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

const viewIcon = generateIcon(iconMap.view, null, 'currentColor', 20, 20)
const downloadIcon = generateIcon(iconMap.download, null, 'currentColor', 20, 20)
const editIcon = generateIcon(iconMap.edit, null, 'currentColor', 20, 20)
const filterIcon = generateIcon(iconMap.filter, null, 'currentColor', 20, 20)
const searchIcon = generateIcon(iconMap.search, 'input-icon', 'currentColor', 16, 16)
const dropDownIcon = generateIcon(iconMap.arrowDown, null, 'currentColor', 20, 20)
const sortUpIcon = generateIcon(iconMap.arrowUp, 'sort-icon', 'currentColor', 14, 14)
const sortDownIcon = generateIcon(iconMap.arrowDown, 'sort-icon', 'currentColor', 14, 14)
const dropDownStyle = {width: '100%'}
const childDropDownStyle = {justifyContent: 'center'}

const DebtorList = () => {
        const navigate = useNavigate()
        const notification = useNotification()
        const {store} = useContext(Context)
        const nodeRef = useRef(null)
        const [stateDebtor, setStateDebtor] = useState({
            isFilterOpen: false, // Змінили назву для ясності
            selectData: {},
            confirmLoading: false,
            itemId: null,
            sendData: {
                limit: 16,
                page: 1,
                sort_by: null,
                sort_direction: null,
            }
        })
        const isFirstRun = useRef(true)
        const {error, status, data, retryFetch} = useFetch('api/debtor/filter', {
            method: 'post',
            data: stateDebtor.sendData
        })
        const startRecord = ((stateDebtor.sendData.page || 1) - 1) * stateDebtor.sendData.limit + 1;
        const endRecord = Math.min(startRecord + stateDebtor.sendData.limit - 1, data?.totalItems || 1);

        useEffect(() => {
            if (isFirstRun.current) {
                isFirstRun.current = false
                return;
            }
            retryFetch('api/debtor/filter', {
                method: 'post',
                data: stateDebtor.sendData,
            })
        }, [stateDebtor.sendData, retryFetch])

        // Функція для обробки сортування
        const handleSort = useCallback((dataIndex) => {
            setStateDebtor(prevState => {
                let newDirection = 'desc'; // За замовчуванням від найбільшого до найменшого
                
                // Якщо вже сортуємо по цьому полю, змінюємо напрямок
                if (prevState.sendData.sort_by === dataIndex) {
                    newDirection = prevState.sendData.sort_direction === 'desc' ? 'asc' : 'desc';
                }
                
                return {
                    ...prevState,
                    sendData: {
                        ...prevState.sendData,
                        sort_by: dataIndex,
                        sort_direction: newDirection,
                        page: 1, // Скидаємо на першу сторінку при сортуванні
                    }
                };
            });
        }, []);

        // Функція для отримання іконки сортування
        const getSortIcon = useCallback((dataIndex) => {
            if (stateDebtor.sendData.sort_by !== dataIndex) {
                return null;
            }
            try {
                return stateDebtor.sendData.sort_direction === 'desc' ? sortDownIcon : sortUpIcon;
            } catch (error) {
                console.error('Помилка при створенні іконки сортування:', error);
                return null;
            }
        }, [stateDebtor.sendData.sort_by, stateDebtor.sendData.sort_direction]);

        const columnTable = useMemo(() => {
            const createSortableColumn = (title, dataIndex, render = null, width = null) => ({
                title,
                dataIndex,
                sortable: true,
                onHeaderClick: () => handleSort(dataIndex),
                sortIcon: getSortIcon(dataIndex),
                headerClassName: stateDebtor.sendData.sort_by === dataIndex ? 'active' : '',
                ...(width && { width }),
                ...(render && { render })
            });
        
            const hasDebt = (record) => {
                return ['mpz', 'orenda_debt', 'land_debt', 'residential_debt', 'non_residential_debt']
                    .some(field => Number(record[field]) > 0);
            };
            // Перевіряємо чи вибраний конкретний тип податку
            const selectedTaxType = stateDebtor.selectData?.tax_type;

            let columns = [
                createSortableColumn('ІПН', 'identification', null, '65px'),
                createSortableColumn('П.І.Б', 'name', null, '130px'),
                createSortableColumn('Дата', 'date', null, '80px'),
            ];
            
            if (!selectedTaxType || selectedTaxType === '') {
                // Якщо тип не вибраний - показуємо всі колонки
                columns.push(
                    createSortableColumn('Нежитл', 'non_residential_debt', null, '70px'),
                    createSortableColumn('Житл', 'residential_debt', null, '65px'),
                    createSortableColumn('Земля', 'land_debt', null, '65px'),
                    createSortableColumn('Оренда', 'orenda_debt', null, '70px'),
                    createSortableColumn('МПЗ', 'mpz', null, '60px')
                );
            } else {
                // Якщо вибраний конкретний тип - показуємо тільки його
                const taxTypeMapping = {
                    'non_residential_debt': { title: 'Нежитлова', width: '100px' },
                    'residential_debt': { title: 'Житлова', width: '100px' },
                    'land_debt': { title: 'Земельна', width: '100px' },
                    'orenda_debt': { title: 'Орендна', width: '100px' },
                    'mpz': { title: 'МПЗ', width: '100px' }
                };
                
                if (taxTypeMapping[selectedTaxType]) {
                    columns.push(
                        createSortableColumn(
                            taxTypeMapping[selectedTaxType].title, 
                            selectedTaxType, 
                            null, 
                            taxTypeMapping[selectedTaxType].width
                        )
                    );
                }
            }
            columns.push(
                createSortableColumn('Всього', 'total_debt', (value) => {
                    const numValue = Number(value) || 0;
                    return (
                        <span style={{
                            fontWeight: 'bold', 
                            color: numValue > 0 ? '#e74c3c' : '#27ae60',
                            fontSize: '13px'
                        }}>
                            {numValue.toFixed(2)}
                        </span>
                    );
                }, '80px'),
                {
                    title: 'Дія',
                    dataIndex: 'action',
                    headerClassName: 'non-sortable',
                    width: '95px',
                    render: (_, record) => (
                        <div className="btn-sticky" style={{
                            justifyContent: 'center', 
                            gap: '1px', 
                            flexWrap: 'wrap'
                        }}>
                            <Button
                                title="Перегляд"
                                icon={viewIcon}
                                size="small"
                                onClick={() => navigate(`/debtor/${record.id}`)}
                            />
                            {hasDebt(record) && (
                                <>
                                    <Button
                                        title="Завантажити"
                                        icon={downloadIcon}
                                        size="small"
                                        onClick={() => handleOpenModal(record.id)}
                                    />
                                    <Button
                                        title="Реквізити"
                                        icon={editIcon}
                                        size="small"
                                        onClick={() => navigate(`/debtor/${record.id}/print`)}
                                    />
                                </>
                            )}
                        </div>
                    ),
                }
            );
        
            return columns;
        }, [navigate, handleSort, getSortIcon, stateDebtor.sendData.sort_by, stateDebtor.selectData?.tax_type]);
            /*return [
                //createSortableColumn('ID', 'id', null, '45px'),
                createSortableColumn('ІПН', 'identification', null, '65px'),
                createSortableColumn('П.І.Б', 'name', null, '130px'),
                createSortableColumn('Дата', 'date', null, '80px'),
                createSortableColumn('Нежитл', 'non_residential_debt', null, '70px'),
                createSortableColumn('Житл', 'residential_debt', null, '65px'),
                createSortableColumn('Земля', 'land_debt', null, '65px'),
                createSortableColumn('Оренда', 'orenda_debt', null, '70px'),
                createSortableColumn('МПЗ', 'mpz', null, '60px'),
                createSortableColumn('Всього', 'total_debt', (value) => {
                    const numValue = Number(value) || 0;
                    return (
                        <span style={{
                            fontWeight: 'bold', 
                            color: numValue > 0 ? '#e74c3c' : '#27ae60',
                            fontSize: '13px'
                        }}>
                            {numValue.toFixed(2)}
                        </span>
                    );
                }, '80px'),
                {
                    title: 'Дія',
                    dataIndex: 'action',
                    headerClassName: 'non-sortable',
                    width: '95px',
                    render: (_, record) => (
                        <div className="btn-sticky" style={{
                            justifyContent: 'center', 
                            gap: '1px', 
                            flexWrap: 'wrap'
                        }}>
                            <Button
                                title="Перегляд"
                                icon={viewIcon}
                                size="small"
                                onClick={() => navigate(`/debtor/${record.id}`)}
                            />
                            {hasDebt(record) && (
                                <>
                                    <Button
                                        title="Завантажити"
                                        icon={downloadIcon}
                                        size="small"
                                        onClick={() => handleOpenModal(record.id)}
                                    />
                                    <Button
                                        title="Реквізити"
                                        icon={editIcon}
                                        size="small"
                                        onClick={() => navigate(`/debtor/${record.id}/print`)}
                                    />
                                </>
                            )}
                        </div>
                    ),
                }
            ];
        }, [navigate, handleSort, getSortIcon, stateDebtor.sendData.sort_by]);*/
        
        const tableData = useMemo(() => {
            if (data?.items?.length) {
                const result = data?.items?.map(el => {
                    const totalDebt = (Number(el.non_residential_debt) || 0) + 
                                    (Number(el.residential_debt) || 0) + 
                                    (Number(el.land_debt) || 0) + 
                                    (Number(el.orenda_debt) || 0) + 
                                    (Number(el.mpz) || 0);
                    
                    return {
                        key: el.id,
                        id: el.id,
                        name: el.name,
                        date: el.date,
                        non_residential_debt: el.non_residential_debt,
                        residential_debt: el.residential_debt,
                        land_debt: el.land_debt,
                        orenda_debt: el.orenda_debt,
                        mpz: el.mpz,
                        identification: el.identification,
                        total_debt: totalDebt,
                    }
                });
                console.log('tableData result:', result[0]); // Фінальний дебаг
                return result;
            }
            return []
        }, [data])

        const itemMenu = [
            {
                label: '16',
                key: '16',
                onClick: () => {
                    if (stateDebtor.sendData.limit !== 16) {
                        setStateDebtor(prevState => ({
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
                    if (stateDebtor.sendData.limit !== 32) {
                        setStateDebtor(prevState => ({
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
                    if (stateDebtor.sendData.limit !== 48) {
                        setStateDebtor(prevState => ({
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
            setStateDebtor(prevState => ({
                ...prevState,
                isFilterOpen: !prevState.isFilterOpen,
            }))
        }

        const closeFilterDropdown = () => {
            setStateDebtor(prevState => ({
                ...prevState,
                isFilterOpen: false,
            }))
        }

        // Перевіряємо чи є активні фільтри
        const hasActiveFilters = useMemo(() => {
            return Object.values(stateDebtor.selectData).some(value => {
                if (Array.isArray(value) && !value.length) {
                    return false
                }
                return value !== null && value !== undefined && value !== ''
            })
        }, [stateDebtor.selectData])

        const onHandleChange = (name, value) => {
            setStateDebtor(prevState => ({
                ...prevState,
                selectData: {
                    ...prevState.selectData,
                    [name]: value
                }
            }))
        }

        const resetFilters = () => {
            if (Object.values(stateDebtor.selectData).some(value => value)) {
                setStateDebtor(prevState => ({
                    ...prevState,
                    selectData: {},
                }));
            }
            const dataReadyForSending = hasOnlyAllowedParams(stateDebtor.sendData, ['limit', 'page', 'sort_by', 'sort_direction'])
            if (!dataReadyForSending) {
                setStateDebtor(prevState => ({
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
            const isAnyInputFilled = Object.values(stateDebtor.selectData).some(value => {
                if (Array.isArray(value) && !value.length) {
                    return false
                }
                return value
            })
            if (isAnyInputFilled) {
                const dataValidation = validateFilters(stateDebtor.selectData)
                if (!dataValidation.error) {
                    setStateDebtor(prevState => ({
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
            if (stateDebtor.sendData.page !== page) {
                setStateDebtor(prevState => ({
                    ...prevState,
                    sendData: {
                        ...prevState.sendData,
                        page,
                    }
                }))
            }
        }, [stateDebtor.sendData.page])

        const handleOpenModal = (recordId) => {
            setStateDebtor(prevState => ({
                ...prevState,
                itemId: recordId,
            }))
            document.body.style.overflow = 'hidden'
        }

        const handleCloseModal = () => {
            setStateDebtor(prevState => ({
                ...prevState,
                itemId: null,
            }))
            document.body.style.overflow = 'auto';
        }

        const handleGenerate = async () => {
            if (stateDebtor.itemId) {
                try {
                    setStateDebtor(prevState => ({
                        ...prevState,
                        confirmLoading: true,
                    }))
                    const fetchData = await fetchFunction(`api/debtor/generate/${stateDebtor.itemId}`, {
                        method: 'get',
                        responseType: 'blob'
                    })
                    notification({
                        placement: "top",
                        duration: 2,
                        title: 'Успіх',
                        message: "Успішно сформовано.",
                        type: 'success'
                    })
                    const blob = fetchData.data
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = 'generated.docx';
                    document.body.appendChild(a);
                    a.click();
                    a.remove();

                } catch (error) {
                    if (error?.response?.status === 401) {
                        notification({
                            type: 'warning',
                            title: "Помилка",
                            message: error?.response?.status === 401 ? "Не авторизований" : error.message,
                            placement: 'top',
                        })
                        store.logOff()
                        return navigate('/')
                    }
                    notification({
                        type: 'warning',
                        title: "Помилка",
                        message: error?.response?.data?.message ? error.response.data.message : error.message,
                        placement: 'top',
                    })
                } finally {
                    setStateDebtor(prevState => ({
                        ...prevState,
                        confirmLoading: false,
                        itemId: null,
                    }))
                    document.body.style.overflow = 'auto';
                }
            }
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
                                            Показує {startRecord !== endRecord ? `${startRecord}-${endRecord}` : startRecord} з {data?.totalItems || 1}
                                        </React.Fragment> : <React.Fragment>Записів не знайдено</React.Fragment>
                                    }
                                </h2>
                                <div className="table-header__buttons">
                                    <Dropdown
                                        icon={dropDownIcon}
                                        iconPosition="right"
                                        style={dropDownStyle}
                                        childStyle={childDropDownStyle}
                                        caption={`Записів: ${stateDebtor.sendData.limit}`}
                                        menu={itemMenu}/>
                                    <Button
                                        className={`table-filter-trigger ${hasActiveFilters ? 'has-active-filters' : ''}`}
                                        onClick={filterHandleClick}
                                        icon={filterIcon}>
                                        Фільтри {hasActiveFilters && `(${Object.keys(stateDebtor.selectData).filter(key => stateDebtor.selectData[key]).length})`}
                                    </Button>
                                    
                                    {/* Dropdown фільтр */}
                                    <FilterDropdown
                                        isOpen={stateDebtor.isFilterOpen}
                                        onClose={closeFilterDropdown}
                                        filterData={stateDebtor.selectData}
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
                                        pageSize={stateDebtor.sendData.limit}
                                        onPageChange={onPageChange}/>
                                </div>
                            </div>
                        </div>
                    </React.Fragment> : null
                }
                <Transition in={!!stateDebtor.itemId} timeout={200} unmountOnExit nodeRef={nodeRef}>
                    {state => (
                        <Modal
                            className={`${state === 'entered' ? "modal-window-wrapper--active" : ""}`}
                            onClose={handleCloseModal}
                            onOk={handleGenerate}
                            confirmLoading={stateDebtor.confirmLoading}
                            cancelText="Скасувати"
                            okText="Так, сформувати"
                            title="Підтвердження формування реквізитів">
                            <p className="paragraph">
                                Ви впевнені, що бажаєте виконати операцію &quot;Сформувати реквізити&quot;?
                            </p>
                        </Modal>
                    )}
                </Transition>
            </React.Fragment>
        )
    }
;
export default DebtorList;