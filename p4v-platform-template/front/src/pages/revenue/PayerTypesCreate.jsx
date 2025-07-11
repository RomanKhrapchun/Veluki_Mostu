
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

const PayerTypesCreate = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        type_name: ''
    });

    const handleBack = useCallback(() => {
        navigate('/revenue/payer-types');
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
            if (!formData.type_name) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: "Заповніть назву типу платника",
                    placement: 'top',
                });
                return;
            }
            
            await fetchFunction('api/revenue/payer-types', {
                method: 'post',
                data: formData
            });
            
            notification({
                type: 'success',
                title: "Успіх",
                message: "Тип платника успішно створено",
                placement: 'top',
            });
            
            navigate('/revenue/payer-types');
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
                    Створення типу платника
                </div>
                <div className="page-container__actions">
                </div>
            </div>
            <div className="page-container__content">
                <div className="card">
                    <div className="card__header">
                        <h2>Інформація про тип платника</h2>
                    </div>
                    <div className="card__content">
                        <FormItem
                            label="Назва типу платника:"
                            required
                            fullWidth
                        >
                            <Input
                                name="type_name"
                                value={formData.type_name}
                                onChange={handleInputChange}
                                placeholder="Введіть назву типу платника"
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

export default PayerTypesCreate;
