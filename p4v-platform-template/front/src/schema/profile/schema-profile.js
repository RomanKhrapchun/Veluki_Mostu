import {createValidationSchema} from "../../utils/function";
import * as yup from "yup";

export const userProfileValidationSchema = () => createValidationSchema([
    {
        fieldName: 'first_name',
        validationRule: yup.string().trim().required('Поле обов\'язкове.'),
    },
    {
        fieldName: 'last_name',
        validationRule: yup.string().trim().required('Поле обов\'язкове.'),
    },
    {
        fieldName: 'email',
        validationRule: yup
            .string()
            .email('Будь ласка, введіть електронну адресу в правильному форматі.')
            .required('Поле обов\'язкове.'),
    },
    {
        fieldName: 'password',
        validationRule: yup.string().test(
            'password',
            'Пароль має містити принаймні одну цифру, одну малу та велику латинські літери і містити мінімум 8 символів',
            function (value) {
                if (value && value.trim() !== '') {
                    return /^(?=.{8})(?=[^a-z]*[a-z])(?=[^A-Z]*[A-Z])(?=\D*\d)[a-zA-Z\d]+$/.test(value);
                }
                return true;
            }
        ),
    },
    {
        fieldName: 'phone',
        validationRule: yup.string().test(
            'phone',
            'Будь ласка, введіть номер телефону в правильному форматі.',
            function (value) {
                if (value && value.trim() !== '') {
                    return /^(\+?\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(value);
                }
                return true;
            }
        ),
    },
]);