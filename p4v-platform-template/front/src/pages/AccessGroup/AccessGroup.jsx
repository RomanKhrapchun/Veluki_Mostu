import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom'
import useFetch from "../../hooks/useFetch";
import Table from "../../components/common/Table/Table";
import Badge from "../../components/common/Badge/Badge";
import {formatDate, generateIcon, iconMap, STATUS} from "../../utils/constants";
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

const deleteIcon = generateIcon(iconMap.delete)
const accessIcon = generateIcon(iconMap.password)
const editIcon = generateIcon(iconMap.edit)
const addIcon = generateIcon(iconMap.add)
const viewIcon = generateIcon(iconMap.view)
const filterIcon = generateIcon(iconMap.filter)
const searchIcon = generateIcon(iconMap.search, 'input-icon')
const dropDownIcon = generateIcon(iconMap.arrowDown)
const dropDownStyle = {width: '100%'}
const childDropDownStyle = {justifyContent: 'center'}

const AccessGroup = () => {
        const nodeRef = useRef(null)
        const navigate = useNavigate()
        const notification = useNotification()
        const {store} = useContext(Context)
        const [stateAccessGroup, setStateAccessGroup] = useState({
            isOpen: false,
            confirmLoading: false,
            deletedItemId: null,
            selectData: {},
            sendData: {
                limit: 16,
                page: 1,
            }
        })
        const isFirstRun = useRef(true)
        const {error, status, data, retryFetch} = useFetch('api/accessGroup/filter', {
            method: 'post',
            data: stateAccessGroup.sendData
        })
        const startRecord = ((stateAccessGroup.sendData.page || 1) - 1) * stateAccessGroup.sendData.limit + 1;
        const endRecord = Math.min(startRecord + stateAccessGroup.sendData.limit - 1, data?.totalItems || 1);
        useEffect(() => {
            if (isFirstRun.current) {
                isFirstRun.current = false
                return;
            }
            retryFetch('api/accessGroup/filter', {
                method: 'post',
                data: stateAccessGroup.sendData,
            })
        }, [stateAccessGroup.sendData, retryFetch])

        const handleOpenModal = (recordId) => {
            setStateAccessGroup(prevState => ({
                ...prevState,
                deletedItemId: recordId,
            }))
            document.body.style.overflow = 'hidden'
        }

        const handleCloseModal = () => {
            setStateAccessGroup(prevState => ({
                ...prevState,
                deletedItemId: null,
            }))
            document.body.style.overflow = 'auto';
        }

        const columnTable = useMemo(() => {
            return [
                {
                    title: 'ID', dataIndex: 'id',
                }, {
                    title: 'Статус',
                    render: (_, {enabled}) => (<Badge caption={`${enabled ? 'Увімкнено' : 'Вимкнено'}`}
                                                      theme={`${enabled ? 'positive' : 'negative'}`}/>),
                }, {
                    title: 'Назва', dataIndex: 'access_group_name',
                }, {
                    title: 'Опис', dataIndex: 'info',
                }, {
                    title: 'Дата створення',
                    render: (_, {create_date}) => (
                        <>{create_date ? formatDate(create_date) : ''}</>
                    ),
                }, {
                    title: 'Дата редагування',
                    render: (_, {editor_date}) => (
                        <>{editor_date ? formatDate(editor_date) : ''}</>
                    ),
                }, {
                    title: 'Дія', dataIndex: 'action', render: (_, {id}) => (
                        <div className="btn-sticky" style={{justifyContent:'center'}}>
                            <Button
                                title="Перегляд"
                                icon={viewIcon}
                                onClick={() => navigate(`/group/${id}`)}
                            />
                            <Button
                                title="Доступ"
                                icon={accessIcon}
                                onClick={() => navigate(`/group/${id}/access`)}
                            />
                            <Button
                                title="Редагувати"
                                icon={editIcon}
                                onClick={() => navigate(`/group/${id}/edit`)}
                            />
                            <Button
                                title="Видалити"
                                className="btn--secondary"
                                icon={deleteIcon}
                                onClick={() => handleOpenModal(id)}
                            />
                        </div>
                    ),
                }
            ]
        }, [navigate])

        const tableData = useMemo(() => {
            if (data?.items?.length) {
                return data?.items?.map(el => ({
                    key: el.id,
                    id: el.id,
                    access_group_name: el.access_group_name,
                    enabled: el.enabled,
                    info: el.info,
                    create_date: el.create_date,
                    editor_date: el.editor_date,
                }))
            }
            return []
        }, [data])

        const itemMenu = [
            {
                label: '16',
                key: '16',
                onClick: () => {
                    if (stateAccessGroup.sendData.limit !== 16) {
                        setStateAccessGroup(prevState => ({
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
                    if (stateAccessGroup.sendData.limit !== 32) {
                        setStateAccessGroup(prevState => ({
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
                    if (stateAccessGroup.sendData.limit !== 48) {
                        setStateAccessGroup(prevState => ({
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
            setStateAccessGroup(prevState => ({
                ...prevState,
                isOpen: !prevState.isOpen,
            }))
        }

        const addHandleClick = () => {
            navigate('/group/add')
        }

        const onHandleChange = (name, value) => {
            setStateAccessGroup(prevState => ({
                ...prevState,
                selectData: {
                    ...prevState.selectData,
                    [name]: value
                }
            }))
        }

        const resetFilters = () => {
            if (Object.values(stateAccessGroup.selectData).some(value => value)) {
                setStateAccessGroup(prevState => ({
                    ...prevState,
                    selectData: {},
                }));
            }
            const dataReadyForSending = hasOnlyAllowedParams(stateAccessGroup.sendData, ['limit', 'page'])
            if (!dataReadyForSending) {
                setStateAccessGroup(prevState => ({
                    ...prevState,
                    sendData: {
                        limit: prevState.sendData.limit,
                        page: 1,
                    }
                }))
            }
        }

        const applyFilter = () => {
            const isAnyInputFilled = Object.values(stateAccessGroup.selectData).some(value => {
                if (Array.isArray(value) && !value.length) {
                    return false
                }
                return value
            })
            if (isAnyInputFilled) {
                const dataValidation = validateFilters(stateAccessGroup.selectData)
                if (!dataValidation.error) {
                    setStateAccessGroup(prevState => ({
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
            if (stateAccessGroup.sendData.page !== page) {
                setStateAccessGroup(prevState => ({
                    ...prevState,
                    sendData: {
                        ...prevState.sendData,
                        page,
                    }
                }))
            }
        },[stateAccessGroup.sendData.page])

        const handleOk = async () => {
            if (stateAccessGroup.deletedItemId) {
                try {
                    setStateAccessGroup(prevState => ({
                        ...prevState,
                        confirmLoading: true,
                    }))
                    const fetchData = await fetchFunction(`api/accessGroup/${stateAccessGroup.deletedItemId}`, {
                        method: 'delete',
                    })
                    notification({
                        placement: "top",
                        duration: 2,
                        title: 'Успіх',
                        message: fetchData.data,
                        type: 'success'
                    })
                    const currentPage = stateAccessGroup.sendData.page;
                    const isLastItemOnPage = data?.items?.length === 1;
                    const newPage = isLastItemOnPage && currentPage > 1 ? currentPage - 1 : currentPage;
                    setStateAccessGroup(prevState => ({
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
                    setStateAccessGroup(prevState => ({
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
                                        </React.Fragment>
                                        : <React.Fragment>Записів не знайдено</React.Fragment>
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
                                        caption={`Записів: ${stateAccessGroup.sendData.limit}`}
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
                                     className={classNames("table-and-pagination-wrapper", {"table-and-pagination-wrapper--active": stateAccessGroup.isOpen})}>
                                    <Table columns={columnTable} dataSource={tableData}/>
                                    <Pagination
                                        className="m-b"
                                        currentPage={parseInt(data?.currentPage) || 1}
                                        totalCount={data?.totalItems || 1}
                                        pageSize={stateAccessGroup.sendData.limit}
                                        onPageChange={onPageChange}/>
                                </div>
                                <div className={`table-filter ${stateAccessGroup.isOpen ? "table-filter--active" : ""}`}>
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
                                            placeholder="Введіть назву групи доступу"
                                            value={stateAccessGroup.selectData.title || ''}
                                            onChange={onHandleChange}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment> : null}
                <Transition in={!!stateAccessGroup.deletedItemId} timeout={200} unmountOnExit nodeRef={nodeRef}>
                    {state => (
                        <Modal
                            className={`${state === 'entered' ? "modal-window-wrapper--active" : ""}`}
                            onClose={handleCloseModal}
                            onOk={handleOk}
                            confirmLoading={stateAccessGroup.confirmLoading}
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

export default AccessGroup;