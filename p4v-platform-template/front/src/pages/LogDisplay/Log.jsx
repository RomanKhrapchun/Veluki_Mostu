import React, {useEffect, useState, useMemo, useRef, useCallback} from 'react';
import {useNavigate} from 'react-router-dom'
import {formatDate, generateIcon, iconMap, operationsItem, STATUS} from '../../utils/constants';
import {useNotification} from "../../hooks/useNotification";
import useFetch from "../../hooks/useFetch";
import Badge from "../../components/common/Badge/Badge";
import Table from "../../components/common/Table/Table";
import PageError from "../ErrorPage/PageError";
import Button from "../../components/common/Button/Button";
import classNames from "classnames";
import Select from "../../components/common/Select/Select";
import RangePicker from "../../components/common/RangePicker/RangePicker";
import {fetchFunction, hasOnlyAllowedParams, validateFilters} from "../../utils/function";
import AsyncSelect from "../../components/common/AsyncSelect/AsyncSelect";
import Dropdown from "../../components/common/Dropdown/Dropdown";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";

const viewIcon = generateIcon(iconMap.view)
const filterIcon = generateIcon(iconMap.filter)
const prevIcon = generateIcon(iconMap.prev)
const nextIcon = generateIcon(iconMap.next)
const dropDownIcon = generateIcon(iconMap.arrowDown)
const dropDownStyle = {width: '100%'}
const childDropDownStyle = {justifyContent: 'center'}
const Log = () => {
    const navigate = useNavigate();
    const notification = useNotification()
    const [stateLog, setStateLog] = useState({
        isOpen: false,
        selectData: {},
        sendData: {
            limit: 16,
        }
    })

    const isFirstRun = useRef(true)
    const {status, data, retryFetch, error} = useFetch('api/log', {
        method: 'post',
        data: stateLog.sendData,
    })

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false
            return;
        }
        retryFetch('api/log', {
            method: 'post',
            data: stateLog.sendData,
        })
    }, [stateLog.sendData, retryFetch])

    const itemDropdown = [
        {
            label: '16',
            key: '16',
            onClick: () => {
                if (stateLog.sendData.limit !== 16) {
                    setStateLog(prevState => ({
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
                if (stateLog.sendData.limit !== 32) {
                    setStateLog(prevState => ({
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
                if (stateLog.sendData.limit !== 48) {
                    setStateLog(prevState => ({
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

    const columnTable = useMemo(() => {
        return [
            {
                title: 'Ідентифікатор', dataIndex: 'id',
            }, {
                title: 'Дата створення', dataIndex: 'action_stamp_tx',
            },
            {
                title: 'Користувач', dataIndex: 'uid',
            }, {
                title: 'Назва таблиці', dataIndex: 'table_name',
            },
            {
                title: 'Операція',
                render: (_, { action }) => {
                    const operation = operationsItem.find(item => item.value === action);
                    return (
                        <Badge
                            caption={operation ? operation.label : "Невідома операція"}
                            theme={action === 'DELETE' ? "negative" : "positive"}
                        />
                    );
                }
            },
            {
                title: 'ID об\'єкту', dataIndex: 'row_pk_id',
            }, {
                title: 'Дія', dataIndex: 'action', render: (_, {id}) => (
                    <div className="btn-sticky" style={{justifyContent:'center'}}>
                        <Button
                            title="Перегляд"
                            icon={viewIcon}
                            onClick={() => navigate(`/logs/${id}`)}
                        />
                    </div>
                ),
            }
        ]
    }, [navigate])

    const tableData = useMemo(() => {
            if (data.data?.length > 0) {
                return data?.data?.map((el) => (({
                    key: el.id,
                    id: el.id,
                    action_stamp_tx: formatDate(`${el.action_stamp_tx}`),
                    table_name: el.schema_name + '.' + el.table_name,
                    action: el.action,
                    uid: el.username,
                    row_pk_id: el.row_pk_id,
                })))
            }
            return []
        }, [data])

    const filterHandleClick = () => {
        setStateLog(prevState => ({
            ...prevState,
            isOpen: !prevState.isOpen,
        }))
    }

    const handleNextPage = () => {
        setStateLog(prevState => ({
            ...prevState,
            sendData: {
                ...prevState.sendData,
                cursor: data?.next,
                sort: 'DESC'
            }
        }))
    }

    const handlePrevPage = () => {
        setStateLog(prevState => ({
            ...prevState,
            sendData: {
                ...prevState.sendData,
                cursor: data?.prev,
                sort: 'ASC'
            }
        }))
    }

    const onHandleChange = (name, value) => {
        setStateLog(prevState => ({
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

    const callApiAccessGroup = useCallback(async (title, signal) => {
        const result = await fetchFunction('api/accessGroup/all', {
            method: 'post',
            data: {title},
            signal,
        })
        if (result?.data) {
            return result.data?.map(el => ({
                label: el['access_group_name'], value: el['id'],
            }))
        }
        return [];
    }, [])

    const applyFilter = () => {
        const isAnyInputFilled = Object.values(stateLog.selectData).some(value => {
            if (Array.isArray(value) && !value.length) {
                return false
            }
            return value
        })
        if (isAnyInputFilled) {
            const dataValidation = validateFilters(stateLog.selectData)
            if (!dataValidation.error) {
                setStateLog(prevState => ({
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
        if (Object.values(stateLog.selectData).some(value => value)) {
            setStateLog(prevState => ({
                ...prevState,
                selectData: {},
            }));
        }
        const dataReadyForSending = hasOnlyAllowedParams(stateLog.sendData, ['limit', 'cursor', 'sort'])
        if (!dataReadyForSending) {
            setStateLog(prevState => ({
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
                            {data?.data && Array.isArray(data?.data) && data?.data.length > 0 ?
                                <React.Fragment>
                                    Показує {data.data.length === 1 ? `${data.data.length} запис` :
                                    data.data.length > 1 && data.data.length <= 4 ? `${data.data.length} записи`
                                        : `${data.data.length} записів`}
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
                                caption={`Записів: ${stateLog.sendData.limit}`}
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
                        <div
                            style={{width: `${data?.data?.length > 0 ? 'auto' : '100%'}`}}
                            className={classNames("table-and-pagination-wrapper", {"table-and-pagination-wrapper--active": stateLog.isOpen})}>
                            <Table columns={columnTable} dataSource={tableData}/>
                            {data?.data.length > 0 && (data?.next || data?.prev) ?
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
                        <div className={`table-filter ${stateLog.isOpen ? "table-filter--active" : ""}`}>
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
                                <h4 className="input-description">
                                    Користувач
                                </h4>
                                <AsyncSelect
                                    value={stateLog.selectData?.uid}
                                    loadOptions={callApi}
                                    isSearchable
                                    name="uid"
                                    onChange={onHandleChange}/>
                            </div>
                            <div className="table-filter__item">
                                <h4 className="input-description">
                                    Група доступу
                                </h4>
                                <AsyncSelect
                                    value={stateLog.selectData?.access_group_id}
                                    loadOptions={callApiAccessGroup}
                                    isSearchable
                                    name="access_group_id"
                                    onChange={onHandleChange}/>
                            </div>
                            <div className="table-filter__item">
                                <h4 className="input-description">
                                    Тип операції
                                </h4>
                                <Select
                                    value={stateLog.selectData?.action}
                                    options={operationsItem}
                                    name="action"
                                    isSearchable
                                    isMulti={true}
                                    onChange={onHandleChange}/>
                            </div>
                            <div className="table-filter__item">
                                    <RangePicker
                                        startRangeTitle={"Початкова дата створення"}
                                        endRangeTitle={"Кінцева дата створення"}
                                        name="action_stamp_tx"
                                        value={stateLog.selectData?.action_stamp_tx}
                                        onChange={onHandleChange}/>
                            </div>
                        </div>

                    </div>
                </div>
            </React.Fragment> : null}
    </React.Fragment>)
};
export default Log;

