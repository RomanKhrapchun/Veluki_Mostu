import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom'
import useFetch from "../../hooks/useFetch";
import Table from "../../components/common/Table/Table";
import {booleanArray, generateIcon, iconMap, monthList, STATUS} from "../../utils/constants";
import Button from "../../components/common/Button/Button";
import PageError from "../ErrorPage/PageError";
import classNames from "classnames";
import Pagination from "../../components/common/Pagination/Pagination";
import Input from "../../components/common/Input/Input";
import { hasOnlyAllowedParams, validateFilters} from "../../utils/function";
import Select from "../../components/common/Select/Select";
import {useNotification} from "../../hooks/useNotification";
import {Context} from "../../main";
import Dropdown from "../../components/common/Dropdown/Dropdown";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";

const filterIcon = generateIcon(iconMap.filter)
const searchIcon = generateIcon(iconMap.search, 'input-icon')
const dropDownIcon = generateIcon(iconMap.arrowDown)
const dropDownStyle = {width: '100%'}
const childDropDownStyle = {justifyContent: 'center'}
const DetailedLog = () => {
        const navigate = useNavigate()
        const notification = useNotification()
        const [stateLog, setStateLog] = useState({
            isOpen: false,
            selectData: {},
            sendData: {
                limit: 16,
                page: 1,
            }
        })

        const isFirstRun = useRef(true)
        const {error, status, data, retryFetch} = useFetch('api/log/detailed', {
            method: 'post',
            data: stateLog.sendData
        })
        const startRecord = ((stateLog.sendData.page || 1) - 1) * stateLog.sendData.limit + 1;
        const endRecord = Math.min(startRecord + stateLog.sendData.limit - 1, data?.totalItems || 1);

        useEffect(() => {
            if (isFirstRun.current) {
                isFirstRun.current = false
                return;
            }
            retryFetch('api/log/detailed', {
                method: 'post',
                data: stateLog.sendData,
            })
        }, [stateLog.sendData, retryFetch])


        const columnTable = useMemo(() => {
            return [
                {
                    title: 'П.І.Б', dataIndex: 'fullName',
                },
                {
                    title: 'Місяць', dataIndex: 'month_name',
                }, {
                    title: 'Рік', dataIndex: 'year',
                },
                {
                    title: 'Кількість друків', dataIndex: 'print_count',
                },
                {
                    title: 'Кількість згенерованих документів', dataIndex: 'generate_count',
                },
                {
                    title: 'Кількість пошуків', dataIndex: 'search_count',
                },
            ]

        }, [navigate])

        const tableData = useMemo(() => {
            if (data?.items?.length) {
                return data?.items?.map((el,index) => ({
                    key: index,
                    fullName: el.fullName,
                    month_name: el.month_name,
                    year: el.year,
                    print_count: el.print_count,
                    generate_count: el.generate_count,
                    search_count: el.search_count,
                }))
            }
            return []
        }, [data])

        const itemMenu = [
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
                    if (stateLog.sendData.limit !== 32) {
                        setStateLog(prevState => ({
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
                    if (stateLog.sendData.limit !== 48) {
                        setStateLog(prevState => ({
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
            setStateLog(prevState => ({
                ...prevState,
                isOpen: !prevState.isOpen,
            }))
        }

        const onHandleChange = (name, value) => {
            if((name ==="year") && (!/^\d*$/.test(value))) {
                return;
            }
            setStateLog(prevState => ({
                ...prevState,
                selectData: {
                    ...prevState.selectData,
                    [name]: value
                }
            }))
        }

        const resetFilters = () => {
            if (Object.values(stateLog.selectData).some(value => value)) {
                setStateLog(prevState => ({
                    ...prevState,
                    selectData: {},
                }));
            }
            const dataReadyForSending = hasOnlyAllowedParams(stateLog.sendData, ['limit', 'page'])
            if (!dataReadyForSending) {
                setStateLog(prevState => ({
                    ...prevState,
                    sendData: {
                        limit: prevState.sendData.limit,
                        page: 1,
                    }
                }))
            }
        }

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
            if (stateLog.sendData.page !== page) {
                setStateLog(prevState => ({
                    ...prevState,
                    sendData: {
                        ...prevState.sendData,
                        page,
                    }
                }))
            }
        },[stateLog.sendData.page])

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
                                        caption={`Записів: ${stateLog.sendData.limit}`}
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
                                     className={classNames("table-and-pagination-wrapper", {"table-and-pagination-wrapper--active": stateLog.isOpen})}>
                                    <Table columns={columnTable} dataSource={tableData}/>
                                    <Pagination
                                        className="m-b"
                                        currentPage={parseInt(data?.currentPage) || 1}
                                        totalCount={data?.totalItems || 1}
                                        pageSize={stateLog.sendData.limit}
                                        onPageChange={onPageChange}/>
                                </div>
                                <div className={`table-filter ${stateLog.isOpen ? "table-filter--active" : ""}`}>
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
                                            name="year"
                                            type="text"
                                            placeholder="Введіть рік"
                                            value={stateLog.selectData?.year || ''}
                                            onChange={onHandleChange}/>
                                    </div>
                                    <div className="table-filter__item">
                                        <h4 className="input-description">
                                            Місяць
                                        </h4>
                                        <Select
                                            name="month"
                                            placeholder="Виберіть..."
                                            options={monthList}
                                            value={stateLog.selectData?.month}
                                            onChange={onHandleChange}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </React.Fragment> : null
                }
            </React.Fragment>
        )
    }
;
export default DetailedLog;