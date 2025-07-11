import {createValidationSchema} from "../../utils/function";
import * as yup from "yup";

export const accessGroupValidationSchema = () => createValidationSchema([
    {
        fieldName: 'access_group_name',
        validationRule: yup.string().trim().required('Поле обов\'язкове.'),
    },
    {
        fieldName: 'info',
        validationRule: yup.string().trim().required('Поле обов\'язкове.'),
    },
]);