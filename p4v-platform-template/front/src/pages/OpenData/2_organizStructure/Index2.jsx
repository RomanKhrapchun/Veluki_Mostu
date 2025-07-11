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

const Index2 = () => {
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
            const response = await fetchFunction('api/opendata/2', {
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
        navigate(`/opendata/2/view/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id) => {
        navigate(`/opendata/2/edit/${id}`);
    }, [navigate]);

    const handleDelete = useCallback(async (id) => {
        try {
            await fetchFunction(`api/opendata/2/${id}`, {
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
                identifier: formatData(item.identifier),
                positionName: formatData(item.positionName),
                unitName: formatData(item.unitName),
                value: formatData(item.value),
            }));
        }
        return [];
    }, [data]);

    const columns = [
        { title: 'Ідентифікатор', dataIndex: 'identifier' },
        { title: 'Посада', dataIndex: 'positionName' },
        { title: 'Назва підрозділу', dataIndex: 'unitName' },
        { title: 'Значення', dataIndex: 'value' },
        {
            title: 'Дії',
            render: (record) => (
                <div className="btn-group">
                    <Button icon={viewIcon} onClick={() => handleView(record.identifier)}>
                        Переглянути
                    </Button>
                    <Button icon={editIcon} onClick={() => handleEdit(record.identifier)}>
                        Редагувати
                    </Button>
                    <Button icon={deleteIcon} onClick={() => handleDelete(record.identifier)}>
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

export default Index2;