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

const AccountView = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { error, status, data } = useFetch(`api/cnap/accounts/${id}`)

    const tableData = useMemo(() => {
        if (data) {
            return {
                columns: [
                    {
                        title: 'Номер рахунку',
                        dataIndex: 'account_number',
                    },
                    {
                        title: 'Дата',
                        dataIndex: 'date',
                        render: (date) => new Date(date).toLocaleDateString('uk-UA')
                    },
                    {
                        title: 'Час',
                        dataIndex: 'time'
                    },
                    {
                        title: 'Назва послуги',
                        dataIndex: 'service_name'
                    },
                    {
                        title: 'Платник',
                        dataIndex: 'payer'
                    },
                    {
                        title: 'Сума',
                        dataIndex: 'amount',
                        render: (amount) => `${amount} грн`
                    },
                    {
                        title: 'Адміністратор',
                        dataIndex: 'administrator'
                    }
                ],
                data: [{
                    key: data.id,
                    ...data
                }]
            }
        }
        return { columns: [], data: [] };
    }, [data])

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
                        <Button icon={onBackIcon} onClick={() => navigate('/cnap/accounts')}>
                            Повернутись до рахунків
                        </Button>
                        <Button type="primary" icon={onEditIcon} onClick={() => navigate(`/cnap/accounts/${id}/edit`)}>
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
}

export default AccountView;
