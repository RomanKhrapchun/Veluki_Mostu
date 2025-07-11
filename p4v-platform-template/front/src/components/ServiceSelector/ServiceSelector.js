import React, { useState, useEffect, useCallback } from 'react';
import Select from "../common/Select/Select";
import FormItem from "../common/FormItem/FormItem";
import './ServiceSelector.css'; // Стилі для компонента

const ServiceSelector = ({ 
    value, 
    onChange, 
    error, 
    services = [],
    placeholder = "Виберіть послугу",
    required = false 
}) => {
    const [selectedGroup, setSelectedGroup] = useState(null);
    const [groupedServices, setGroupedServices] = useState({});
    const [serviceGroups, setServiceGroups] = useState([]);
    const [availableServices, setAvailableServices] = useState([]);
    const [hoveredGroup, setHoveredGroup] = useState(null);

    // Групуємо послуги по виконавцям при завантаженні
    useEffect(() => {
        if (services && services.length > 0) {
            // Групуємо послуги по виконавцям (припускаємо, що є поле executor)
            const grouped = services.reduce((acc, service) => {
                const executor = service.executor || service.group || 'Інші послуги';
                if (!acc[executor]) {
                    acc[executor] = [];
                }
                acc[executor].push(service);
                return acc;
            }, {});

            setGroupedServices(grouped);

            // Створюємо список груп для відображення
            const groups = Object.keys(grouped).map(executor => ({
                name: executor,
                count: grouped[executor].length,
                services: grouped[executor]
            }));

            setServiceGroups(groups);
        }
    }, [services]);

    // Обробка вибору групи
    const handleGroupSelect = useCallback((groupName) => {
        setSelectedGroup(groupName);
        setAvailableServices(groupedServices[groupName] || []);
        // Скидаємо вибрану послугу при зміні групи
        if (onChange) {
            onChange(null, null);
        }
    }, [groupedServices, onChange]);

    // Обробка вибору послуги
    const handleServiceChange = useCallback((value, option) => {
        if (onChange) {
            onChange(value, option);
        }
    }, [onChange]);

    // Обробка наведення на групу
    const handleGroupHover = useCallback((groupName) => {
        setHoveredGroup(groupName);
    }, []);

    const handleGroupLeave = useCallback(() => {
        setHoveredGroup(null);
    }, []);

    return (
        <div className="service-selector">
            {/* Перший крок: Вибір групи */}
            <FormItem
                label="Група послуг (Виконавець)"
                required={required}
                fullWidth
            >
                <div className="service-groups">
                    {serviceGroups.map((group, index) => (
                        <div
                            key={index}
                            className={`service-group-item ${selectedGroup === group.name ? 'selected' : ''} ${hoveredGroup === group.name ? 'hovered' : ''}`}
                            onClick={() => handleGroupSelect(group.name)}
                            onMouseEnter={() => handleGroupHover(group.name)}
                            onMouseLeave={handleGroupLeave}
                        >
                            <div className="group-name">{group.name}</div>
                            <div className="group-count">{group.count} послуг</div>
                            
                            {/* Випадаючий список послуг при наведенні */}
                            {hoveredGroup === group.name && (
                                <div className="group-services-preview">
                                    {group.services.slice(0, 5).map((service, serviceIndex) => (
                                        <div key={serviceIndex} className="service-preview-item">
                                            <span className="service-name">{service.label}</span>
                                            <span className="service-price">{service.price} грн</span>
                                        </div>
                                    ))}
                                    {group.services.length > 5 && (
                                        <div className="service-preview-more">
                                            ... та ще {group.services.length - 5} послуг
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </FormItem>

            {/* Другий крок: Вибір конкретної послуги */}
            {selectedGroup && (
                <FormItem
                    label="Послуга"
                    error={error}
                    required={required}
                    fullWidth
                >
                    <Select
                        placeholder={placeholder}
                        value={value}
                        onChange={handleServiceChange}
                        options={availableServices}
                    />
                </FormItem>
            )}

            {/* Показуємо назву вибраної групи для контексту */}
            {selectedGroup && (
                <div className="selected-group-info">
                    <small>Група: {selectedGroup}</small>
                </div>
            )}
        </div>
    );
};

export default ServiceSelector;