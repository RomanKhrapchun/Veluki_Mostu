import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { generateIcon, iconMap, STATUS } from "../../utils/constants";
import useFetch from "../../hooks/useFetch";
import { fetchFunction } from "../../utils/function";
import { useNotification } from "../../hooks/useNotification";
import { Context } from "../../main";
import Button from "../../components/common/Button/Button";
import FormItem from "../../components/common/FormItem/FormItem";
import Input from "../../components/common/Input/Input";
import Loader from "../../components/Loader/Loader";
import PageError from "../ErrorPage/PageError";

const onBackIcon = generateIcon(iconMap.back);
const onSaveIcon = generateIcon(iconMap.save);

const ServiceEdit = () => {
    const { serviceId } = useParams();
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        unit: '',
        price: '',
        service_group_id: ''
    });

    const { error, status, data } = useFetch(`api/sportscomplex/service/${serviceId}`);

    useEffect(() => {
        if (data && Object.keys(data).length) {
            setFormData({
                name: data.name || '',
                unit: data.unit || '',
                price: data.price || '',
                service_group_id: data.service_group_id || ''
            });
        }
    }, [data]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // Валідація полів
        if (!formData.name || !formData.unit || !formData.price) {
            notification({
                type: 'warning',
                placement: 'top',
                title: 'Помилка',
                message: 'Всі поля форми обов\'язкові для заповнення',
            });
            return;
        }

        try {
            setLoading(true);
            
            await fetchFunction(`/api/sportscomplex/services/${serviceId}`, {
                method: 'put',
                data: {
                    name: formData.name,
                    unit: formData.unit,
                    price: parseFloat(formData.price),
                    service_group_id: formData.service_group_id
                }
            });
            
            notification({
                type: 'success',
                placement: 'top',
                title: 'Успіх',
                message: 'Послугу успішно оновлено',
            });
            
            navigate('/poolservices');
        } catch (error) {
            if (error?.response?.status === 401) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: "Не авторизований",
                    placement: 'top',
                });
                store.logOff();
                return navigate('/');
            }
            
            notification({
                type: 'warning',
                title: "Помилка",
                message: error?.response?.data?.message ? error.response.data.message : error.message,
                placement: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    if (status === STATUS.PENDING) {
        return <Loader />;
    }

    if (status === STATUS.ERROR) {
        return <PageError statusError={error.status} title={error.message} />;
    }

    return (
        <React.Fragment>
            {status === STATUS.SUCCESS && (
                <div className="form-container">
                    <div className="btn-group" style={{ marginBottom: '20px' }}>
                        <Button icon={onBackIcon} onClick={() => navigate('/poolservices')}>
                            Повернутись до реєстру
                        </Button>
                        <Button icon={onSaveIcon} onClick={handleSubmit} loading={loading}>
                            Зберегти
                        </Button>
                    </div>
                    
                    <div className="form-section">
                        <h2 className="section-title">Редагування послуги басейну</h2>
                        
                        <FormItem 
                            label="Назва послуги" 
                            required 
                            fullWidth
                        >
                            <Input
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="Введіть назву послуги"
                            />
                        </FormItem>
                        
                        <FormItem 
                            label="Одиниці" 
                            required 
                            fullWidth
                        >
                            <Input
                                name="unit"
                                value={formData.unit}
                                onChange={handleChange}
                                placeholder="Введіть одиниці виміру"
                            />
                        </FormItem>
                        
                        <FormItem 
                            label="Ціна" 
                            required 
                            fullWidth
                        >
                            <Input
                                name="price"
                                type="number"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="Введіть ціну"
                            />
                        </FormItem>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

export default ServiceEdit;