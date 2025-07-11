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

const RequisiteEdit = () => {
    const { requisiteId } = useParams();
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        kved: '',
        iban: '',
        edrpou: '',
        service_group_name: '',
        service_group_id: ''
    });

    const { error, status, data } = useFetch(`api/sportscomplex/info/${requisiteId}`);

    useEffect(() => {
        if (data && Object.keys(data).length) {
            setFormData({
                kved: data.kved || '',
                iban: data.iban || '',
                edrpou: data.edrpou || '',
                service_group_name: data.group_name || '',
                service_group_id: data.service_group_id || ''
            });
        }
    }, [data]);

    const handleChange = (name, value) => {
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async () => {
        // Валідація полів
        if (!formData.kved || !formData.iban || !formData.edrpou || !formData.service_group_name) {
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
            
            // Якщо назва групи змінилася, спочатку створити нову групу
            let serviceGroupId = formData.service_group_id;
            
            if (formData.service_group_name !== data.group_name) {
                // Створюємо нову групу послуг
                const groupResponse = await fetchFunction('/api/sportscomplex/service-groups', {
                    method: 'post',
                    data: {
                        name: formData.service_group_name
                    }
                });
                
                serviceGroupId = groupResponse.data.id;
            }
            
            // Оновити реквізити з новим ID групи
            await fetchFunction(`/api/sportscomplex/requisites/${requisiteId}`, {
                method: 'put',
                data: {
                    kved: formData.kved,
                    iban: formData.iban,
                    edrpou: formData.edrpou,
                    service_group_id: serviceGroupId
                }
            });
            
            notification({
                type: 'success',
                placement: 'top',
                title: 'Успіх',
                message: 'Реквізити успішно оновлено',
            });
            
            navigate('/details');
        } catch (error) {
            // Обробка помилок
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
                        <Button icon={onBackIcon} onClick={() => navigate('/details')}>
                            Повернутись до реєстру
                        </Button>
                        <Button icon={onSaveIcon} onClick={handleSubmit} loading={loading}>
                            Зберегти
                        </Button>
                    </div>
                    
                    <div className="form-section">
                        <h2 className="section-title">Редагування реквізитів</h2>
                        
                        <FormItem 
                            label="КВЕД" 
                            required 
                            fullWidth
                        >
                            <Input
                                name="kved"
                                value={formData.kved}
                                onChange={handleChange}
                                placeholder="Введіть КВЕД"
                            />
                        </FormItem>
                        
                        <FormItem 
                            label="IBAN" 
                            required 
                            fullWidth
                        >
                            <Input
                                name="iban"
                                value={formData.iban}
                                onChange={handleChange}
                                placeholder="Введіть IBAN"
                            />
                        </FormItem>
                        
                        <FormItem 
                            label="ЄДРПОУ" 
                            required 
                            fullWidth
                        >
                            <Input
                                name="edrpou"
                                value={formData.edrpou}
                                onChange={handleChange}
                                placeholder="Введіть ЄДРПОУ"
                            />
                        </FormItem>
                        
                        <FormItem 
                            label="Група послуг" 
                            required
                            fullWidth
                        >
                            <Input
                                name="service_group_name"
                                value={formData.service_group_name}
                                onChange={handleChange}
                                placeholder="Введіть назву групи послуг"
                            />
                        </FormItem>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

export default RequisiteEdit;