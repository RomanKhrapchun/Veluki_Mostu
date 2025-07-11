import React, { useCallback, useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Index1_2 = () => {
    const navigate = useNavigate();
    const notification = useNotification();

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
            const response = await fetchFunction('api/opendata/1.2', {
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
        navigate(`/opendata/1.2/view/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id) => {
        navigate(`/opendata/1.2/edit/${id}`);
    }, [navigate]);

    const handleDelete = useCallback(async (id) => {
        try {
            await fetchFunction(`api/opendata/1.2/${id}`, {
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
                unitId: formatData(item.unitId),
                unitName: formatData(item.unitName),
                unitDescription: formatData(item.unitDescription),
                constituentDocumentUrl: formatData(item.constituentDocumentUrl),
                homepage: formatData(item.homepage),
                headName: formatData(item.headName),
                headPost: formatData(item.headPost),
                unitOfId: formatData(item.unitOfId),
                unitOfName: formatData(item.unitOfName),
                subUnitOfId: formatData(item.subUnitOfId),
                authorityCatuttc: formatData(item.authorityCatuttc),
                addressAdminUnitL1: formatData(item.addressAdminUnitL1),
                addressAdminUnitL2: formatData(item.addressAdminUnitL2),
                addressAdminUnitL3: formatData(item.addressAdminUnitL3),
                addressAdminUnitL4: formatData(item.addressAdminUnitL4),
                addressPostName: formatData(item.addressPostName),
                addressThoroughfare: formatData(item.addressThoroughfare),
                addressLocatorDesignator: formatData(item.addressLocatorDesignator),
                addressLocatorName: formatData(item.addressLocatorName),
                addressPostCode: formatData(item.addressPostCode),
                contactPointName: formatData(item.contactPointName),
                contactPointEmail: formatData(item.contactPointEmail),
                contactPointTelephone: formatData(item.contactPointTelephone),
                contactPointOpeningHoursMonday: formatData(item.contactPointOpeningHoursMonday),
                contactPointOpeningHoursTuesday: formatData(item.contactPointOpeningHoursTuesday),
                contactPointOpeningHoursWednesday: formatData(item.contactPointOpeningHoursWednesday),
                contactPointOpeningHoursThursday: formatData(item.contactPointOpeningHoursThursday),
                contactPointOpeningHoursFriday: formatData(item.contactPointOpeningHoursFriday),
                contactPointAvailabRestriction: formatData(item.contactPointAvailabRestriction),
            }));
        }
        return [];
    }, [data]);

    const columns = [
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
        {
            title: 'Дії',
            render: (record) => (
                <div className="btn-group">
                    <Button icon={viewIcon} onClick={() => handleView(record.unitId)}>
                        Переглянути
                    </Button>
                    <Button icon={editIcon} onClick={() => handleEdit(record.unitId)}>
                        Редагувати
                    </Button>
                    <Button icon={deleteIcon} onClick={() => handleDelete(record.unitId)}>
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

export default Index1_2;