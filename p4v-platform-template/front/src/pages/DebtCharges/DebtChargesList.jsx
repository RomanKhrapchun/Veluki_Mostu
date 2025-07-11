import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom'
import useFetch from "../../hooks/useFetch";
import Table from "../../components/common/Table/Table";
import {generateIcon, iconMap, STATUS} from "../../utils/constants.jsx";
import Button from "../../components/common/Button/Button";
import PageError from "../ErrorPage/PageError";
import Pagination from "../../components/common/Pagination/Pagination";
import {fetchFunction, hasOnlyAllowedParams, validateFilters} from "../../utils/function";
import {useNotification} from "../../hooks/useNotification";
import {Context} from "../../main";
import Dropdown from "../../components/common/Dropdown/Dropdown";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";
import Modal from "../../components/common/Modal/Modal.jsx";
import {Transition} from "react-transition-group";
import FilterDropdown from "../../components/common/Dropdown/FilterDropdown";
import "../../components/common/Dropdown/FilterDropdown.css";

const uploadIcon = generateIcon(iconMap.upload, null, 'currentColor', 20, 20)
const refreshIcon = generateIcon(iconMap.refresh, null, 'currentColor', 20, 20)
const downloadIcon = generateIcon(iconMap.download, null, 'currentColor', 20, 20)
const viewIcon = generateIcon(iconMap.view, null, 'currentColor', 20, 20)
const editIcon = generateIcon(iconMap.edit, null, 'currentColor', 20, 20)
const filterIcon = generateIcon(iconMap.filter, null, 'currentColor', 20, 20)
const searchIcon = generateIcon(iconMap.search, 'input-icon', 'currentColor', 16, 16)
const dropDownIcon = generateIcon(iconMap.arrowDown, null, 'currentColor', 20, 20)
const sortUpIcon = generateIcon(iconMap.arrowUp, 'sort-icon', 'currentColor', 14, 14)
const sortDownIcon = generateIcon(iconMap.arrowDown, 'sort-icon', 'currentColor', 14, 14)
const dropDownStyle = {width: '100%'}
const childDropDownStyle = {justifyContent: 'center'}

const DebtChargesList = () => {
    const navigate = useNavigate()
    const notification = useNotification()
    const {store} = useContext(Context)
    const nodeRef = useRef(null)
    const fileInputRef = useRef(null)
    
    const [stateDebtCharges, setStateDebtCharges] = useState({
        isFilterOpen: false,
        selectData: {},
        confirmLoading: false,
        uploadLoading: false,
        isUploadModalOpen: false,
        selectedFile: null,
        sendData: {
            limit: 16,
            page: 1,
            sort_by: null,
            sort_direction: null,
        }
    })
    
    const isFirstRun = useRef(true)
    const {error, status, data, retryFetch} = useFetch('api/debtcharges/filter', {
        method: 'post',
        data: stateDebtCharges.sendData
    })
    
    const startRecord = ((stateDebtCharges.sendData.page || 1) - 1) * stateDebtCharges.sendData.limit + 1;
    const endRecord = Math.min(startRecord + stateDebtCharges.sendData.limit - 1, data?.totalItems || 1);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false
            return;
        }
        retryFetch('api/debtcharges/filter', {
            method: 'post',
            data: stateDebtCharges.sendData,
        })
    }, [stateDebtCharges.sendData, retryFetch])

    // Функція для обробки сортування
    const handleSort = useCallback((dataIndex) => {
        setStateDebtCharges(prevState => {
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

    // Функція для отримання іконки сортування
    const getSortIcon = useCallback((dataIndex) => {
        if (stateDebtCharges.sendData.sort_by !== dataIndex) {
            return null;
        }
        return stateDebtCharges.sendData.sort_direction === 'desc' ? sortDownIcon : sortUpIcon;
    }, [stateDebtCharges.sendData.sort_by, stateDebtCharges.sendData.sort_direction]);

    const columnTable = useMemo(() => {
        const createSortableColumn = (title, dataIndex, render = null, width = null) => ({
            title,
            dataIndex,
            sortable: true,
            onHeaderClick: () => handleSort(dataIndex),
            sortIcon: getSortIcon(dataIndex),
            headerClassName: stateDebtCharges.sendData.sort_by === dataIndex ? 'active' : '',
            ...(width && { width }),
            ...(render && { render })
        });

        // Функція форматування дати
        const formatDate = (dateString) => {
            if (!dateString) return '-';
            try {
                const date = new Date(dateString);
                return date.toLocaleDateString('uk-UA');
            } catch {
                return dateString;
            }
        };

        // Функція форматування суми
        const formatAmount = (value) => {
            const numValue = Number(value) || 0;
            if (numValue === 0) return '0₴';
            return `${numValue.toLocaleString('uk-UA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}₴`;
        };

        // Функція для відображення статусу з кольором
        const renderStatus = (status) => {
            const getStatusColor = (status) => {
                switch (status) {
                    case 'Не вручено': return '#e74c3c';
                    case 'Вручено': return '#f39c12';
                    case 'Сплачено': return '#27ae60';
                    case 'Скасовано': return '#95a5a6';
                    default: return '#6c757d';
                }
            };

            return (
                <span style={{
                    color: getStatusColor(status),
                    fontWeight: '500',
                    fontSize: '12px'
                }}>
                    {status || '-'}
                </span>
            );
        };

        return [
            createSortableColumn('Податковий номер', 'tax_number', null, '110px'),
            createSortableColumn('Назва платника', 'payer_name', (value) => (
                <span title={value} style={{ fontSize: '12px' }}>
                    {value?.length > 25 ? `${value.substring(0, 25)}...` : value}
                </span>
            ), '150px'),
            createSortableColumn('Номер', 'tax_classifier', null, '90px'),
            createSortableColumn('Платіж', 'payment_info', null,'90px'),
            createSortableColumn('Дата', 'account_number', null,'90px'),
            createSortableColumn('Дата документа', 'document_date', formatDate, '100px'),
            createSortableColumn('Дата вручення', 'delivery_date', formatDate, '100px'),
            createSortableColumn('Сума', 'amount', (value) => (
                <span style={{
                    fontWeight: 'bold',
                    color: Number(value) > 0 ? '#e74c3c' : '#27ae60',
                    fontSize: '13px'
                }}>
                    {formatAmount(value)}
                </span>
            ), '90px'),
            createSortableColumn('Статус', 'status', renderStatus, '80px'),
            {
                title: 'Дія',
                dataIndex: 'action',
                headerClassName: 'non-sortable',
                width: '70px',
                render: (_, record) => (
                    <div className="btn-sticky" style={{
                        justifyContent: 'center',
                        gap: '1px'
                    }}>
                        {/*<Button
                            title="Перегляд"
                            icon={viewIcon}
                            size="small"
                            onClick={() => navigate(`/debt-charges/${record.id}`)}
                        />
                        <Button
                            title="Редагувати"
                            icon={editIcon}
                            size="small"
                            onClick={() => navigate(`/debt-charges/${record.id}/edit`)}
                        /> */}
                       <Button
                            title="Завантажити податкове повідомлення"
                            icon={downloadIcon}
                            size="small"
                            onClick={() => handleDownloadTaxNotification(record.id)}
                            disabled={stateDebtCharges.downloadLoading}
                        />
                    </div>
                ),
            }
        ];
    }, [navigate, handleSort, getSortIcon, stateDebtCharges.sendData.sort_by]);

    const tableData = useMemo(() => {
        if (data?.items?.length) {
            return data.items.map(el => ({
                key: el.id,
                id: el.id,
                tax_number: el.tax_number,
                payer_name: el.payer_name,
                payment_info: el.payment_info,
                tax_classifier: el.tax_classifier,
                account_number: el.account_number,
                full_document_id: el.full_document_id,
                document_date: el.document_date,
                delivery_date: el.delivery_date,
                amount: el.amount,
                status: el.status,
            }));
        }
        return []
    }, [data])

    const itemMenu = [
        {
            label: '16',
            key: '16',
            onClick: () => {
                if (stateDebtCharges.sendData.limit !== 16) {
                    setStateDebtCharges(prevState => ({
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
                if (stateDebtCharges.sendData.limit !== 32) {
                    setStateDebtCharges(prevState => ({
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
                if (stateDebtCharges.sendData.limit !== 48) {
                    setStateDebtCharges(prevState => ({
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
        setStateDebtCharges(prevState => ({
            ...prevState,
            isFilterOpen: !prevState.isFilterOpen,
        }))
    }

    const closeFilterDropdown = () => {
        setStateDebtCharges(prevState => ({
            ...prevState,
            isFilterOpen: false,
        }))
    }

    // Перевіряємо чи є активні фільтри
    const hasActiveFilters = useMemo(() => {
        return Object.values(stateDebtCharges.selectData).some(value => {
            if (Array.isArray(value) && !value.length) {
                return false
            }
            return value !== null && value !== undefined && value !== ''
        })
    }, [stateDebtCharges.selectData])

    const onHandleChange = (name, value) => {
        setStateDebtCharges(prevState => ({
            ...prevState,
            selectData: {
                ...prevState.selectData,
                [name]: value
            }
        }))
    }

    const resetFilters = () => {
        if (Object.values(stateDebtCharges.selectData).some(value => value)) {
            setStateDebtCharges(prevState => ({
                ...prevState,
                selectData: {},
            }));
        }
        const dataReadyForSending = hasOnlyAllowedParams(stateDebtCharges.sendData, ['limit', 'page', 'sort_by', 'sort_direction'])
        if (!dataReadyForSending) {
            setStateDebtCharges(prevState => ({
                ...prevState,
                sendData: {
                    limit: prevState.sendData.limit,
                    page: 1,
                    sort_by: prevState.sendData.sort_by,
                    sort_direction: prevState.sendData.sort_direction,
                }
            }))
        }
    }

    const applyFilter = () => {
        const isAnyInputFilled = Object.values(stateDebtCharges.selectData).some(value => {
            if (Array.isArray(value) && !value.length) {
                return false
            }
            return value
        })
        if (isAnyInputFilled) {
            const dataValidation = validateFilters(stateDebtCharges.selectData)
            if (!dataValidation.error) {
                setStateDebtCharges(prevState => ({
                    ...prevState,
                    sendData: {
                        ...dataValidation,
                        limit: prevState.sendData.limit,
                        page: 1,
                        sort_by: prevState.sendData.sort_by,
                        sort_direction: prevState.sendData.sort_direction,
                    }
                }))
            } else {
                notification({
                    type: 'warning',
                    placement: 'top',
                    title: 'Помилка',
                    message: dataValidation.message ?? 'Щось пішло не так.',
                })
            }
        }
    }

    const onPageChange = useCallback((page) => {
        if (stateDebtCharges.sendData.page !== page) {
            setStateDebtCharges(prevState => ({
                ...prevState,
                sendData: {
                    ...prevState.sendData,
                    page,
                }
            }))
        }
    }, [stateDebtCharges.sendData.page])

    // Функції для роботи з файлами
    const handleFileUploadClick = () => {
        setStateDebtCharges(prevState => ({
            ...prevState,
            isUploadModalOpen: true,
        }))
    }

    const handleFileSelect = (event) => {
        const file = event.target.files?.[0];
        
        if (file) {
            
            
            // Перевіряємо .xls та .xlsx формати
            const fileName = file.name.toLowerCase();
            const isValidFormat = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
            
            if (!isValidFormat) {
                console.log('❌ Неправильний тип файлу:', fileName);
                notification({
                    type: 'warning',
                    placement: 'top',
                    title: 'Помилка',
                    message: 'Файл має бути у форматі Excel (.xls або .xlsx)!',
                });
                
                if (fileInputRef.current) {
                    fileInputRef.current.value = '';
                }
                return;
            }
            
            console.log('✅ Файл валідний, оновлюємо стан');
            setStateDebtCharges(prevState => ({
                ...prevState,
                selectedFile: file,
            }));
            
        } else {
            console.log('❌ Файл не знайдено');
        }
    };
    const handleDragOver = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };
    
    const handleDragLeave = (event) => {
        event.preventDefault();
        event.stopPropagation();
    };
    
    const handleDrop = (event) => {
        event.preventDefault();
        event.stopPropagation();
        
        const files = event.dataTransfer.files;
        
        if (files.length > 0) {
            const file = files[0];
            
            const fileName = file.name.toLowerCase();
            const isValidFormat = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
            
            if (!isValidFormat) {
                notification({
                    type: 'warning',
                    placement: 'top',
                    title: 'Помилка',
                    message: 'Файл має бути у форматі Excel (.xls або .xlsx)!',
                });
                return;
            }
            
            setStateDebtCharges(prevState => ({
                ...prevState,
                selectedFile: file,
            }));
            
        }
    };
    
    const handleDivClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        } 
    };
    const handleDownloadTaxNotification = async (chargeId) => {
        try {
            setStateDebtCharges(prevState => ({
                ...prevState,
                downloadLoading: true,
            }))
    
            console.log('🔍 Generating tax notification for charge ID:', chargeId);
    
            const response = await fetchFunction(`api/debtcharges/generate/${chargeId}`, {
                method: 'get',
                responseType: 'blob'
            })
    
            // Створюємо URL для blob та завантажуємо файл
            const blob = new Blob([response.data], { 
                type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' 
            });
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `tax-notification-${chargeId}.docx`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
    
            notification({
                placement: "top",
                duration: 4,
                title: 'Успіх',
                message: '✅ Податкове повідомлення успішно згенеровано.',
                type: 'success'
            })
    
        } catch (error) {
            console.error('Generate error:', error);
            if (error?.response?.status === 401) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: "Не авторизований",
                    placement: 'top',
                })
                store.logOff()
                return navigate('/')
            }
            notification({
                type: 'error',
                title: "Помилка генерації",
                message: error?.response?.data?.message || error.message || 'Сталась помилка при генерації податкового повідомлення',
                placement: 'top',
            })
        } finally {
            setStateDebtCharges(prevState => ({
                ...prevState,
                downloadLoading: false,
            }))
        }
    }
    const handleUploadFile = async () => {
        if (!stateDebtCharges.selectedFile) {
            notification({
                type: 'warning',
                placement: 'top',
                title: 'Помилка',
                message: 'Оберіть файл для завантаження!',
            })
            return;
        }

        try {
            setStateDebtCharges(prevState => ({
                ...prevState,
                uploadLoading: true,
            }))

            const formData = new FormData();
            formData.append('file', stateDebtCharges.selectedFile);

            const response = await fetchFunction('api/debtcharges/upload', {
                method: 'post',
                data: formData,
                headers: {
                    'Content-Type': 'multipart/form-data',
                }
            })

            notification({
                placement: "top",
                duration: 4,
                title: 'Успіх',
                message: `✅ База нарахувань успішно оновлена. Завантажено ${response.data.imported || 0} записів.`,
                type: 'success'
            })

            // Оновлюємо дані в таблиці
            retryFetch('api/debtcharges/filter', {
                method: 'post',
                data: stateDebtCharges.sendData,
            })

            // Закриваємо модальне вікно
            handleCloseUploadModal();

        } catch (error) {
            console.error('Upload error:', error);
            if (error?.response?.status === 401) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: "Не авторизований",
                    placement: 'top',
                })
                store.logOff()
                return navigate('/')
            }
            notification({
                type: 'error',
                title: "Помилка завантаження",
                message: error?.response?.data?.message || error.message || 'Сталась помилка при завантаженні файлу',
                placement: 'top',
            })
        } finally {
            setStateDebtCharges(prevState => ({
                ...prevState,
                uploadLoading: false,
            }))
        }
    }

    const handleCloseUploadModal = () => {
        setStateDebtCharges(prevState => ({
            ...prevState,
            isUploadModalOpen: false,
            selectedFile: null,
        }))
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }

    const handleRefresh = () => {
        retryFetch('api/debtcharges/filter', {
            method: 'post',
            data: stateDebtCharges.sendData,
        })
    }

    if (status === STATUS.ERROR) {
        return <PageError title={error.message} statusError={error.status}/>
    }

    return (
        <React.Fragment>
            {status === STATUS.PENDING ? <SkeletonPage/> : null}
            {status === STATUS.SUCCESS ?
                <React.Fragment>
                    <div className="table-elements">
                        <div className="table-header">
                            <h2 className="title title--sm">
                                {data?.items && Array.isArray(data?.items) && data?.items.length > 0 ?
                                    <React.Fragment>
                                        Нарахування: показує {startRecord !== endRecord ? `${startRecord}-${endRecord}` : startRecord} з {data?.totalItems || 1}
                                    </React.Fragment> : <React.Fragment>Нарахувань не знайдено</React.Fragment>
                                }
                            </h2>
                            <div className="table-header__buttons">
                                <Button
                                    onClick={handleFileUploadClick}
                                    icon={uploadIcon}
                                    style={{ marginRight: '8px' }}>
                                    Завантажити файл
                                </Button>
                                <Button
                                    onClick={handleRefresh}
                                    icon={refreshIcon}
                                    style={{ marginRight: '8px' }}>
                                    Оновити
                                </Button>
                                <Dropdown
                                    icon={dropDownIcon}
                                    iconPosition="right"
                                    style={dropDownStyle}
                                    childStyle={childDropDownStyle}
                                    caption={`Записів: ${stateDebtCharges.sendData.limit}`}
                                    menu={itemMenu}/>
                                <Button
                                    className={`table-filter-trigger ${hasActiveFilters ? 'has-active-filters' : ''}`}
                                    onClick={filterHandleClick}
                                    icon={filterIcon}>
                                    Фільтри {hasActiveFilters && `(${Object.keys(stateDebtCharges.selectData).filter(key => stateDebtCharges.selectData[key]).length})`}
                                </Button>

                                {/* Dropdown фільтр */}
                                <FilterDropdown
                                    isOpen={stateDebtCharges.isFilterOpen}
                                    onClose={closeFilterDropdown}
                                    filterData={stateDebtCharges.selectData}
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
                                    pageSize={stateDebtCharges.sendData.limit}
                                    onPageChange={onPageChange}/>
                            </div>
                        </div>
                    </div>
                </React.Fragment> : null
            }

{/* Модальне вікно для завантаження файлу */}
<Transition in={stateDebtCharges.isUploadModalOpen} timeout={200} unmountOnExit nodeRef={nodeRef}>
    {state => (
        <Modal
            className={`${state === 'entered' ? "modal-window-wrapper--active" : ""}`}
            onClose={handleCloseUploadModal}
            onOk={handleUploadFile}
            confirmLoading={stateDebtCharges.uploadLoading}
            cancelText="Скасувати"
            okText="Завантажити"
            title="Завантаження файлу нарахувань"
            disabled={!stateDebtCharges.selectedFile}>
            <div className="upload-modal-content">
    <p className="paragraph" style={{ marginBottom: '16px' }}>
        Оберіть Excel файл (.xlsx) з нарахуваннями за борги для завантаження в систему.
    </p>
    
    {/* Компонент для завантаження файлу з покращеною обробкою */}
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
    onClick={(e) => {
        console.log('📁 Input clicked');
    }}
/>
        <div style={{
            width: '100%',
            padding: '20px',
            border: '2px dashed #007bff',
            borderRadius: '8px',
            backgroundColor: stateDebtCharges.selectedFile ? '#e8f4f8' : '#f8f9fa',
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
                {stateDebtCharges.selectedFile 
                    ? `Обрано: ${stateDebtCharges.selectedFile.name}`
                    : 'Клікніть або перетягніть файл сюди'
                }
            </p>
            <p style={{
    margin: '4px 0 0 0',
    fontSize: '12px',
    color: '#6c757d'
}}>
    Файли .xls та .xlsx
</p>
        </div>
    </div>
    
    {/* Додаткова кнопка для відкриття файлового діалогу */}
    <div style={{ textAlign: 'center', marginBottom: '16px' }}>
        <button 
            type="button"
            onClick={() => {
                console.log('🔘 Button clicked');
                if (fileInputRef.current) {
                    fileInputRef.current.click();
                }
            }}
            style={{
                padding: '8px 16px',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '14px'
            }}
        >
            Обрати файл
        </button>
    </div>
    
    {/* Відображення статусу файлу */}
    {stateDebtCharges.selectedFile && (
        <div style={{
            padding: '12px',
            backgroundColor: '#e8f5e8',
            borderRadius: '4px',
            marginBottom: '16px',
            border: '1px solid #28a745'
        }}>
            <p style={{
                fontSize: '12px',
                color: '#155724',
                margin: 0,
                fontWeight: '500'
            }}>
                ✅ Розмір файлу: {(stateDebtCharges.selectedFile.size / 1024).toFixed(1)} KB
            </p>
        </div>
    )}
    
    <div style={{
    backgroundColor: '#f8f9fa',
    padding: '12px',
    borderRadius: '4px',
    border: '1px solid #dee2e6'
}}>
    <p style={{ fontSize: '12px', color: '#6c757d', margin: 0, fontWeight: '600' }}>
        📋 Структура файлу:
    </p>
    <p style={{ fontSize: '11px', color: '#6c757d', margin: '4px 0 0 0', lineHeight: '1.4' }}>
        Податковий номер ПП, Назва платника, Платіж, Номер, Дата, Дата вручення платнику податків, Сума, Статус
    </p>
    <p style={{ fontSize: '11px', color: '#007bff', margin: '4px 0 0 0', fontWeight: '500' }}>
        Підтримуються формати: .xls, .xlsx
    </p>
</div>
</div>
        </Modal>
    )}
</Transition>
        </React.Fragment>
    )
};

export default DebtChargesList;