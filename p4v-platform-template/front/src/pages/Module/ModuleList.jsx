import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom'
import useFetch from "../../hooks/useFetch";
import Table from "../../components/common/Table/Table";
import {generateIcon, iconMap, STATUS} from "../../utils/constants";
import Button from "../../components/common/Button/Button";
import PageError from "../ErrorPage/PageError";
import classNames from "classnames";
import Pagination from "../../components/common/Pagination/Pagination";
import Input from "../../components/common/Input/Input";
import {fetchFunction, hasOnlyAllowedParams, validateFilters} from "../../utils/function";
import Modal from "../../components/common/Modal/Modal";
import {Transition} from 'react-transition-group';
import {useNotification} from "../../hooks/useNotification";
import {Context} from "../../main";
import Dropdown from "../../components/common/Dropdown/Dropdown";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";
import Badge from "../../components/common/Badge/Badge";

const deleteIcon = generateIcon(iconMap.delete)
const viewIcon = generateIcon(iconMap.view)
const editIcon = generateIcon(iconMap.edit)
const addIcon = generateIcon(iconMap.add)
const filterIcon = generateIcon(iconMap.filter)
const searchIcon = generateIcon(iconMap.search, 'input-icon')
const dropDownIcon = generateIcon(iconMap.arrowDown)
const dropDownStyle = {width: '100%'}
const childDropDownStyle = {justifyContent: 'center'}
const ModuleList = () => {
        const navigate = useNavigate()
        const notification = useNotification()
        const {store} = useContext(Context)
        const [stateModule, setStateModule] = useState({
            isOpen: false,
            confirmLoading: false,
            deletedItemId: null,
            selectData: {},
            sendData: {
                limit: 16,
                page: 1,
            }
        })
        const nodeRef = useRef(null)
        const isFirstRun = useRef(true)
        const {error, status, data, retryFetch} = useFetch('api/module/allModule', {
            method: 'post',
            data: stateModule.sendData
        })
        const startRecord = ((stateModule.sendData.page || 1) - 1) * stateModule.sendData.limit + 1;
        const endRecord = Math.min(startRecord + stateModule.sendData.limit - 1, data?.totalItems || 1);

        useEffect(() => {
            if (isFirstRun.current) {
                isFirstRun.current = false
                return;
            }
            retryFetch('api/module/allModule', {
                method: 'post',
                data: stateModule.sendData,
            })
        }, [stateModule.sendData, retryFetch])

        const handleOpenModal = (recordId) => {
            setStateModule(prevState => ({
                ...prevState,
                deletedItemId: recordId,
            }))
            document.body.style.overflow = 'hidden'
        }

        const handleCloseModal = () => {
            setStateModule(prevState => ({
                ...prevState,
                deletedItemId: null,
            }))
            document.body.style.overflow = 'auto';
        }

        const columnTable = useMemo(() => {
            return [
                {
                    title: 'ID', dataIndex: 'module_id',
                }, {
                    title: 'Код', dataIndex: 'module',
                }, {
                    title: 'Назва модуля', dataIndex: 'module_name',
                },{
                    title: 'Статус',
                    render: (_, {enabled}) => (
                        <Badge caption={`${enabled ? 'Увімкнено' : 'Вимкнено'}`}
                               theme={`${enabled ? 'positive' : 'negative'}`}/>
                    )
                },
                {
                    title: 'Версія', dataIndex: 'install_version',
                },{
                    title: 'Автор', dataIndex: 'author',
                },
                {
                    title: 'Опис', dataIndex: 'info',
                },
                {
                    title: 'Статус модуля', dataIndex: 'module_status',
                },
                {
                    title: 'Порядок відображення', dataIndex: 'ord',
                },
                {
                    title: 'Дія', dataIndex: 'action', render: (_, {module_id}) => (
                        <div className="btn-sticky" style={{justifyContent:'center'}}>
                            <Button
                                title="Перегляд"
                                icon={viewIcon}
                                onClick={() => navigate(`/modules/${module_id}`)}/>
                            <Button
                                title="Редагувати"
                                icon={editIcon}
                                onClick={() => navigate(`/modules/${module_id}/edit`)}/>
                            <Button
                                title="Видалити"
                                className="btn--secondary"
                                icon={deleteIcon}
                                onClick={() => handleOpenModal(module_id)}/>
                        </div>
                    ),
                }
            ]

        }, [navigate])

        const tableData = useMemo(() => {
            if (data?.items?.length) {
                return data?.items?.map(el => ({
                    key: el.module_id,
                    module_id: el.module_id,
                    module: el.module,
                    module_name: el.module_name,
                    install_version: el.install_version,
                    info: el.info,
                    author: el.author,
                    enabled: el.enabled,
                    ord: el.ord,
                    module_status: el.module_status,
                }))
            }
            return []
        }, [data])

        const itemMenu = [
            {
                label: '16',
                key: '16',
                onClick: () => {
                    if (stateModule.sendData.limit !== 16) {
                        setStateModule(prevState => ({
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
                    if (stateModule.sendData.limit !== 32) {
                        setStateModule(prevState => ({
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
                    if (stateModule.sendData.limit !== 48) {
                        setStateModule(prevState => ({
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
            setStateModule(prevState => ({
                ...prevState,
                isOpen: !prevState.isOpen,
            }))
        }

        const addHandleClick = () => {
            navigate('/modules/add')
        }

        const onHandleChange = (name, value) => {
            setStateModule(prevState => ({
                ...prevState,
                selectData: {
                    ...prevState.selectData,
                    [name]: value
                }
            }))
        }

        const resetFilters = () => {
            if (Object.values(stateModule.selectData).some(value => value)) {
                setStateModule(prevState => ({
                    ...prevState,
                    selectData: {},
                }));
            }
            const dataReadyForSending = hasOnlyAllowedParams(stateModule.sendData, ['limit', 'page'])
            if (!dataReadyForSending) {
                setStateModule(prevState => ({
                    ...prevState,
                    sendData: {
                        limit: prevState.sendData.limit,
                        page: 1,
                    }
                }))
            }
        }

        const applyFilter = () => {
            const isAnyInputFilled = Object.values(stateModule.selectData).some(value => {
                if (Array.isArray(value) && !value.length) {
                    return false
                }
                return value
            })
            if (isAnyInputFilled) {
                const dataValidation = validateFilters(stateModule.selectData)
                if (!dataValidation.error) {
                    setStateModule(prevState => ({
                        ...prevState,
                        sendData: {
                            ...dataValidation,
                            limit: prevState.sendData.limit,
                            page: 1,
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
            if (stateModule.sendData.page !== page) {
                setStateModule(prevState => ({
                    ...prevState,
                    sendData: {
                        ...prevState.sendData,
                        page,
                    }
                }))
            }
        },[stateModule.sendData.page])

        const handleOk = async () => {
            if (stateModule.deletedItemId) {
                try {
                    setStateModule(prevState => ({
                        ...prevState,
                        confirmLoading: true,
                    }))
                    const fetchData = await fetchFunction(`api/module/${stateModule.deletedItemId}`, {
                        method: 'delete',
                    })
                    notification({
                        placement: "top",
                        duration: 2,
                        title: 'Успіх',
                        message: fetchData.data,
                        type: 'success'
                    })
                    const currentPage = stateModule.sendData.page;
                    const isLastItemOnPage = data?.items?.length === 1;
                    const newPage = isLastItemOnPage && currentPage > 1 ? currentPage - 1 : currentPage;
                    setStateModule(prevState => ({
                        ...prevState,
                        sendData: {
                            ...prevState.sendData,
                            page: newPage,
                        }
                    }))

                } catch (error) {
                    notification({
                        type: 'warning',
                        title: "Помилка",
                        message: error?.response?.data?.message ? error.response.data.message : error.message,
                        placement: 'top',
                    })
                    if (error?.response?.status === 401) {
                        store.logOff()
                        return navigate('/')
                    }
                } finally {
                    setStateModule(prevState => ({
                        ...prevState,
                        confirmLoading: false,
                        deletedItemId: null,
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
                                    <Button
                                        icon={addIcon}
                                        onClick={addHandleClick}>
                                        Додати
                                    </Button>
                                    <Dropdown
                                        icon={dropDownIcon}
                                        iconPosition="right"
                                        style={dropDownStyle}
                                        childStyle={childDropDownStyle}
                                        caption={`Записів: ${stateModule.sendData.limit}`}
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
                                <div style={{width: `${data?.items?.length > 0 ? 'auto' : '100%'}`}}
                                     className={classNames("table-and-pagination-wrapper", {"table-and-pagination-wrapper--active": stateModule.isOpen})}>
                                    <Table columns={columnTable} dataSource={tableData}/>
                                    <Pagination
                                        className="m-b"
                                        currentPage={parseInt(data?.currentPage) || 1}
                                        totalCount={data?.totalItems || 1}
                                        pageSize={stateModule.sendData.limit}
                                        onPageChange={onPageChange}/>
                                </div>
                                <div className={`table-filter ${stateModule.isOpen ? "table-filter--active" : ""}`}>
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
                                            name="title"
                                            type="text"
                                            placeholder="Введіть назву модуля"
                                            value={stateModule.selectData?.title || ''}
                                            onChange={onHandleChange}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment> : null
                }
                <Transition in={!!stateModule.deletedItemId} timeout={200} unmountOnExit nodeRef={nodeRef}>
                    {state => (
                        <Modal
                            className={`${state === 'entered' ? "modal-window-wrapper--active" : ""}`}
                            onClose={handleCloseModal}
                            onOk={handleOk}
                            confirmLoading={stateModule.confirmLoading}
                            cancelText="Скасувати"
                            okText="Так, вилучити"
                            title="Підтвердження видалення">
                            <p className="paragraph">
                                Ви впевнені, що бажаєте виконати операцію &quot;Видалення&quot;?
                            </p>
                        </Modal>
                    )}
                </Transition>
            </React.Fragment>
        )
    }
;
export default ModuleList;