import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from "../../components/common/Button/Button";
import ViewCard from '../../components/Cards/ViewCard';
import useFetch from "../../hooks/useFetch";
import { generateIcon, iconMap, STATUS } from "../../utils/constants";
import Loader from "../../components/Loader/Loader";
import PageError from "../ErrorPage/PageError";

const onBackIcon = generateIcon(iconMap.back);

const UtilityView = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { error, status, data } = useFetch(`api/utilities/info/${id}`);

    const tableData = useMemo(() => {
        if (typeof data === "object" && Object.keys(data).length) {
            return {
                columns: [
                    {
                        title: 'Ідентифікатор платника', dataIndex: 'payerident',
                    },
                    {
                        title: 'П.І.Б', dataIndex: 'fio',
                    },
                    {
                        title: 'Послуга', dataIndex: 'service',
                    },
                    {
                        title: 'Нарахування', dataIndex: 'charge',
                    },
                    {
                        title: 'Адреса', dataIndex: 'adress',
                    },
                ],
                data: data.map(el => ({
                    key: el.payerident,
                    payerident: el.payerident,
                    fio: el.fio,
                    service: el.service,
                    charge: el.charge,
                    adress: el.adress,
                }))
            };
        }
        return { columns: [], data: [] };
    }, [data]);

    if (status === STATUS.PENDING) {
        return <Loader />;
    }

    if (status === STATUS.ERROR) {
        return <PageError statusError={error.status} title={error.message} />;
    }

    return (
        <React.Fragment>
            {status === STATUS.SUCCESS ? (
                <React.Fragment>
                    <div className="btn-group" style={{ marginBottom: '10px' }}>
                        <Button icon={onBackIcon} onClick={() => navigate('/utilities')}>
                            Повернутись до реєстру
                        </Button>
                    </div>
                    <ViewCard dataSource={tableData.data} columns={tableData.columns} />
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
};

export default UtilityView;
