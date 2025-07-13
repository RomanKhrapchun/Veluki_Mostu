import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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

// Іконки
const uploadIcon = generateIcon(iconMap.upload, null, 'currentColor', 20, 20);
const addIcon = generateIcon(iconMap.plus, null, 'currentColor', 20, 20);
const editIcon = generateIcon(iconMap.edit, null, 'currentColor', 20, 20);
const deleteIcon = generateIcon(iconMap.delete, null, 'currentColor', 20, 20);
const searchIcon = generateIcon(iconMap.search, 'input-icon', 'currentColor', 16, 16);
const saveIcon = generateIcon(iconMap.save, null, 'currentColor', 20, 20);
const backIcon = generateIcon(iconMap.back, null, 'currentColor', 20, 20);
const viewIcon = generateIcon(iconMap.view, null, 'currentColor', 20, 20);

const CadasterList = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const { id } = useParams();
    
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
            search: ''
        },
        
        // Модальні вікна
        isDeleteModalOpen: false,
        isUploadModalOpen: false,
        isCreateModalOpen: false,
        isEditModalOpen: false,
        isViewModalOpen: false,
        
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
        retryFetch();
    }, [stateCadaster.sendData]);

    // ===== ПОШУК ТА ПАГІНАЦІЯ =====
    const handleSearch = useCallback((_, value) => {
        setStateCadaster(prevState => ({
            ...prevState,
            sendData: {
                ...prevState.sendData,
                search: value,
                page: 1
            }
        }));
    }, []);

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
            // Очищуємо помилку для цього поля
            formErrors: {
                ...prevState.formErrors,
                [name]: undefined
            }
        }));
    }, []);

    // ===== СТВОРЕННЯ ЗАПИСУ =====
    const handleCreateClick = useCallback(() => {
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
        setStateCadaster(prevState => ({
            ...prevState,
            isDeleteModalOpen: true,
            deletedItemId: id,
        }));
    }, []);

    const confirmDelete = useCallback(async () => {
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
        setStateCadaster(prevState => ({
            ...prevState,
            isUploadModalOpen: true,
        }));
    }, []);

    const handleFileSelect = useCallback((event) => {
        const file = event.target.files?.[0];
        
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
            render: (_, index) => startRecord + index
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
                <div className="table-actions">
                    <Button
                        type="icon"
                        icon={viewIcon}
                        onClick={() => handleViewClick(record.id)}
                        title="Переглянути"
                    />
                    <Button
                        type="icon"
                        icon={editIcon}
                        onClick={() => handleEditClick(record.id)}
                        title="Редагувати"
                    />
                    <Button
                        type="icon"
                        icon={deleteIcon}
                        onClick={() => handleDeleteClick(record.id)}
                        title="Видалити"
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

    if (status === STATUS.LOADING) {
        return <SkeletonPage />;
    }

    return (
        <div className="page">
            {/* Заголовок сторінки */}
            <div className="page-header">
                <h1 className="page-title">Кадастрові записи платників податків</h1>
                <div className="page-actions">
                    <Button
                        type="secondary"
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
                </div>
            </div>

            {/* Фільтри */}
            <div className="page-filters">
                <Input
                    placeholder="Пошук за ПІБ, кадастровим номером або адресою..."
                    icon={searchIcon}
                    value={stateCadaster.sendData.search}
                    onChange={handleSearch}
                    style={{ width: '400px' }}
                />
            </div>

            {/* Контент */}
            <div className="page-content">
                <Table
                    dataSource={data?.data || []}
                    columns={columns}
                    loading={status === STATUS.LOADING}
                    rowKey="id"
                />

                {data?.totalItems > 0 && (
                    <Pagination
                        current={stateCadaster.sendData.page}
                        pageSize={stateCadaster.sendData.limit}
                        total={data.totalItems}
                        onChange={onPageChange}
                        showSizeChanger={false}
                    />
                )}

                <div className="page-info">
                    Показано записи {startRecord} - {endRecord} з {data?.totalItems || 0}
                </div>
            </div>

            {/* ===== МОДАЛЬНІ ВІКНА ===== */}

            {/* Модальне вікно видалення */}
            <Transition in={stateCadaster.isDeleteModalOpen} timeout={200} nodeRef={nodeRef}>
                {(transitionState) => (
                    <Modal
                        ref={nodeRef}
                        isOpen={stateCadaster.isDeleteModalOpen}
                        onClose={closeModals}
                        title="Підтвердження видалення"
                        transitionState={transitionState}
                    >
                        <p>Ви впевнені, що хочете видалити цей кадастровий запис?</p>
                        <div className="modal-actions">
                            <Button onClick={closeModals}>Скасувати</Button>
                            <Button
                                type="danger"
                                onClick={confirmDelete}
                                loading={stateCadaster.confirmLoading}
                            >
                                Видалити
                            </Button>
                        </div>
                    </Modal>
                )}
            </Transition>

            {/* Модальне вікно завантаження Excel */}
            <Transition in={stateCadaster.isUploadModalOpen} timeout={200} nodeRef={uploadNodeRef}>
                {(transitionState) => (
                    <Modal
                        ref={uploadNodeRef}
                        isOpen={stateCadaster.isUploadModalOpen}
                        onClose={closeModals}
                        title="Завантаження Excel файлу"
                        transitionState={transitionState}
                        footer={
                            <div className="modal-actions">
                                <Button onClick={closeModals}>Скасувати</Button>
                                <Button
                                    type="primary"
                                    onClick={handleUploadFile}
                                    loading={stateCadaster.uploadLoading}
                                    disabled={!stateCadaster.selectedFile}
                                >
                                    Завантажити
                                </Button>
                            </div>
                        }
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
                            
                            {/* Drag & Drop зона */}
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
                        isOpen={stateCadaster.isCreateModalOpen}
                        onClose={closeModals}
                        title="Створення кадастрового запису"
                        transitionState={transitionState}
                        width="800px"
                        footer={
                            <div className="modal-actions">
                                <Button onClick={closeModals}>Скасувати</Button>
                                <Button
                                    type="primary"
                                    icon={saveIcon}
                                    onClick={handleCreateSave}
                                    loading={stateCadaster.createLoading}
                                >
                                    Створити
                                </Button>
                            </div>
                        }
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
                        isOpen={stateCadaster.isEditModalOpen}
                        onClose={closeModals}
                        title="Редагування кадастрового запису"
                        transitionState={transitionState}
                        width="800px"
                        footer={
                            <div className="modal-actions">
                                <Button onClick={closeModals}>Скасувати</Button>
                                <Button
                                    type="primary"
                                    icon={saveIcon}
                                    onClick={handleEditSave}
                                    loading={stateCadaster.editLoading}
                                >
                                    Зберегти
                                </Button>
                            </div>
                        }
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
                        isOpen={stateCadaster.isViewModalOpen}
                        onClose={closeModals}
                        title="Перегляд кадастрового запису"
                        transitionState={transitionState}
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
        </div>
    );
};

export default CadasterList;