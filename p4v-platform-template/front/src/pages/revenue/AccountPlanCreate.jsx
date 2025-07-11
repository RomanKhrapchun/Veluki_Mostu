
import React, { useCallback, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../main';
import { generateIcon, iconMap } from '../../utils/constants';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import { useNotification } from "../../hooks/useNotification";
import { fetchFunction } from "../../utils/function";
import FormItem from '../../components/common/FormItem/FormItem';

// Icons definition
const backIcon = generateIcon(iconMap.back)
const saveIcon = generateIcon(iconMap.save)

const AccountPlanCreate = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        iban: '',
        classification_code: '',
        classification_name: '',
        coefficient: '',
        tax_type: ''
    });

    const handleBack = useCallback(() => {
        navigate('/revenue/account-plan');
    }, [navigate]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        handleChange(name, value);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            
            // Validate form
            if (!formData.iban || !formData.classification_code || !formData.classification_name) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: "Заповніть всі обов'язкові поля",
                    placement: 'top',
                });
                return;
            }
            
            // Ensure coefficient is a number
            formData.coefficient = parseFloat(formData.coefficient.toString().replace(',', '.'));
            
            await fetchFunction('api/revenue/account-plan', {
                method: 'post',
                data: formData
            });
            
            notification({
                type: 'success',
                title: "Успіх",
                message: "План рахунків успішно створено",
                placement: 'top',
            });
            
            navigate('/revenue/account-plan-list');
        } catch (error) {
            notification({
                type: 'error',
                title: "Помилка",
                message: error?.response?.data?.message || error.message,
                placement: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-container__header">
                <div className="page-container__title">
                    Створення плану рахунків
                </div>
                <div className="page-container__actions">
                </div>
            </div>
            <div className="page-container__content">
                <div className="card">
                    <div className="card__header">
                        <h2>Інформація про рахунок</h2>
                    </div>
                    <div className="card__content">
                        <FormItem
                            label="Номер рахунку (IBAN):"
                            required
                            fullWidth
                        >
                            <Input
                                name="iban"
                                value={formData.iban}
                                onChange={handleInputChange}
                                placeholder="Введіть номер рахунку"
                            />
                        </FormItem>
                        
                        <FormItem
                            label="Код класифікації:"
                            required
                            fullWidth
                        >
                            <Input
                                name="classification_code"
                                value={formData.classification_code}
                                onChange={handleInputChange}
                                placeholder="Введіть код класифікації"
                            />
                        </FormItem>
                        
                        <FormItem
                            label="Найменування коду класифікації доходів бюджету:"
                            required
                            fullWidth
                        >
                            <Input
                                name="classification_name"
                                value={formData.classification_name}
                                onChange={handleInputChange}
                                placeholder="Введіть найменування"
                            />
                        </FormItem>
                        
                        <FormItem
                            label="Коефіцієнт:"
                            fullWidth
                        >
                            <Input
                                name="coefficient"
                                value={formData.coefficient}
                                onChange={handleInputChange}
                                placeholder="Введіть коефіцієнт"
                            />
                        </FormItem>
                        
                        <FormItem
                            label="Тип податку:"
                            fullWidth
                        >
                            <Input
                                name="tax_type"
                                value={formData.tax_type}
                                onChange={handleInputChange}
                                placeholder="Введіть тип податку"
                            />
                        </FormItem>
                        
                        <div className="btn-group" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <Button
                                type="default"
                                icon={backIcon}
                                onClick={handleBack}
                            >
                                Назад
                            </Button>
                            <Button
                                type="primary"
                                icon={saveIcon}
                                onClick={handleSubmit}
                                loading={loading}
                            >
                                Зберегти
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountPlanCreate;
