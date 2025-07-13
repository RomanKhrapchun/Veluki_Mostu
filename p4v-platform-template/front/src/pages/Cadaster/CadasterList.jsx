import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from "../../hooks/useFetch";
import Table from "../../components/common/Table/Table";
import { generateIcon, iconMap, STATUS } from "../../utils/constants";
import Button from "../../components/common/Button/Button";
import PageError from "../ErrorPage/PageError";
import Pagination from "../../components/common/Pagination/Pagination";
import Input from "../../components/common/Input/Input";
import { fetchFunction, hasOnlyAllowedParams, validateFilters, handleKeyDown } from "../../utils/function";
import Modal from "../../components/common/Modal/Modal";
import { Transition } from 'react-transition-group';
import { useNotification } from "../../hooks/useNotification";
import { Context } from "../../main";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";
import FormItem from "../../components/common/FormItem/FormItem";
import Dropdown from "../../components/common/Dropdown/Dropdown";
import classNames from "classnames";

// Іконки
const uploadIcon = generateIcon(iconMap.upload, null, 'currentColor', 20, 20);
const addIcon = generateIcon(iconMap.plus, null, 'currentColor', 20, 20);
const editIcon = generateIcon(iconMap.edit, null, 'currentColor', 20, 20);
const deleteIcon = generateIcon(iconMap.delete, null, 'currentColor', 20, 20);
const searchIcon = generateIcon(iconMap.search, 'input-icon', 'currentColor', 16, 16);
const saveIcon = generateIcon(iconMap.save, null, 'currentColor', 20, 20);
const backIcon = generateIcon(iconMap.back, null, 'currentColor', 20, 20);
const viewIcon = generateIcon(iconMap.view, null, 'currentColor', 20, 20);
const filterIcon = generateIcon(iconMap.filter, null, 'currentColor', 20, 20);
const dropDownIcon = generateIcon(iconMap.arrowDown, null, 'currentColor', 20, 20);

const dropDownStyle = {
    padding: "8px 16px",
    width: "150px"
};

const childDropDownStyle = {
    padding: "8px 16px"
};

const CadasterList = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    
    const nodeRef = useRef(null);
    const uploadNodeRef = useRef(null);
    const createNodeRef = useRef(null);
    const editNodeRef = useRef(null);
    const viewNodeRef = useRef(null);
    const fileInputRef = useRef(null);
    const isFirstRun = useRef(true);

    const [stateCadaster, setStateCadaster] = useState({
        // Основні стани
        sendData: {
            limit: 16,
            page: 1,
        },
        selectData: {},
        
        // Модальні вікна
        isDeleteModalOpen: false,
        isUploadModalOpen: false,
        isCreateModalOpen: false,
        isEditModalOpen: false,
        isViewModalOpen: false,
        isFilterOpen: false,
        
        // Завантаження
        confirmLoading: false,
        uploadLoading: false,
        createLoading: false,
        editLoading: false,
        
        // Дані
        deletedItemId: null,
        selectedFile: null,
        editingItem: null,
        viewingItem: null,
        
        // Форма створення/редагування
        formData: {
            payer_name: '',
            payer_address: '',
            iban: '',
            plot_area: '',
            land_tax: '',
            tax_address: '',
            cadastral_number: ''
        },
        formErrors: {}
    });

    const { error, status, data, retryFetch } = useFetch('api/cadaster/filter', {
        method: 'post',
        data: stateCadaster.sendData
    });

    const startRecord = ((stateCadaster.sendData.page || 1) - 1) * stateCadaster.sendData.limit + 1;
    const endRecord = Math.min(startRecord + stateCadaster.sendData.limit - 1, data?.totalItems || 1);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        retryFetch('api/cadaster/filter', {
            method: 'post',
            data: stateCadaster.sendData,
        });
    }, [stateCadaster.sendData, retryFetch]);

    // ===== МЕНЮ DROPDOWN =====
    const itemMenu = [
        {
            label: '16',
            key: '16',
            onClick: () => {
                if (stateCadaster.sendData.limit !== 16) {
                    setStateCadaster(prevState => ({
                        ...prevState,
                        sendData: {
                            ...prevState.sendData,
                            limit: 16,
                            page: 1,
                        }
                    }))
                }
            },
        },
        {
            label: '32',
            key: '32',
            onClick: () => {
                if (stateCadaster.sendData.limit !== 32) {
                    setStateCadaster(prevState => ({
                        ...prevState,
                        sendData: {
                            ...prevState.sendData,
                            limit: 32,
                            page: 1,
                        }
                    }))
                }
            },
        },
        {
            label: '48',
            key: '48',
            onClick: () => {
                if (stateCadaster.sendData.limit !== 48) {
                    setStateCadaster(prevState => ({
                        ...prevState,
                        sendData: {
                            ...prevState.sendData,
                            limit: 48,
                            page: 1,
                        }
                    }))
                }
            },
        },
    ];

    // ===== ПОШУК ТА ПАГІНАЦІЯ =====
    const onHandleChange = (name, value) => {
        console.log('Filter change:', name, value);
        setStateCadaster(prevState => ({
            ...prevState,
            selectData: {
                ...prevState.selectData,
                [name]: value
            }
        }))
    }

    const onPageChange = useCallback((page) => {
        if (stateCadaster.sendData.page !== page) {
            setStateCadaster(prevState => ({
                ...prevState,
                sendData: {
                    ...prevState.sendData,
                    page,
                }
            }));
        }
    }, [stateCadaster.sendData.page]);

    // ===== ФІЛЬТРИ =====
    const filterHandleClick = () => {
        console.log('Filter button clicked');
        setStateCadaster(prevState => ({
            ...prevState,
            isFilterOpen: !prevState.isFilterOpen,
        }))
    }

    const hasActiveFilters = useMemo(() => {
        return Object.values(stateCadaster.selectData).some(value => {
            if (Array.isArray(value) && !value.length) {
                return false
            }
            return value !== null && value !== undefined && value !== ''
        })
    }, [stateCadaster.selectData])

    const applyFilter = () => {
        console.log('Apply filter:', stateCadaster.selectData);
        const isAnyInputFilled = Object.values(stateCadaster.selectData).some(value => {
            if (Array.isArray(value) && !value.length) {
                return false
            }
            return value
        })
        if (isAnyInputFilled) {
            setStateCadaster(prevState => ({
                ...prevState,
                sendData: {
                    ...stateCadaster.selectData,
                    limit: prevState.sendData.limit,
                    page: 1,
                }
            }))
        }
    }

    const resetFilters = () => {
        console.log('Reset filters');
        setStateCadaster(prevState => ({
            ...prevState,
            selectData: {},
            sendData: {
                limit: prevState.sendData.limit,
                page: 1,
            }
        }))
    }

    // ===== ВАЛІДАЦІЯ ФОРМИ =====
    const validateForm = useCallback((formData) => {
        const newErrors = {};

        if (!formData.payer_name.trim()) {
            newErrors.payer_name = 'ПІБ платника є обов\'язковим';
        }

        if (!formData.payer_address.trim()) {
            newErrors.payer_address = 'Адреса платника є обов\'язковою';
        }

        if (!formData.iban.trim()) {
            newErrors.iban = 'IBAN є обов\'язковим';
        } else if (!/^UA\d{27}$/.test(formData.iban)) {
            newErrors.iban = 'IBAN має бути у форматі UA + 27 цифр';
        }

        if (!formData.plot_area || parseFloat(formData.plot_area) <= 0) {
            newErrors.plot_area = 'Площа діляки повинна бути більше 0';
        }

        if (!formData.land_tax || parseFloat(formData.land_tax) <= 0) {
            newErrors.land_tax = 'Земельний податок повинен бути більше 0';
        }

        if (!formData.tax_address.trim()) {
            newErrors.tax_address = 'Податкова адреса є обов\'язковою';
        }

        if (!formData.cadastral_number.trim()) {
            newErrors.cadastral_number = 'Кадастровий номер є обов\'язковим';
        }

        return newErrors;
    }, []);

    const handleInputChange = useCallback((name, value) => {
        setStateCadaster(prevState => ({
            ...prevState,
            formData: {
                ...prevState.formData,
                [name]: value
            },
            formErrors: {
                ...prevState.formErrors,
                [name]: undefined
            }
        }));
    }, []);

    // ===== СТВОРЕННЯ ЗАПИСУ =====
    const handleCreateClick = useCallback(() => {
        console.log('Create button clicked');
        setStateCadaster(prevState => ({
            ...prevState,
            isCreateModalOpen: true,
            formData: {
                payer_name: '',
                payer_address: '',
                iban: '',
                plot_area: '',
                land_tax: '',
                tax_address: '',
                cadastral_number: ''
            },
            formErrors: {}
        }));
    }, []);

    const handleCreateSave = useCallback(async () => {
        console.log('Create save clicked');
        const errors = validateForm(stateCadaster.formData);
        
        if (Object.keys(errors).length > 0) {
            setStateCadaster(prevState => ({
                ...prevState,
                formErrors: errors
            }));
            notification({
                type: "warning",
                title: "Помилка валідації",
                message: "Будь ласка, виправте помилки у формі",
                placement: "top"
            });
            return;
        }

        setStateCadaster(prevState => ({ ...prevState, createLoading: true }));

        try {
            const response = await fetchFunction('api/cadaster', {
                method: 'POST',
                data: {
                    ...stateCadaster.formData,
                    plot_area: parseFloat(stateCadaster.formData.plot_area),
                    land_tax: parseFloat(stateCadaster.formData.land_tax)
                }
            });

            if (response && !response.error) {
                notification({
                    type: "success",
                    title: "Успіх",
                    message: response.message || "Кадастровий запис успішно створено",
                    placement: "top"
                });
                
                retryFetch();
                setStateCadaster(prevState => ({
                    ...prevState,
                    isCreateModalOpen: false,
                    formData: {
                        payer_name: '',
                        payer_address: '',
                        iban: '',
                        plot_area: '',
                        land_tax: '',
                        tax_address: '',
                        cadastral_number: ''
                    },
                    formErrors: {}
                }));
            }
        } catch (error) {
            notification({
                type: "error",
                title: "Помилка",
                message: error.message || "Помилка при створенні",
                placement: "top"
            });
        } finally {
            setStateCadaster(prevState => ({ ...prevState, createLoading: false }));
        }
    }, [stateCadaster.formData, validateForm, notification, retryFetch]);

    // ===== РЕДАГУВАННЯ ЗАПИСУ =====
    const handleEditClick = useCallback(async (id) => {
        console.log('Edit button clicked for id:', id);
        try {
            const response = await fetchFunction(`api/cadaster/${id}`);
            if (response && !response.error) {
                setStateCadaster(prevState => ({
                    ...prevState,
                    isEditModalOpen: true,
                    editingItem: response,
                    formData: {
                        payer_name: response.payer_name || '',
                        payer_address: response.payer_address || '',
                        iban: response.iban || '',
                        plot_area: response.plot_area || '',
                        land_tax: response.land_tax || '',
                        tax_address: response.tax_address || '',
                        cadastral_number: response.cadastral_number || ''
                    },
                    formErrors: {}
                }));
            }
        } catch (error) {
            notification({
                type: "error",
                title: "Помилка",
                message: "Помилка при завантаженні даних",
                placement: "top"
            });
        }
    }, [notification]);

    const handleEditSave = useCallback(async () => {
        console.log('Edit save clicked');
        const errors = validateForm(stateCadaster.formData);
        
        if (Object.keys(errors).length > 0) {
            setStateCadaster(prevState => ({
                ...prevState,
                formErrors: errors
            }));
            notification({
                type: "warning",
                title: "Помилка валідації",
                message: "Будь ласка, виправте помилки у формі",
                placement: "top"
            });
            return;
        }

        setStateCadaster(prevState => ({ ...prevState, editLoading: true }));

        try {
            const response = await fetchFunction(`api/cadaster/${stateCadaster.editingItem.id}`, {
                method: 'PUT',
                data: {
                    ...stateCadaster.formData,
                    plot_area: parseFloat(stateCadaster.formData.plot_area),
                    land_tax: parseFloat(stateCadaster.formData.land_tax)
                }
            });

            if (response && !response.error) {
                notification({
                    type: "success",
                    title: "Успіх",
                    message: response.message || "Кадастровий запис успішно оновлено",
                    placement: "top"
                });
                
                retryFetch();
                setStateCadaster(prevState => ({
                    ...prevState,
                    isEditModalOpen: false,
                    editingItem: null,
                    formErrors: {}
                }));
            }
        } catch (error) {
            notification({
                type: "error",
                title: "Помилка",
                message: error.message || "Помилка при збереженні",
                placement: "top"
            });
        } finally {
            setStateCadaster(prevState => ({ ...prevState, editLoading: false }));
        }
    }, [stateCadaster.formData, stateCadaster.editingItem, validateForm, notification, retryFetch]);

    // ===== ПЕРЕГЛЯД ЗАПИСУ =====
    const handleViewClick = useCallback(async (id) => {
        console.log('View button clicked for id:', id);
        try {
            const response = await fetchFunction(`api/cadaster/${id}`);
            if (response && !response.error) {
                setStateCadaster(prevState => ({
                    ...prevState,
                    isViewModalOpen: true,
                    viewingItem: response
                }));
            }
        } catch (error) {
            notification({
                type: "error",
                title: "Помилка",
                message: "Помилка при завантаженні даних",
                placement: "top"
            });
        }
    }, [notification]);

    // ===== ВИДАЛЕННЯ ЗАПИСУ =====
    const handleDeleteClick = useCallback((id) => {
        console.log('Delete button clicked for id:', id);
        setStateCadaster(prevState => ({
            ...prevState,
            isDeleteModalOpen: true,
            deletedItemId: id,
        }));
    }, []);

    const confirmDelete = useCallback(async () => {
        console.log('Confirm delete for id:', stateCadaster.deletedItemId);
        setStateCadaster(prevState => ({ ...prevState, confirmLoading: true }));
        
        try {
            const response = await fetchFunction(`api/cadaster/${stateCadaster.deletedItemId}`, {
                method: 'DELETE',
            });
            
            if (response && !response.error) {
                notification({
                    type: "success",
                    title: "Успіх",
                    message: response.message || "Запис успішно видалено",
                    placement: "top"
                });
                retryFetch();
            }
        } catch (error) {
            notification({
                type: "error",
                title: "Помилка",
                message: error.message || "Помилка при видаленні",
                placement: "top"
            });
        } finally {
            setStateCadaster(prevState => ({
                ...prevState,
                isDeleteModalOpen: false,
                confirmLoading: false,
                deletedItemId: null,
            }));
        }
    }, [stateCadaster.deletedItemId, notification, retryFetch]);

    // ===== ЗАВАНТАЖЕННЯ EXCEL =====
    const handleFileUploadClick = useCallback(() => {
        console.log('Upload button clicked');
        setStateCadaster(prevState => ({
            ...prevState,
            isUploadModalOpen: true,
        }));
    }, []);

    const handleFileSelect = useCallback((event) => {
        const file = event.target.files?.[0];
        console.log('File selected:', file);
        
        if (file) {
            const fileName = file.name.toLowerCase();
            const isValidFormat = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
            
            if (!isValidFormat) {
                notification({
                    type: 'warning',
                    placement: 'top',
                    title: 'Помилка',
                    message: 'Файл має бути у форматі Excel (.xls або .xlsx)!'
                });
                return;
            }
            
            setStateCadaster(prevState => ({
                ...prevState,
                selectedFile: file,
            }));
        }
    }, [notification]);

    const handleDragOver = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDragLeave = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        e.stopPropagation();
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            const fileName = file.name.toLowerCase();
            const isValidFormat = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
            
            if (!isValidFormat) {
                notification({
                    type: 'warning',
                    placement: 'top',
                    title: 'Помилка',
                    message: 'Файл має бути у форматі Excel (.xls або .xlsx)!'
                });
                return;
            }
            
            setStateCadaster(prevState => ({
                ...prevState,
                selectedFile: file,
            }));
        }
    }, [notification]);

    const handleDivClick = useCallback(() => {
        fileInputRef.current?.click();
    }, []);

    const handleUploadFile = useCallback(async () => {
        console.log('Upload file:', stateCadaster.selectedFile);
        if (!stateCadaster.selectedFile) {
            notification({
                type: 'warning',
                placement: 'top',
                title: 'Помилка',
                message: 'Оберіть файл для завантаження!'
            });
            return;
        }

        setStateCadaster(prevState => ({ ...prevState, uploadLoading: true }));

        try {
            const formData = new FormData();
            formData.append('file', stateCadaster.selectedFile);

            const response = await fetchFunction('api/cadaster/upload', {
                method: 'POST',
                data: formData,
            });

            if (response && response.success) {
                notification({
                    type: "success",
                    title: "Успіх",
                    message: response.message || "Файл успішно завантажено",
                    placement: "top"
                });
                
                retryFetch();
                setStateCadaster(prevState => ({
                    ...prevState,
                    isUploadModalOpen: false,
                    selectedFile: null,
                }));
            }
        } catch (error) {
            notification({
                type: "error",
                title: "Помилка",
                message: error.message || "Помилка при завантаженні файлу",
                placement: "top"
            });
        } finally {
            setStateCadaster(prevState => ({ ...prevState, uploadLoading: false }));
        }
    }, [stateCadaster.selectedFile, notification, retryFetch]);

    // ===== ЗАКРИТТЯ МОДАЛЬНИХ ВІКОН =====
    const closeModals = useCallback(() => {
        console.log('Close modals');
        setStateCadaster(prevState => ({
            ...prevState,
            isDeleteModalOpen: false,
            isUploadModalOpen: false,
            isCreateModalOpen: false,
            isEditModalOpen: false,
            isViewModalOpen: false,
            deletedItemId: null,
            selectedFile: null,
            editingItem: null,
            viewingItem: null,
            formErrors: {}
        }));
    }, []);

    // ===== КОЛОНКИ ТАБЛИЦІ =====
    const columns = useMemo(() => [
        {
            title: '№',
            key: 'index',
            width: '60px',
            render: (_, record, index) => startRecord + index
        },
        {
            title: 'ПІБ Платника',
            dataIndex: 'payer_name',
            key: 'payer_name',
            ellipsis: true,
        },
        {
            title: 'Адреса платника',
            dataIndex: 'payer_address',
            key: 'payer_address',
            ellipsis: true,
        },
        {
            title: 'IBAN',
            dataIndex: 'iban',
            key: 'iban',
            width: '200px',
        },
        {
            title: 'Площа діляки (га)',
            dataIndex: 'plot_area',
            key: 'plot_area',
            width: '120px',
            render: (value) => value ? `${parseFloat(value).toFixed(2)} га` : '-'
        },
        {
            title: 'Земельний податок (грн)',
            dataIndex: 'land_tax',
            key: 'land_tax',
            width: '140px',
            render: (value) => value ? `${parseFloat(value).toFixed(2)} грн` : '-'
        },
        {
            title: 'Кадастровий номер',
            dataIndex: 'cadastral_number',
            key: 'cadastral_number',
            width: '160px',
        },
        {
            title: 'Дія',
            key: 'action',
            width: '150px',
            render: (_, record) => (
                <div className="btn-sticky" style={{ justifyContent: 'center', gap: '4px' }}>
                    <Button
                        title="Переглянути"
                        icon={viewIcon}
                        onClick={() => handleViewClick(record.id)}
                    />
                    <Button
                        title="Редагувати"
                        icon={editIcon}
                        onClick={() => handleEditClick(record.id)}
                    />
                    <Button
                        title="Видалити"
                        icon={deleteIcon}
                        onClick={() => handleDeleteClick(record.id)}
                        danger
                    />
                </div>
            ),
        },
    ], [startRecord, handleViewClick, handleEditClick, handleDeleteClick]);

    // ===== РЕНДЕР ФОРМИ =====
    const renderForm = (formData, formErrors, handleInputChange) => (
        <div className="form-grid">
            <FormItem 
                label="ПІБ Платника" 
                required 
                error={formErrors.payer_name}
            >
                <Input
                    value={formData.payer_name}
                    onChange={(_, value) => handleInputChange('payer_name', value)}
                    placeholder="Введіть ПІБ платника"
                    onKeyDown={handleKeyDown}
                />
            </FormItem>

            <FormItem 
                label="Адреса платника" 
                required 
                error={formErrors.payer_address}
            >
                <Input
                    value={formData.payer_address}
                    onChange={(_, value) => handleInputChange('payer_address', value)}
                    placeholder="Введіть адресу платника"
                    onKeyDown={handleKeyDown}
                />
            </FormItem>

            <FormItem 
                label="IBAN" 
                required 
                error={formErrors.iban}
            >
                <Input
                    value={formData.iban}
                    onChange={(_, value) => handleInputChange('iban', value)}
                    placeholder="UA123456789012345678901234567"
                    onKeyDown={handleKeyDown}
                />
            </FormItem>

            <FormItem 
                label="Площа діляки (га)" 
                required 
                error={formErrors.plot_area}
            >
                <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.plot_area}
                    onChange={(_, value) => handleInputChange('plot_area', value)}
                    placeholder="Введіть площу в гектарах"
                    onKeyDown={handleKeyDown}
                />
            </FormItem>

            <FormItem 
                label="Земельний податок (грн)" 
                required 
                error={formErrors.land_tax}
            >
                <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.land_tax}
                    onChange={(_, value) => handleInputChange('land_tax', value)}
                    placeholder="Введіть суму податку в гривнях"
                    onKeyDown={handleKeyDown}
                />
            </FormItem>

            <FormItem 
                label="Податкова адреса платника" 
                required 
                error={formErrors.tax_address}
            >
                <Input
                    value={formData.tax_address}
                    onChange={(_, value) => handleInputChange('tax_address', value)}
                    placeholder="Введіть податкову адресу"
                    onKeyDown={handleKeyDown}
                />
            </FormItem>

            <FormItem 
                label="Кадастровий номер" 
                required 
                error={formErrors.cadastral_number}
            >
                <Input
                    value={formData.cadastral_number}
                    onChange={(_, value) => handleInputChange('cadastral_number', value)}
                    placeholder="Введіть кадастровий номер"
                    onKeyDown={handleKeyDown}
                />
            </FormItem>
        </div>
    );

    if (status === STATUS.ERROR) {
        return <PageError onRetry={retryFetch} />;
    }

    return (
        <React.Fragment>
            {status === STATUS.PENDING ? <SkeletonPage /> : null}
            {status === STATUS.SUCCESS ? (
                <React.Fragment>
                    <div className="table-elements">
                        <div className="table-header">
                            <h2 className="title title--sm">
                                {data?.data && Array.isArray(data?.data) && data?.data.length > 0 ? (
                                    <React.Fragment>
                                        Показує {startRecord !== endRecord ? `${startRecord}-${endRecord}` : startRecord} з {data?.totalItems || 1}
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>Записів не знайдено</React.Fragment>
                                )}
                            </h2>
                            <div className="table-header__buttons">
                                                               <Button
                                    icon={uploadIcon}
                                    onClick={handleFileUploadClick}
                                >
                                    Завантажити Excel
                                </Button>
                                <Button
                                    type="primary"
                                    icon={addIcon}
                                    onClick={handleCreateClick}
                                >
                                    Додати запис
                                </Button>
                                <Dropdown
                                    icon={dropDownIcon}
                                    iconPosition="right"
                                    style={dropDownStyle}
                                    childStyle={childDropDownStyle}
                                    caption={`Записів: ${stateCadaster.sendData.limit}`}
                                    menu={itemMenu}
                                />
                                <Button
                                    className={`table-filter-trigger ${hasActiveFilters ? 'has-active-filters' : ''}`}
                                    onClick={filterHandleClick}
                                    icon={filterIcon}
                                >
                                    Фільтри {hasActiveFilters && `(${Object.keys(stateCadaster.selectData).filter(key => stateCadaster.selectData[key]).length})`}
                                </Button>
                            </div>
                        </div>
                        <div className="table-main">
                            <div style={{ width: `${data?.data?.length > 0 ? 'auto' : '100%'}` }}
                                 className={classNames("table-and-pagination-wrapper", { "table-and-pagination-wrapper--active": stateCadaster.isFilterOpen })}>
                                <Table columns={columns} dataSource={data?.data || []} />
                                {data?.totalItems > 0 && (
                                    <Pagination
                                        className="m-b"
                                        currentPage={stateCadaster.sendData.page}
                                        totalCount={data.totalItems}
                                        pageSize={stateCadaster.sendData.limit}
                                        onPageChange={onPageChange}
                                    />
                                )}
                            </div>
                            <div className={`table-filter ${stateCadaster.isFilterOpen ? "table-filter--active" : ""}`}>
                                <h3 className="title title--sm">
                                    Фільтри
                                </h3>
                                <div className="btn-group">
                                    <Button onClick={applyFilter}>
                                        Застосувати
                                    </Button>
                                    <Button className="btn--secondary" onClick={resetFilters}>
                                        Скинути
                                    </Button>
                                </div>
                                <div className="table-filter__item">
                                    <Input
                                        icon={searchIcon}
                                        name="search"
                                        type="text"
                                        placeholder="Введіть пошуковий запит"
                                        value={stateCadaster.selectData?.search || ''}
                                        onChange={(name, value) => onHandleChange(name, value)}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            ) : null}

            {/* ===== МОДАЛЬНІ ВІКНА ===== */}

            {/* Модальне вікно видалення */}
            <Transition in={stateCadaster.isDeleteModalOpen} timeout={200} nodeRef={nodeRef}>
                {(transitionState) => (
                    <Modal
                        ref={nodeRef}
                        className={`${transitionState === 'entered' ? "modal-window-wrapper--active" : ""}`}
                        onClose={closeModals}
                        onOk={confirmDelete}
                        confirmLoading={stateCadaster.confirmLoading}
                        cancelText="Скасувати"
                        okText="Так, видалити"
                        title="Підтвердження видалення"
                    >
                        <p className="paragraph">
                            Ви впевнені, що хочете видалити цей кадастровий запис?
                        </p>
                    </Modal>
                )}
            </Transition>

            {/* Модальне вікно завантаження Excel */}
            <Transition in={stateCadaster.isUploadModalOpen} timeout={200} nodeRef={uploadNodeRef}>
                {(transitionState) => (
                    <Modal
                        ref={uploadNodeRef}
                        className={`${transitionState === 'entered' ? "modal-window-wrapper--active" : ""}`}
                        onClose={closeModals}
                        onOk={handleUploadFile}
                        confirmLoading={stateCadaster.uploadLoading}
                        cancelText="Скасувати"
                        okText="Завантажити"
                        title="Завантаження Excel файлу"
                        okButtonProps={{ disabled: !stateCadaster.selectedFile }}
                    >
                        <div className="upload-modal-content">
                            <p style={{ marginBottom: '16px' }}>
                                Оберіть Excel файл (.xlsx або .xls) з кадастровими записами для завантаження.
                            </p>
                            
                            <div style={{ marginBottom: '16px' }}>
                                <strong>Структура файлу повинна містити колонки:</strong>
                                <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
                                    <li>ПІБ Платника</li>
                                    <li>Адреса платника</li>
                                    <li>IBAN</li>
                                    <li>Площа діляки</li>
                                    <li>Земельний податок</li>
                                    <li>Податкова адреса</li>
                                    <li>Кадастровий номер</li>
                                </ul>
                            </div>
                            
                            <div 
                                style={{
                                    position: 'relative',
                                    marginBottom: '16px'
                                }}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={handleDivClick}
                            >
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                                    onChange={handleFileSelect}
                                    style={{
                                        position: 'absolute',
                                        opacity: 0,
                                        width: '100%',
                                        height: '100%',
                                        cursor: 'pointer',
                                        zIndex: 1
                                    }}
                                />
                                <div style={{
                                    width: '100%',
                                    padding: '20px',
                                    border: '2px dashed #007bff',
                                    borderRadius: '8px',
                                    backgroundColor: stateCadaster.selectedFile ? '#e8f4f8' : '#f8f9fa',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transition: 'all 0.3s ease',
                                    minHeight: '80px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center',
                                    alignItems: 'center'
                                }}>
                                    <div style={{
                                        fontSize: '24px',
                                        marginBottom: '8px',
                                        color: '#007bff'
                                    }}>
                                        📁
                                    </div>
                                    <p style={{
                                        margin: 0,
                                        fontSize: '14px',
                                        color: '#495057',
                                        fontWeight: '500'
                                    }}>
                                        {stateCadaster.selectedFile 
                                            ? `Обрано файл: ${stateCadaster.selectedFile.name}` 
                                            : 'Перетягніть файл сюди або натисніть для вибору'
                                        }
                                    </p>
                                </div>
                            </div>
                        </div>
                    </Modal>
                )}
            </Transition>

            {/* Модальне вікно створення */}
            <Transition in={stateCadaster.isCreateModalOpen} timeout={200} nodeRef={createNodeRef}>
                {(transitionState) => (
                    <Modal
                        ref={createNodeRef}
                        className={`${transitionState === 'entered' ? "modal-window-wrapper--active" : ""}`}
                        onClose={closeModals}
                        onOk={handleCreateSave}
                        confirmLoading={stateCadaster.createLoading}
                        cancelText="Скасувати"
                        okText="Створити"
                        title="Створення кадастрового запису"
                        width="800px"
                    >
                        {renderForm(stateCadaster.formData, stateCadaster.formErrors, handleInputChange)}
                    </Modal>
                )}
            </Transition>

            {/* Модальне вікно редагування */}
            <Transition in={stateCadaster.isEditModalOpen} timeout={200} nodeRef={editNodeRef}>
                {(transitionState) => (
                    <Modal
                        ref={editNodeRef}
                        className={`${transitionState === 'entered' ? "modal-window-wrapper--active" : ""}`}
                        onClose={closeModals}
                        onOk={handleEditSave}
                        confirmLoading={stateCadaster.editLoading}
                        cancelText="Скасувати"
                        okText="Зберегти"
                        title="Редагування кадастрового запису"
                        width="800px"
                    >
                        {renderForm(stateCadaster.formData, stateCadaster.formErrors, handleInputChange)}
                    </Modal>
                )}
            </Transition>

            {/* Модальне вікно перегляду */}
            <Transition in={stateCadaster.isViewModalOpen} timeout={200} nodeRef={viewNodeRef}>
                {(transitionState) => (
                    <Modal
                        ref={viewNodeRef}
                        className={`${transitionState === 'entered' ? "modal-window-wrapper--active" : ""}`}
                        onClose={closeModals}
                        cancelText="Закрити"
                        title="Перегляд кадастрового запису"
                        width="800px"
                        footer={
                            <div className="modal-actions">
                                <Button onClick={closeModals}>Закрити</Button>
                                <Button
                                    type="primary"
                                    icon={editIcon}
                                    onClick={() => {
                                        closeModals();
                                        setTimeout(() => handleEditClick(stateCadaster.viewingItem.id), 100);
                                    }}
                                >
                                    Редагувати
                                </Button>
                            </div>
                        }
                    >
                        {stateCadaster.viewingItem && (
                            <div className="detail-grid">
                                <div className="detail-item">
                                    <label className="detail-label">ПІБ Платника:</label>
                                    <div className="detail-value">{stateCadaster.viewingItem.payer_name}</div>
                                </div>

                                <div className="detail-item">
                                    <label className="detail-label">Адреса платника:</label>
                                    <div className="detail-value">{stateCadaster.viewingItem.payer_address}</div>
                                </div>

                                <div className="detail-item">
                                    <label className="detail-label">IBAN:</label>
                                    <div className="detail-value">{stateCadaster.viewingItem.iban}</div>
                                </div>

                                <div className="detail-item">
                                    <label className="detail-label">Площа діляки:</label>
                                    <div className="detail-value">
                                        {stateCadaster.viewingItem.plot_area ? `${parseFloat(stateCadaster.viewingItem.plot_area).toFixed(4)} га` : '-'}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <label className="detail-label">Земельний податок:</label>
                                    <div className="detail-value">
                                        {stateCadaster.viewingItem.land_tax ? `${parseFloat(stateCadaster.viewingItem.land_tax).toFixed(2)} грн` : '-'}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <label className="detail-label">Податкова адреса платника:</label>
                                    <div className="detail-value">{stateCadaster.viewingItem.tax_address}</div>
                                </div>

                                <div className="detail-item">
                                    <label className="detail-label">Кадастровий номер:</label>
                                    <div className="detail-value">{stateCadaster.viewingItem.cadastral_number}</div>
                                </div>

                                {stateCadaster.viewingItem.created_at && (
                                    <div className="detail-item">
                                        <label className="detail-label">Дата створення:</label>
                                        <div className="detail-value">
                                            {new Date(stateCadaster.viewingItem.created_at).toLocaleString('uk-UA')}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </Modal>
                )}
            </Transition>
        </React.Fragment>
    );
};

export default CadasterList;