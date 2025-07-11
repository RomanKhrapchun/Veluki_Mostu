import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import { fetchFunction } from '../../../utils/function';
import { useNotification } from '../../../hooks/useNotification';
import Loader from '../../../components/Loader/Loader';

const Index1_3Edit = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { id } = useParams();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        uid: '',
        name: '',
        gender: '',
        positionName: '',
        unitId: '',
        unitName: '',
        orgId: '',
        orgName: '',
        img: '',
        homepage: '',
        socialAccount: '',
        telephone: '',
        email: '',
        openingHours: '',
        availabilityRestriction: '',
    });

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetchFunction(`api/opendata/1.3/${id}`, {
                    method: 'GET',
                });
                if (response?.data) {
                    setFormData({
                        uid: response.data.uid || '',
                        name: response.data.name || '',
                        gender: response.data.gender || '',
                        positionName: response.data.positionName || '',
                        unitId: response.data.unitId || '',
                        unitName: response.data.unitName || '',
                        orgId: response.data.orgId || '',
                        orgName: response.data.orgName || '',
                        img: response.data.img || '',
                        homepage: response.data.homepage || '',
                        socialAccount: response.data.socialAccount || '',
                        telephone: response.data.telephone || '',
                        email: response.data.email || '',
                        openingHours: response.data.openingHours || '',
                        availabilityRestriction: response.data.availabilityRestriction || '',
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
            await fetchFunction(`api/opendata/1.3/${id}`, {
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
                label="Унікальний ідентифікатор (UID)"
                name="uid"
                value={formData.uid}
                onChange={(e) => handleInputChange('uid', e.target.value)}
                disabled
            />
            <Input
                label="Ім'я"
                name="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
            />
            <Input
                label="Стать"
                name="gender"
                value={formData.gender}
                onChange={(e) => handleInputChange('gender', e.target.value)}
            />
            <Input
                label="Посада"
                name="positionName"
                value={formData.positionName}
                onChange={(e) => handleInputChange('positionName', e.target.value)}
            />
            <Input
                label="ID підрозділу"
                name="unitId"
                value={formData.unitId}
                onChange={(e) => handleInputChange('unitId', e.target.value)}
            />
            <Input
                label="Назва підрозділу"
                name="unitName"
                value={formData.unitName}
                onChange={(e) => handleInputChange('unitName', e.target.value)}
            />
            <Input
                label="ID організації"
                name="orgId"
                value={formData.orgId}
                onChange={(e) => handleInputChange('orgId', e.target.value)}
            />
            <Input
                label="Назва організації"
                name="orgName"
                value={formData.orgName}
                onChange={(e) => handleInputChange('orgName', e.target.value)}
            />
            <Input
                label="Зображення"
                name="img"
                value={formData.img}
                onChange={(e) => handleInputChange('img', e.target.value)}
            />
            <Input
                label="Домашня сторінка"
                name="homepage"
                value={formData.homepage}
                onChange={(e) => handleInputChange('homepage', e.target.value)}
            />
            <Input
                label="Соціальний акаунт"
                name="socialAccount"
                value={formData.socialAccount}
                onChange={(e) => handleInputChange('socialAccount', e.target.value)}
            />
            <Input
                label="Телефон"
                name="telephone"
                value={formData.telephone}
                onChange={(e) => handleInputChange('telephone', e.target.value)}
            />
            <Input
                label="Email"
                name="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
            />
            <Input
                label="Години роботи"
                name="openingHours"
                value={formData.openingHours}
                onChange={(e) => handleInputChange('openingHours', e.target.value)}
            />
            <Input
                label="Обмеження доступності"
                name="availabilityRestriction"
                value={formData.availabilityRestriction}
                onChange={(e) => handleInputChange('availabilityRestriction', e.target.value)}
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

export default Index1_3Edit;