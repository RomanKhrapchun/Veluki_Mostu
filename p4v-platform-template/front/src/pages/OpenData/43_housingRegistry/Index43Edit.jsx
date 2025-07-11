import React, { useCallback, useContext, useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Context } from '../../../main';
import { useNotification } from "../../../hooks/useNotification";
import Input from "../../../components/common/Input/Input";
import Button from "../../../components/common/Button/Button";
import { fetchFunction, handleKeyDown } from "../../../utils/function";
import { generateIcon, iconMap } from "../../../utils/constants";
import FormItem from "../../../components/common/FormItem/FormItem";
import Loader from "../../../components/Loader/Loader";
import useFetch from "../../../hooks/useFetch";

const onBackIcon = generateIcon(iconMap.back);
const onSaveIcon = generateIcon(iconMap.save);

const Index43Edit = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const { id } = useParams();
    const [loading, setLoading] = useState(false);
    // Отримуємо дані з вашого API
    const { data: recordData, status } = useFetch(`api/opendata/43/${id}`);

    // Початковий стан форми
    const [formData, setFormData] = useState({
        familyName: '',
        name: '',
        additionalName: '',
        familyStructure: '',
        recordDecisionDate: '',
        recordDecisionNumber: '',
        decisionDate: '',
        priorityDecisionDate: '',
        priorityDecisionNumber: '',
        provisionDecisionDate: '',
        provisionDecisionNumber: '',
        exclusionDecisionDate: '',
        exclusionDecisionNumber: ''
    });

    // Стан для помилок
    const [errors, setErrors] = useState({});

    // Коли приходять дані з сервера — оновлюємо форму
    useEffect(() => {
        if (recordData) {
            setFormData({
                familyName: recordData.familyName || '',
                name: recordData.name || '',
                additionalName: recordData.additionalName || '',
                familyStructure: recordData.familyStructure || '',
                recordDecisionDate: recordData.recordDecisionDate || '',
                recordDecisionNumber: recordData.recordDecisionNumber || '',
                decisionDate: recordData.decisionDate || '',
                priorityDecisionDate: recordData.priorityDecisionDate || '',
                priorityDecisionNumber: recordData.priorityDecisionNumber || '',
                provisionDecisionDate: recordData.provisionDecisionDate || '',
                provisionDecisionNumber: recordData.provisionDecisionNumber || '',
                exclusionDecisionDate: recordData.exclusionDecisionDate || '',
                exclusionDecisionNumber: recordData.exclusionDecisionNumber || ''
            });
        }
    }, [recordData]);

    // Обробка зміни інпутів: приймає (name, value)
    const handleInputChange = useCallback((fieldName, newValue) => {
        setFormData(prev => ({
            ...prev,
            [fieldName]: newValue
        }));
        // Якщо є помилка для цього поля — скидаємо, бо користувач почав вводити нове значення
        if (errors[fieldName]) {
            setErrors(prev => ({
                ...prev,
                [fieldName]: ''
            }));
        }
    }, [errors]);

    // Валідація: перевіримо, чи заповнені потрібні поля
    const validateForm = () => {
        const newErrors = {};
        if (!formData.familyName) newErrors.familyName = "Обов'язкове поле";
        if (!formData.name) newErrors.name = "Обов'язкове поле";
        if (!formData.additionalName) newErrors.additionalName = "Обов'язкове поле";
        // Якщо треба додаткові перевірки, додавайте тут

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    // Збереження (відправка PUT-запиту)
    const handleSave = async (e) => {
        e.preventDefault();
        // Спочатку перевіряємо форму
        if (!validateForm()) {
            notification({
                type: 'warning',
                message: 'Будь ласка, заповніть усі обов`язкові поля',
                placement: 'top'
            });
            return;
        }

        try {
            setLoading(true);
            await fetchFunction(`api/opendata/43/${id}`, {
                method: 'PUT',
                data: formData
            });
            notification({
                type: 'success',
                message: 'Дані успішно збережено',
                placement: 'top'
            });
            // Повертаємось на сторінку перегляду
            navigate(`/opendata/43/view/${id}`);
        } catch (error) {
            notification({
                type: 'error',
                message: error?.response?.data?.message || 'Помилка при збереженні даних',
                placement: 'top'
            });
            if (error?.response?.status === 401) {
                store.logOff();
                navigate('/');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleBack = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    // Якщо ми досі завантажуємо дані або відправляємо PUT — показуємо лоудер
    if (status === 'loading' || loading) {
        return <Loader />;
    }

    // Рендеримо форму
    return (
        <form onKeyDown={handleKeyDown} onSubmit={handleSave}>
            <div className="components-container">
                <FormItem
                    label="Прізвище"
                    error={errors.familyName}
                    required
                    fullWidth
                >
                    <Input
                        name="familyName"
                        value={formData.familyName}
                        // ВАЖЛИВО: передаємо напряму handleInputChange
                        onChange={handleInputChange}
                    />
                </FormItem>

                <FormItem
                    label="Ім'я"
                    error={errors.name}
                    required
                    fullWidth
                >
                    <Input
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                    />
                </FormItem>

                <FormItem
                    label="По-батькові"
                    error={errors.additionalName}
                    required
                    fullWidth
                >
                    <Input
                        name="additionalName"
                        value={formData.additionalName}
                        onChange={handleInputChange}
                    />
                </FormItem>

                <FormItem
                    label="Склад сім'ї"
                    fullWidth
                >
                    <Input
                        name="familyStructure"
                        value={formData.familyStructure}
                        onChange={handleInputChange}
                    />
                </FormItem>

                <FormItem
                    label="Дата подання заяви"
                    fullWidth
                >
                    <Input
                        type="date"
                        name="recordDecisionDate"
                        value={formData.recordDecisionDate}
                        onChange={handleInputChange}
                    />
                </FormItem>

                <FormItem
                    label="Номер рішення про взяття на облік"
                    fullWidth
                >
                    <Input
                        name="recordDecisionNumber"
                        value={formData.recordDecisionNumber}
                        onChange={handleInputChange}
                    />
                </FormItem>

                <FormItem
                    label="Дата рішення"
                    fullWidth
                >
                    <Input
                        type="date"
                        name="decisionDate"
                        value={formData.decisionDate}
                        onChange={handleInputChange}
                    />
                </FormItem>

                <FormItem
                    label="Дата включення до списку першочерговиків"
                    fullWidth
                >
                    <Input
                        type="date"
                        name="priorityDecisionDate"
                        value={formData.priorityDecisionDate}
                        onChange={handleInputChange}
                    />
                </FormItem>

                <FormItem
                    label="Номер включення до списку першочерговиків"
                    fullWidth
                >
                    <Input
                        name="priorityDecisionNumber"
                        value={formData.priorityDecisionNumber}
                        onChange={handleInputChange}
                    />
                </FormItem>

                <FormItem
                    label="Дата надання жилого приміщення"
                    fullWidth
                >
                    <Input
                        type="date"
                        name="provisionDecisionDate"
                        value={formData.provisionDecisionDate}
                        onChange={handleInputChange}
                    />
                </FormItem>

                <FormItem
                    label="Номер надання жилого приміщення"
                    fullWidth
                >
                    <Input
                        name="provisionDecisionNumber"
                        value={formData.provisionDecisionNumber}
                        onChange={handleInputChange}
                    />
                </FormItem>

                <FormItem
                    label="Дата зняття з обліку"
                    fullWidth
                >
                    <Input
                        type="date"
                        name="exclusionDecisionDate"
                        value={formData.exclusionDecisionDate}
                        onChange={handleInputChange}
                    />
                </FormItem>

                <FormItem
                    label="Номер зняття з обліку"
                    fullWidth
                >
                    <Input
                        name="exclusionDecisionNumber"
                        value={formData.exclusionDecisionNumber}
                        onChange={handleInputChange}
                    />
                </FormItem>

                <div className="btn-group">
                    <Button
                        type="default"
                        icon={onBackIcon}
                        onClick={handleBack}
                    >
                        Назад
                    </Button>
                    <Button
                        type="primary"
                        icon={onSaveIcon}
                        htmlType="submit"
                    >
                        Зберегти
                    </Button>
                </div>
            </div>
        </form>
    );
};

export default Index43Edit;
