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

const Index1_2View = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { error, status, data } = useFetch(`api/opendata/1.2/${id}`);

    const tableData = useMemo(() => {
        if (data) {
            return {
                columns: [
                    { title: 'ID підрозділу', dataIndex: 'unitId' },
                    { title: 'Назва підрозділу', dataIndex: 'unitName' },
                    { title: 'Опис підрозділу', dataIndex: 'unitDescription' },
                    { title: 'URL установчого документа', dataIndex: 'constituentDocumentUrl' },
                    { title: 'Домашня сторінка', dataIndex: 'homepage' },
                    { title: 'Ім\'я керівника', dataIndex: 'headName' },
                    { title: 'Посада керівника', dataIndex: 'headPost' },
                    { title: 'ID організації', dataIndex: 'unitOfId' },
                    { title: 'Назва організації', dataIndex: 'unitOfName' },
                    { title: 'ID підпорядкованої організації', dataIndex: 'subUnitOfId' },
                    { title: 'Код КАТУТТЦ', dataIndex: 'authorityCatuttc' },
                    { title: 'Адміністративна одиниця рівень 1', dataIndex: 'addressAdminUnitL1' },
                    { title: 'Адміністративна одиниця рівень 2', dataIndex: 'addressAdminUnitL2' },
                    { title: 'Адміністративна одиниця рівень 3', dataIndex: 'addressAdminUnitL3' },
                    { title: 'Адміністративна одиниця рівень 4', dataIndex: 'addressAdminUnitL4' },
                    { title: 'Назва поштового відділення', dataIndex: 'addressPostName' },
                    { title: 'Вулиця', dataIndex: 'addressThoroughfare' },
                    { title: 'Номер будинку', dataIndex: 'addressLocatorDesignator' },
                    { title: 'Назва будинку', dataIndex: 'addressLocatorName' },
                    { title: 'Поштовий індекс', dataIndex: 'addressPostCode' },
                    { title: 'Контактна особа', dataIndex: 'contactPointName' },
                    { title: 'Email контактної особи', dataIndex: 'contactPointEmail' },
                    { title: 'Телефон контактної особи', dataIndex: 'contactPointTelephone' },
                    { title: 'Години роботи (понеділок)', dataIndex: 'contactPointOpeningHoursMonday' },
                    { title: 'Години роботи (вівторок)', dataIndex: 'contactPointOpeningHoursTuesday' },
                    { title: 'Години роботи (середа)', dataIndex: 'contactPointOpeningHoursWednesday' },
                    { title: 'Години роботи (четвер)', dataIndex: 'contactPointOpeningHoursThursday' },
                    { title: 'Години роботи (п\'ятниця)', dataIndex: 'contactPointOpeningHoursFriday' },
                    { title: 'Обмеження доступності', dataIndex: 'contactPointAvailabRestriction' },
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
                        <Button type="primary" icon={editIcon} onClick={() => navigate(`/opendata/1.2/edit/${id}`)}>
                            Редагувати
                        </Button>
                    </div>
                    <ViewCard dataSource={tableData.data} columns={tableData.columns} />
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
};

export default Index1_2View;