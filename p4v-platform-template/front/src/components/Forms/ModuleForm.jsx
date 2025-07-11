import React, {useCallback, useContext, useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {Context} from '../../main';
import {
    handleKeyDown,
    fetchFunction, transformData,
} from '../../utils/function';
import {useNotification} from "../.././hooks/useNotification";
import {generateIcon, iconMap, moduleStatus} from "../../utils/constants";
import useForm from "../../hooks/useForm";
import Switch from "../common/Switch/Switch";
import PageError from "../../pages/ErrorPage/PageError";
import Loader from "../Loader/Loader";
import Input from "../common/Input/Input";
import Button from "../common/Button/Button";
import FormItem from "../common/FormItem/FormItem";
import Select from "../common/Select/Select";

import {moduleValidationSchema} from "../../schema/module/module-schema";
import TextArea from "../common/TextArea/TextArea";

const onBackIcon = generateIcon(iconMap.back)
const onSaveIcon = generateIcon(iconMap.save)
const heightTextArea = {height: '75px'}
const ModuleForm = () => {
    const navigate = useNavigate()
    const {store} = useContext(Context)
    const notification = useNotification()
    const {moduleId} = useParams()
    const initialValues = {
        module: '',
        module_name: '',
        install_version: '',
        author: '',
        schema_name: '',
        info: '',
        ord: 1,
        module_status: null,
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

    const loadModuleData = useCallback(async () => {
        try {
            if (moduleId) {
                const fetchModuleData = await fetchFunction(`api/module/info/${moduleId}`)
                setFieldsValue({
                    'module': fetchModuleData.data[0]['module'],
                    'module_name': fetchModuleData.data[0]['module_name'],
                    'install_version': fetchModuleData.data[0]['install_version'],
                    'author': fetchModuleData.data[0]['author'],
                    'schema_name': fetchModuleData.data[0]['schema_name'],
                    'info': fetchModuleData.data[0]['info'],
                    'enabled': fetchModuleData.data[0]['enabled'],
                    'ord': fetchModuleData.data[0]['ord'],
                    'module_status': (() => {
                        const group = moduleStatus.find(el => el?.value === fetchModuleData.data[0]['module_status']);
                        return group ? group : null;
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

    }, [moduleId, navigate, store, notification, setFieldsValue])


    useEffect(() => {
        loadModuleData()
    }, [loadModuleData])

    const onBackClick = (e) => {
        e.preventDefault();
        navigate('/modules')
    }

    const onSubmit = async (event) => {
        event.preventDefault()
        try {
            setState(prevState => ({...prevState, isLoading: true}))
            const schema = moduleValidationSchema()
            const result = await validateFields(schema)
            if (result?.error) {
                throw new Error(result.error)
            }
            const endpoint = moduleId ? `api/module/${moduleId}` : `api/module`;
            const method = moduleId ? 'put' : 'post';
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
            navigate('/modules')
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
                                <FormItem
                                    label="Код модуля"
                                    tooltip="Вноситься код модуля, що буде відображатися у системі"
                                    error={errors.module}
                                    required
                                    fullWidth
                                    htmlFor={"module_input"}
                                >
                                    <Input
                                        type="text"
                                        className={"half-width"}
                                        name="module"
                                        value={formData.module}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Назва модуля"
                                    tooltip="Вноситься назва модуля, що буде відображатися у системі"
                                    error={errors.module_name}
                                    required
                                    fullWidth
                                    htmlFor={"module_name_input"}
                                >
                                    <Input
                                        type="text"
                                        className={"half-width"}
                                        name="module_name"
                                        value={formData.module_name}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Версія"
                                    tooltip="Вноситься версія модуля, що буде відображатися у системі"
                                    error={errors.install_version}
                                    required
                                    fullWidth
                                    htmlFor={"install_version_input"}
                                >
                                    <Input
                                        type="text"
                                        className={"half-width"}
                                        name="install_version"
                                        value={formData.install_version}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Автор"
                                    tooltip="Вноситься автор модуля, що буде відображатись у системі"
                                    error={errors.author}
                                    fullWidth
                                    htmlFor={"author_input"}
                                >
                                    <Input
                                        type="text"
                                        className={"half-width"}
                                        name="author"
                                        value={formData.author}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Схема"
                                    tooltip="Вноситься схеми таблиць, які використовуються даним модулем"
                                    error={errors.schema_name}
                                    fullWidth
                                    htmlFor={"schema_name_input"}
                                >
                                    <Input
                                        type="text"
                                        className={"half-width"}
                                        name="schema_name"
                                        value={formData.schema_name}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Активований"
                                    tooltip="При натисканні вказується наявність активації модуля"
                                    fullWidth
                                    htmlFor={"enabled_switch"}
                                >
                                    <Switch
                                        className={"half-width"}
                                        name="enabled"
                                        value={formData.enabled}
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Порядок сортування"
                                    tooltip="Вноситься число,в якому порядку будуть відображатись модулі"
                                    error={errors.ord}
                                    required
                                    fullWidth
                                    htmlFor={"ord_input"}
                                >
                                    <Input
                                        type="text"
                                        name="ord"
                                        value={formData.ord}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Статус модуля"
                                    error={errors.module_status}
                                    tooltip="Обираются статуси модуля"
                                    required
                                    fullWidth
                                >
                                    <Select
                                        isSearchable
                                        className={"half-width"}
                                        name="module_status"
                                        placeholder="Виберіть..."
                                        value={formData.module_status}
                                        options={moduleStatus}
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Опис"
                                    tooltip="Вноситься опис модудя, що буде відображатися у системі"
                                    error={errors.info}
                                    fullWidth
                                    htmlFor={"info_textArea"}
                                >
                                    <TextArea
                                        style={heightTextArea}
                                        className={"input full-width"}
                                        name="info"
                                        value={formData.info || ''}
                                        autoComplete="new-password"
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
                    </React.Fragment>
            }
        </React.Fragment>
    );
};
export default ModuleForm;