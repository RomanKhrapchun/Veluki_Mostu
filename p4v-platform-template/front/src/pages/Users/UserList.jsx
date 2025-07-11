import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom'
import useFetch from "../../hooks/useFetch";
import Table from "../../components/common/Table/Table";
import Badge from "../../components/common/Badge/Badge";
import {booleanArray, generateIcon, iconMap, STATUS} from "../../utils/constants";
import Button from "../../components/common/Button/Button";
import PageError from "../ErrorPage/PageError";
import classNames from "classnames";
import Pagination from "../../components/common/Pagination/Pagination";
import Input from "../../components/common/Input/Input";
import {fetchFunction, hasOnlyAllowedParams, validateFilters} from "../../utils/function";
import Modal from "../../components/common/Modal/Modal";
import {Transition} from 'react-transition-group';
import Select from "../../components/common/Select/Select";
import {useNotification} from "../../hooks/useNotification";
import {Context} from "../../main";
import Dropdown from "../../components/common/Dropdown/Dropdown";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";

const deleteIcon = generateIcon(iconMap.delete)
const viewIcon = generateIcon(iconMap.view)
const editIcon = generateIcon(iconMap.edit)
const addIcon = generateIcon(iconMap.add)
const filterIcon = generateIcon(iconMap.filter)
const searchIcon = generateIcon(iconMap.search, 'input-icon')
const dropDownIcon = generateIcon(iconMap.arrowDown)
const dropDownStyle = {width: '100%'}
const childDropDownStyle = {justifyContent: 'center'}
const UserList = () => {
        const navigate = useNavigate()
        const notification = useNotification()
        const {store} = useContext(Context)
        const [stateUser, setStateUser] = useState({
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
        const {error, status, data, retryFetch} = useFetch('api/users/filter', {
            method: 'post',
            data: stateUser.sendData
        })
        const startRecord = ((stateUser.sendData.page || 1) - 1) * stateUser.sendData.limit + 1;
        const endRecord = Math.min(startRecord + stateUser.sendData.limit - 1, data?.totalItems || 1);

        useEffect(() => {
            if (isFirstRun.current) {
                isFirstRun.current = false
                return;
            }
            retryFetch('api/users/filter', {
                method: 'post',
                data: stateUser.sendData,
            })
        }, [stateUser.sendData, retryFetch])

        const handleOpenModal = (recordId) => {
            setStateUser(prevState => ({
                ...prevState,
                deletedItemId: recordId,
            }))
            document.body.style.overflow = 'hidden'
        }

        const handleCloseModal = () => {
            setStateUser(prevState => ({
                ...prevState,
                deletedItemId: null,
            }))
            document.body.style.overflow = 'auto';
        }

        const columnTable = useMemo(() => {
            return [
                {
                    title: 'ID', dataIndex: 'users_id',
                }, {
                    title: 'Статус активації',
                    render: (_, {is_active}) => (
                        <Badge caption={`${is_active ? 'Увімкнено' : 'Вимкнено'}`}
                               theme={`${is_active ? 'positive' : 'negative'}`}/>
                    )
                }, {
                    title: 'П.І.Б', dataIndex: 'fullName',
                }, {
                    title: 'Логін', dataIndex: 'username',
                },
                {
                    title: 'Номер телефону', dataIndex: 'phone',
                },
                {
                    title: 'Електронна скринька', dataIndex: 'email',
                }, {
                    title: 'Група', dataIndex: 'access_group_name',
                }, {
                    title: 'Дія', dataIndex: 'action', render: (_, {users_id}) => (
                        <div className="btn-sticky" style={{justifyContent:'center'}}>
                            <Button
                                title="Перегляд"
                                icon={viewIcon}
                                onClick={() => navigate(`/user/${users_id}`)}/>
                            <Button
                                title="Редагувати"
                                icon={editIcon}
                                onClick={() => navigate(`/user/${users_id}/edit`)}/>
                            <Button
                                title="Видалити"
                                className="btn--secondary"
                                icon={deleteIcon}
                                onClick={() => handleOpenModal(users_id)}/>
                        </div>
                    ),
                }
            ]

        }, [navigate])

        const tableData = useMemo(() => {
            if (data?.items?.length) {
                return data?.items?.map(el => ({
                    key: el.users_id,
                    users_id: el.users_id,
                    is_active: el.is_active,
                    fullName: `${el.last_name} ${el.first_name} ${el.middle_name ?? ''}`,
                    username: el.username,
                    email: el.email,
                    is_blocked: el.is_blocked,
                    phone: el.phone,
                    access_group_name: el.access_group_name,
                }))
            }
            return []
        }, [data])

        const itemMenu = [
            {
                label: '16',
                key: '16',
                onClick: () => {
                    if (stateUser.sendData.limit !== 16) {
                        setStateUser(prevState => ({
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
                    if (stateUser.sendData.limit !== 32) {
                        setStateUser(prevState => ({
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
                    if (stateUser.sendData.limit !== 48) {
                        setStateUser(prevState => ({
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
            setStateUser(prevState => ({
                ...prevState,
                isOpen: !prevState.isOpen,
            }))
        }

        const addHandleClick = () => {
            navigate('/user/add')
        }

        const onHandleChange = (name, value) => {
            setStateUser(prevState => ({
                ...prevState,
                selectData: {
                    ...prevState.selectData,
                    [name]: value
                }
            }))
        }

        const resetFilters = () => {
            if (Object.values(stateUser.selectData).some(value => value)) {
                setStateUser(prevState => ({
                    ...prevState,
                    selectData: {},
                }));
            }
            const dataReadyForSending = hasOnlyAllowedParams(stateUser.sendData, ['limit', 'page'])
            if (!dataReadyForSending) {
                setStateUser(prevState => ({
                    ...prevState,
                    sendData: {
                        limit: prevState.sendData.limit,
                        page: 1,
                    }
                }))
            }
        }

        const applyFilter = () => {
            const isAnyInputFilled = Object.values(stateUser.selectData).some(value => {
                if (Array.isArray(value) && !value.length) {
                    return false
                }
                return value
            })
            if (isAnyInputFilled) {
                const dataValidation = validateFilters(stateUser.selectData)
                if (!dataValidation.error) {
                    setStateUser(prevState => ({
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
            if (stateUser.sendData.page !== page) {
                setStateUser(prevState => ({
                    ...prevState,
                    sendData: {
                        ...prevState.sendData,
                        page,
                    }
                }))
            }
        },[stateUser.sendData.page])

        const handleOk = async () => {
            if (stateUser.deletedItemId) {
                try {
                    setStateUser(prevState => ({
                        ...prevState,
                        confirmLoading: true,
                    }))
                    const fetchData = await fetchFunction(`api/users/${stateUser.deletedItemId}`, {
                        method: 'delete',
                    })
                    notification({
                        placement: "top",
                        duration: 2,
                        title: 'Успіх',
                        message: fetchData.data,
                        type: 'success'
                    })
                    const currentPage = stateUser.sendData.page;
                    const isLastItemOnPage = data?.items?.length === 1;
                    const newPage = isLastItemOnPage && currentPage > 1 ? currentPage - 1 : currentPage;
                    setStateUser(prevState => ({
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
                    setStateUser(prevState => ({
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
                                        caption={`Записів: ${stateUser.sendData.limit}`}
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
                                     className={classNames("table-and-pagination-wrapper", {"table-and-pagination-wrapper--active": stateUser.isOpen})}>
                                    <Table columns={columnTable} dataSource={tableData}/>
                                    <Pagination
                                        className="m-b"
                                        currentPage={parseInt(data?.currentPage) || 1}
                                        totalCount={data?.totalItems || 1}
                                        pageSize={stateUser.sendData.limit}
                                        onPageChange={onPageChange}/>
                                </div>
                                <div className={`table-filter ${stateUser.isOpen ? "table-filter--active" : ""}`}>
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
                                            placeholder="Введіть логін або прізвище"
                                            value={stateUser.selectData?.title || ''}
                                            onChange={onHandleChange}/>
                                    </div>
                                    <div className="table-filter__item">
                                        <h4 className="input-description">
                                            Статус активації
                                        </h4>
                                        <Select
                                            name="is_active"
                                            placeholder="Виберіть..."
                                            options={booleanArray}
                                            value={stateUser.selectData?.is_active}
                                            onChange={onHandleChange}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment> : null
                }
                <Transition in={!!stateUser.deletedItemId} timeout={200} unmountOnExit nodeRef={nodeRef}>
                    {state => (
                        <Modal
                            className={`${state === 'entered' ? "modal-window-wrapper--active" : ""}`}
                            onClose={handleCloseModal}
                            onOk={handleOk}
                            confirmLoading={stateUser.confirmLoading}
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
export default UserList;