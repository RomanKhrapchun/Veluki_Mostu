import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from "../../../components/common/Button/Button";
import ViewCard from '../../../components/Cards/ViewCard';
import useFetch from "../../../hooks/useFetch";
import { generateIcon, iconMap, STATUS } from "../../../utils/constants";
import Loader from "../../../components/Loader/Loader";
import PageError from "../../ErrorPage/PageError";

const onBackIcon = generateIcon(iconMap.back);
const onEditIcon = generateIcon(iconMap.edit);

const Index43View = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { error, status, data } = useFetch(`api/opendata/43/${id}`);

    const tableData = useMemo(() => {
        if (data) {
            return {
                columns: [
                    { title: 'ID', dataIndex: 'id' },
                    { title: 'Прізвище', dataIndex: 'familyName' },
                    { title: 'Ім\'я', dataIndex: 'name' },
                    { title: 'По-батькові', dataIndex: 'additionalName' },
                    { title: 'Склад сім\'ї', dataIndex: 'familyStructure' },
                    { title: 'Дата подання заяви', dataIndex: 'recordDecisionDate' },
                    { title: 'Номер рішення про взяття на облік', dataIndex: 'recordDecisionNumber' },
                    { title: 'Дата рішення', dataIndex: 'decisionDate' },
                    { title: 'Дата включення до списку першочерговиків', dataIndex: 'priorityDecisionDate' },
                    { title: 'Номер включення до списку першочерговиків', dataIndex: 'priorityDecisionNumber' },
                    { title: 'Дата надання жилого приміщення', dataIndex: 'provisionDecisionDate' },
                    { title: 'Номер надання жилого приміщення', dataIndex: 'provisionDecisionNumber' },
                    { title: 'Дата зняття з обліку', dataIndex: 'exclusionDecisionDate' },
                    { title: 'Номер зняття з обліку', dataIndex: 'exclusionDecisionNumber' },
                ],
                data: [
                    {
                        key: data.id,
                        ...data,
                    },
                ],
            };
        }
        return { columns: [], data: [] };
    }, [data]);

    if (status === STATUS.PENDING) {
        return <Loader />;
    }

    if (status === STATUS.ERROR) {
        return <PageError statusError={error?.status} title={error?.message} />;
    }

    return (
        <React.Fragment>
            {status === STATUS.SUCCESS ? (
                <React.Fragment>
                    <div className="btn-group" style={{ marginBottom: '10px' }}>
                        <Button icon={onBackIcon} onClick={() => navigate(-1)}>
                            Назад
                        </Button>
                        <Button type="primary" icon={onEditIcon} onClick={() => navigate(`/opendata/43/edit/${id}`)}>
                            Редагувати
                        </Button>
                    </div>
                    <ViewCard dataSource={tableData.data} columns={tableData.columns} />
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
};

export default Index43View;
