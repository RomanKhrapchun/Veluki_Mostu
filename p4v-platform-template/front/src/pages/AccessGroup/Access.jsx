import  React, {useCallback, useContext, useEffect, useMemo, useState} from 'react';
import "./Access.css"
import Button from "../../components/common/Button/Button";
import Input from "../../components/common/Input/Input";
import {accessGroupItem, generateIcon, iconMap, noResultsFound} from "../../utils/constants";
import Select from "../../components/common/Select/Select";
import {Context} from "../../main";
import PageError from "../ErrorPage/PageError";
import Loader from "../../components/Loader/Loader";
import {
    fetchFunction,
    generateRole,
    transformPermissionsToSelectFormat,
    transformSelectFormatToPermissions
} from "../../utils/function";
import {useNavigate, useParams} from "react-router-dom";
import {useNotification} from "../../hooks/useNotification";

const iconSearch = generateIcon(iconMap.search, 'input-icon')
const iconBack = generateIcon(iconMap.back)
const iconSave = generateIcon(iconMap.save)

const Access = () => {
    const {store} = useContext(Context)
    const navigate = useNavigate()
    const notification = useNotification()
    const {roleId} = useParams()
    const [state, setState] = useState({
        activeIndex: null,
        activeMenu: null,
        listMenu: {},
        search: "",
        data: [],
        isLoading: true,
        isError: {
            error: false,
            status: '',
            message: '',
        },
    })

    const loadAccessGroupData = useCallback(async () => {
        try {
            setState(prevState => ({
                ...prevState,
                isLoading: true,
                isError: {
                    error: false,
                    status: '',
                    message: '',
                },
            }))
            const [fetchMenuData, fetchMenuDataByID] = await Promise.all([
                fetchFunction('api/users/menu'),
                fetchFunction(`api/accessGroup/info/${roleId}`)
            ])

            if (fetchMenuData.data && Array.isArray(fetchMenuData.data) && fetchMenuData.data.length > 0) {
                const userRole = generateRole(fetchMenuData.data)
                const permission = fetchMenuDataByID?.data?.[0]?.permission
                const menuData = fetchMenuData.data.filter(el => el.children?.length > 0)
                if (permission && Object.keys(permission).length > 0) {
                    setState(prevState => ({
                        ...prevState,
                        data: menuData,
                        listMenu: {
                            ...transformPermissionsToSelectFormat(userRole),
                            ...transformPermissionsToSelectFormat(permission)
                        },
                    }))
                } else {
                    setState(prevState => ({
                        ...prevState,
                        data: menuData,
                        listMenu: userRole,
                    }))
                }
            }
        } catch (error) {
            notification({
                type: 'warning',
                title: "Помилка",
                message: error?.response?.data?.message ? error.response.data.message : error.message,
                placement: 'top'
            })
            if (error?.response?.status === 401) {
                store.logOff()
                return navigate('/')
            }
            setState(prevState => ({
                ...prevState,
                isError: {
                    error: true,
                    status: error.response?.status ?? 400,
                    message: error?.response?.data?.message ? error.response.data.message : error.message,
                },
            }))

        } finally {
            setState(prevState => ({...prevState, isLoading: false}))
        }

    }, [roleId, navigate, store, notification])

    useEffect(() => {
        loadAccessGroupData()
    }, [loadAccessGroupData])

    useEffect(() => {
        window.scrollTo(0, 0)
    }, [state.activeIndex])

    const showMenuItems = useMemo(() => {
        if (!state.search) return state.data
        const result = []
        if (Array.isArray(state.data)) {
            state.data.forEach(element => {
                if (element?.module_name?.toLowerCase().includes(state.search)) result.push(element)
            })
        }
        return result

    }, [state.search, state.data])

    useEffect(() => {
        if (showMenuItems.length > 0) {
            setState(prevState => ({
                ...prevState,
                activeIndex: 0,
                activeMenu: showMenuItems[0].module_id
            }))
        }
    }, [showMenuItems, state.search])

    const onChangeHandle = (name, value) => {
        setState(prevState => ({
            ...prevState, listMenu: {
                ...prevState.listMenu,
                [name]: value,
            }
        }))
    }
    const onSearch = (_, value) => {
        setState(prevState => ({...prevState, search: value, activeMenu: null}))
    }
    const onBackHandle = () => {
        navigate('/group')
    }
    const onSubmit = async () => {
        try {
            let fetchData = ''
            setState(prevState => ({
                ...prevState,
                isLoading: true,
            }))
            if (showMenuItems.length === 0) {
                throw new Error("Відсутні дані")
            } else {
                fetchData = await fetchFunction(`api/accessGroup/${roleId}`, {
                    method: "put",
                    data: {
                        permission: transformSelectFormatToPermissions(state.listMenu),
                    }
                })
            }
            notification({
                placement: "top",
                type: 'success',
                title: "Успіх",
                message: fetchData?.data,
                duration: 2
            })
            navigate('/group')
        } catch (error) {
            notification({
                type: 'warning',
                title: "Помилка",
                message: error?.response?.data?.message ? error.response.data.message : error.message,
                placement: 'top'
            })
            if (error?.response?.status === 401) {
                store.logOff()
                return navigate('/')
            }

        } finally {
            setState(prevState => ({...prevState, isLoading: false}))
        }
    }

    if (state.isError.error) {
        return <PageError statusError={state.isError.status} title={state.isError.message}/>
    }

    return (
        <React.Fragment>
            {state.isLoading ? <Loader/> :
                <section className="access">
                    <div className="access__tabs">
                        {showMenuItems.length > 0 ?
                            <React.Fragment>
                                {showMenuItems?.map((element, index) => {
                                    return (
                                        <Button
                                            className={`btn--left ${state.activeIndex === index ? "" : "btn--secondary"}`}
                                            key={index}
                                            onClick={
                                                () => setState(prevState =>
                                                    ({
                                                        ...prevState,
                                                        activeIndex: index,
                                                        activeMenu: element.module_id
                                                    }))}
                                        >
                                            {element.module_name}
                                        </Button>
                                    )
                                })
                                }
                            </React.Fragment> : noResultsFound}
                    </div>
                    <div className="access__main">
                        <div className="input-wrapper access__search">
                            <Input
                                value={state.search}
                                icon={iconSearch}
                                placeholder="Пошук"
                                onChange={onSearch}/>
                        </div>
                        {state.activeMenu && showMenuItems.length > 0
                            ? (
                                <div className="access__rows-wrapper">
                                    {showMenuItems.find(item => item.module_id === state.activeMenu)?.children?.map((el, index) => {
                                            return (
                                                <div className="access__row" key={index}>
                                                    <div style={{display: "flex", alignItems: 'center'}}>
                                                        <h2 className="input-description">
                                                            {el.module_name}
                                                        </h2>
                                                    </div>
                                                    <Select
                                                        key={el.module_id}
                                                        name={el.module_id}
                                                        value={state?.listMenu[el?.module_id]}
                                                        options={accessGroupItem}
                                                        isMulti
                                                        isClearable
                                                        onChange={onChangeHandle}/>
                                                </div>
                                            )
                                        }
                                    )}
                                </div>
                            )
                            : (
                                <p className="paragraph paragraph--lg"
                                   style={{marginTop: '20px', marginBottom: '20px'}}>
                                    {noResultsFound}
                                </p>
                            )
                        }
                        <div className="btn-group">
                            <Button
                                icon={iconBack}
                                onClick={onBackHandle}
                                className="btn--secondary">
                                Повернутись
                            </Button>
                            <Button
                                icon={iconSave}
                                onClick={onSubmit}>
                                Зберегти
                            </Button>
                        </div>
                    </div>
                </section>
            }
        </React.Fragment>
    );
};

export default Access;