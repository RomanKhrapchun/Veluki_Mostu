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
import Select from "../common/Select/Select";
import TextArea from "../common/TextArea/TextArea";
import {registryValidationSchema} from "../../schema/registry/registry-schema";

const onBackIcon = generateIcon(iconMap.back)
const onSaveIcon = generateIcon(iconMap.save)
const heightTextArea = {height: '75px'}
const RegistryForm = () => {
    const navigate = useNavigate()
    const {store} = useContext(Context)
    const notification = useNotification()
    const {registryId} = useParams()
    const initialValues = {
        module: null,
        name: '',
        title: '',
        info: '',
        ord: 1,
        enabled: false,
    }
    const {errors, validateFields, onFieldChange, setFieldsValue, formData} = useForm(initialValues)
    const [state, setState] = useState({
        isLoading: true,
        moduleList: [],
        isError: {
            error: false,
            status: '',
            message: '',
        },
    })

    const loadRegistryData = useCallback(async () => {
        try {
            const fetchModules = await fetchFunction('api/module/all', {method: 'get'})
            if (fetchModules?.data?.length) {
                setState(prevState => ({
                    ...prevState,
                    moduleList: fetchModules.data.map((el) => (({
                        label: el['module_name'], value: el['module_id'],
                    })))
                }))
            }

            if (registryId) {
                const fetchModuleData = await fetchFunction(`api/module/registry/${registryId}`)
                setFieldsValue({
                    'name': fetchModuleData.data[0]['name'],
                    'title': fetchModuleData.data[0]['title'],
                    'info': fetchModuleData.data[0]['info'],
                    'enabled': fetchModuleData.data[0]['enabled'],
                    'ord': fetchModuleData.data[0]['ord'],
                    'module': (() => {
                        const module = fetchModules.data.find(el => el?.module_id === fetchModuleData.data[0]['module']);
                        return module ? {label: module.module_name, value: module.module_id} : null;
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

    }, [registryId, navigate, store, notification, setFieldsValue])


    useEffect(() => {
        loadRegistryData()
    }, [loadRegistryData])

    const onBackClick = (e) => {
        e.preventDefault();
        navigate('/registry')
    }

    const onSubmit = async (event) => {
        event.preventDefault()
        try {
            setState(prevState => ({...prevState, isLoading: true}))
            const schema = registryValidationSchema()
            const result = await validateFields(schema)
            if (result?.error) {
                throw new Error(result.error)
            }
            const endpoint = registryId ? `api/module/registry/${registryId}` : `api/module/registry`;
            const method = registryId ? 'put' : 'post';
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
            navigate('/registry')
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
                                    label="Код реєстру"
                                    tooltip="Вноситься код реєстру, що буде відображатися у системі"
                                    error={errors.title}
                                    required
                                    fullWidth
                                    htmlFor={"title_input"}
                                >
                                    <Input
                                        type="text"
                                        className={"half-width"}
                                        name="title"
                                        value={formData.title}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Назва реєстру"
                                    tooltip="Вноситься назва реєстру, що буде відображатися у системі"
                                    error={errors.name}
                                    required
                                    fullWidth
                                    htmlFor={"module_name_input"}
                                >
                                    <Input
                                        type="text"
                                        className={"half-width"}
                                        name="name"
                                        value={formData.name}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Активований"
                                    tooltip="При натисканні вказується наявність активації реєстру"
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
                                    tooltip="Вноситься число,в якому порядку будуть відображатись реєстри"
                                    error={errors.ord}
                                    required
                                    fullWidth
                                    htmlFor={"ord_input"}
                                >
                                    <Input
                                        type="text"
                                        minlength={1}
                                        name="ord"
                                        value={formData.ord}
                                        autoComplete="new-password"
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Модуль"
                                    error={errors.module}
                                    tooltip="Вибираються модулі з списку"
                                    required
                                    fullWidth
                                >
                                    <Select
                                        isSearchable
                                        className={"half-width"}
                                        name="module"
                                        placeholder="Виберіть..."
                                        value={formData.module}
                                        options={state.moduleList}
                                        onChange={onFieldChange}
                                    />
                                </FormItem>
                                <FormItem
                                    label="Опис"
                                    tooltip="Вноситься опис реєстру, що буде відображатися у системі"
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
export default RegistryForm;