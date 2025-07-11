import React, { useCallback, useContext, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../main';
import Table from '../../../components/common/Table/Table';
import { fetchFunction } from '../../../utils/function';
import { generateIcon, iconMap } from '../../../utils/constants';
import { useNotification } from '../../../hooks/useNotification';
import Button from '../../../components/common/Button/Button';
import SkeletonPage from '../../../components/common/Skeleton/SkeletonPage';
import PageError from '../../ErrorPage/PageError';

const viewIcon = generateIcon(iconMap.view);
const editIcon = generateIcon(iconMap.edit);
const deleteIcon = generateIcon(iconMap.delete);

const Index1 = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ items: [], totalItems: 0 });
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        limit: 10,
        page: 1,
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetchFunction('api/opendata/1.1', {
                method: 'POST',
                data: { ...pagination },
            });

            if (response?.data) {
                setData({
                    items: response.data,
                    totalItems: response.data.length,
                });
            } else {
                setError('Не вдалося завантажити дані');
            }
        } catch (error) {
            setError(error.message || 'Сталася помилка');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [pagination]);

    const handleView = useCallback((id) => {
        navigate(`/opendata/1.1/view/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id) => {
        navigate(`/opendata/1.1/edit/${id}`);
    }, [navigate]);

    const handleDelete = useCallback(async (id) => {
        try {
            await fetchFunction(`api/opendata/1.1/${id}`, {
                method: 'DELETE',
            });
            notification.success('Запис успішно видалено');
            fetchData();
        } catch (error) {
            notification.error('Не вдалося видалити запис');
        }
    }, [notification]);

    const formatData = (value) => {
        return value || 'Немає даних';
    };

    const tableData = useMemo(() => {
        if (data?.items?.length) {
            return data.items.map((item) => ({
                ...item,
                id: item.id,
                name: formatData(item.name),
                description: formatData(item.description),
                docURL: formatData(item.docURL),
                homepage: formatData(item.homepage),
                social: formatData(item.social),
                logo: formatData(item.logo),
                headName: formatData(item.headName),
                headPost: formatData(item.headPost),
                subOrgId: formatData(item.subOrgId),
                subOrgName: formatData(item.subOrgName),
                CATUTTC: formatData(item.CATUTTC),
                adminUnit1: formatData(item.adminUnit1),
                adminUnit2: formatData(item.adminUnit2),
                adminUnit3: formatData(item.adminUnit3),
                adminUnit4: formatData(item.adminUnit4),
                postName: formatData(item.postName),
                street: formatData(item.street),
                houseNum: formatData(item.houseNum),
                houseName: formatData(item.houseName),
                postCode: formatData(item.postCode),
                contactName: formatData(item.contactName),
                contactEmail: formatData(item.contactEmail),
                contactPhone: formatData(item.contactPhone),
                hasEmail: formatData(item.hasEmail),
                hoursMon: formatData(item.hoursMon),
                hoursTue: formatData(item.hoursTue),
                hoursWed: formatData(item.hoursWed),
                hoursThu: formatData(item.hoursThu),
                hoursFri: formatData(item.hoursFri),
                hoursSat: formatData(item.hoursSat),
                hoursSun: formatData(item.hoursSun),
                restriction: formatData(item.restriction),
            }));
        }
        return [];
    }, [data]);

    const columns = [
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
        {
            title: 'Дії',
            render: (record) => (
                <div className="btn-group">
                    <Button icon={viewIcon} onClick={() => handleView(record.id)}>
                        Переглянути
                    </Button>
                    <Button icon={editIcon} onClick={() => handleEdit(record.id)}>
                        Редагувати
                    </Button>
                    <Button icon={deleteIcon} onClick={() => handleDelete(record.id)}>
                        Видалити
                    </Button>
                </div>
            ),
        },
    ];

    if (loading) {
        return <SkeletonPage />;
    }

    if (error) {
        return <PageError title="Помилка завантаження" statusError={error} />;
    }

    return (
        <Table
            columns={columns}
            dataSource={tableData}
            pagination={{
                total: data.totalItems,
                current: pagination.page,
                pageSize: pagination.limit,
                onChange: (page) => setPagination((prev) => ({ ...prev, page })),
            }}
        />
    );
};

export default Index1;