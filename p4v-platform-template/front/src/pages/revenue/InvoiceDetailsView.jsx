
import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from "../../components/common/Button/Button";
import ViewCard from '../../components/Cards/ViewCard';
import useFetch from "../../hooks/useFetch";
import { generateIcon, iconMap, STATUS } from "../../utils/constants";
import Loader from "../../components/Loader/Loader";
import PageError from "../ErrorPage/PageError";

const onBackIcon = generateIcon(iconMap.back);
const onPrintIcon = generateIcon(iconMap.print);

const InvoiceDetailsView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { error, status, data } = useFetch(`api/revenue/invoice-details/${id}`);

    const tableData = useMemo(() => {
        if (status === STATUS.SUCCESS && data) {
            return {
                columns: [
                    {
                        title: 'ID',
                        dataIndex: 'id',
                    },
                    {
                        title: 'ЄДРПОУ програми',
                        dataIndex: 'program_edrpou',
                    },
                    {
                        title: 'Дата інвойсу',
                        dataIndex: 'invoice_date',
                        render: (value) => new Date(value).toLocaleDateString(),
                    },
                    {
                        title: 'ЄДРПОУ платника',
                        dataIndex: 'edrpou',
                    },
                    {
                        title: 'Назва платника',
                        dataIndex: 'payer_name',
                    },
                    {
                        title: 'Дебет',
                        dataIndex: 'debit',
                    },
                    {
                        title: 'Призначення платежу',
                        dataIndex: 'payment_purpose',
                    },
                    {
                        title: 'Рахунок',
                        dataIndex: 'account',
                    },
                    {
                        title: 'Рік',
                        dataIndex: 'year',
                    },
                    {
                        title: 'Місяць',
                        dataIndex: 'month',
                    },
                    {
                        title: 'Район',
                        dataIndex: 'district_name',
                    },
                    {
                        title: 'Населений пункт',
                        dataIndex: 'settlement_name',
                    },
                    {
                        title: 'Дебет з коефіцієнтом',
                        dataIndex: 'debit_with_coefficient',
                    },
                    {
                        title: 'Код податку',
                        dataIndex: 'tax_code',
                    },
                    {
                        title: 'Назва податку',
                        dataIndex: 'tax_name',
                    },
                    {
                        title: 'Тип податку',
                        dataIndex: 'tax_type',
                    },
                    {
                        title: 'Тип платника',
                        dataIndex: 'payer_type',
                    },
                    {
                        title: 'Розрахована назва платника',
                        dataIndex: 'calculated_payer_name',
                    },
                    {
                        title: 'Код класифікації',
                        dataIndex: 'classification_code',
                    },
                    {
                        title: 'Назва класифікації',
                        dataIndex: 'classification_name',
                    },
                    {
                        title: 'Коефіцієнт',
                        dataIndex: 'coefficient',
                    },
                    {
                        title: 'Тип податку (рахунок)',
                        dataIndex: 'account_tax_type',
                    },
                    {
                        title: 'Зареєстрована назва платника',
                        dataIndex: 'registered_payer_name',
                    },
                    {
                        title: 'Зареєстрований тип платника',
                        dataIndex: 'registered_payer_type',
                    },
                    {
                        title: 'Дата створення',
                        dataIndex: 'created_at',
                        render: (value) => new Date(value).toLocaleString(),
                    },
                    {
                        title: 'Дата оновлення',
                        dataIndex: 'updated_at',
                        render: (value) => new Date(value).toLocaleString(),
                    },
                ],
                data: [data],
            };
        }
        return { columns: [], data: [] };
    }, [data]);

    if (status === STATUS.PENDING) {
        return <Loader />
    }

    if (status === STATUS.ERROR) {
        return <PageError statusError={error.status} title={error.message} />
    }

    return (
        <React.Fragment>
            {status === STATUS.SUCCESS ? (
                <React.Fragment>
                    <div className="btn-group" style={{ marginBottom: '10px' }}>
                        <Button icon={onBackIcon} onClick={() => navigate('/revenue/details')}>
                            Повернутись до деталізації надходжень
                        </Button>
                        <Button type="default" icon={onPrintIcon} onClick={() => window.print()}>
                            Друк
                        </Button>
                    </div>
                    <ViewCard dataSource={tableData.data} columns={tableData.columns} />
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
};

export default InvoiceDetailsView;
