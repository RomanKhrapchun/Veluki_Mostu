
import React, { useCallback, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../main';
import { generateIcon, iconMap } from '../../utils/constants';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import { useNotification } from "../../hooks/useNotification";
import { fetchFunction } from "../../utils/function";
import FormItem from '../../components/common/FormItem/FormItem';

// Icons definition
const backIcon = generateIcon(iconMap.back)
const saveIcon = generateIcon(iconMap.save)

const SettlementsCreate = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const [loading, setLoading] = useState(false);
    const [districts, setDistricts] = useState([]);
    const [formData, setFormData] = useState({
        settlement_name: '',
        district_id: null
    });

    useEffect(() => {
        // Fetch districts for dropdown
        const fetchDistricts = async () => {
            try {
                const response = await fetchFunction('api/revenue/districts');
                const districtsOptions = response.data.map(district => ({
                    value: district.id,
                    label: district.district_name
                }));
                setDistricts(districtsOptions);
            } catch (error) {
                notification({
                    type: 'error',
                    title: "Помилка",
                    message: "Не вдалося завантажити список округів",
                    placement: 'top',
                });
            }
        };
        
        fetchDistricts();
    }, [notification]);

    const handleBack = useCallback(() => {
        navigate('/revenue/settlements');
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

    const handleDistrictChange = (selected) => {
        handleChange('district_id', selected ? selected.value : null);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);
            
            // Validate form
            if (!formData.settlement_name || !formData.district_id) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: "Заповніть всі обов'язкові поля",
                    placement: 'top',
                });
                return;
            }
            
            await fetchFunction('api/revenue/settlements', {
                method: 'post',
                data: formData
            });
            
            notification({
                type: 'success',
                title: "Успіх",
                message: "Населений пункт успішно створено",
                placement: 'top',
            });
            
            navigate('/revenue/settlements');
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
                    Створення населеного пункту
                </div>
                <div className="page-container__actions">
                </div>
            </div>
            <div className="page-container__content">
                <div className="card">
                    <div className="card__header">
                        <h2>Інформація про населений пункт</h2>
                    </div>
                    <div className="card__content">
                        <FormItem
                            label="Назва населеного пункту:"
                            required
                            fullWidth
                        >
                            <Input
                                name="settlement_name"
                                value={formData.settlement_name}
                                onChange={handleInputChange}
                                placeholder="Введіть назву населеного пункту"
                            />
                        </FormItem>
                        
                        <FormItem
                            label="Округ:"
                            required
                            fullWidth
                        >
                            <Select
                                options={districts}
                                onChange={handleDistrictChange}
                                placeholder="Оберіть округ"
                                isClearable
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

export default SettlementsCreate;
