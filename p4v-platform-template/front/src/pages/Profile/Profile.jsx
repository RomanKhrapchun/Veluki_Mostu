import React, {useContext, useState, useEffect} from 'react';
import {Context} from '../../main';
import "./Profile.css"
import {useNavigate} from "react-router-dom";
import {useNotification} from "../../hooks/useNotification";
import useForm from "../../hooks/useForm";
import {
    fetchFunction,
    handleKeyDown,
    handlePhoneChange, transformData
} from "../../utils/function";
import Loader from "../../components/Loader/Loader";
import PageError from "../ErrorPage/PageError";
import FormSeparator from "../../components/common/FormSeparator/FormSeparator";
import FormItem from "../../components/common/FormItem/FormItem";
import Input from "../../components/common/Input/Input";
import Switch from "../../components/common/Switch/Switch";
import Button from "../../components/common/Button/Button";
import {generateIcon, iconMap} from "../../utils/constants";
import {userProfileValidationSchema} from "../../schema/profile/schema-profile";

const onBackIcon = generateIcon(iconMap.back)
const onSaveIcon = generateIcon(iconMap.save)
const separatorStyle = {marginBottom: 0}

const initialProfileValues = {
    phone: '',
    email: '',
    password: '',
    middle_name: '',
    first_name: '',
    last_name: '',
    username: '',
    is_active: false,
}
const Profile = () => {
    const navigate = useNavigate()
    const {store} = useContext(Context)
    const notification = useNotification()
    const {errors, validateFields, onFieldChange, setFieldsValue, formData} = useForm(initialProfileValues)
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
        navigate('/')
    }

    const onPhoneChange = (name, value) => {
        onFieldChange(name, handlePhoneChange(value))
    }

    useEffect(() => {
        const loadUserProfile = async () => {
            try {
                const fetchProfileData = await fetchFunction(`api/users/profile`)
                setFieldsValue({
                    'first_name': fetchProfileData.data[0]['first_name'],
                    'last_name': fetchProfileData.data[0]['last_name'],
                    'username': fetchProfileData.data[0]['username'],
                    'middle_name': fetchProfileData.data[0]['middle_name'],
                    'is_active': fetchProfileData.data[0]['is_active'],
                    'phone': handlePhoneChange(fetchProfileData.data[0]['phone'] ?? ''),
                    'email': fetchProfileData.data[0]['email'],
                })
            } catch (error) {
                if (error?.response?.status === 401) {
                    notification({
                        placement: "top",
                        type: 'warning',
                        title: "Помилка",
                        message: error?.response?.data?.message ?? "Не авторизований!",
                    })
                    store.logOff()
                    return navigate('/')
                }
                setState(prevState => ({
                    ...prevState,
                    isError: {
                        error: true,
                        status: error?.response?.status ?? 400,
                        message: error?.response?.data?.message ? error.response.data.message : error.message,
                    },
                }))

            } finally {
                setState(prevState => ({...prevState, isLoading: false}))
            }

        }
        loadUserProfile();
    }, [navigate, store, notification, setFieldsValue])

    const onSubmit = async (event) => {
        event.preventDefault()
        try {
            setState(prevState => ({...prevState, isLoading: true}))
            const schema = userProfileValidationSchema()
            const result = await validateFields(schema)
            if (result?.error) {
                throw new Error(result.error)
            }
            const fetchData = await fetchFunction(`api/users/profile`, {
                method: 'put',
                data: transformData(result.data),
            })
            if (!formData.is_active) {
                await store.logout()
                return navigate('/')
            } else {
                notification({
                    placement: "top",
                    type: 'success',
                    title: "Успіх",
                    message: fetchData?.data,
                    duration: 2
                })
                return navigate('/')
            }

        } catch (error) {
            notification({
                placement: "top",
                type: 'warning',
                title: "Помилка",
                message: error?.response?.data?.message ? error.response.data.message : error.message,
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
            {state.isLoading
                ? <Loader/>
                : (
                    <form onKeyDown={handleKeyDown} onSubmit={onSubmit}>
                        <div className="components-container">
                            <FormSeparator caption="Аккаунт" style={separatorStyle}/>
                            <FormItem
                                label="Прізвище"
                                tooltip="Вноситься прізвище користувача, що буде відображатися у системі"
                                error={errors.last_name}
                                fullWidth
                                required
                                htmlFor={"lastName_input"}
                            >
                                <Input
                                    name={"last_name"}
                                    type="text"
                                    className={"half-width"}
                                    value={formData.last_name}
                                    autoComplete="new-password"
                                    onChange={onFieldChange}/>
                            </FormItem>
                            <FormItem
                                label="Ім'я"
                                tooltip="Вноситься ім'я користувача, що буде відображатися у системі"
                                error={errors.first_name}
                                fullWidth
                                required
                                htmlFor={"firstName_input"}
                            >
                                <Input
                                    type="text"
                                    className={"half-width"}
                                    name="first_name"
                                    value={formData.first_name}
                                    autoComplete="new-password"
                                    onChange={onFieldChange}/>
                            </FormItem>
                            <FormItem
                                label="По-батькові"
                                tooltip="Вноситься по-батькові користувача, що буде відображатися у системі"
                                error={errors.middle_name}
                                fullWidth
                                htmlFor={"middleName_input"}
                            >
                                <Input
                                    type="text"
                                    className={"half-width"}
                                    name="middle_name"
                                    value={formData.middle_name}
                                    autoComplete="new-password"
                                    onChange={onFieldChange}/>
                            </FormItem>
                            <FormSeparator caption="Доступ" style={separatorStyle}/>
                            <FormItem label="Логін" fullWidth htmlFor={"userName_input"}>
                                <Input
                                    type="text"
                                    className={"half-width"}
                                    name="username"
                                    value={formData.username}
                                    autoComplete="username"
                                    disabled={true}/>
                            </FormItem>
                            <FormItem
                                label="Пароль"
                                tooltip="Вноситься пароль, що буде використовуватися для входу у систему (рекомендоване використання складних паролів)"
                                error={errors.password}
                                fullWidth
                                htmlFor={"password_input"}
                            >
                                <Input
                                    type="password"
                                    className={"half-width"}
                                    name="password"
                                    value={formData.password}
                                    autoComplete="new-password"
                                    onChange={onFieldChange}/>
                            </FormItem>
                            <FormItem
                                fullWidth
                                label="Активований"
                                tooltip="При натисканні вказується наявність активації користувача"
                                htmlFor={"active_switch"}
                            >
                                <Switch
                                    className={"half-width"}
                                    name="is_active"
                                    value={formData.is_active}
                                    onChange={onFieldChange}
                                />
                            </FormItem>
                            <FormSeparator caption="Контакти" style={separatorStyle}/>
                            <FormItem
                                label="Електронна скринька"
                                tooltip="Вноситься електронна скринька користувача"
                                error={errors.email}
                                required
                                fullWidth
                                htmlFor={"email_input"}
                            >
                                <Input
                                    type="text"
                                    className={"half-width"}
                                    name="email"
                                    value={formData.email}
                                    autoComplete="new-password"
                                    onChange={onFieldChange}/>
                            </FormItem>
                            <FormItem
                                label="Номер телефону"
                                tooltip="Вноситься номер телефону користувача в форматі (0961234567)"
                                error={errors.phone}
                                fullWidth
                                htmlFor={"phone_input"}
                            >
                                <Input
                                    type="text"
                                    name="phone"
                                    className={"half-width"}
                                    value={formData.phone}
                                    autoComplete="new-password"
                                    maxLength={14}
                                    onChange={onPhoneChange}
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
                )
            }
        </React.Fragment>
    );
};

export default Profile;