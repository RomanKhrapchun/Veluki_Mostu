import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from "../../hooks/useFetch";
import Table from "../../components/common/Table/Table";
import { generateIcon, iconMap, STATUS } from "../../utils/constants.jsx";
import Button from "../../components/common/Button/Button";
import PageError from "../ErrorPage/PageError";
import classNames from "classnames";
import Pagination from "../../components/common/Pagination/Pagination";
import Input from "../../components/common/Input/Input";
import { fetchFunction, hasOnlyAllowedParams, validateFilters } from "../../utils/function";
import { useNotification } from "../../hooks/useNotification";
import { Context } from "../../main";
import Dropdown from "../../components/common/Dropdown/Dropdown";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";
import Modal from "../../components/common/Modal/Modal.jsx";
import { Transition } from "react-transition-group";
import FormItem from "../../components/common/FormItem/FormItem";
import Select from "../../components/common/Select/Select";

// Іконки
const viewIcon = generateIcon(iconMap.view);
const downloadIcon = generateIcon(iconMap.download);
const editIcon = generateIcon(iconMap.edit);
const filterIcon = generateIcon(iconMap.filter);
const searchIcon = generateIcon(iconMap.search, 'input-icon');
const dropDownIcon = generateIcon(iconMap.arrowDown);
const addIcon = generateIcon(iconMap.add);
const cancelIcon = generateIcon(iconMap.close);
const changeStateIcon = generateIcon(iconMap.edit);
const dropDownStyle = { width: '100%' };
const childDropDownStyle = { justifyContent: 'center' };

const Bills = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const nodeRef = useRef(null);
    const addFormRef = useRef(null);
    const changeStateRef = useRef(null);
    const isFirstRun = useRef(true);
    
    const [state, setState] = useState({
        isOpen: false,
        selectData: {},
        confirmLoading: false,
        itemId: null,
        sendData: {
            limit: 16,
            page: 1,
        }
    });
    
    // Стан для модального вікна створення рахунку
    const [createModalState, setCreateModalState] = useState({
        isOpen: false,
        loading: false,
        formData: {
            account_number: '',
            payer: '',
            service_group_id: '',
            service_id: '',
            quantity: 1,
            // Автоматично заповнювані поля
            service_name: '',
            unit: '',
            price: 0,
            total_price: 0,
        },
        serviceGroups: [], // Список груп послуг
        services: [],      // Список послуг для вибраної групи
    });
    
    // Стан для модального вікна зміни статусу
    const [changeStateModalState, setChangeStateModalState] = useState({
        isOpen: false,
        loading: false,
        bill: null,
        newState: ''
    });

    // Завантаження даних рахунків
    const {error, status, data, retryFetch} = useFetch('api/sportscomplex/bills/filter', {
        method: 'post',
        data: state.sendData
    }) 
    
    // Завантаження груп послуг при відкритті модального вікна
    useEffect(() => {
        if (createModalState.isOpen && createModalState.serviceGroups.length === 0) {
            loadServiceGroups();
        }
    }, [createModalState.isOpen]);

    // Ефект для оновлення даних при зміні параметрів пошуку
    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false
            return;
        }
        retryFetch('api/sportscomplex/bills/filter', {
            method: 'post',
            data: state.sendData,
        })
    }, [state.sendData, retryFetch])
    
    // Завантаження груп послуг
    const loadServiceGroups = async () => {
        try {
            const response = await fetchFunction('/api/sportscomplex/service-groups', {
                method: 'get'
            });
            
            if (response?.data) {
                setCreateModalState(prev => ({
                    ...prev,
                    serviceGroups: response.data.map(group => ({
                        value: group.id,
                        label: group.name
                    }))
                }));
            }
        } catch (error) {
            notification({
                type: 'warning',
                title: "Помилка",
                message: "Не вдалося завантажити групи послуг",
                placement: 'top',
            });
        }
    };
    
    // Завантаження послуг для вибраної групи
    const loadServicesForGroup = async (groupId) => {
        // Якщо groupId не вказано, не робимо запит
        if (!groupId) {
            setCreateModalState(prev => ({
                ...prev,
                services: []
            }));
            return;
        }
        
        try {
            const response = await fetchFunction(`/api/sportscomplex/services-by-group/${groupId}`, {
                method: 'get'
            });
            
            if (response?.data) {
                console.log("Завантажені послуги:", response.data); // Для відлагодження
                
                setCreateModalState(prev => ({
                    ...prev,
                    services: Array.isArray(response.data) ? response.data.map(service => ({
                        value: service.id,
                        label: service.name,
                        unit: service.unit,
                        price: service.price
                    })) : []
                }));
            }
        } catch (error) {
            notification({
                type: 'warning',
                title: "Помилка",
                message: "Не вдалося завантажити послуги",
                placement: 'top',
            });
        }
    };

    const startRecord = ((state.sendData.page || 1) - 1) * state.sendData.limit + 1;
    const endRecord = Math.min(startRecord + state.sendData.limit - 1, parseInt(data?.totalItems) || 1);

    // Визначення колонок таблиці
    const columnTable = useMemo(() => [
        {
            title: 'Номер рахунку',
            dataIndex: 'account_number',
            width: '10%'
        },
        {
            title: 'Платник',
            dataIndex: 'payer',
            width: '15%'
        },
        {
            title: 'Група послуг',
            dataIndex: 'service_group',
            width: '12%'
        },
        {
            title: 'Назва послуги',
            dataIndex: 'service_name',
            width: '15%'
        },
        {
            title: 'Одиниці',
            dataIndex: 'unit',
            width: '8%'
        },
        {
            title: 'Кількість',
            dataIndex: 'quantity',
            width: '8%'
        },
        {
            title: 'Вартість',
            dataIndex: 'total_price',
            width: '8%',
            render: (price) => `${price} грн`
        },
        {
            title: 'Стан',
            dataIndex: 'status',
            width: '10%',
            render: (status) => {
                let color = '';
                switch(status) {
                    case 'В процесі':
                        color = 'blue';
                        break;
                    case 'Оплачено':
                        color = 'green';
                        break;
                    case 'Скасовано':
                        color = 'red';
                        break;
                    default:
                        color = 'black';
                }
                return <span style={{ color }}>{status}</span>;
            }
        },
        {
            title: 'Дія',
            dataIndex: 'action',
            width: '14%',
            render: (_, record) => {
                // Визначаємо наступний статус для зміни
                let nextStatus;
                switch(record.status) {
                    case 'В процесі':
                        nextStatus = 'Оплачено';
                        break;
                    case 'Оплачено':
                        nextStatus = 'Скасовано';
                        break;
                    case 'Скасовано':
                        nextStatus = 'В процесі';
                        break;
                }

                return (
                    <div className="btn-sticky" style={{ justifyContent: 'center' }}>
                        {/* Кнопка "Змінити стан" - завжди присутня */}
                        <Button
                            title={`Змінити на "${nextStatus}"`}
                            icon={changeStateIcon}
                            onClick={() => handleOpenChangeStateModal(record, nextStatus)}
                        />
                        
                        {/* Інші кнопки в залежності від статусу */}
                        {record.status === 'В процесі' && (
                            <>
                                <Button
                                    title="Переглянути реквізити"
                                    icon={viewIcon}
                                    onClick={() => navigate(`/sportscomplex/bills/${record.id}/requisites`)}
                                />
                                <Button
                                    title="Скасувати"
                                    icon={cancelIcon}
                                    onClick={async () => {
                                        try {
                                            await fetchFunction(`/api/sportscomplex/bills/${record.id}/status`, {
                                                method: 'put',
                                                data: { status: 'Скасовано' }
                                            });
                                            notification({
                                                type: 'success',
                                                message: `Рахунок №${record.account_number} скасовано`
                                            });
                                            retryFetch('/api/sportscomplex/bills/filter', {
                                                method: 'post',
                                                data: state.sendData
                                            });
                                        } catch (e) {
                                            notification({
                                                type: 'error',
                                                message: 'Не вдалося скасувати рахунок'
                                            });
                                        }
                                    }}
                                />
                            </>
                        )}
                        
                        {record.status === 'Оплачено' && (
                            <>
                                <Button
                                    title="Переглянути"
                                    icon={viewIcon}
                                    onClick={() => navigate(`/sportscomplex/bills/${record.id}/requisites`)}
                                />
                                <Button
                                    title="Завантажити квитанцію"
                                    icon={downloadIcon}
                                    onClick={() => handleDownloadReceipt(record.id)}
                                />
                            </>
                        )}
                        
                        {record.status === 'Скасовано' && (
                            <Button
                                title="Переглянути"
                                icon={viewIcon}
                                onClick={() => navigate(`/sportscomplex/bills/${record.id}/requisites`)}
                            />
                        )}
                    </div>
                );
            }
        }
    ], [navigate]);

    // Підготовка даних для таблиці
    const tableData = useMemo(() => {
        if (!Array.isArray(data?.items)) return [];
        return data.items.map(el => ({
            key: el.id,
            id: el.id,
            account_number: el.account_number,
            payer: el.payer,
            service_group: el.service_group,
            service_name: el.service_name,
            unit: el.unit,
            quantity: el.quantity,
            total_price: el.total_price,
            status: el.status
        }));
    }, [data]);


    // Пункти меню для вибору кількості записів на сторінці
    const itemMenu = [16, 32, 48].map(size => ({
        label: `${size}`,
        key: `${size}`,
        onClick: () => {
            if (state.sendData.limit !== size) {
                setState(prev => ({...prev, sendData: {...prev.sendData, limit: size, page: 1}}));
            }
        }
    }));

    // Функції для фільтрів
    const filterHandleClick = () => setState(prev => ({...prev, isOpen: !prev.isOpen}));

    const onHandleChange = (name, value) => setState(prev => ({
        ...prev, 
        selectData: {...prev.selectData, [name]: value}
    }));
    
    // Функції для модального вікна створення рахунку
    const onCreateFormChange = (name, value) => {
        setCreateModalState(prev => {
            const updatedFormData = {
                ...prev.formData,
                [name]: value
            };
            
            // Якщо змінюється кількість, оновити загальну вартість
            if (name === 'quantity' && updatedFormData.price) {
                updatedFormData.total_price = updatedFormData.price * value;
            }
            
            return {
                ...prev,
                formData: updatedFormData
            };
        });
    };
    
    // Функція для обробки вибору групи послуг
    const handleServiceGroupChange = (name, option) => {
        // Правильно отримуємо значення, залежно від того, чи це об'єкт чи примітив
        const groupId = option && typeof option === 'object' ? option.value : option;
        
        setCreateModalState(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                service_group_id: option, // Зберігаємо повний об'єкт опції
                service_id: '', // Скидаємо вибрану послугу
                service_name: '',
                unit: '',
                price: 0,
                total_price: 0
            }
        }));
        
        // Переконуємося, що у нас є валідний groupId перед тим, як зробити API-виклик
        if (groupId) {
            loadServicesForGroup(groupId);
        }
    };

    // Функція для обробки вибору послуги
    const handleServiceChange = (name, option) => {
        console.log("handleServiceChange викликаний з:", { name, option }); // Для відлагодження
        
        if (!option) return;
        
        // Якщо опція - це об'єкт з компонента Select
        const serviceOption = createModalState.services.find(
            service => service.value === (typeof option === 'object' ? option.value : option)
        );
        
        if (serviceOption) {
            const { label, unit, price } = serviceOption;
            const quantity = parseInt(createModalState.formData.quantity) || 1;

            setCreateModalState(prev => ({
                ...prev,
                formData: {
                    ...prev.formData,
                    service_id: option, // Зберігаємо повний об'єкт опції
                    service_name: label,
                    unit,
                    price,
                    total_price: price * quantity
                }
            }));
            
            console.log("Оновлений стан:", {
                service_id: option,
                service_name: label,
                unit,
                price,
                total_price: price * quantity
            }); // Для відлагодження
        }
    };

    // Функції для фільтрів
    const resetFilters = () => {
        setState(prev => ({...prev, selectData: {}}));
        
        const dataReadyForSending = hasOnlyAllowedParams(state.sendData, ['limit', 'page']);
        if (!dataReadyForSending) {
            setState(prev => ({...prev, sendData: {limit: prev.sendData.limit, page: 1}}));
        }
    };

    const applyFilter = () => {
        if (Object.values(state.selectData).some(val => val)) {
            const dataValidation = validateFilters(state.selectData);
            if (!dataValidation.error) {
                setState(prev => ({...prev, sendData: {...dataValidation, limit: prev.sendData.limit, page: 1}}));
            } else {
                notification({ 
                    type: 'warning', 
                    title: 'Помилка', 
                    message: dataValidation.message,
                    placement: 'top' 
                });
            }
        }
    };

    // Функція для навігації по сторінках
    const onPageChange = useCallback(page => setState(prev => ({...prev, sendData: {...prev.sendData, page}})), []);

    // Функції для модального вікна зміни статусу
    const handleOpenChangeStateModal = (bill, newState) => {
        setChangeStateModalState({
            isOpen: true,
            loading: false,
            bill,
            newState
        });
        document.body.style.overflow = 'hidden';
    };

    const handleCloseChangeStateModal = () => {
        setChangeStateModalState({
            isOpen: false,
            loading: false,
            bill: null,
            newState: ''
        });
        document.body.style.overflow = 'auto';
    };
    
    // Функція для підтвердження зміни статусу
    const handleChangeState = async () => {
        if (!changeStateModalState.bill || !changeStateModalState.newState) return;
        
        try {
            setChangeStateModalState(prev => ({...prev, loading: true}));
            
            await fetchFunction(`/api/sportscomplex/bills/${changeStateModalState.bill.id}/status`, {
                method: 'put',
                data: {
                    status: changeStateModalState.newState
                }
            });
            
            notification({
                type: 'success',
                placement: 'top',
                title: 'Успіх',
                message: `Статус рахунку успішно змінено на "${changeStateModalState.newState}"`,
            });
            
            // Оновлюємо дані в таблиці
            retryFetch('/api/sportscomplex/bills/filter', {
                method: 'post',
                data: state.sendData,
            });
            
            // Закриваємо модальне вікно
            handleCloseChangeStateModal();
        } catch (error) {
            console.error("Помилка при зміні статусу:", error);
            
            if (error?.response?.status === 401) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: "Не авторизований",
                    placement: 'top',
                });
                store.logOff();
                return navigate('/');
            }
            
            notification({
                type: 'warning',
                title: "Помилка",
                message: error?.response?.data?.message || error.message,
                placement: 'top',
            });
        } finally {
            setChangeStateModalState(prev => ({...prev, loading: false}));
        }
    };
    
    // Функція для завантаження квитанції
    const handleDownloadReceipt = async (billId) => {
        try {
            setState(prev => ({...prev, confirmLoading: true}));
            
            const response = await fetchFunction(`/api/sportscomplex/bills/${billId}/receipt`, {
                method: 'get',
                responseType: 'blob'
            });
            
            notification({
                placement: "top",
                duration: 2,
                title: 'Успіх',
                message: "Квитанцію успішно сформовано.",
                type: 'success'
            });
            
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt-${billId}.pdf`;
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            if (error?.response?.status === 401) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: "Не авторизований",
                    placement: 'top',
                });
                store.logOff();
                return navigate('/');
            }
            
            notification({
                type: 'warning',
                title: "Помилка",
                message: error?.response?.data?.message ? error.response.data.message : error.message,
                placement: 'top',
            });
        } finally {
            setState(prev => ({...prev, confirmLoading: false}));
        }
    };
    
    // Функції для модального вікна створення рахунку
    const openCreateModal = () => {
        // Генеруємо номер рахунку - 6 випадкових цифр
        const accountNumber = Math.floor(100000 + Math.random() * 900000).toString();
        
        setCreateModalState(prev => ({
            ...prev,
            isOpen: true,
            formData: {
                account_number: accountNumber,
                payer: '',
                service_group_id: '',
                service_id: '',
                quantity: 1,
                service_name: '',
                unit: '',
                price: 0,
                total_price: 0
            }
        }));
        document.body.style.overflow = 'hidden';
    };
    
    const closeCreateModal = () => {
        setCreateModalState(prev => ({
            ...prev,
            isOpen: false
        }));
        document.body.style.overflow = 'auto';
    };
    
    // Функція для обробки відправки форми створення рахунку
    const handleCreateFormSubmit = async () => {
        const { account_number, payer, service_id, quantity } = createModalState.formData;
        
        // Валідація форми
        if (!account_number || !payer || !service_id || !quantity) {
            notification({
                type: 'warning',
                placement: 'top',
                title: 'Помилка',
                message: 'Всі поля форми обов\'язкові для заповнення',
            });
            return;
        }
        
        try {
            setCreateModalState(prev => ({...prev, loading: true}));
            
            // Перевіряємо, що service_id це об'єкт з компоненту Select і витягуємо ID
            const serviceIdValue = typeof service_id === 'object' ? service_id.value : service_id;
            
            // Відправка даних на сервер з правильним форматом ID
            await fetchFunction('/api/sportscomplex/bills', {
                method: 'post',
                data: {
                    account_number,
                    payer,
                    service_id: serviceIdValue, // Використовуємо числове значення ID
                    quantity: parseInt(quantity),
                    status: 'В процесі'
                }
            });
            
            notification({
                type: 'success',
                placement: 'top',
                title: 'Успіх',
                message: 'Рахунок успішно створено',
            });
            
            // Оновлення даних в таблиці
            retryFetch('/api/sportscomplex/bills/filter', {
                method: 'post',
                data: state.sendData,
            });
            
            // Закриття модального вікна
            closeCreateModal();
        } catch (error) {
            console.error("Помилка створення рахунку:", error.response?.data || error.message); // Додаємо детальне логування
            
            if (error?.response?.status === 401) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: "Не авторизований",
                    placement: 'top',
                });
                store.logOff();
                return navigate('/');
            }
            
            notification({
                type: 'warning',
                title: "Помилка",
                message: error?.response?.data?.message || error?.response?.data?.error || error.message,
                placement: 'top',
            });
        } finally {
            setCreateModalState(prev => ({...prev, loading: false}));
        }
    };

    // Обробка помилок
    if (status === STATUS.ERROR) {
        return <PageError title={error.message} statusError={error.status} />;
    }

    return (
        <>
            {status === STATUS.PENDING && <SkeletonPage />}
            
            {status === STATUS.SUCCESS && (
                <div className="table-elements">
                    <div className="table-header">
                        <h2 className="title title--sm">
                            {data?.items?.length ? 
                                `Показує ${startRecord}-${endRecord} з ${data?.totalItems}` : 
                                'Записів не знайдено'
                            }
                        </h2>
                        <div className="table-header__buttons">

                            {/* Кнопка "Створити" замість "Додати" */}
                            <Button 
                                className="btn--primary"
                                onClick={openCreateModal}
                                icon={addIcon}
                            >
                                Створити
                            </Button>
                            <Dropdown 
                                icon={dropDownIcon} 
                                iconPosition="right" 
                                style={dropDownStyle} 
                                childStyle={childDropDownStyle} 
                                caption={`Записів: ${state.sendData.limit}`} 
                                menu={itemMenu} 
                            />
                            <Button 
                                className="table-filter-trigger" 
                                onClick={filterHandleClick} 
                                icon={filterIcon}
                            >
                                Фільтри
                            </Button>
                        </div>
                    </div>
                    <div className="table-main">
                        <div 
                            style={{width: data?.items?.length > 0 ? 'auto' : '100%'}} 
                            className={classNames("table-and-pagination-wrapper", {"table-and-pagination-wrapper--active": state.isOpen})}
                        >
                            <Table 
                                columns={Array.isArray(columnTable) ? columnTable.filter(Boolean) : []} 
                                dataSource={Array.isArray(tableData) ? tableData : []}
                            />
                            <Pagination 
                                className="m-b" 
                                currentPage={parseInt(data?.currentPage) || 1} 
                                totalCount={parseInt(data?.totalItems) || 1} 
                                pageSize={state.sendData.limit} 
                                onPageChange={onPageChange} 
                            />
                        </div>
                        <div className={`table-filter ${state.isOpen ? "table-filter--active" : ""}`}>
                            <h3 className="title title--sm">Фільтри</h3>
                            <div className="btn-group">
                                <Button onClick={applyFilter}>Застосувати</Button>
                                <Button className="btn--secondary" onClick={resetFilters}>Скинути</Button>
                            </div>
                            <div className="table-filter__item">
                                <Input 
                                    icon={searchIcon} 
                                    name="account_number" 
                                    placeholder="Номер рахунку" 
                                    value={state.selectData?.account_number || ''} 
                                    onChange={onHandleChange} 
                                />
                            </div>
                            <div className="table-filter__item">
                                <Input 
                                    icon={searchIcon} 
                                    name="payer" 
                                    placeholder="Платник" 
                                    value={state.selectData?.payer || ''} 
                                    onChange={onHandleChange} 
                                />
                            </div>
                            <div className="table-filter__item">
                                <Input 
                                    icon={searchIcon} 
                                    name="service_name" 
                                    placeholder="Назва послуги" 
                                    value={state.selectData?.service_name || ''} 
                                    onChange={onHandleChange} 
                                />
                            </div>
                            <div className="table-filter__item">
                                <h4 className="input-description">Стан</h4>
                                <Input 
                                    icon={searchIcon} 
                                    name="status" 
                                    placeholder="Стан рахунку" 
                                    value={state.selectData?.status || ''} 
                                    onChange={onHandleChange} 
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Модальне вікно для створення нового рахунку */}
            <Transition in={createModalState.isOpen} timeout={200} unmountOnExit nodeRef={addFormRef}>
                {transitionState => (
                    <Modal
                        className={transitionState === 'entered' ? "modal-window-wrapper--active" : ""}
                        onClose={closeCreateModal}
                        onOk={handleCreateFormSubmit}
                        confirmLoading={createModalState.loading}
                        cancelText="Скасувати"
                        okText="Зберегти"
                        title="Створення нового рахунку"
                        width="600px"
                    >
                        <div className="form-container">
                            <FormItem 
                                label="Номер рахунку" 
                                required 
                                fullWidth
                                tooltip="Номер рахунку генерується автоматично"
                            >
                                <Input
                                    name="account_number"
                                    value={createModalState.formData.account_number}
                                    onChange={onCreateFormChange}
                                    placeholder="Введіть номер рахунку"
                                    disabled={true} // Номер рахунку генерується автоматично
                                />
                            </FormItem>
                            
                            <FormItem 
                                label="Платник" 
                                required 
                                fullWidth
                            >
                                <Input
                                    name="payer"
                                    value={createModalState.formData.payer}
                                    onChange={onCreateFormChange}
                                    placeholder="Введіть ПІБ платника"
                                />
                            </FormItem>
                            
                            <FormItem 
                                label="Група послуг" 
                                required 
                                fullWidth
                            >
                                <Select
                                    placeholder="Виберіть групу послуг"
                                    value={createModalState.formData.service_group_id}
                                    onChange={handleServiceGroupChange}
                                    options={createModalState.serviceGroups}
                                />
                            </FormItem>
                            
                            <FormItem 
                                label="Назва послуги" 
                                required 
                                fullWidth
                            >
                                <Select
                                    placeholder="Виберіть послугу"
                                    value={createModalState.formData.service_id}
                                    onChange={handleServiceChange}
                                    options={createModalState.services}
                                    disabled={!createModalState.formData.service_group_id}
                                    // Додайте властивості для відлагодження
                                    isClearable={true}
                                    isSearchable={true}
                                />
                            </FormItem>
                            
                            <div className="form-row" style={{display: 'flex', gap: '16px'}}>
                                <FormItem 
                                    label="Одиниці" 
                                    fullWidth
                                >
                                    <Input
                                        name="unit"
                                        value={createModalState.formData.unit}
                                        disabled={true} // Заповнюється автоматично при виборі послуги
                                    />
                                </FormItem>
                                
                                <FormItem 
                                    label="Кількість" 
                                    required 
                                    fullWidth
                                >
                                    <Input
                                        name="quantity"
                                        type="number"
                                        min="1"
                                        value={createModalState.formData.quantity}
                                        onChange={onCreateFormChange}
                                        placeholder="Кількість"
                                    />
                                </FormItem>
                            </div>
                            
                            <div className="form-row" style={{display: 'flex', gap: '16px'}}>
                                <FormItem 
                                    label="Ціна за одиницю" 
                                    fullWidth
                                >
                                    <Input
                                        name="price"
                                        value={createModalState.formData.price ? `${createModalState.formData.price} грн` : ''}
                                        disabled={true} // Заповнюється автоматично при виборі послуги
                                    />
                                </FormItem>
                                
                                <FormItem 
                                    label="Загальна вартість" 
                                    fullWidth
                                >
                                    <Input
                                        name="total_price"
                                        value={createModalState.formData.total_price ? `${createModalState.formData.total_price} грн` : ''}
                                        disabled={true} // Розраховується автоматично
                                    />
                                </FormItem>
                            </div>
                        </div>
                    </Modal>
                )}
            </Transition>
            
            {/* Модальне вікно для зміни статусу рахунку */}
            <Transition in={changeStateModalState.isOpen} timeout={200} unmountOnExit nodeRef={changeStateRef}>
                {transitionState => (
                    <Modal
                        className={transitionState === 'entered' ? "modal-window-wrapper--active" : ""}
                        onClose={handleCloseChangeStateModal}
                        onOk={handleChangeState}
                        confirmLoading={changeStateModalState.loading}
                        cancelText="Скасувати"
                        okText={`Так, змінити на "${changeStateModalState.newState}"`}
                        title="Зміна статусу рахунку"
                    >
                        <p className="paragraph">
                            Ви впевнені, що бажаєте змінити статус рахунку №{changeStateModalState.bill?.account_number} 
                            з "{changeStateModalState.bill?.status}" на "{changeStateModalState.newState}"?
                        </p>
                    </Modal>
                )}
            </Transition>
        </>
    );
};

export default Bills;