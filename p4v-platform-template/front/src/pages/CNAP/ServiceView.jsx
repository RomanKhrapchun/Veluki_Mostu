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

const ServiceView = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const { error, status, data } = useFetch(`api/cnap/services/${id}`)

    const tableData = useMemo(() => {
        if (data) {
            return {
                columns: [
                    {
                        title: 'Ідентифікатор',
                        dataIndex: 'identifier',
                    },
                    {
                        title: 'Назва послуги',
                        dataIndex: 'name',
                    },
                    {
                        title: 'Вартість',
                        dataIndex: 'price',
                    },
                    {
                        title: 'ЄДРПОУ',
                        dataIndex: 'edrpou',
                    },
                    {
                        title: 'IBAN',
                        dataIndex: 'iban',
                    },
                    {
                        title: 'Дата створення',
                        dataIndex: 'create_date',
                        render: (date) => new Date(date).toLocaleString('uk-UA', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })
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
                        <Button icon={onBackIcon} onClick={() => navigate('/cnap/services')}>
                            Повернутись до послуг
                        </Button>
                        <Button type="primary" icon={onEditIcon} onClick={() => navigate(`/cnap/services/${id}/edit`)}>
                            Редагувати
                        </Button>
                    </div>
                    <ViewCard dataSource={tableData.data} columns={tableData.columns} />
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
}

export default ServiceView;
