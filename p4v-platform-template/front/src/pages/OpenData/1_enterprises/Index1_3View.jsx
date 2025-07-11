import React, { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button/Button';
import ViewCard from '../../../components/Cards/ViewCard';
import useFetch from '../../../hooks/useFetch';
import { generateIcon, iconMap, STATUS } from '../../../utils/constants';
import Loader from '../../../components/Loader/Loader';
import PageError from '../../ErrorPage/PageError';

const backIcon = generateIcon(iconMap.back);
const editIcon = generateIcon(iconMap.edit);

const Index1_3View = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { error, status, data } = useFetch(`api/opendata/1.3/${id}`);

    const tableData = useMemo(() => {
        if (data) {
            return {
                columns: [
                    { title: 'UID', dataIndex: 'uid' },
                    { title: 'Ім\'я', dataIndex: 'name' },
                    { title: 'Стать', dataIndex: 'gender' },
                    { title: 'Посада', dataIndex: 'positionName' },
                    { title: 'ID підрозділу', dataIndex: 'unitId' },
                    { title: 'Назва підрозділу', dataIndex: 'unitName' },
                    { title: 'ID організації', dataIndex: 'orgId' },
                    { title: 'Назва організації', dataIndex: 'orgName' },
                    { title: 'Зображення', dataIndex: 'img' },
                    { title: 'Домашня сторінка', dataIndex: 'homepage' },
                    { title: 'Соціальний акаунт', dataIndex: 'socialAccount' },
                    { title: 'Телефон', dataIndex: 'telephone' },
                    { title: 'Email', dataIndex: 'email' },
                    { title: 'Години роботи', dataIndex: 'openingHours' },
                    { title: 'Обмеження доступності', dataIndex: 'availabilityRestriction' },
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
                        <Button icon={backIcon} onClick={() => navigate(-1)}>
                            Назад
                        </Button>
                        <Button type="primary" icon={editIcon} onClick={() => navigate(`/opendata/1.3/edit/${id}`)}>
                            Редагувати
                        </Button>
                    </div>
                    <ViewCard dataSource={tableData.data} columns={tableData.columns} />
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
};

export default Index1_3View;