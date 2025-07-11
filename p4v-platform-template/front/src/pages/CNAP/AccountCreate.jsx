import React, { useCallback, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../main';
import { useNotification } from "../../hooks/useNotification";
import Input from "../../components/common/Input/Input";
import Button from "../../components/common/Button/Button";
import GroupedServiceSelector from "../../components/ServiceSelector/GroupedServiceSelector";
import { fetchFunction, handleKeyDown } from "../../utils/function";
import { generateIcon, iconMap } from "../../utils/constants";
import FormItem from "../../components/common/FormItem/FormItem";
import Loader from "../../components/Loader/Loader";

const onBackIcon = generateIcon(iconMap.back)
const onSaveIcon = generateIcon(iconMap.save)

const AccountCreate = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const [loading, setLoading] = useState(false);
    const [selectedService, setSelectedService] = useState(null);
    
    const generateAccountNumber = () => {
        const randomNum = Math.floor(100000 + Math.random() * 900000);
        return randomNum.toString().padStart(6, '0');
    };

    const [formData, setFormData] = useState({
        account_number: generateAccountNumber(),
        service_id: '',
        service_code: '',
        payer: '',
        amount: '',
        administrator: store.user?.fullName || ''
    });
    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (store.user?.fullName) {
            setFormData(prev => ({
                ...prev,
                administrator: store.user.fullName
            }));
        }
    }, [store.user?.fullName]);

    const handleInputChange = useCallback((name, value) => {
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        if (errors[name]) {
            setErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    }, [errors]);

    // Обробка вибору послуги через новий компонент
    const handleServiceChange = useCallback((value, option) => {
        console.log('Selected service:', { value, option });
        if (option) {
            setSelectedService(option);
            setFormData(prev => ({
                ...prev,
                service_id: option.value,
                service_code: option.identifier,
                amount: option.price,
                service_name: option.label
            }));
            
            // Очищуємо помилку послуги, якщо була
            if (errors.service_id) {
                setErrors(prev => ({
                    ...prev,
                    service_id: ''
                }));
            }
        } else {
            setSelectedService(null);
            setFormData(prev => ({
                ...prev,
                service_id: '',
                service_code: '',
                amount: '',
                service_name: ''
            }));
        }
    }, [errors.service_id]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.account_number) {
            newErrors.account_number = "Обов'язкове поле";
        } else if (!/^\d{6}$/.test(formData.account_number)) {
            newErrors.account_number = "Номер рахунку має містити 6 цифр";
        }

        if (!formData.service_id || !selectedService) {
            newErrors.service_id = "Виберіть послугу";
        }

        if (!formData.payer) {
            newErrors.payer = "Обов'язкове поле";
        }

        if (!formData.amount) {
            newErrors.amount = "Обов'язкове поле";
        }

        console.log('Form data:', formData);
        console.log('Validation errors:', newErrors);
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const onBackClick = useCallback((e) => {
        e.preventDefault();
        navigate('/cnap/accounts');
    }, [navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Submitting form with data:', formData);
        
        if (store.user?.fullName && !formData.administrator) {
            setFormData(prev => ({
                ...prev,
                administrator: store.user.fullName
            }));
        }

        if (!validateForm()) return;

        try {
            setLoading(true);
            const currentDate = new Date();
            const timeString = currentDate.toLocaleTimeString('uk-UA', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false,
                timeZone: 'Europe/Kiev'
            });
            
            const submitData = {
                ...formData,
                administrator: store.user?.fullName || formData.administrator,
                date: currentDate.toISOString().split('T')[0],
                time: timeString
            };

            console.log('Sending data to server:', submitData);

            const response = await fetchFunction('api/cnap/accounts', {
                method: 'post',
                data: submitData
            });

            if (response?.error) {
                throw new Error(response.error);
            }

            notification({
                type: 'success',
                message: 'Рахунок успішно створено',
                placement: 'top'
            });
            navigate('/cnap/accounts');
        } catch (error) {
            console.error('Submit error:', error);
            let errorMessage = 'Помилка при створенні рахунку';
            
            if (error.message.includes('permission denied')) {
                errorMessage = 'У вас немає прав для створення рахунку. Зверніться до адміністратора системи.';
            } else if (error.message.includes('database')) {
                errorMessage = 'Помилка бази даних. Будь ласка, спробуйте пізніше.';
            }

            notification({
                type: 'error',
                message: error?.response?.data?.message || errorMessage,
                placement: 'top'
            });
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
                    label="Номер рахунку"
                    fullWidth
                    htmlFor="account_number_input"
                >
                    <Input
                        id="account_number_input"
                        name="account_number"
                        value={formData.account_number}
                        disabled={true}
                        autoComplete="off"
                    />
                </FormItem>

                {/* Новий компонент вибору послуги з групуванням */}
                <FormItem
                    label="Послуга"
                    error={errors.service_id}
                    required
                    fullWidth
                >
                    <GroupedServiceSelector
                        value={formData.service_id}
                        onChange={handleServiceChange}
                        error={errors.service_id}
                        placeholder="Виберіть послугу"
                        required={true}
                    />
                </FormItem>

                <FormItem
                    label="Код послуги"
                    fullWidth
                >
                    <Input
                        value={formData.service_code}
                        disabled
                        placeholder={selectedService ? "" : "Буде заповнено автоматично"}
                    />
                </FormItem>

                <FormItem
                    label="Платник"
                    error={errors.payer}
                    required
                    fullWidth
                >
                    <Input
                        name="payer"
                        value={formData.payer}
                        onChange={handleInputChange}
                        placeholder="Введіть ПІБ платника"
                    />
                </FormItem>

                <FormItem
                    label="Сума"
                    error={errors.amount}
                    required
                    fullWidth
                >
                    <Input
                        name="amount"
                        value={formData.amount}
                        onChange={handleInputChange}
                        disabled
                        placeholder={selectedService ? "" : "Буде заповнено автоматично"}
                    />
                </FormItem>

                <FormItem
                    label="Адміністратор"
                    fullWidth
                >
                    <Input
                        value={formData.administrator}
                        disabled
                    />
                </FormItem>

                <div className="btn-group">
                    <Button
                        type="default"
                        icon={onBackIcon}
                        onClick={onBackClick}
                    >
                        Назад
                    </Button>
                    <Button
                        type="primary"
                        icon={onSaveIcon}
                        htmlType="submit"
                        disabled={!selectedService}
                    >
                        Зберегти
                    </Button>
                </div>
            </div>
        </form>
    );
}

export default AccountCreate;