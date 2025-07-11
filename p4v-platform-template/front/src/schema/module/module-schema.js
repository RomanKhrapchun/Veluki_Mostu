import {createValidationSchema} from "../../utils/function";
import * as yup from "yup";

export const moduleValidationSchema = () => createValidationSchema([
    {
        fieldName: 'module',
        validationRule: yup.string().trim().required('Поле обов\'язкове.'),
    },
    {
        fieldName: 'module_name',
        validationRule: yup.string().trim().required('Поле обов\'язкове.'),
    },
    {
        fieldName: 'install_version',
        validationRule: yup.string().trim().required('Поле обов\'язкове.'),
    },
    {
        fieldName: 'ord',
        validationRule: yup.string()
            .trim()
            .matches(/^\d+$/, 'Поле повинно містити лише цифри.'), // Перевірка на числову строку
    },
    {
        fieldName: 'module_status',
        validationRule: yup.object().shape({
            label: yup.string().required(),
            value: yup.string().required(),
        }).required('Поле обов\'язкове.'),
    }
]);