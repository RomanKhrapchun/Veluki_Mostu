import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from '../../../main';
import { useNotification } from '../../../hooks/useNotification';
import useFetch from '../../../hooks/useFetch';
import Loader from '../../../components/Loader/Loader';
import PageError from '../../ErrorPage/PageError';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';

const Index1Edit = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);

    const { data: recordData, status, error } = useFetch(`api/opendata/1.1/${id}`);
    const [formData, setFormData] = useState({
        name: '',
        description: '', 
        docURL: '', 
        homepage: '',
        social: '', 
        logo: '',
        headName: '',
        headPost: '',
        subOrgId: '', 
        subOrgName: '',
        CATUTTC: '',
        adminUnit1: '', 
        adminUnit2: '', 
        adminUnit3: '', 
        adminUnit4: '', 
        postName: '',
        street: '', 
        houseNum: '', 
        houseName: '', 
        postCode: '',
        contactName: '', 
        contactEmail: '', 
        contactPhone: '', 
        hasEmail: '', 
        hoursMon: '', 
        hoursTue: '', 
        hoursWed: '', 
        hoursThu: '', 
        hoursFri: '', 
        hoursSat: '', 
        hoursSun: '', 
        restriction: '', 
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
            await fetchFunction(`api/opendata/1/${id}`, {
                method: 'PUT',
                data: formData,
            });
            notification.success('Запис успішно оновлено');
            navigate(-1);
        } catch (err) {
            notification.error('Не вдалося оновити запис');
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
            <div className="form-group">
                <Input label="Назва" name="name" value={formData.name} onChange={handleChange} required />
                <Input label="Опис" name="description" value={formData.description} onChange={handleChange} />
                <Input label="URL документа" name="docURL" value={formData.docURL} onChange={handleChange} />
                <Input label="Домашня сторінка" name="homepage" value={formData.homepage} onChange={handleChange} />
                <Input label="Соціальний акаунт" name="social" value={formData.social} onChange={handleChange} />
                <Input label="Логотип" name="logo" value={formData.logo} onChange={handleChange} />
                <Input label="Ім'я керівника" name="headName" value={formData.headName} onChange={handleChange} />
                <Input label="Посада керівника" name="headPost" value={formData.headPost} onChange={handleChange} />
                <Input label="ID підпорядкованої організації" name="subOrgId" value={formData.subOrgId} onChange={handleChange} />
                <Input label="Назва підпорядкованої організації" name="subOrgName" value={formData.subOrgName} onChange={handleChange} />
                <Input label="Код КАТУТТЦ" name="CATUTTC" value={formData.CATUTTC} onChange={handleChange} />
                <Input label="Адміністративна одиниця рівень 1" name="adminUnit1" value={formData.adminUnit1} onChange={handleChange} />
                <Input label="Адміністративна одиниця рівень 2" name="adminUnit2" value={formData.adminUnit2} onChange={handleChange} />
                <Input label="Адміністративна одиниця рівень 3" name="adminUnit3" value={formData.adminUnit3} onChange={handleChange} />
                <Input label="Адміністративна одиниця рівень 4" name="adminUnit4" value={formData.adminUnit4} onChange={handleChange} />
                <Input label="Назва поштового відділення" name="postName" value={formData.postName} onChange={handleChange} />
                <Input label="Вулиця" name="street" value={formData.street} onChange={handleChange} />
                <Input label="Номер будинку" name="houseNum" value={formData.houseNum} onChange={handleChange} />
                <Input label="Назва будинку" name="houseName" value={formData.houseName} onChange={handleChange} />
                <Input label="Поштовий індекс" name="postCode" value={formData.postCode} onChange={handleChange} />
                <Input label="Контактна особа" name="contactName" value={formData.contactName} onChange={handleChange} />
                <Input label="Email контактної особи" name="contactEmail" value={formData.contactEmail} onChange={handleChange} />
                <Input label="Телефон контактної особи" name="contactPhone" value={formData.contactPhone} onChange={handleChange} />
                <Input label="Чи є Email контактної особи" name="hasEmail" value={formData.hasEmail} onChange={handleChange} />
                <Input label="Години роботи (понеділок)" name="hoursMon" value={formData.hoursMon} onChange={handleChange} />
                <Input label="Години роботи (вівторок)" name="hoursTue" value={formData.hoursTue} onChange={handleChange} />
                <Input label="Години роботи (середа)" name="hoursWed" value={formData.hoursWed} onChange={handleChange} />
                <Input label="Години роботи (четвер)" name="hoursThu" value={formData.hoursThu} onChange={handleChange} />
                <Input label="Години роботи (п'ятниця)" name="hoursFri" value={formData.hoursFri} onChange={handleChange} />
                <Input label="Години роботи (субота)" name="hoursSat" value={formData.hoursSat} onChange={handleChange} />
                <Input label="Години роботи (неділя)" name="hoursSun" value={formData.hoursSun} onChange={handleChange} />
                <Input label="Обмеження доступності" name="restriction" value={formData.restriction} onChange={handleChange} />
            </div>
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

export default Index1Edit;