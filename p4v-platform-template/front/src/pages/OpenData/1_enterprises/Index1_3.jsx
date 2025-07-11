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

const Index1_3 = () => {
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
            const response = await fetchFunction('api/opendata/1.3', {
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
        navigate(`/opendata/1.3/view/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id) => {
        navigate(`/opendata/1.3/edit/${id}`);
    }, [navigate]);

    const handleDelete = useCallback(async (id) => {
        try {
            await fetchFunction(`api/opendata/1.3/${id}`, {
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
                uid: formatData(item.uid),
                name: formatData(item.name),
                gender: formatData(item.gender),
                positionName: formatData(item.positionName),
                unitId: formatData(item.unitId),
                unitName: formatData(item.unitName),
                orgId: formatData(item.orgId),
                orgName: formatData(item.orgName),
                img: formatData(item.img),
                homepage: formatData(item.homepage),
                socialAccount: formatData(item.socialAccount),
                telephone: formatData(item.telephone),
                email: formatData(item.email),
                openingHours: formatData(item.openingHours),
                availabilityRestriction: formatData(item.availabilityRestriction),
            }));
        }
        return [];
    }, [data]);

    const columns = [
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
        {
            title: 'Дії',
            render: (record) => (
                <div className="btn-group">
                    <Button icon={viewIcon} onClick={() => handleView(record.uid)}>
                        Переглянути
                    </Button>
                    <Button icon={editIcon} onClick={() => handleEdit(record.uid)}>
                        Редагувати
                    </Button>
                    <Button icon={deleteIcon} onClick={() => handleDelete(record.uid)}>
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

export default Index1_3;