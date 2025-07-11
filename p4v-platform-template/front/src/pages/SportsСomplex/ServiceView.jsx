import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom'
import Button from "../../components/common/Button/Button";
import ViewCard from '../../components/Cards/ViewCard';
import useFetch from "../../hooks/useFetch";
import { generateIcon, iconMap, STATUS } from "../../utils/constants";
import Loader from "../../components/Loader/Loader";
import PageError from "../ErrorPage/PageError";

const onBackIcon = generateIcon(iconMap.back)

const ServiceView = () => {
    const { serviceId } = useParams()
    const navigate = useNavigate()
    const { error, status, data } = useFetch(`api/sportscomplex/service/${serviceId}`)

    const tableData = useMemo(() => {
        if (typeof data === "object" && Object.keys(data).length) {
            return {
                columns: [
                    { title: 'ID', dataIndex: 'id' },
                    { title: 'Назва послуги', dataIndex: 'name' },
                    { title: 'Одиниці', dataIndex: 'unit' },
                    { title: 'Ціна', dataIndex: 'price' },
                    { title: 'Група послуг', dataIndex: 'group_name' },
                ],
                data: [{
                    key: data.id,
                    id: data.id,
                    name: data.name,
                    unit: data.unit,
                    price: data.price,
                    group_name: data.group_name,
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
                        <Button icon={onBackIcon} onClick={() => navigate('/poolservices')}>
                            Повернутись до реєстру
                        </Button>
                    </div>
                    <ViewCard dataSource={tableData.data} columns={tableData.columns} />
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
}

export default ServiceView;