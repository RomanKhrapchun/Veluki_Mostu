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

const Index4 = () => {
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
            const response = await fetchFunction('api/opendata/4', {
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
        navigate(`/opendata/4/view/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id) => {
        navigate(`/opendata/4/edit/${id}`);
    }, [navigate]);

    const handleDelete = useCallback(async (id) => {
        try {
            await fetchFunction(`api/opendata/4/${id}`, {
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
                title: formatData(item.title),
                acceptedDate: formatData(item.acceptedDate),
                issuedDate: formatData(item.issuedDate),
                type: formatData(item.type),
                url: formatData(item.url),
                text: formatData(item.text),
                creatorName: formatData(item.creatorName),
                publisherName: formatData(item.publisherName),
                publisherIdentifier: formatData(item.publisherIdentifier),
                totalRequests: formatData(item.totalRequests),
                citizensUkraine: formatData(item.citizensUkraine),
                publicOrganizations: formatData(item.publicOrganizations),
            }));
        }
        return [];
    }, [data]);

    const columns = [
        { title: 'Ідентифікатор', dataIndex: 'uid' },
        { title: 'Назва', dataIndex: 'title' },
        { title: 'Дата затвердження', dataIndex: 'acceptedDate' },
        { title: 'Дата оприлюднення', dataIndex: 'issuedDate' },
        { title: 'Тип', dataIndex: 'type' },
        { title: 'Посилання', dataIndex: 'url' },
        { title: 'Текст', dataIndex: 'text' },
        { title: 'Ім’я автора', dataIndex: 'creatorName' },
        { title: 'Назва видавника', dataIndex: 'publisherName' },
        { title: 'Ідентифікатор видавника', dataIndex: 'publisherIdentifier' },
        { title: 'Всього запитів', dataIndex: 'totalRequests' },
        { title: 'Від громадян України', dataIndex: 'citizensUkraine' },
        { title: 'Від громадських організацій', dataIndex: 'publicOrganizations' },
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

export default Index4;