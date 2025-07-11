import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch';
import { fetchFunction } from '../../../utils/function';
import Input from '../../../components/common/Input/Input';
import Button from '../../../components/common/Button/Button';
import Loader from '../../../components/Loader/Loader';
import PageError from '../../ErrorPage/PageError';

const Index3Edit = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { data, status, error } = useFetch(`api/opendata/3/${id}`); 
    const [formData, setFormData] = useState({
        uid: '',
        title: '',
        validFrom: '',
        validThrough: '',
        url: '',
        text: '',
        legalActId: '',
        legalActType: '',
        legalActTitle: '',
        legalActDateAccepted: '',
        legalActNum: '',
        publisherName: '',
        publisherIdentifier: '',
    });

    useEffect(() => {
        if (data) {
            setFormData(data); 
        }
    }, [data]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetchFunction(`api/opendata/3/${id}`, {
                method: 'PUT',
                data: formData,
            });
            navigate(-1); 
        } catch (err) {
            console.error('Помилка при збереженні:', err);
        }
    };

    if (status === 'loading') {
        return <Loader />;
    }

    if (status === 'error') {
        return <PageError title="Помилка завантаження" statusError={error?.status} />;
    }

    return (
        <form onSubmit={handleSubmit}>
            <Input
                label="UID"
                name="uid"
                value={formData.uid}
                onChange={handleChange}
                disabled 
            />
            <Input
                label="Назва"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
            />
            <Input
                label="Дійсний з"
                name="validFrom"
                value={formData.validFrom}
                onChange={handleChange}
                type="date"
            />
            <Input
                label="Дійсний до"
                name="validThrough"
                value={formData.validThrough}
                onChange={handleChange}
                type="date"
            />
            <Input
                label="URL"
                name="url"
                value={formData.url}
                onChange={handleChange}
            />
            <Input
                label="Текст"
                name="text"
                value={formData.text}
                onChange={handleChange}
            />
            <Input
                label="ID правового акту"
                name="legalActId"
                value={formData.legalActId}
                onChange={handleChange}
            />
            <Input
                label="Тип правового акту"
                name="legalActType"
                value={formData.legalActType}
                onChange={handleChange}
            />
            <Input
                label="Назва правового акту"
                name="legalActTitle"
                value={formData.legalActTitle}
                onChange={handleChange}
            />
            <Input
                label="Дата прийняття правового акту"
                name="legalActDateAccepted"
                value={formData.legalActDateAccepted}
                onChange={handleChange}
                type="date"
            />
            <Input
                label="Номер правового акту"
                name="legalActNum"
                value={formData.legalActNum}
                onChange={handleChange}
            />
            <Input
                label="Назва видавця"
                name="publisherName"
                value={formData.publisherName}
                onChange={handleChange}
            />
            <Input
                label="Ідентифікатор видавця"
                name="publisherIdentifier"
                value={formData.publisherIdentifier}
                onChange={handleChange}
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

export default Index3Edit;