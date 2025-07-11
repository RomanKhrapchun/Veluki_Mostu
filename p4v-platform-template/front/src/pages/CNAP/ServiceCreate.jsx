import React, {useCallback, useContext, useState, useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {Context} from '../../main';
import {useNotification} from "../../hooks/useNotification";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import Select from "../../components/common/Select/Select";
import {fetchFunction, handleKeyDown} from "../../utils/function";
import {generateIcon, iconMap} from "../../utils/constants";
import FormItem from "../../components/common/FormItem/FormItem";
import Loader from "../../components/Loader/Loader";

const onBackIcon = generateIcon(iconMap.back)
const onSaveIcon = generateIcon(iconMap.save)

const ServiceCreate = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const {store} = useContext(Context);
    const [loading, setLoading] = useState(false);
    const [executorsLoading, setExecutorsLoading] = useState(false);
    const [executors, setExecutors] = useState([]);
    const [formData, setFormData] = useState({
        identifier: '',
        name: '',
        price: '',
        edrpou: '',
        iban: '',
        executor_id: null
    });
    const [errors, setErrors] = useState({});

    // Завантаження списку виконавців
    useEffect(() => {
        const fetchExecutors = async () => {
            try {
                setExecutorsLoading(true);
                const response = await fetchFunction('api/cnap/executors', {
                    method: 'get'
                });

                if (response?.data?.data && Array.isArray(response.data.data)) {
                    const executorOptions = response.data.data.map(executor => ({
                        value: executor.id,
                        label: executor.name
                    }));
                    setExecutors(executorOptions);
                }
            } catch (error) {
                console.error('Error fetching executors:', error);
                notification({
                    type: 'error',
                    message: 'Помилка завантаження списку надавачів',
                    placement: 'top'
                });
            } finally {
                setExecutorsLoading(false);
            }
        };

        fetchExecutors();
    }, [notification]);

    const handleInputChange = useCallback((name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.identifier) newErrors.identifier = "Обов'язкове поле";
        if (!formData.name) newErrors.name = "Обов'язкове поле";
        if (!formData.price) newErrors.price = "Обов'язкове поле";
        if (!formData.edrpou) newErrors.edrpou = "Обов'язкове поле";
        if (!formData.iban) newErrors.iban = "Обов'язкове поле";
        // executor_id не є обов'язковим, тому що може бути послуга без надавача
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onBackClick = (e) => {
        e.preventDefault();
        navigate('/cnap/services');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            notification({
                type: 'warning',
                title: 'Помилка',
                message: 'Будь ласка, заповніть всі обов\'язкові поля',
                placement: 'top'
            });
            return;
        }

        try {
            setLoading(true);
            
            // Формуємо дані для відправки
            const submitData = {
                ...formData,
                // Якщо executor_id порожній, відправляємо null
                executor_id: formData.executor_id || null
            };

            const response = await fetchFunction('api/cnap/services', {
                method: 'post',
                data: submitData
            });

            notification({
                type: 'success',
                title: 'Успіх',
                message: 'Послугу успішно додано',
                placement: 'top'
            });

            navigate('/cnap/services');
        } catch (error) {
            notification({
                type: 'error',
                title: 'Помилка',
                message: error?.response?.data?.message || 'Помилка при створенні послуги',
                placement: 'top'
            });
            
            if (error?.response?.status === 401) {
                store.logOff();
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <form onKeyDown={handleKeyDown} onSubmit={handleSubmit}>
            <div className="components-container">
                <FormItem
                    label="Ідентифікатор"
                    tooltip="Унікальний ідентифікатор послуги"
                    error={errors.identifier}
                    required
                    fullWidth
                    htmlFor="identifier_input"
                >
                    <Input
                        type="text"
                        className="half-width"
                        name="identifier"
                        value={formData.identifier}
                        onChange={handleInputChange}
                        autoComplete="off"
                    />
                </FormItem>

                <FormItem
                    label="Назва послуги"
                    tooltip="Повна назва послуги"
                    error={errors.name}
                    required
                    fullWidth
                    htmlFor="name_input"
                >
                    <Input
                        type="text"
                        className="half-width"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        autoComplete="off"
                    />
                </FormItem>

                <FormItem
                    label="Надсилач"
                    tooltip="Виберіть надавача для цієї послуги (необов'язково)"
                    error={errors.executor_id}
                    fullWidth
                    htmlFor="executor_select"
                >
                    <Select
                        className="half-width"
                        name="executor_id"
                        value={formData.executor_id}
                        onChange={handleInputChange}
                        options={executors}
                        placeholder={executorsLoading ? "Завантаження..." : "Виберіть надавача"}
                        disabled={executorsLoading}
                        allowClear={true}
                    />
                </FormItem>

                <FormItem
                    label="Вартість"
                    tooltip="Вартість послуги в гривнях"
                    error={errors.price}
                    required
                    fullWidth
                    htmlFor="price_input"
                >
                    <Input
                        type="number"
                        className="half-width"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        autoComplete="off"
                        step="0.01"
                        min="0"
                    />
                </FormItem>

                <FormItem
                    label="ЄДРПОУ"
                    tooltip="Код ЄДРПОУ організації"
                    error={errors.edrpou}
                    required
                    fullWidth
                    htmlFor="edrpou_input"
                >
                    <Input
                        type="text"
                        className="half-width"
                        name="edrpou"
                        value={formData.edrpou}
                        onChange={handleInputChange}
                        autoComplete="off"
                    />
                </FormItem>

                <FormItem
                    label="IBAN"
                    tooltip="Номер банківського рахунку в форматі IBAN"
                    error={errors.iban}
                    required
                    fullWidth
                    htmlFor="iban_input"
                >
                    <Input
                        type="text"
                        className="half-width"
                        name="iban"
                        value={formData.iban}
                        onChange={handleInputChange}
                        autoComplete="off"
                    />
                </FormItem>

                <div className="form-actions">
                    <Button
                        type="submit"
                        icon={onSaveIcon}
                        disabled={loading || executorsLoading}
                    >
                        Зберегти
                    </Button>
                    <Button
                        type="button"
                        onClick={onBackClick}
                        icon={onBackIcon}
                        className="btn--secondary"
                    >
                        Назад
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default ServiceCreate;