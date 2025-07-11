import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from '../../../main';
import { useNotification } from '../../../hooks/useNotification';
import useFetch from '../../../hooks/useFetch';
import Loader from '../../../components/Loader/Loader';
import PageError from '../../ErrorPage/PageError';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';

const Index4Edit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);

    const { data: recordData, status, error } = useFetch(`api/opendata/4/${id}`);
    const [formData, setFormData] = useState({
        uid: '',
        title: '',
        acceptedDate: '',
        issuedDate: '',
        type: '',
        url: '',
        text: '',
        creatorName: '',
        publisherName: '',
        publisherIdentifier: '',
        totalRequests: '',
        citizensUkraine: '',
        publicOrganizations: '',
    });

    const [errors, setErrors] = useState({});

    useEffect(() => {
        if (recordData) {
            setFormData(recordData);
        }
    }, [recordData]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await store.updateRecord(`api/opendata/4/${id}`, formData);
            notification.success('Дані успішно оновлено');
            navigate('/opendata/4');
        } catch (err) {
            notification.error('Не вдалося оновити дані');
            setErrors(err.response?.data?.errors || {});
        }
    };

    if (status === 'loading') {
        return <Loader />;
    }

    if (status === 'error') {
        return <PageError title="Помилка завантаження" statusError={error} />;
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input
                label="Ідентифікатор"
                name="uid"
                value={formData.uid}
                onChange={handleChange}
                error={errors.uid}
            />
            <Input
                label="Назва"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
            />
            <Input
                label="Дата затвердження"
                name="acceptedDate"
                type="date"
                value={formData.acceptedDate}
                onChange={handleChange}
                error={errors.acceptedDate}
            />
            <Input
                label="Дата оприлюднення"
                name="issuedDate"
                type="date"
                value={formData.issuedDate}
                onChange={handleChange}
                error={errors.issuedDate}
            />
            <Input
                label="Тип"
                name="type"
                value={formData.type}
                onChange={handleChange}
                error={errors.type}
            />
            <Input
                label="Посилання"
                name="url"
                type="url"
                value={formData.url}
                onChange={handleChange}
                error={errors.url}
            />
            <Input
                label="Текст"
                name="text"
                type="textarea"
                value={formData.text}
                onChange={handleChange}
                error={errors.text}
            />
            <Input
                label="Ім’я автора"
                name="creatorName"
                value={formData.creatorName}
                onChange={handleChange}
                error={errors.creatorName}
            />
            <Input
                label="Назва видавника"
                name="publisherName"
                value={formData.publisherName}
                onChange={handleChange}
                error={errors.publisherName}
            />
            <Input
                label="Ідентифікатор видавника"
                name="publisherIdentifier"
                value={formData.publisherIdentifier}
                onChange={handleChange}
                error={errors.publisherIdentifier}
            />
            <Input
                label="Всього запитів"
                name="totalRequests"
                type="number"
                value={formData.totalRequests}
                onChange={handleChange}
                error={errors.totalRequests}
            />
            <Input
                label="Від громадян України"
                name="citizensUkraine"
                type="number"
                value={formData.citizensUkraine}
                onChange={handleChange}
                error={errors.citizensUkraine}
            />
            <Input
                label="Від громадських організацій"
                name="publicOrganizations"
                type="number"
                value={formData.publicOrganizations}
                onChange={handleChange}
                error={errors.publicOrganizations}
            />
            <Button type="submit">Зберегти</Button>
        </form>
    );
};

export default Index4Edit;