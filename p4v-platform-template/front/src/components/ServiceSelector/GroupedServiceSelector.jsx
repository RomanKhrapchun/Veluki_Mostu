
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { fetchFunction } from '../../utils/function';
import { useNotification } from '../../hooks/useNotification';
import './GroupedServiceSelector.css';

const GroupedServiceSelector = ({ 
    value, 
    onChange, 
    error, 
    placeholder = "Виберіть послугу",
    required = false 
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [executors, setExecutors] = useState([]);
    const [allServices, setAllServices] = useState([]);
    const [selectedExecutorId, setSelectedExecutorId] = useState(null);
    const [availableServices, setAvailableServices] = useState([]);
    const [selectedService, setSelectedService] = useState(null);
    const [loading, setLoading] = useState(false);
    const notification = useNotification();
    const dropdownRef = useRef(null);

    // Завантаження даних
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const response = await fetchFunction('api/cnap/services/with-executors', {
                    method: 'get',
                });
                
                if (response?.data.data) {
                    const mappedServices = response.data.data.map(service => ({
                        value: service.id,
                        label: service.name,
                        price: service.price,
                        identifier: service.identifier,
                        executor_id: service.executor_id,
                        executor_name: service.executor_name
                    }));
                    setAllServices(mappedServices);

                    // Створюємо список виконавців
                    const executorsMap = new Map();
                    
                    response.data.data.forEach(service => {
                        if (service.executor_id && service.executor_name) {
                            if (!executorsMap.has(service.executor_id)) {
                                executorsMap.set(service.executor_id, {
                                    id: service.executor_id,
                                    name: service.executor_name,
                                    services_count: 0
                                });
                            }
                            executorsMap.get(service.executor_id).services_count++;
                        }
                    });

                    // Додаємо групу для послуг без виконавця
                    const servicesWithoutExecutor = mappedServices.filter(s => !s.executor_id);
                    if (servicesWithoutExecutor.length > 0) {
                        executorsMap.set('no_executor', {
                            id: 'no_executor',
                            name: 'Послуги без виконавця',
                            services_count: servicesWithoutExecutor.length
                        });
                    }

                    setExecutors(Array.from(executorsMap.values()));
                }
            } catch (error) {
                console.error('Error fetching data:', error);
                notification({
                    type: 'error',
                    message: 'Помилка завантаження даних',
                    placement: 'top'
                });
            } finally {
                setLoading(false);
            }
        };
        
        fetchData();
    }, [notification]);

    // Знаходимо вибрану послугу при зміні value
    useEffect(() => {
        if (value && allServices.length > 0) {
            const service = allServices.find(s => s.value === value);
            if (service) {
                setSelectedService(service);
                // Автоматично вибираємо виконавця
                const executorId = service.executor_id || 'no_executor';
                setSelectedExecutorId(executorId);
                handleExecutorSelect(executorId);
            }
        } else {
            setSelectedService(null);
            setSelectedExecutorId(null);
            setAvailableServices([]);
        }
    }, [value, allServices]);

    // Закриття dropdown при кліку поза компонентом
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleExecutorSelect = useCallback((executorId) => {
        setSelectedExecutorId(executorId);
        
        let filteredServices = [];
        if (executorId === 'no_executor') {
            filteredServices = allServices.filter(service => !service.executor_id);
        } else {
            filteredServices = allServices.filter(service => service.executor_id === executorId);
        }
        
        setAvailableServices(filteredServices);
    }, [allServices]);

    const handleServiceSelect = useCallback((service) => {
        setSelectedService(service);
        setIsOpen(false);
        
        if (onChange) {
            onChange(service.value, service);
        }
    }, [onChange]);

    const toggleDropdown = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen]);

    const getDisplayText = () => {
        if (selectedService) {
            return selectedService.label;
        }
        return placeholder;
    };

    const truncateText = (text, maxLength = 60) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength - 3) + '...';
    };

    return (
        <div className="grouped-service-selector" ref={dropdownRef}>
            {/* Поле вибору */}
            <div 
                className={`selector-input ${isOpen ? 'open' : ''} ${error ? 'error' : ''}`}
                onClick={toggleDropdown}
            >
                <span className={`selector-text ${selectedService ? 'selected' : 'placeholder'}`}>
                    {getDisplayText()}
                </span>
                <span className={`selector-arrow ${isOpen ? 'up' : 'down'}`}>
                    ▼
                </span>
            </div>

            {/* Dropdown з групами та послугами */}
            {isOpen && (
                <div className="selector-dropdown">
                    {loading ? (
                        <div className="dropdown-loading">
                            Завантаження...
                        </div>
                    ) : (
                        <div className="dropdown-content">
                            {/* Ліва панель - Виконавці */}
                            <div className="executors-panel">
                                <div className="panel-header">Надсилачі</div>{/*Виконавці*/}
                                <div className="executors-list">
                                    {executors.map(executor => (
                                        <div
                                            key={executor.id}
                                            className={`executor-item ${selectedExecutorId === executor.id ? 'selected' : ''}`}
                                            onClick={() => handleExecutorSelect(executor.id)}
                                        >
                                            <div className="executor-name">
                                                {truncateText(executor.name, 35)}
                                            </div>
                                            <div className="executor-count">
                                                {executor.services_count} послуг
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Права панель - Послуги */}
                            <div className="services-panel">
                                <div className="panel-header">
                                    {selectedExecutorId ? 'Послуги' : 'Виберіть виконавця'}
                                </div>
                                <div className="services-list">
                                    {selectedExecutorId ? (
                                        availableServices.length > 0 ? (
                                            availableServices.map(service => (
                                                <div
                                                    key={service.value}
                                                    className={`service-item ${selectedService?.value === service.value ? 'selected' : ''}`}
                                                    onClick={() => handleServiceSelect(service)}
                                                >
                                                    <div className="service-name">
                                                        {service.label}
                                                    </div>
                                                    <div className="service-details">
                                                        <span className="service-code">{service.identifier}</span>
                                                        <span className="service-price">{service.price} грн</span>
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="no-services">
                                                Немає доступних послуг
                                            </div>
                                        )
                                    ) : (
                                        <div className="select-executor-message">
                                            ← Спочатку виберіть надавача зліва
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Показуємо інформацію про вибрану послугу */}
            {selectedService && !isOpen && (
                <div className="selected-service-info">
                    <div className="service-summary">
                        <span className="service-code-summary">Код: {selectedService.identifier}</span>
                        <span className="service-price-summary">Ціна: {selectedService.price} грн</span>
                        {selectedService.executor_name && (
                            <span className="service-executor-summary">
                                Надсилач: {truncateText(selectedService.executor_name, 30)}
                            </span>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default GroupedServiceSelector;