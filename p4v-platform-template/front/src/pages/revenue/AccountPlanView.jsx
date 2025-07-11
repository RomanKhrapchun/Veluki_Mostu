import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from "../../components/common/Button/Button";
import ViewCard from '../../components/Cards/ViewCard';
import useFetch from "../../hooks/useFetch";
import { generateIcon, iconMap, STATUS } from "../../utils/constants";
import Loader from "../../components/Loader/Loader";
import PageError from "../ErrorPage/PageError";

const onBackIcon = generateIcon(iconMap.back)
const onEditIcon = generateIcon(iconMap.edit)
const onPrintIcon = generateIcon(iconMap.print)

const AccountPlanView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { error, status, data } = useFetch(`api/revenue/account-plan/${id}`);

    const tableData = useMemo(() => {
        if (status === STATUS.SUCCESS && data) {
            return {
                columns: [
                    {
                        title: 'ID',
                        dataIndex: 'id',
                    },
                    {
                        title: 'IBAN',
                        dataIndex: 'iban',
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
                        title: 'Тип податку',
                        dataIndex: 'tax_type',
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
                        <Button icon={onBackIcon} onClick={() => navigate('/revenue/account-plan')}>
                            Повернутись до плану рахунків
                        </Button>
                        <Button type="primary" icon={onEditIcon} onClick={() => navigate(`/revenue/account-plan/${id}/edit`)}>
                            Редагувати
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

export default AccountPlanView;