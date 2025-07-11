import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Context} from '../../main';
import {
    handleKeyDown,
    fetchFunction, transformData,
} from '../../utils/function';
import {useNotification} from "../.././hooks/useNotification";
import {generateIcon, iconMap} from "../../utils/constants";
import useForm from "../../hooks/useForm";
import Switch from "../common/Switch/Switch";
import PageError from "../../pages/ErrorPage/PageError";
import Loader from "../Loader/Loader";
import Input from "../common/Input/Input";
import Button from "../common/Button/Button";
import FormItem from "../common/FormItem/FormItem";
import TextArea from "../common/TextArea/TextArea";
import {accessGroupValidationSchema} from "../../schema/accessGroup/accessGroup-schema";

const onBackIcon = generateIcon(iconMap.back)
const onSaveIcon = generateIcon(iconMap.save)
const textAreaStyle = {height: '120px'}

const AccessGroupForm = () => {
    const navigate = useNavigate()
    const {store} = useContext(Context)
    const notification = useNotification()
    const {roleId} = useParams()
    const initialValues = {
        access_group_name: '',
        info: '',
        enabled: false,
    }
    const {errors, validateFields, onFieldChange, setFieldsValue, formData} = useForm(initialValues)
    const [state, setState] = useState({
        isLoading: true,
        isError: {
            error: false,
            status: '',
            message: '',
        },
    })

    const onBackClick = (e) => {
        e.preventDefault();
        navigate('/group')
    }

    const loadRoleData = useCallback(async () => {
        try {
            if (roleId) {
                const fetchRoleData = await fetchFunction(`api/accessGroup/info/${roleId}`)
                setFieldsValue({
                    'access_group_name': fetchRoleData.data[0]['access_group_name'],
                    'info': fetchRoleData.data[0]['info'],
                    'enabled': fetchRoleData.data[0]['enabled'],
                })
            }
        } catch (error) {
            if (error?.response?.status === 401) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: error?.response?.data?.message ? error.response.data.message : error.message,
                    placement: 'top'
                })
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

    }, [roleId, navigate, notification, setFieldsValue, store])


    useEffect(() => {
        loadRoleData()
    }, [loadRoleData])

    const onSubmit = async (event) => {
        event.preventDefault()
        try {
            setState(prevState => ({...prevState, isLoading: true}))
            const schema = accessGroupValidationSchema()
            const result = await validateFields(schema)
            if (result?.error) {
                throw new Error(result.error)
            }
            const method = roleId ? 'put' : 'post'
            const endpoint = roleId ? `api/accessGroup/${roleId}` : `api/accessGroup`
                const fetchData = await fetchFunction(endpoint, {
                    method,
                    data: transformData(result.data),
                })

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


    return (<React.Fragment>
        {state.isLoading
            ? <Loader/>
            : <form onKeyDown={handleKeyDown} onSubmit={onSubmit}>
                <div className="components-container">
                    <FormItem
                        htmlFor={"accessGroup_input"}
                        label="Назва"
                        tooltip="Вноситься загальна назва групи доступу українською мовою"
                        error={errors.access_group_name}
                        required
                    >
                        <Input
                            type="text"
                            className="full-width"
                            name="access_group_name"
                            value={formData.access_group_name}
                            autoComplete="new-password"
                            onChange={onFieldChange}/>
                    </FormItem>
                    <FormItem
                        label="Опис"
                        tooltip="Додається текстовий опис групи доступу, що буде збережений в системі"
                        error={errors.info}
                        required
                        fullWidth
                        htmlFor={"info_textarea"}
                    >
                        <TextArea
                            className="input full-width"
                            style={textAreaStyle}
                            name="info"
                            value={formData.info}
                            autoComplete="new-password"
                            onChange={onFieldChange}/>
                    </FormItem>

                    <FormItem
                        label="Активований"
                        tooltip="При натисканні вказується наявність активації групи доступу"
                        fullWidth
                        htmlFor={"enabled_switch"}
                    >
                        <Switch
                            name="enabled"
                            value={formData.enabled}
                            onChange={onFieldChange}
                        />
                    </FormItem>
                    <div className="btn-group components-container__full-width">
                        <Button icon={onBackIcon} onClick={onBackClick}>
                            Повернутись
                        </Button>
                        <Button type="submit" icon={onSaveIcon}>
                            Зберегти
                        </Button>
                    </div>
                </div>
            </form>
        }
    </React.Fragment>);
};
export default AccessGroupForm;