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
const addIcon = generateIcon(iconMap.add); // Додано іконку для кнопки додавання
const saveIcon = generateIcon(iconMap.save); // Додано іконку для збереження
const dropDownStyle = { width: '100%' };
const childDropDownStyle = { justifyContent: 'center' };

const Services = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const nodeRef = useRef(null);
    const addFormRef = useRef(null); // Референція для модального вікна додавання
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
    
    // Додано новий стан для модального вікна додавання
    const [addModalState, setAddModalState] = useState({
        isOpen: false,
        loading: false,
        formData: {
            name: '',
            unit: '',
            price: '',
            service_group_id: ''
        }
    });

    const [serviceGroups, setServiceGroups] = useState([]);

    const { error, status, data, retryFetch } = useFetch('/api/sportscomplex/filter-pool', {
        method: 'post',
        data: state.sendData
    });

    const startRecord = ((state.sendData.page || 1) - 1) * state.sendData.limit + 1;
    const endRecord = Math.min(startRecord + state.sendData.limit - 1, data?.totalItems || 1);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        retryFetch('/api/sportscomplex/filter-pool', {
            method: 'post',
            data: state.sendData,
        });
    }, [state.sendData, retryFetch]);

    useEffect(() => {
        const fetchServiceGroups = async () => {
            try {
                const res = await fetchFunction('/api/sportscomplex/service-groups', { method: 'get' });
                if (res?.data) {
                    setServiceGroups(res.data.map(group => ({
                        value: group.id,
                        label: group.name
                    })));
                }
            } catch (err) {
                notification({
                    type: 'error',
                    title: 'Помилка',
                    message: 'Не вдалося завантажити групи послуг',
                    placement: 'top'
                });
            }
        };

        fetchServiceGroups();
    }, []);

    const columnTable = useMemo(() => [
        {
            title: 'Назва послуги',
            dataIndex: 'serviceName',
        },
        {
            title: 'Одиниці',
            dataIndex: 'unit',
        },
        {
            title: 'Ціна',
            dataIndex: 'price',
        },
        {
            title: 'Дія',
            dataIndex: 'action',
            render: (_, {id}) => (
                <div className="btn-sticky" style={{justifyContent: 'center'}}>
                    <Button 
                        title="Перегляд" 
                        icon={viewIcon} 
                        onClick={() => navigate(`/sportscomplex/services/${id}`)} 
                    />
                    <Button 
                        title="Редагувати" 
                        icon={editIcon} 
                        onClick={() => navigate(`/sportscomplex/services/${id}/edit`)} 
                    />
                </div>
            ),
        }
    ], [navigate]);                

    const tableData = useMemo(() => {
        if (data?.items?.length) {
            return data?.items?.map(el => ({
                key: el.id,
                id: el.id,
                serviceName: el.name,
                unit: el.unit,
                price: el.price,
            }))                
        }
        return []
    }, [data])     

    const itemMenu = [16, 32, 48].map(size => ({
        label: `${size}`,
        key: `${size}`,
        onClick: () => {
            if (state.sendData.limit !== size) {
                setState(prev => ({...prev, sendData: {...prev.sendData, limit: size, page: 1}}));
            }
        }
    }));

    const filterHandleClick = () => setState(prev => ({...prev, isOpen: !prev.isOpen}));

    const onHandleChange = (name, value) => setState(prev => ({
        ...prev, 
        selectData: {...prev.selectData, [name]: value}
    }));
    
    // Функція для зміни полів форми додавання
    const onAddFormChange = (name, value) => {
        setAddModalState(prev => ({
            ...prev,
            formData: {
                ...prev.formData,
                [name]: value
            }
        }));
    };

    const resetFilters = () => {
        if (Object.values(state.selectData).some(value => value)) {
            setState(prev => ({...prev, selectData: {}}));
        }
        
        const dataReadyForSending = hasOnlyAllowedParams(state.sendData, ['limit', 'page']);
        if (!dataReadyForSending) {
            setState(prev => ({
                ...prev,
                sendData: {
                    limit: prev.sendData.limit,
                    page: 1,
                }
            }));
        }
    };

    const applyFilter = () => {
        const isAnyInputFilled = Object.values(state.selectData).some(value => {
            if (Array.isArray(value) && !value.length) return false;
            return value;
        });
        
        if (isAnyInputFilled) {
            const dataValidation = validateFilters(state.selectData);
            if (!dataValidation.error) {
                setState(prev => ({
                    ...prev,
                    sendData: {
                        ...dataValidation,
                        limit: prev.sendData.limit,
                        page: 1,
                    }
                }));
            } else {
                notification({
                    type: 'warning',
                    placement: 'top',
                    title: 'Помилка',
                    message: dataValidation.message ?? 'Щось пішло не так.',
                });
            }
        }
    };

    const onPageChange = useCallback(page => {
        if (state.sendData.page !== page) {
            setState(prev => ({...prev, sendData: {...prev.sendData, page}}));
        }
    }, [state.sendData.page]);

    const handleOpenModal = (id) => {
        setState(prev => ({...prev, itemId: id}));
        document.body.style.overflow = 'hidden';
    };

    const handleCloseModal = () => {
        setState(prev => ({...prev, itemId: null}));
        document.body.style.overflow = 'auto';
    };
    
    // Функції для модального вікна додавання
    const openAddModal = () => {
        setAddModalState(prev => ({
            ...prev,
            isOpen: true,
            formData: {
                name: '',
                unit: '',
                price: '',
                service_group_id: ''
            }
        }));
        document.body.style.overflow = 'hidden';
    };

    
    const closeAddModal = () => {
        setAddModalState(prev => ({
            ...prev,
            isOpen: false
        }));
        document.body.style.overflow = 'auto';
    };
    
    // Функція для обробки відправки форми додавання
    const handleAddFormSubmit = async () => {
        const { name, unit, price, service_group_id } = addModalState.formData;

        // Валідація форми
        if (!name || !unit || !price || !service_group_id?.value) {
            notification({
                type: 'warning',
                placement: 'top',
                title: 'Помилка',
                message: 'Всі поля форми обов\'язкові для заповнення',
            });
            return;
        }

        try {
            setAddModalState(prev => ({ ...prev, loading: true }));

            // Відправка даних до серверу
            await fetchFunction('/api/sportscomplex/services', {
                method: 'post',
                data: {
                    name,
                    unit,
                    price: parseFloat(price),
                    service_group_id: service_group_id.value, // <-- витягуємо ID з обʼєкта
                }
            });

            notification({
                type: 'success',
                placement: 'top',
                title: 'Успіх',
                message: 'Послугу успішно додано',
            });

            // Оновлення таблиці
            retryFetch('/api/sportscomplex/filter-pool', {
                method: 'post',
                data: state.sendData,
            });

            closeAddModal();
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
            setAddModalState(prev => ({ ...prev, loading: false }));
        }
    };

    const handleGenerate = async () => {
        if (!state.itemId) return;
        
        try {
            setState(prev => ({...prev, confirmLoading: true}));
            
            const response = await fetchFunction(`api/sportscomplex/generate/${state.itemId}`, {
                method: 'get',
                responseType: 'blob'
            });
            
            notification({
                placement: "top",
                duration: 2,
                title: 'Успіх',
                message: "Успішно сформовано.",
                type: 'success'
            });
            
            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'generated.docx';
            document.body.appendChild(a);
            a.click();
            a.remove();
        } catch (error) {
            // Зберігаємо детальну обробку помилок з оригінального коду
            if (error?.response?.status === 401) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: error?.response?.status === 401 ? "Не авторизований" : error.message,
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
            setState(prev => ({...prev, confirmLoading: false, itemId: null}));
            document.body.style.overflow = 'auto';
        }
    };

    if (status === STATUS.ERROR) {
        return <PageError title={error.message} statusError={error.status} />;
    }

    return (
        <>
            {status === STATUS.PENDING ? <SkeletonPage /> : null}
            
            {status === STATUS.SUCCESS && (
                <div className="table-elements">
                    <div className="table-header">
                        <h2 className="title title--sm">
                            {data?.items?.length ? 
                                `Показує ${startRecord !== endRecord ? `${startRecord}-${endRecord}` : startRecord} з ${data?.totalItems || 1}` : 
                                'Записів не знайдено'
                            }
                        </h2>
                        <div className="table-header__buttons">
                            {/* Додано кнопку "Додати" */}
                            <Button
                                onClick={openAddModal}
                                className="btn--primary"
                                icon={addIcon}
                            >
                                Додати
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
                            <Table columns={columnTable} dataSource={tableData} />
                            <Pagination
                                className="m-b"
                                currentPage={parseInt(data?.currentPage) || 1}
                                totalCount={data?.totalItems || 1}
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
                                    name="name"
                                    type="text"
                                    placeholder="Введіть назву послуги"
                                    value={state.selectData?.name || ''}
                                    onChange={onHandleChange}
                                />
                            </div>
                            <div className="table-filter__item">
                                <h4 className="input-description">Одиниця виміру</h4>
                                <Input
                                    icon={searchIcon}
                                    name="unit"
                                    type="text"
                                    placeholder="Введіть одиницю виміру"
                                    value={state.selectData?.unit || ''}
                                    onChange={onHandleChange}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Модальне вікно для підтвердження генерації документів */}
            <Transition in={!!state.itemId} timeout={200} unmountOnExit nodeRef={nodeRef}>
                {transitionState => (
                    <Modal
                        className={transitionState === 'entered' ? "modal-window-wrapper--active" : ""}
                        onClose={handleCloseModal}
                        onOk={handleGenerate}
                        confirmLoading={state.confirmLoading}
                        cancelText="Скасувати"
                        okText="Так, сформувати"
                        title="Підтвердження формування реквізитів"
                    >
                        <p className="paragraph">
                            Ви впевнені, що бажаєте виконати операцію "Сформувати реквізити"?
                        </p>
                    </Modal>
                )}
            </Transition>
            
            {/* Нове модальне вікно для додавання послуги */}
            <Transition in={addModalState.isOpen} timeout={200} unmountOnExit nodeRef={addFormRef}>
                {transitionState => (
                    <Modal
                        className={transitionState === 'entered' ? "modal-window-wrapper--active" : ""}
                        onClose={closeAddModal}
                        onOk={handleAddFormSubmit}
                        confirmLoading={addModalState.loading}
                        cancelText="Скасувати"
                        okText="Зберегти"
                        title="Додавання нової послуги басейну"
                        width="500px"
                    >
                        <div className="form-container">
                            <FormItem 
                                label="Назва послуги" 
                                required 
                                fullWidth
                            >
                                <Input
                                    name="name"
                                    value={addModalState.formData.name}
                                    onChange={onAddFormChange}
                                    placeholder="Введіть назву послуги"
                                />
                            </FormItem>
                            
                            <FormItem 
                                label="Одиниця виміру" 
                                required 
                                fullWidth
                            >
                                <Input
                                    name="unit"
                                    value={addModalState.formData.unit}
                                    onChange={onAddFormChange}
                                    placeholder="Введіть одиницю виміру (наприклад, година)"
                                />
                            </FormItem>

                            <FormItem 
                                label="Група послуг" 
                                required 
                                fullWidth
                            >
                                <Select
                                name="service_group_id"
                                placeholder="Виберіть групу"
                                value={addModalState.formData.service_group_id}
                                onChange={(name, option) => onAddFormChange(name, option)}
                                options={serviceGroups}
                                />
                            </FormItem>

                            <FormItem 
                                label="Ціна" 
                                required 
                                fullWidth
                            >
                                <Input
                                    name="price"
                                    type="number"
                                    value={addModalState.formData.price}
                                    onChange={onAddFormChange}
                                    placeholder="Введіть ціну"
                                />
                            </FormItem>
                        </div>
                    </Modal>
                )}
            </Transition>
        </>
    );
};

export default Services;