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
import RangePicker from "../../components/common/RangePicker/RangePicker";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";

const filterIcon = generateIcon(iconMap.filter)
const searchIcon = generateIcon(iconMap.search, 'input-icon')
const dropDownIcon = generateIcon(iconMap.arrowDown)
const dropDownStyle = {width: '100%'}
const childDropDownStyle = {justifyContent: 'center'}
const BlackList = () => {
        const navigate = useNavigate()
        const notification = useNotification()
        const {store} = useContext(Context)
        const [stateBlackList, setStateBlackList] = useState({
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
        const {error, status, data, retryFetch} = useFetch('api/log/blacklist/all', {
            method: 'post',
            data: stateBlackList.sendData
        })
        const startRecord = ((stateBlackList.sendData.page || 1) - 1) * stateBlackList.sendData.limit + 1;
        const endRecord = Math.min(startRecord + stateBlackList.sendData.limit - 1, data?.totalItems || 1);

        useEffect(() => {
            if (isFirstRun.current) {
                isFirstRun.current = false
                return;
            }
            retryFetch('api/log/blacklist/all', {
                method: 'post',
                data: stateBlackList.sendData,
            })
        }, [stateBlackList.sendData, retryFetch])

        const handleOpenModal = (recordId) => {
            setStateBlackList(prevState => ({
                ...prevState,
                deletedItemId: recordId,
            }))
            document.body.style.overflow = 'hidden'
        }

        const handleCloseModal = () => {
            setStateBlackList(prevState => ({
                ...prevState,
                deletedItemId: null,
            }))
            document.body.style.overflow = 'auto';
        }

        const itemMenu = [
            {
                label: '16',
                key: '16',
                onClick: () => {
                    if (stateBlackList.sendData.limit !== 16) {
                        setStateBlackList(prevState => ({
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
                    if (stateBlackList.sendData.limit !== 32) {
                        setStateBlackList(prevState => ({
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
                    if (stateBlackList.sendData.limit !== 48) {
                        setStateBlackList(prevState => ({
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

        const columnData = useMemo(() => {
            return [
                {
                    title: 'ID', dataIndex: 'id',
                }, {
                    title: 'Ip-адреса', dataIndex: 'ip',
                }, {
                    title: 'Агент', dataIndex: 'agent',
                }, {
                    title: 'Детальний опис', dataIndex: 'details',
                }, {
                    title: 'Дата створення', dataIndex: 'create_date',
                }, {
                    title: 'Дія', dataIndex: 'action', render: (_, {id}) => (
                        <div className="btn-sticky" style={{justifyContent:'center'}}>
                            <Button title="Видалити" onClick={() => handleOpenModal(id)}>
                                Розблокувати IP
                            </Button>
                        </div>
                    )
                }
            ]
        }, [])

        const tableData = useMemo(() => {
            if (data?.items?.length) {
                return data?.items?.map(el => ({
                    key: el.id,
                    id: el.id,
                    ip: el.ip,
                    details: el.details,
                    agent: el.agent,
                    create_date: new Date(`${el.create_date}`).toLocaleDateString('uk-UA',
                        {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit'
                        }),
                }))
            }
            return []
        }, [data])


        const filterHandleClick = () => {
            setStateBlackList(prevState => ({
                ...prevState,
                isOpen: !prevState.isOpen,
            }))
        }

        const onHandleChange = (name, value) => {
            setStateBlackList(prevState => ({
                ...prevState,
                selectData: {
                    ...prevState.selectData,
                    [name]: value
                }
            }))
        }

        const resetFilters = () => {
            if (Object.values(stateBlackList.selectData).some(value => value)) {
                setStateBlackList(prevState => ({
                    ...prevState,
                    selectData: {},
                }));
            }
            const dataReadyForSending = hasOnlyAllowedParams(stateBlackList.sendData, ['limit', 'page'])
            if (!dataReadyForSending) {
                setStateBlackList(prevState => ({
                    ...prevState,
                    sendData: {
                        limit: prevState.sendData.limit,
                        page: 1,
                    }
                }))
            }
        }

        const applyFilter = () => {
            const isAnyInputFilled = Object.values(stateBlackList.selectData).some(value => {
                if (Array.isArray(value) && !value.length) {
                    return false
                }
                return value
            })
            if (isAnyInputFilled) {
                const dataValidation = validateFilters(stateBlackList.selectData)
                if (!dataValidation.error) {
                    setStateBlackList(prevState => ({
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
            if (stateBlackList.sendData.page !== page) {
                setStateBlackList(prevState => ({
                    ...prevState,
                    sendData: {
                        ...prevState.sendData,
                        page,
                    }
                }))
            }
        },[stateBlackList.sendData.page])

        const handleOk = async () => {
            if (stateBlackList.deletedItemId) {
                try {
                    setStateBlackList(prevState => ({
                        ...prevState,
                        confirmLoading: true,
                    }))
                    const fetchData = await fetchFunction(`api/log/blacklist/${stateBlackList.deletedItemId}`, {
                        method: 'delete',
                    })
                    notification({
                        placement: "top",
                        duration: 2,
                        title: 'Успіх',
                        message: fetchData.data,
                        type: 'success'
                    })
                    const currentPage = stateBlackList.sendData.page;
                    const isLastItemOnPage = data?.items?.length === 1;
                    const newPage = isLastItemOnPage && currentPage > 1 ? currentPage - 1 : currentPage;

                    setStateBlackList(prevState => ({
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
                    setStateBlackList(prevState => ({
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
                                    <Dropdown
                                        icon={dropDownIcon}
                                        iconPosition="right"
                                        style={dropDownStyle}
                                        childStyle={childDropDownStyle}
                                        caption={`Записів: ${stateBlackList.sendData.limit}`}
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
                                     className={classNames("table-and-pagination-wrapper", {"table-and-pagination-wrapper--active": stateBlackList.isOpen})}>
                                    <Table columns={columnData} dataSource={tableData}/>
                                    <Pagination
                                        className="m-b"
                                        currentPage={parseInt(data?.currentPage) || 1}
                                        totalCount={data?.totalItems || 1}
                                        pageSize={stateBlackList.sendData.limit}
                                        onPageChange={onPageChange}/>
                                </div>
                                <div className={`table-filter ${stateBlackList.isOpen ? "table-filter--active" : ""}`}>
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
                                            name="ip"
                                            type="text"
                                            placeholder="Введіть IP адресу"
                                            value={stateBlackList.selectData?.ip || ''}
                                            onChange={onHandleChange}/>
                                    </div>
                                    <div className="table-filter__item">
                                            <RangePicker
                                                startRangeTitle={"Початкова дата публікації"}
                                                endRangeTitle={"Кінцева дата публікації"}
                                                name="create_date"
                                                value={stateBlackList.selectData?.create_date}
                                                onChange={onHandleChange}/>

                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment> : null}
                <Transition in={!!stateBlackList.deletedItemId} timeout={200} unmountOnExit nodeRef={nodeRef}>
                    {state => (
                        <Modal
                            className={`${state === 'entered' ? "modal-window-wrapper--active" : ""}`}
                            onClose={handleCloseModal}
                            onOk={handleOk}
                            confirmLoading={stateBlackList.confirmLoading}
                            cancelText="Скасувати"
                            okText="Так, розблокувати"
                            title="Підтвердження розблокування">
                            <p className="paragraph">
                                Ви впевнені, що бажаєте виконати операцію &quot;Розблокувати ІР&quot;?
                            </p>
                        </Modal>
                    )}
                </Transition>
            </React.Fragment>
        )
    }
;
export default BlackList;