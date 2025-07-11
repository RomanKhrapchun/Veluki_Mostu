import React, {useEffect, useState, useMemo, useRef, useCallback, useContext} from 'react';
import {formatDate, generateIcon, iconMap, operationsSecureItem} from '../../utils/constants';
import {useNotification} from "../../hooks/useNotification";
import useFetch from "../../hooks/useFetch";
import Table from "../../components/common/Table/Table";
import Badge from "../../components/common/Badge/Badge";
import PageError from "../ErrorPage/PageError";
import Button from "../../components/common/Button/Button";
import classNames from "classnames";
import Select from "../../components/common/Select/Select";
import RangePicker from "../../components/common/RangePicker/RangePicker";
import {fetchFunction, hasOnlyAllowedParams, validateFilters} from "../../utils/function";
import AsyncSelect from "../../components/common/AsyncSelect/AsyncSelect";
import Dropdown from "../../components/common/Dropdown/Dropdown";
import Modal from "../../components/common/Modal/Modal";
import Input from "../../components/common/Input/Input";
import {Transition} from "react-transition-group";
import {useNavigate} from "react-router-dom";
import {Context} from "../../main";
import {STATUS} from "../../utils/constants";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";

const filterIcon = generateIcon(iconMap.filter)
const prevIcon = generateIcon(iconMap.prev)
const nextIcon = generateIcon(iconMap.next)
const dropDownIcon = generateIcon(iconMap.arrowDown)
const searchIcon = generateIcon(iconMap.search, 'input-icon')
const dropDownStyle = {width: '100%'}
const childDropDownStyle = {justifyContent: 'center'}
const Secure = () => {
        const navigate = useNavigate()
        const notification = useNotification()
        const {store} = useContext(Context)
        const [stateSecure, setStateSecure] = useState({
            isOpen: false,
            confirmLoading: false,
            blockIp: {
                ip: null,
                agent: '',
                details: '',
            },
            selectData: {},
            sendData: {
                limit: 16,
            }
        })
        const nodeRef = useRef(null)
        const isFirstRun = useRef(true)
        const {error, status, data, retryFetch} = useFetch('api/log/secure', {
            method: 'post',
            data: stateSecure.sendData,
        })

        useEffect(() => {
            if (isFirstRun.current) {
                isFirstRun.current = false
                return;
            }
            retryFetch('api/log/secure', {
                method: 'post',
                data: stateSecure.sendData,
            })
        }, [stateSecure.sendData, retryFetch])

        const handleOpenModal = (ip, agent, details) => {
            setStateSecure(prevState => ({
                ...prevState,
                blockIp: {
                    ip,
                    agent,
                    details,
                },
            }))
            document.body.style.overflow = 'hidden'
        }

        const handleCloseModal = () => {
            setStateSecure(prevState => ({
                ...prevState,
                blockIp: {
                    ip: null,
                    details: '',
                    agent: '',
                },
            }))
            document.body.style.overflow = 'auto';
        }

        const itemDropdown = [
            {
                label: '16',
                key: '16',
                onClick: () => {
                    if (stateSecure.sendData.limit !== 16) {
                        setStateSecure(prevState => ({
                            ...prevState,
                            sendData: {
                                ...prevState.sendData,
                                limit: 16,
                                cursor: null,
                                sort: null
                            }
                        }))
                    }
                },
            },
            {
                label: '32',
                key: '32',
                onClick: () => {
                    if (stateSecure.sendData.limit !== 32) {
                        setStateSecure(prevState => ({
                            ...prevState,
                            sendData: {
                                ...prevState.sendData,
                                limit: 32,
                                cursor: null,
                                sort: null
                            }
                        }))
                    }
                },
            },
            {
                label: '48',
                key: '48',
                onClick: () => {
                    if (stateSecure.sendData.limit !== 48) {
                        setStateSecure(prevState => ({
                            ...prevState,
                            sendData: {
                                ...prevState.sendData,
                                limit: 48,
                                cursor: null,
                                sort: null
                            }
                        }))
                    }
                },
            },
        ]

        const columnsTable = useMemo(() => {
            return [
                {
                    title: 'Ідентифікатор', dataIndex: 'id',
                }, {
                    title: 'Дата створення', dataIndex: 'date_add',
                },
                {
                    title: 'Операція', render: (_, {action}) => (
                        <Badge
                            caption={`${action === 'success' ? "Авторизовано" : action === 'error' ? "Не авторизовано" : action === 'unknown' ? "Невідомий користувач" : ""}`}
                            theme={`${action === 'unknown' || action === 'error' ? "negative" : "positive"}`}/>
                    )
                },
                {
                    title: 'Користувач', dataIndex: 'username',
                }, {
                    title: 'IP адреса', dataIndex: 'ip',
                }, {
                    title: 'Опис', dataIndex: 'description',
                }, {
                    title: 'Дія', dataIndex: 'action', render: (_, {ip, user_agent, details}) => (
                        <div className="btn-sticky">
                            <Button
                                title="Заблокувати ІР"
                                onClick={() => handleOpenModal(ip, user_agent, details)}>
                                Заблокувати ІР
                            </Button>
                        </div>)
                }
            ]
        }, [])


        const tableData = useMemo(() => {
            if (data?.data?.length) {
                return data.data.map((el) => (({
                    key: el.id,
                    id: el.id,
                    action: el.action,
                    date_add: formatDate(`${el.date_add}`),
                    ip: el.ip,
                    description: el.description,
                    username: el.username,
                    user_agent: el.user_agent,
                    details: el.details,
                })))
            }
            return []
        }, [data])

        const handleOk = async () => {
            if (stateSecure.blockIp.ip) {
                try {
                    setStateSecure(prevState => ({
                        ...prevState,
                        confirmLoading: true,
                    }))
                    const fetchData = await fetchFunction(`api/log/blacklist`, {
                        method: 'post',
                        data: stateSecure.blockIp,
                    })
                    notification({
                        placement: "top",
                        duration: 2,
                        title: 'Успіх',
                        message: fetchData.data,
                        type: 'success'
                    })
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
                    setStateSecure(prevState => ({
                        ...prevState,
                        confirmLoading: false,
                        blockIp: {
                            ip: null,
                            details: '',
                            agent: '',
                        },
                    }))
                    document.body.style.overflow = 'auto';
                }
            }
        }

        const filterHandleClick = () => {
            setStateSecure(prevState => ({
                ...prevState,
                isOpen: !prevState.isOpen,
            }))
        }

        const handleNextPage = () => {
            setStateSecure(prevState => ({
                ...prevState,
                sendData: {
                    ...prevState.sendData,
                    cursor: data?.next,
                    sort: 'DESC'
                }
            }))
        }

        const handlePrevPage = () => {
            setStateSecure(prevState => ({
                ...prevState,
                sendData: {
                    ...prevState.sendData,
                    cursor: data?.prev,
                    sort: 'ASC'
                }
            }))
        }

        const onHandleChange = (name, value) => {
            setStateSecure(prevState => ({
                ...prevState,
                selectData: {
                    ...prevState.selectData,
                    [name]: value
                },
            }))

        }

        const callApi = useCallback(async (title, signal) => {
            const result = await fetchFunction('api/users/all', {
                method: 'post',
                data: {title},
                signal,
            })
            if (result?.data) {
                return result.data?.map(el => ({
                    label: el['username'], value: el['users_id'],
                }))
            }
            return [];
        }, [])

        const applyFilter = () => {
            const isAnyInputFilled = Object.values(stateSecure.selectData).some(value => {
                if (Array.isArray(value) && !value.length) {
                    return false
                }
                return value
            })
            if (isAnyInputFilled) {
                const dataValidation = validateFilters(stateSecure.selectData)
                if (!dataValidation.error) {
                    setStateSecure(prevState => ({
                        ...prevState,
                        sendData: {
                            ...dataValidation,
                            limit: prevState.sendData.limit,
                            cursor: null,
                            sort: null,
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

        const resetFilter = () => {
            if (Object.values(stateSecure.selectData).some(value => value)) {
                setStateSecure(prevState => ({
                    ...prevState,
                    selectData: {},
                }));
            }
            const dataReadyForSending = hasOnlyAllowedParams(stateSecure.sendData, ['limit', 'cursor', 'sort'])
            if (!dataReadyForSending) {
                setStateSecure(prevState => ({
                    ...prevState,
                    sendData: {
                        limit: prevState.sendData.limit,
                    }
                }))
            }
        }

        if (status === STATUS.ERROR) {
            return <PageError title={error.message} statusError={error.status}/>
        }

        return (<React.Fragment>

                {status === STATUS.PENDING ? <SkeletonPage/> : null}
                {status === STATUS.SUCCESS ?
                    <React.Fragment>
                        <div className="table-elements">
                            <div className="table-header">
                                <h2 className="title title--sm">
                                    {data?.data && Array.isArray(data.data) && data.data.length > 0 ?
                                        <React.Fragment>
                                            Показує {data.data.length === 1 ? `${data.data.length} запис` :
                                            data.data.length > 1 && data.data.length <= 4 ? `${data.data.length} записи`
                                                : `${data.data.length} записів`}
                                        </React.Fragment>
                                        : <React.Fragment>Показує 0 записів</React.Fragment>
                                    }
                                </h2>
                                <div className="table-header__buttons">
                                    <Dropdown
                                        icon={dropDownIcon}
                                        iconPosition="right"
                                        style={dropDownStyle}
                                        childStyle={childDropDownStyle}
                                        caption={`Записів: ${stateSecure.sendData.limit}`}
                                        menu={itemDropdown}/>
                                    <Button
                                        className="table-filter-trigger"
                                        onClick={filterHandleClick}
                                        icon={filterIcon}>
                                        Фільтри
                                    </Button>
                                </div>
                            </div>
                            <div className="table-main">
                                <div style={{width: `${data?.data?.length > 0 ? 'auto' : '100%'}`}}
                                     className={classNames("table-and-pagination-wrapper", {"table-and-pagination-wrapper--active": stateSecure.isOpen})}>
                                    <Table columns={columnsTable} dataSource={tableData}/>
                                    {data?.data?.length > 0 && (data?.next || data?.prev) ?
                                        <ul className="pagination pagination--center" style={{marginTop: 'var(--mg)'}}>
                                            <li>
                                                <Button
                                                    icon={prevIcon}
                                                    className="btn--secondary"
                                                    disabled={!data?.prev}
                                                    onClick={handlePrevPage}>
                                                    Попередня сторінка
                                                </Button>
                                            </li>
                                            <li>
                                                <Button
                                                    icon={nextIcon}
                                                    iconPosition="right"
                                                    disabled={!data?.next}
                                                    onClick={handleNextPage}>
                                                    Наступна сторінка
                                                </Button>
                                            </li>
                                        </ul> : null}
                                </div>
                                <div className={`table-filter ${stateSecure.isOpen ? "table-filter--active" : ""}`}>
                                    <h3 className="title title--sm">
                                        Фільтри
                                    </h3>
                                    <div className="btn-group">
                                        <Button onClick={applyFilter}>
                                            Застосувати
                                        </Button>
                                        <Button className="btn--secondary" onClick={resetFilter}>
                                            Скинути
                                        </Button>
                                    </div>
                                    <div className="table-filter__item">
                                        <Input
                                            icon={searchIcon}
                                            name="ip"
                                            type="text"
                                            placeholder="Введіть IP адресу"
                                            value={stateSecure.selectData?.ip || ''}
                                            autoComplete={"new-password"}
                                            onChange={onHandleChange}/>
                                    </div>
                                    <div className="table-filter__item">
                                        <h4 className="input-description">
                                            Користувач
                                        </h4>
                                        <AsyncSelect
                                            value={stateSecure.selectData?.uid}
                                            loadOptions={callApi}
                                            isSearchable
                                            name="uid"
                                            onChange={onHandleChange}/>
                                    </div>
                                    <div className="table-filter__item">
                                        <h4 className="input-description">
                                            Тип операції
                                        </h4>
                                        <Select
                                            value={stateSecure.selectData?.action}
                                            options={operationsSecureItem}
                                            name="action"
                                            isSearchable
                                            isMulti={true}
                                            onChange={onHandleChange}/>
                                    </div>
                                    <div className="table-filter__item">
                                            <RangePicker
                                                startRangeTitle={"Початкова дата створення"}
                                                endRangeTitle={"Кінцева дата створення"}
                                                name="date_add"
                                                value={stateSecure.selectData.date_add}
                                                onChange={onHandleChange}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment> : null}
                <Transition in={!!stateSecure.blockIp.ip} timeout={200} unmountOnExit nodeRef={nodeRef}>
                    {state => (
                        <Modal
                            className={`${state === 'entered' ? "modal-window-wrapper--active" : ""}`}
                            onClose={handleCloseModal}
                            onOk={handleOk}
                            confirmLoading={stateSecure.confirmLoading}
                            cancelText="Скасувати"
                            okText="Так, блокувати"
                            title="Підтвердження блокування">
                            <p className="paragraph">
                                Ви впевнені, що бажаєте виконати операцію &quot;Блокувати ІР&quot;?
                            </p>
                        </Modal>
                    )}
                </Transition>
            </React.Fragment>
        )
    }
;
export default Secure;

