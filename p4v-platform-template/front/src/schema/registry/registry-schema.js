import {createValidationSchema} from "../../utils/function";
import * as yup from "yup";

export const registryValidationSchema = () => createValidationSchema([
    {
        fieldName: 'title',
        validationRule: yup.string().trim().required('Поле обов\'язкове.'),
    },
    {
        fieldName: 'name',
        validationRule: yup.string().trim().required('Поле обов\'язкове.'),
    },
    {
        fieldName: 'ord',
        validationRule: yup.string()
            .trim()
            .matches(/^\d+$/, 'Поле повинно містити лише цифри.'), // Перевірка на числову строку
    },
    {
        fieldName: 'module',
        validationRule: yup.object().shape({
            label: yup.string().required(),
            value: yup.string().required(),
        }).required('Поле обов\'язкове.'),
    }
]);