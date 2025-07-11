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

const Index1View = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { error, status, data } = useFetch(`api/opendata/1.1/${id}`);

    const tableData = useMemo(() => {
        if (data) {
            return {
                columns: [
                    { title: 'ID', dataIndex: 'id' },
                    { title: 'Назва', dataIndex: 'name' },
                    { title: 'Опис', dataIndex: 'description' },
                    { title: 'URL документа', dataIndex: 'docURL' },
                    { title: 'Домашня сторінка', dataIndex: 'homepage' },
                    { title: 'Соціальний акаунт', dataIndex: 'social' },
                    { title: 'Логотип', dataIndex: 'logo' },
                    { title: 'Ім\'я керівника', dataIndex: 'headName' },
                    { title: 'Посада керівника', dataIndex: 'headPost' },
                    { title: 'ID підпорядкованої організації', dataIndex: 'subOrgId' },
                    { title: 'Назва підпорядкованої організації', dataIndex: 'subOrgName' },
                    { title: 'Код КАТУТТЦ', dataIndex: 'CATUTTC' },
                    { title: 'Адміністративна одиниця рівень 1', dataIndex: 'adminUnit1' },
                    { title: 'Адміністративна одиниця рівень 2', dataIndex: 'adminUnit2' },
                    { title: 'Адміністративна одиниця рівень 3', dataIndex: 'adminUnit3' },
                    { title: 'Адміністративна одиниця рівень 4', dataIndex: 'adminUnit4' },
                    { title: 'Назва поштового відділення', dataIndex: 'postName' },
                    { title: 'Вулиця', dataIndex: 'street' },
                    { title: 'Номер будинку', dataIndex: 'houseNum' },
                    { title: 'Назва будинку', dataIndex: 'houseName' },
                    { title: 'Поштовий індекс', dataIndex: 'postCode' },
                    { title: 'Контактна особа', dataIndex: 'contactName' },
                    { title: 'Email контактної особи', dataIndex: 'contactEmail' },
                    { title: 'Телефон контактної особи', dataIndex: 'contactPhone' },
                    { title: 'Чи є Email контактної особи', dataIndex: 'hasEmail' },
                    { title: 'Години роботи (понеділок)', dataIndex: 'hoursMon' },
                    { title: 'Години роботи (вівторок)', dataIndex: 'hoursTue' },
                    { title: 'Години роботи (середа)', dataIndex: 'hoursWed' },
                    { title: 'Години роботи (четвер)', dataIndex: 'hoursThu' },
                    { title: 'Години роботи (п\'ятниця)', dataIndex: 'hoursFri' },
                    { title: 'Години роботи (субота)', dataIndex: 'hoursSat' },
                    { title: 'Години роботи (неділя)', dataIndex: 'hoursSun' },
                    { title: 'Обмеження доступності', dataIndex: 'restriction' },
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
                        <Button type="primary" icon={editIcon} onClick={() => navigate(`/opendata/1.1/edit/${id}`)}>
                            Редагувати
                        </Button>
                    </div>
                    <ViewCard dataSource={tableData.data} columns={tableData.columns} />
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
};

export default Index1View;