import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import { fetchFunction } from '../../../utils/function';
import { useNotification } from '../../../hooks/useNotification';
import Loader from '../../../components/Loader/Loader';

const Index2Edit = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        identifier: '',
        positionName: '',
        unitName: '',
        value: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetchFunction(`api/opendata/2/${id}`, {
                    method: 'GET',
                });
                if (response?.data) {
                    setFormData({
                        identifier: response.data.identifier || '',
                        positionName: response.data.positionName || '',
                        unitName: response.data.unitName || '',
                        value: response.data.value || '',
                    });
                } else {
                    notification.error('Не вдалося завантажити дані');
                }
            } catch (error) {
                notification.error('Сталася помилка при завантаженні даних');
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchData();
        }
    }, [id, notification]);

    const handleInputChange = useCallback((fieldName, newValue) => {
        setFormData((prev) => ({
            ...prev,
            [fieldName]: newValue,
        }));
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            await fetchFunction(`api/opendata/2/${id}`, {
                method: 'PUT',
                data: formData,
            });
            notification.success('Дані успішно збережено');
            navigate(-1);
        } catch (error) {
            notification.error('Не вдалося зберегти дані');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input
                label="Ідентифікатор"
                name="identifier"
                value={formData.identifier}
                onChange={(e) => handleInputChange('identifier', e.target.value)}
                disabled
            />
            <Input
                label="Посада"
                name="positionName"
                value={formData.positionName}
                onChange={(e) => handleInputChange('positionName', e.target.value)}
                required
            />
            <Input
                label="Назва підрозділу"
                name="unitName"
                value={formData.unitName}
                onChange={(e) => handleInputChange('unitName', e.target.value)}
                required
            />
            <Input
                label="Значення"
                name="value"
                value={formData.value}
                onChange={(e) => handleInputChange('value', e.target.value)}
                required
            />
            <div className="btn-group">
                <Button type="button" onClick={() => navigate(-1)}>
                    Назад
                </Button>
                <Button type="submit" primary>
                    Зберегти
                </Button>
            </div>
        </form>
    );
};

export default Index2Edit;