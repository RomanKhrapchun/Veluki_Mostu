import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from "../../hooks/useFetch";
import Table from "../../components/common/Table/Table";
import { generateIcon, iconMap, STATUS } from "../../utils/constants";
import Button from "../../components/common/Button/Button";
import PageError from "../ErrorPage/PageError";
import Pagination from "../../components/common/Pagination/Pagination";
import Input from "../../components/common/Input/Input";
import { fetchFunction, validateFilters, handleKeyDown } from "../../utils/function";
import Modal from "../../components/common/Modal/Modal";
import { Transition } from 'react-transition-group';
import { useNotification } from "../../hooks/useNotification";
import { Context } from "../../main";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";
import FormItem from "../../components/common/FormItem/FormItem";
import Dropdown from "../../components/common/Dropdown/Dropdown";
import CadasterFilterDropdown from "../../components/common/Dropdown/CadasterFilterDropdown";

// Іконки
const uploadIcon = generateIcon(iconMap.upload, null, 'currentColor', 20, 20);
const addIcon = generateIcon(iconMap.plus, null, 'currentColor', 20, 20);
const editIcon = generateIcon(iconMap.edit, null, 'currentColor', 20, 20);
const deleteIcon = generateIcon(iconMap.delete, null, 'currentColor', 20, 20);
const searchIcon = generateIcon(iconMap.search, 'input-icon', 'currentColor', 16, 16);
const viewIcon = generateIcon(iconMap.view, null, 'currentColor', 20, 20);
const filterIcon = generateIcon(iconMap.filter, null, 'currentColor', 20, 20);
const dropDownIcon = generateIcon(iconMap.arrowDown, null, 'currentColor', 20, 20);
// Іконки сортування
const sortUpIcon = generateIcon(iconMap.arrowUp, 'sort-icon', 'currentColor', 14, 14);
const sortDownIcon = generateIcon(iconMap.arrowDown, 'sort-icon', 'currentColor', 14, 14);

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
            sort_by: null,
            sort_direction: null,
        },
        selectData: {
            payer_name: '',
            payer_address: '',
            tax_address: '',
            cadastral_number: '',
            iban: ''
        },
        
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

    // Функції сортування
    const handleSort = useCallback((dataIndex) => {
        setStateCadaster(prevState => {
            let newDirection = 'desc';
            
            if (prevState.sendData.sort_by === dataIndex) {
                newDirection = prevState.sendData.sort_direction === 'desc' ? 'asc' : 'desc';
            }
            
            return {
                ...prevState,
                sendData: {
                    ...prevState.sendData,
                    sort_by: dataIndex,
                    sort_direction: newDirection,
                    page: 1,
                }
            };
        });
    }, []);

    const getSortIcon = useCallback((dataIndex) => {
        if (stateCadaster.sendData.sort_by !== dataIndex) {
            return null;
        }
        try {
            return stateCadaster.sendData.sort_direction === 'desc' ? sortDownIcon : sortUpIcon;
        } catch (error) {
            console.error('Error generating sort icon:', error);
            return null;
        }
    }, [stateCadaster.sendData.sort_by, stateCadaster.sendData.sort_direction]);

    // Кнопка записів (як у debtor)
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
    ]

    const filterHandleClick = () => {
        setStateCadaster(prevState => ({
            ...prevState,
            isFilterOpen: !prevState.isFilterOpen,
        }))
    }

    const closeFilterDropdown = () => {
        setStateCadaster(prevState => ({
            ...prevState,
            isFilterOpen: false,
        }))
    }

    // Перевіряємо чи є активні фільтри
    const hasActiveFilters = useMemo(() => {
        return Object.values(stateCadaster.selectData).some(value => {
            if (Array.isArray(value) && !value.length) {
                return false
            }
            return value !== null && value !== undefined && value !== ''
        })
    }, [stateCadaster.selectData])

    const onHandleChange = (name, value) => {
        setStateCadaster(prevState => ({
            ...prevState,
            selectData: {
                ...prevState.selectData,
                [name]: value
            }
        }))
    }

    const resetFilters = () => {
        if (Object.values(stateCadaster.selectData).some(value => value)) {
            setStateCadaster(prevState => ({
                ...prevState,
                selectData: {
                    payer_name: '',
                    payer_address: '',
                    tax_address: '',
                    cadastral_number: '',
                    iban: ''
                },
                sendData: {
                    ...prevState.sendData,
                    page: 1
                }
            }));
        }
    }

    const applyFilter = () => {
        if (Object.values(stateCadaster.selectData).some(value => value)) {
            const dataValidation = validateFilters(stateCadaster.selectData);
            if (!dataValidation.error) {
                setStateCadaster(prevState => ({
                    ...prevState,
                    sendData: {
                        ...dataValidation,
                        limit: prevState.sendData.limit,
                        page: 1,
                        sort_by: prevState.sendData.sort_by,
                        sort_direction: prevState.sendData.sort_direction
                    },
                    isFilterOpen: false
                }));
            } else {
                notification({
                    type: 'warning',
                    title: 'Помилка фільтрації',
                    message: dataValidation.message,
                    placement: 'top',
                });
            }
        }
    }

    // Пагінація
    const onPageChange = useCallback((newPage) => {
        setStateCadaster(prevState => ({
            ...prevState,
            sendData: {
                ...prevState.sendData,
                page: newPage,
            }
        }));
    }, []);

    // Функції для модальних вікон
    const closeModals = useCallback(() => {
        setStateCadaster(prevState => ({
            ...prevState,
            isDeleteModalOpen: false,
            isUploadModalOpen: false,
            isCreateModalOpen: false,
            isEditModalOpen: false,
            isViewModalOpen: false,
            isFilterOpen: false,
            deletedItemId: null,
            selectedFile: null,
            editingItem: null,
            viewingItem: null,
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
        document.body.style.overflow = 'auto';
    }, []);

    // CRUD операції
    const handleViewClick = useCallback((record) => {
        setStateCadaster(prevState => ({
            ...prevState,
            isViewModalOpen: true,
            viewingItem: record
        }));
        document.body.style.overflow = 'hidden';
    }, []);

    const handleEditClick = useCallback((id) => {
        const item = data?.items?.find(item => item.id === id);
        if (item) {
            setStateCadaster(prevState => ({
                ...prevState,
                isEditModalOpen: true,
                editingItem: item,
                formData: {
                    payer_name: item.payer_name || '',
                    payer_address: item.payer_address || '',
                    iban: item.iban || '',
                    plot_area: item.plot_area || '',
                    land_tax: item.land_tax || '',
                    tax_address: item.tax_address || '',
                    cadastral_number: item.cadastral_number || ''
                },
                formErrors: {}
            }));
            document.body.style.overflow = 'hidden';
        }
    }, [data?.items]);

    const handleDeleteClick = useCallback((id) => {
        setStateCadaster(prevState => ({
            ...prevState,
            isDeleteModalOpen: true,
            deletedItemId: id
        }));
        document.body.style.overflow = 'hidden';
    }, []);

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
        document.body.style.overflow = 'hidden';
    }, []);

    // Валідація форми
    const validateForm = useCallback((formData) => {
        const newErrors = {};

        if (!formData.payer_name.trim()) {
            newErrors.payer_name = 'ПІБ платника є обов\'язковим';
        }

        if (!formData.payer_address.trim()) {
            newErrors.payer_address = 'Адреса платника є обов\'язковою';
        }

        if (formData.iban && !/^UA\d{27}$/.test(formData.iban.replace(/\s/g, ''))) {
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
                data: stateCadaster.formData
            });

            if (response) {
                notification({
                    type: "success",
                    title: "Успіх",
                    message: "Запис успішно створено",
                    placement: "top"
                });
                closeModals();
                retryFetch();
            }
        } catch (error) {
            notification({
                type: "error",
                title: "Помилка",
                message: error?.response?.data?.message || error.message || "Помилка створення запису",
                placement: "top"
            });
        } finally {
            setStateCadaster(prevState => ({ ...prevState, createLoading: false }));
        }
    }, [stateCadaster.formData, validateForm, notification, closeModals, retryFetch]);

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
                data: stateCadaster.formData
            });

            if (response) {
                notification({
                    type: "success",
                    title: "Успіх",
                    message: "Запис успішно оновлено",
                    placement: "top"
                });
                closeModals();
                retryFetch();
            }
        } catch (error) {
            notification({
                type: "error",
                title: "Помилка",
                message: error?.response?.data?.message || error.message || "Помилка оновлення запису",
                placement: "top"
            });
        } finally {
            setStateCadaster(prevState => ({ ...prevState, editLoading: false }));
        }
    }, [stateCadaster.formData, stateCadaster.editingItem, validateForm, notification, closeModals, retryFetch]);

    const handleConfirmDelete = useCallback(async () => {
        if (stateCadaster.deletedItemId) {
            setStateCadaster(prevState => ({ ...prevState, confirmLoading: true }));

            try {
                await fetchFunction(`api/cadaster/${stateCadaster.deletedItemId}`, {
                    method: 'DELETE'
                });

                notification({
                    type: 'success',
                    title: 'Успіх',
                    message: 'Запис успішно видалено',
                    placement: 'top',
                });

                closeModals();
                retryFetch();
            } catch (error) {
                notification({
                    type: 'error',
                    title: 'Помилка',
                    message: error?.response?.data?.message || error.message || 'Помилка видалення запису',
                    placement: 'top',
                });
            } finally {
                setStateCadaster(prevState => ({ ...prevState, confirmLoading: false }));
            }
        }
    }, [stateCadaster.deletedItemId, notification, closeModals, retryFetch]);

    // Завантаження файлів
    const handleUploadClick = useCallback(() => {
        setStateCadaster(prevState => ({
            ...prevState,
            isUploadModalOpen: true,
            selectedFile: null,
        }));
        document.body.style.overflow = 'hidden';
    }, []);

    const handleFileInputChange = useCallback((event) => {
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

        const formData = new FormData();
        formData.append('file', stateCadaster.selectedFile);

        setStateCadaster(prevState => ({ ...prevState, uploadLoading: true }));

        try {
            const response = await fetchFunction('api/cadaster/upload', {
                method: 'POST',
                body: formData,
            });

            if (response?.success) {
                notification({
                    type: 'success',
                    placement: 'top',
                    title: 'Успіх',
                    message: response.message || 'Файл успішно завантажено!'
                });
                
                closeModals();
                retryFetch();
            } else {
                throw new Error(response?.message || 'Помилка завантаження файлу');
            }
        } catch (error) {
            notification({
                type: 'error',
                placement: 'top',
                title: 'Помилка',
                message: error?.response?.data?.message || error.message || 'Помилка завантаження файлу'
            });
        } finally {
            setStateCadaster(prevState => ({ ...prevState, uploadLoading: false }));
        }
    }, [stateCadaster.selectedFile, notification, closeModals, retryFetch]);

    // Колонки таблиці
    const createSortableColumn = useCallback((title, dataIndex, render = null, width = null) => {
        const sortIcon = getSortIcon(dataIndex);
        return {
            title: (
                <div className="sortable-header" onClick={() => handleSort(dataIndex)}>
                    <span>{title}</span>
                    {sortIcon}
                </div>
            ),
            dataIndex,
            headerClassName: stateCadaster.sendData.sort_by === dataIndex ? 
                'sortable-header active' : 'sortable-header',
            width,
            render
        };
    }, [handleSort, getSortIcon, stateCadaster.sendData.sort_by]);

    const columnTable = useMemo(() => {
        const startRecord = ((stateCadaster.sendData.page || 1) - 1) * stateCadaster.sendData.limit + 1;

        return [
            {
                title: '№',
                key: 'index',
                width: '60px',
                headerClassName: 'non-sortable',
                render: (_, record, index) => startRecord + index
            },
            createSortableColumn('ПІБ Платника', 'payer_name', null, null),
            createSortableColumn('Адреса платника', 'payer_address', null, null),
            createSortableColumn('IBAN', 'iban', null, '200px'),
            createSortableColumn('Площа діляки (га)', 'plot_area', (value) => value ? `${parseFloat(value).toFixed(2)} га` : '-', '120px'),
            createSortableColumn('Земельний податок (грн)', 'land_tax', (value) => value ? `${parseFloat(value).toFixed(2)} грн` : '-', '140px'),
            createSortableColumn('Податкова адреса', 'tax_address', null, '180px'),
            createSortableColumn('Кадастровий номер', 'cadastral_number', (value) => {
                if (!value || value.startsWith('AUTO_')) {
                    return 'Інформація не надана';
                }
                return value;
            }, '160px'),
            {
                title: 'Дія',
                key: 'action',
                width: '150px',
                headerClassName: 'non-sortable',
                render: (_, record) => (
                    <div className="btn-sticky" style={{ justifyContent: 'center', gap: '4px' }}>
                        <Button
                            title="Переглянути"
                            icon={viewIcon}
                            onClick={() => handleViewClick(record)}
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
        ];
    }, [startRecord, handleViewClick, handleEditClick, handleDeleteClick, createSortableColumn]);

    // Рендер таблиці даних
    const tableData = useMemo(() => {
        return data?.items?.map((item, index) => ({
            ...item,
            key: item.id || index,
        })) || [];
    }, [data?.items]);

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
                                {data?.items && Array.isArray(data?.items) && data?.items.length > 0 ? (
                                    <React.Fragment>
                                        Показує {startRecord !== endRecord ? `${startRecord}-${endRecord}` : startRecord} з {data?.totalItems || 1}
                                    </React.Fragment>
                                ) : (
                                    <React.Fragment>Записів не знайдено</React.Fragment>
                                )}
                            </h2>
                            <div className="table-header__buttons">
                                <Button 
                                    className="btn--primary"
                                    onClick={handleCreateClick}
                                    icon={addIcon}
                                >
                                    Створити
                                </Button>
                                
                                <Button 
                                    className="btn--primary"
                                    onClick={handleUploadClick}
                                    icon={uploadIcon}
                                >
                                    Завантажити Excel
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
                                    icon={filterIcon}>
                                    Фільтри {hasActiveFilters && `(${Object.keys(stateCadaster.selectData).filter(key => stateCadaster.selectData[key]).length})`}
                                </Button>
                                
                                <CadasterFilterDropdown
                                    isOpen={stateCadaster.isFilterOpen}
                                    onClose={closeFilterDropdown}
                                    filterData={stateCadaster.selectData}
                                    onFilterChange={onHandleChange}
                                    onApplyFilter={applyFilter}
                                    onResetFilters={resetFilters}
                                    searchIcon={searchIcon}
                                />
                            </div>
                        </div>
                        <div className="table-main">
                            <div className="table-and-pagination-wrapper">
                                <div className="table-wrapper" style={{
                                    overflowX: 'auto',
                                    minWidth: data?.items?.length > 0 ? '1200px' : 'auto'
                                }}>
                                    <Table columns={columnTable} dataSource={tableData}/>
                                </div>
                                <Pagination
                                    className="m-b"
                                    currentPage={parseInt(data?.currentPage) || 1}
                                    totalCount={data?.totalItems || 1}
                                    pageSize={stateCadaster.sendData.limit}
                                    onPageChange={onPageChange}/>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            ) : null}

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
                            
                            <div 
                                className="file-upload-area"
                                onClick={() => fileInputRef.current?.click()}
                                style={{
                                    border: '2px dashed #d9d9d9',
                                    borderRadius: '6px',
                                    padding: '20px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    backgroundColor: '#fafafa'
                                }}
                            >
                                {stateCadaster.selectedFile ? (
                                    <div>
                                        <p style={{ color: '#52c41a', marginBottom: '8px' }}>
                                            ✓ Файл обрано: {stateCadaster.selectedFile.name}
                                        </p>
                                        <p style={{ color: '#666', fontSize: '14px' }}>
                                            Клікніть для вибору іншого файлу
                                        </p>
                                    </div>
                                ) : (
                                    <div>
                                        <p style={{ marginBottom: '8px' }}>
                                            {uploadIcon} Клікніть для вибору файлу
                                        </p>
                                        <p style={{ color: '#666', fontSize: '14px' }}>
                                            Підтримуються формати: .xlsx, .xls
                                        </p>
                                    </div>
                                )}
                            </div>
                            
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".xlsx,.xls"
                                onChange={handleFileInputChange}
                                style={{ display: 'none' }}
                            />
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
                        title="Створення нового запису"
                    >
                        <div className="form-grid">
                            <FormItem 
                                label="ПІБ Платника" 
                                required 
                                error={stateCadaster.formErrors.payer_name}
                            >
                                <Input
                                    value={stateCadaster.formData.payer_name}
                                    onChange={(_, value) => handleInputChange('payer_name', value)}
                                    placeholder="Введіть ПІБ платника"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>

                            <FormItem 
                                label="Адреса платника" 
                                required 
                                error={stateCadaster.formErrors.payer_address}
                            >
                                <Input
                                    value={stateCadaster.formData.payer_address}
                                    onChange={(_, value) => handleInputChange('payer_address', value)}
                                    placeholder="Введіть адресу платника"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>

                            <FormItem 
                                label="IBAN" 
                                error={stateCadaster.formErrors.iban}
                            >
                                <Input
                                    value={stateCadaster.formData.iban}
                                    onChange={(_, value) => handleInputChange('iban', value)}
                                    placeholder="UA + 27 цифр"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>

                            <FormItem 
                                label="Площа діляки (га)" 
                                required 
                                error={stateCadaster.formErrors.plot_area}
                            >
                                <Input
                                    type="number"
                                    step="0.0001"
                                    min="0"
                                    value={stateCadaster.formData.plot_area}
                                    onChange={(_, value) => handleInputChange('plot_area', value)}
                                    placeholder="Введіть площу в гектарах"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>

                            <FormItem 
                                label="Земельний податок (грн)" 
                                required 
                                error={stateCadaster.formErrors.land_tax}
                            >
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={stateCadaster.formData.land_tax}
                                    onChange={(_, value) => handleInputChange('land_tax', value)}
                                    placeholder="Введіть суму податку в гривнях"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>

                            <FormItem 
                                label="Податкова адреса платника" 
                                required 
                                error={stateCadaster.formErrors.tax_address}
                            >
                                <Input
                                    value={stateCadaster.formData.tax_address}
                                    onChange={(_, value) => handleInputChange('tax_address', value)}
                                    placeholder="Введіть податкову адресу"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>

                            <FormItem 
                                label="Кадастровий номер" 
                                required 
                                error={stateCadaster.formErrors.cadastral_number}
                            >
                                <Input
                                    value={stateCadaster.formData.cadastral_number}
                                    onChange={(_, value) => handleInputChange('cadastral_number', value)}
                                    placeholder="Введіть кадастровий номер"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>
                        </div>
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
                        title="Редагування запису"
                    >
                        <div className="form-grid">
                            <FormItem 
                                label="ПІБ Платника" 
                                required 
                                error={stateCadaster.formErrors.payer_name}
                            >
                                <Input
                                    value={stateCadaster.formData.payer_name}
                                    onChange={(_, value) => handleInputChange('payer_name', value)}
                                    placeholder="Введіть ПІБ платника"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>

                            <FormItem 
                                label="Адреса платника" 
                                required 
                                error={stateCadaster.formErrors.payer_address}
                            >
                                <Input
                                    value={stateCadaster.formData.payer_address}
                                    onChange={(_, value) => handleInputChange('payer_address', value)}
                                    placeholder="Введіть адресу платника"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>

                            <FormItem 
                                label="IBAN" 
                                error={stateCadaster.formErrors.iban}
                            >
                                <Input
                                    value={stateCadaster.formData.iban}
                                    onChange={(_, value) => handleInputChange('iban', value)}
                                    placeholder="UA + 27 цифр"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>

                            <FormItem 
                                label="Площа діляки (га)" 
                                required 
                                error={stateCadaster.formErrors.plot_area}
                            >
                                <Input
                                    type="number"
                                    step="0.0001"
                                    min="0"
                                    value={stateCadaster.formData.plot_area}
                                    onChange={(_, value) => handleInputChange('plot_area', value)}
                                    placeholder="Введіть площу в гектарах"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>

                            <FormItem 
                                label="Земельний податок (грн)" 
                                required 
                                error={stateCadaster.formErrors.land_tax}
                            >
                                <Input
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={stateCadaster.formData.land_tax}
                                    onChange={(_, value) => handleInputChange('land_tax', value)}
                                    placeholder="Введіть суму податку в гривнях"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>

                            <FormItem 
                                label="Податкова адреса платника" 
                                required 
                                error={stateCadaster.formErrors.tax_address}
                            >
                                <Input
                                    value={stateCadaster.formData.tax_address}
                                    onChange={(_, value) => handleInputChange('tax_address', value)}
                                    placeholder="Введіть податкову адресу"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>

                            <FormItem 
                                label="Кадастровий номер" 
                                required 
                                error={stateCadaster.formErrors.cadastral_number}
                            >
                                <Input
                                    value={stateCadaster.formData.cadastral_number}
                                    onChange={(_, value) => handleInputChange('cadastral_number', value)}
                                    placeholder="Введіть кадастровий номер"
                                    onKeyDown={handleKeyDown}
                                />
                            </FormItem>
                        </div>
                    </Modal>
                )}
            </Transition>

            {/* Модальне вікно видалення */}
            <Transition in={!!stateCadaster.deletedItemId} timeout={200} unmountOnExit nodeRef={nodeRef}>
                {state => (
                    <Modal
                        ref={nodeRef}
                        className={`${state === 'entered' ? "modal-window-wrapper--active" : ""}`}
                        onClose={closeModals}
                        onOk={handleConfirmDelete}
                        confirmLoading={stateCadaster.confirmLoading}
                        cancelText="Скасувати"
                        okText="Видалити"
                        title="Видалення запису"
                        danger
                    >
                        <p>Ви впевнені, що хочете видалити цей запис? Цю дію неможливо скасувати.</p>
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
                        title="Перегляд запису"
                        footer={null}
                    >
                        {stateCadaster.viewingItem && (
                            <div className="detail-view">
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
                                    <div className="detail-value">{stateCadaster.viewingItem.iban || '-'}</div>
                                </div>

                                <div className="detail-item">
                                    <label className="detail-label">Площа діляки:</label>
                                    <div className="detail-value">
                                        {stateCadaster.viewingItem.plot_area ? 
                                            `${parseFloat(stateCadaster.viewingItem.plot_area).toFixed(4)} га` : '-'}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <label className="detail-label">Земельний податок:</label>
                                    <div className="detail-value">
                                        {stateCadaster.viewingItem.land_tax ? 
                                            `${parseFloat(stateCadaster.viewingItem.land_tax).toFixed(2)} грн` : '-'}
                                    </div>
                                </div>

                                <div className="detail-item">
                                    <label className="detail-label">Податкова адреса платника:</label>
                                    <div className="detail-value">{stateCadaster.viewingItem.tax_address}</div>
                                </div>

                                <div className="detail-item">
                                    <label className="detail-label">Кадастровий номер:</label>
                                    <div className="detail-value">
                                        {!stateCadaster.viewingItem.cadastral_number || 
                                         stateCadaster.viewingItem.cadastral_number.startsWith('AUTO_') ? 
                                         'Інформація не надана' : stateCadaster.viewingItem.cadastral_number}
                                    </div>
                                </div>
                            </div>
                        )}
                    </Modal>
                )}
            </Transition>
        </React.Fragment>
    );
};

export default CadasterList;