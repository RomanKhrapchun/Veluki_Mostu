import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom'
import Table from "../../components/common/Table/Table";
import {generateIcon, iconMap} from "../../utils/constants";
import Button from "../../components/common/Button/Button";
import {fetchFunction} from "../../utils/function";
import {useNotification} from "../../hooks/useNotification";
import {Context} from "../../main";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";
import Input from "../../components/common/Input/Input";
import Dropdown from "../../components/common/Dropdown/Dropdown";
import Modal from "../../components/common/Modal/Modal";
import Pagination from "../../components/common/Pagination/Pagination";
import {Transition} from "react-transition-group";
import classNames from "classnames";

// Іконки
const viewIcon = generateIcon(iconMap.view)
const editIcon = generateIcon(iconMap.edit)
const filterIcon = generateIcon(iconMap.filter)
const searchIcon = generateIcon(iconMap.search, 'input-icon')
const addIcon = generateIcon(iconMap.plus)
const deleteIcon = generateIcon(iconMap.delete)
const dropDownIcon = generateIcon(iconMap.arrowDown)

// Константи стану та стилів
const STATUS = {
    PENDING: 'pending',
    SUCCESS: 'success',
    ERROR: 'error'
};

const dropDownStyle = {
    padding: "8px 16px",
    width: "150px"
};

const childDropDownStyle = {
    padding: "8px 16px"
};

const PaidServicesList = () => {
    const navigate = useNavigate()
    const notification = useNotification()
    const {store} = useContext(Context)
    const nodeRef = useRef(null)
    
    const [status, setStatus] = useState(STATUS.PENDING)
    
    const [state, setState] = useState({
        sendData: {
            limit: 16,
            page: 1,
        },
        selectData: {
            name: '',
            identifier: '',
        },
        isOpen: false,
        data: null,
        itemId: null,
        confirmLoading: false
    })
    
    // Fixed format for Dropdown menu
    const itemMenu = [
        {
            label: "16",
            key: "16",
            onClick: () => handleLimitChange(16)
        },
        {
            label: "32", 
            key: "32",
            onClick: () => handleLimitChange(32)
        },
        {
            label: "64",
            key: "64",
            onClick: () => handleLimitChange(64)
        }
    ];
    
    const handleLimitChange = useCallback((limit) => {
        setState(prev => ({
            ...prev,
            sendData: {
                ...prev.sendData,
                limit,
                page: 1
            }
        }))
    }, [])

    const fetchTableData = async () => {
        try {
            setStatus(STATUS.PENDING)
            const response = await fetchFunction('api/cnap/services/filter', {
                method: 'post',
                data: state.sendData
            })
            
            if (response?.data) {
                setState(prev => ({
                    ...prev,
                    data: response.data
                }))
                setStatus(STATUS.SUCCESS)
            }
        } catch (error) {
            setStatus(STATUS.ERROR)
            notification({
                type: 'error',
                message: 'Помилка при завантаженні даних'
            })
        }
    }

    useEffect(() => {
        fetchTableData()
    }, [])

    useEffect(() => {
        fetchTableData()
    }, [state.sendData])

    const handleView = useCallback((id) => {
        navigate(`/cnap/services/${id}`)
    }, [navigate])

    const handleEdit = useCallback((id) => {
        navigate(`/cnap/services/${id}/edit`)
    }, [navigate])

    const handleAdd = useCallback(() => {
        navigate('/cnap/services/create')
    }, [navigate])

    const handleDelete = useCallback(async (id) => {
        try {
            const response = await fetchFunction(`api/cnap/services/${id}`, {
                method: 'DELETE',
            })
            
            if (response?.data) {
                notification({
                    type: 'success',
                    message: response.data.message
                })
                fetchTableData()
            } else {
                notification({
                    type: 'error',
                    message: 'Помилка при видаленні послуги'
                })
            }
        } catch (error) {
            notification({
                type: 'error',
                message: error?.response?.data?.message || 'Помилка при видаленні послуги'
            })
        }
    }, [notification, fetchTableData])

    const handlePageChange = (page) => {
        if (page !== state.sendData.page) {
            setState(prev => ({
                ...prev,
                sendData: {
                    ...prev.sendData,
                    page
                }
            }))
        }
    }
    
    const filterHandleClick = () => {
        setState(prev => ({
            ...prev,
            isOpen: !prev.isOpen
        }))
    }
    
    // Fixed - safe handling of input changes
    const onHandleChange = (name, value) => {
        if (name && value !== undefined) {
            setState(prev => ({
                ...prev,
                selectData: {
                    ...prev.selectData,
                    [name]: value
                }
            }))
        }
    }
    
    const applyFilter = () => {
        setState(prev => ({
            ...prev,
            sendData: {
                ...prev.sendData,
                ...prev.selectData,
                page: 1
            },
            isOpen: false
        }))
    }
    
    const resetFilters = () => {
        setState(prev => ({
            ...prev,
            selectData: {
                name: '',
                identifier: ''
            },
            isOpen: false,
            sendData: {
                limit: prev.sendData.limit,
                page: 1
            }
        }))
    }
    
    const handleCloseModal = () => {
        setState(prev => ({
            ...prev,
            itemId: null,
            confirmLoading: false
        }))
    }
    
    const handleGenerate = async () => {
        try {
            setState(prev => ({
                ...prev,
                confirmLoading: true
            }))
            
            const response = await fetchFunction(`api/cnap/services/${state.itemId}/generate`, {
                method: 'POST'
            })
            
            if (response?.data) {
                notification({
                    type: 'success',
                    message: response.data.message || 'Реквізити успішно сформовано'
                })
                fetchTableData()
            }
        } catch (error) {
            notification({
                type: 'error',
                message: error?.response?.data?.message || 'Помилка при формуванні реквізитів'
            })
        } finally {
            setState(prev => ({
                ...prev,
                itemId: null,
                confirmLoading: false
            }))
        }
    }
    

    const columns = useMemo(() => [
        {
            title: '№',
            dataIndex: 'id',
            width: '5%'
        },
        {
            title: 'Ідентифікатор',
            dataIndex: 'identifier',
            width: '15%'
        },
        {
            title: 'Назва послуги',
            dataIndex: 'name',
            width: '25%'
        },
        {
            title: 'Вартість',
            dataIndex: 'price',
            width: '10%'
        },
        {
            title: 'ЄДРПОУ',
            dataIndex: 'edrpou',
            width: '10%'
        },
        {
            title: 'IBAN',
            dataIndex: 'iban',
            width: '25%'
        },
        {
            title: 'Дії',
            dataIndex: 'actions',
            width: '10%',
            render: (_, {id}) => (
                <div className="btn-sticky" style={{justifyContent: 'center'}}>
                    <Button
                        title="Перегляд"
                        icon={viewIcon}
                        onClick={() => handleView(id)}
                    />
                    <Button
                        title="Редагувати"
                        icon={editIcon}
                        onClick={() => handleEdit(id)}
                    />
                    <Button
                        title="Видалити"
                        icon={deleteIcon}
                        onClick={() => handleDelete(id)}
                    />
                </div>
            )
        }
    ], [handleView, handleEdit, handleDelete])

    const tableData = useMemo(() => {
        if (state.data?.items?.length) {
            return state.data.items.map(item => ({
                key: item.id,
                id: item.id,
                identifier: item.identifier,
                name: item.name,
                price: item.price,
                edrpou: item.edrpou,
                iban: item.iban
            }))
        }
        return []
    }, [state.data])
    
    // Fixed - correct pagination calculation and handling
    const totalItems = state.data?.totalItems || 0;
    const currentPage = parseInt(state.data?.currentPage) || parseInt(state.sendData.page) || 1;
    const limit = state.sendData.limit || 16;
    
    // Ensure we display the correct start and end record numbers
    const startRecord = totalItems > 0 ? (currentPage - 1) * limit + 1 : 0;
    const endRecord = totalItems > 0 ? Math.min(startRecord + limit - 1, totalItems) : 0;

    return (
        <div className="page-container">
            <div className="page-container__header">
                <div className="page-container__header-title">
                    <h1>Платні послуги</h1>
                </div>
                <div className="page-container__header-action">
                    <Button
                        type="primary"
                        icon={addIcon}
                        onClick={handleAdd}
                    >
                        Створити послугу
                    </Button>
                </div>
            </div>
            <div className="page-container__content">
                {status === STATUS.PENDING ? <SkeletonPage/> : null}
                {status === STATUS.SUCCESS ?
                    <React.Fragment>
                        <div className="table-elements">
                            <div className="table-header">
                                <h2 className="title title--sm">
                                    {state.data?.items && Array.isArray(state.data?.items) && state.data?.items.length > 0 ?
                                        <React.Fragment>
                                            Показує {startRecord !== endRecord ? `${startRecord}-${endRecord}` : startRecord} з {totalItems}
                                        </React.Fragment> : <React.Fragment>Записів не знайдено</React.Fragment>
                                    }
                                </h2>
                                <div className="table-header__buttons">
                                    <Dropdown
                                        icon={dropDownIcon}
                                        iconPosition="right"
                                        style={dropDownStyle}
                                        childStyle={childDropDownStyle}
                                        caption={`Записів: ${state.sendData.limit}`}
                                        menu={itemMenu}/>
                                    <Button
                                        className="table-filter-trigger"
                                        onClick={filterHandleClick}
                                        icon={filterIcon}>
                                        Фільтри
                                    </Button>
                                </div>
                            </div>
                            <div className="table-main">
                                <div style={{width: `${state.data?.items?.length > 0 ? 'auto' : '100%'}`}}
                                     className={classNames("table-and-pagination-wrapper", {"table-and-pagination-wrapper--active": state.isOpen})}>
                                    <Table columns={columns} dataSource={tableData}/>
                                    <Pagination
                                        className="m-b"
                                        currentPage={currentPage}
                                        totalCount={totalItems}
                                        pageSize={limit}
                                        onPageChange={handlePageChange}/>
                                </div>
                                <div className={`table-filter ${state.isOpen ? "table-filter--active" : ""}`}>
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
                                            name="name"
                                            type="text"
                                            placeholder="Введіть назву послуги"
                                            value={state.selectData?.name || ''}
                                            onChange={(name, value) => onHandleChange(name, value)}/>
                                    </div>
                                    <div className="table-filter__item">
                                        <h4 className="input-description">
                                            Ідентифікатор
                                        </h4>
                                        <Input
                                            icon={searchIcon}
                                            name="identifier"
                                            type="text"
                                            placeholder="Введіть ідентифікатор"
                                            value={state.selectData?.identifier || ''}
                                            onChange={(name, value) => onHandleChange(name, value)}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment> : null
                }
                <Transition in={!!state.itemId} timeout={200} unmountOnExit nodeRef={nodeRef}>
                    {transitionState => (
                        <Modal
                            className={`${transitionState === 'entered' ? "modal-window-wrapper--active" : ""}`}
                            onClose={handleCloseModal}
                            onOk={handleGenerate}
                            confirmLoading={state.confirmLoading}
                            cancelText="Скасувати"
                            okText="Так, сформувати"
                            title="Підтвердження формування реквізитів">
                            <p className="paragraph">
                                Ви впевнені, що бажаєте виконати операцію &quot;Сформувати реквізити&quot;?
                            </p>
                        </Modal>
                    )}
                </Transition>
            </div>
        </div>
    )
}

export default PaidServicesList