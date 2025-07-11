import {useCallback, useState} from 'react';
import {ObjectSchema} from 'yup';
import {isObject} from "../utils/constants";

const UseForm = (initialValues) => {
    const [formData, setFormData] = useState(isObject(initialValues) ? initialValues : {});
    const [errors, setErrors] = useState({});

    const onFieldChange = useCallback((name, value) => {
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    }, [])

    const setFieldsValue = useCallback((values = {}) => {
        if (!values || typeof values !== 'object' || Array.isArray(values)) {
            values = {}
        }
        setFormData((prevData) => ({
            ...prevData,
            ...values,
        }));
    }, [])

    const validateFields = useCallback(async (validatorSchema) => {
        if (!(validatorSchema instanceof ObjectSchema)) {
            return {
                data: null,
                error: 'Схема валідації даних не була передана. Будь ласка, переконайтеся, що ви передаєте необхідну схему.',
            }
        }

        try {
            await validatorSchema.validate(formData, {abortEarly: false});
            setErrors({})
            return {
                data: formData,
                error: null,
            }
        } catch (errorInfo) {
            if (errorInfo.inner) {
                const newErrors = {};
                errorInfo.inner.forEach((e) => {
                    newErrors[e.path] = e.message;
                });
                setErrors(newErrors)
                return {
                    data: null,
                    error: 'Будь ласка, перевірте введені дані та спробуйте ще раз.'
                }
            }
        }

    }, [formData])

    return {formData, errors, onFieldChange, validateFields, setFieldsValue};
};
export default UseForm;