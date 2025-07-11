import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Context} from '../../main';
import {
    handlePhoneChange,
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
import FormSeparator from "../common/FormSeparator/FormSeparator";
import FormItem from "../common/FormItem/FormItem";
import Select from "../common/Select/Select";
import {userValidationSchema} from "../../schema/user/schema-user";

const onBackIcon = generateIcon(iconMap.back)
const onSaveIcon = generateIcon(iconMap.save)
const separatorStyle = {marginBottom: 0}
const UserForm = () => {
    const navigate = useNavigate()
    const {store} = useContext(Context)
    const notification = useNotification()
    const {userId} = useParams()
    const initialValues = {
        phone: '',
        email: '',
        password: '',
        username: '',
        middle_name: '',
        first_name: '',
        last_name: '',
        is_active: false,
        access_group: null,
    }
    const {errors, validateFields, onFieldChange, setFieldsValue, formData} = useForm(initialValues)
    const [state, setState] = useState({
        isLoading: true,
        accessGroups: [],
        isError: {
            error: false,
            status: '',
            message: '',
        },
    })

    const loadUserDataAndAccessGroups = useCallback(async () => {
        try {
            const fetchAccessGroups = await fetchFunction('api/accessGroup/all', {method: 'get'})
            if (fetchAccessGroups?.data?.length) {
                setState(prevState => ({
                    ...prevState,
                    accessGroups: fetchAccessGroups.data.map((el) => (({
                        label: el['access_group_name'], value: el['id'],
                    })))
                }))
            }
            if (userId) {
                const fetchUserData = await fetchFunction(`api/users/info/${userId}`)
                setFieldsValue({
                    'first_name': fetchUserData.data[0]['first_name'],
                    'last_name': fetchUserData.data[0]['last_name'],
                    'middle_name': fetchUserData.data[0]['middle_name'],
                    'username': fetchUserData.data[0]['username'],
                    'is_active': fetchUserData.data[0]['is_active'],
                    'phone': handlePhoneChange(fetchUserData.data[0]['phone'] ?? ''),
                    'email': fetchUserData.data[0]['email'],
                    'access_group': (() => {
                        const group = fetchAccessGroups.data.find(el => el?.id === fetchUserData.data[0]['access_group']);
                        return group ? {label: group.access_group_name, value: group.id} : null;
                    })(),
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

    }, [userId, navigate, store, notification, setFieldsValue])


    useEffect(() => {
        loadUserDataAndAccessGroups()
    }, [loadUserDataAndAccessGroups])

    const onBackClick = (e) => {
        e.preventDefault();
        navigate('/user')
    }

    const onNumberChange = (name, value) => {
        onFieldChange(name, handlePhoneChange(value))
    }

    const onSubmit = async (event) => {
        event.preventDefault()
        try {
            setState(prevState => ({...prevState, isLoading: true}))
            const schema = userValidationSchema(userId)
            const result = await validateFields(schema)
            if (result?.error) {
                throw new Error(result.error)
            }
            const endpoint = userId ? `api/users/${userId}` : `api/users`;
            const method = userId ? 'put' : 'post';
            const fetchData = await fetchFunction(endpoint, {
                method,
                data: transformData(result.data)
            })
            notification({
                placement: "top",
                type: 'success',
                title: "Успіх",
                message: fetchData?.data,
                duration: 2
            })
            navigate('/user')
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
            {
                state.isLoading
                    ? <Loader/>
                    : <React.Fragment>
                        <form onKeyDown={handleKeyDown} onSubmit={onSubmit}>
                            <div className="components-container">
                                <FormSeparator caption="Аккаунт" style={separatorStyle}/>
                                <FormItem
                                    label="Ім'я"
                                    tooltip="Вноситься ім'я користувача, що буде відображатися у системі"
                                    error={errors.first_name}
                                    required
                                    fullWidth
                                    htmlFor={"firstName_input"}
                                >
                                    <Input
                                        type="text"
                                        className={"half-width"}
                                        name="first_name"
                                        value={formData.first_name}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Прізвище"
                                    tooltip="Вноситься прізвище користувача, що буде відображатися у системі"
                                    error={errors.last_name}
                                    required
                                    fullWidth
                                    htmlFor={"lastName_input"}
                                >
                                    <Input
                                        type="text"
                                        className={"half-width"}
                                        name="last_name"
                                        value={formData.last_name}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
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
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormSeparator caption="Доступ" style={separatorStyle}/>
                                <FormItem
                                    label="Логін"
                                    tooltip="Вноситься довільний логін користувача латинськими літерами, що буде використовуватись для входу у систему"
                                    error={errors.username}
                                    required
                                    fullWidth
                                    htmlFor={"userName_input"}
                                >
                                    <Input
                                        type="text"
                                        className={"half-width"}
                                        name="username"
                                        value={formData.username}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Пароль"
                                    tooltip="Вноситься пароль, що буде використовуватися для входу у систему (рекомендоване використання складних паролів)"
                                    error={errors.password}
                                    required={!userId}
                                    fullWidth
                                    htmlFor={"password_input"}
                                >
                                    <Input
                                        type="password"
                                        className={"half-width"}
                                        name="password"
                                        value={formData.password}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Група доступу"
                                    error={errors.access_group}
                                    tooltip="Обираются групи доступу- кожна група містить опис інтерфейсів та дій, які зможе переглядати та здійснювати цей користувач"
                                    required
                                    fullWidth
                                >
                                    <Select
                                        isSearchable
                                        className={"half-width"}
                                        name="access_group"
                                        placeholder="Виберіть..."
                                        value={formData.access_group}
                                        options={state.accessGroups}
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Активований"
                                    tooltip="При натисканні вказується наявність активації користувача"
                                    fullWidth
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
                                        className="half-width"
                                        type="text"
                                        name="email"
                                        value={formData.email}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
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
                                        className={"half-width"}
                                        name="phone"
                                        value={formData.phone}
                                        autoComplete="new-password"
                                        maxLength={14}
                                        onChange={onNumberChange}
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
                    </React.Fragment>
            }
        </React.Fragment>
    );
};
export default UserForm;