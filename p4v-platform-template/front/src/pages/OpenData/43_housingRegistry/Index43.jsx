import React, { useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../../main';
import Table from '../../../components/common/Table/Table';
import { fetchFunction } from '../../../utils/function';
import {generateIcon, iconMap} from "../../../utils/constants";
import { useNotification } from '../../../hooks/useNotification';
import Button from '../../../components/common/Button/Button';
import Input from '../../../components/common/Input/Input';
import SkeletonPage from '../../../components/common/Skeleton/SkeletonPage';

const viewIcon = generateIcon(iconMap.view)
const editIcon = generateIcon(iconMap.edit)
const deleteIcon = generateIcon(iconMap.delete)

const Index43 = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState({ items: [], totalItems: 0 });
    const [error, setError] = useState(null);
    const [search, setSearch] = useState('');
    const [pagination, setPagination] = useState({
        limit: 10,
        page: 1
    });

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetchFunction('api/opendata/43', {
                method: 'POST',
                data: { search, ...pagination }
            });

            if (response?.data) {
                setData({
                    items: response.data,
                    totalItems: response.data.length
                });
            } else {
                throw new Error('Очікується масив даних у полі response.data.');
            }
        } catch (error) {
            setError(error);
            notification({
                type: 'error',
                message: 'Помилка при завантаженні даних: ' + error.message
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [search, pagination]);

    const handleView = useCallback((id) => {
        navigate(`/opendata/43/view/${id}`);
    }, [navigate]);

    const handleEdit = useCallback((id) => {
        navigate(`/opendata/43/edit/${id}`);
    }, [navigate]);

    const handleDelete = useCallback((id) => {
        // Add your delete logic here
        notification({
            type: 'info',
            message: `Видалення запису з ID: ${id}`
        });
    }, [notification]);

    const handleSearch = useCallback((_, value) => {
        setSearch(value);
        setPagination((prev) => ({ ...prev, page: 1 }));
    }, []);

    const handlePageChange = (page) => {
        setPagination((prev) => ({ ...prev, page }));
    };

    const columns = useMemo(() => [
        {
            title: 'ID',
            dataIndex: 'id',
            width: '5%'
        },
        {
            title: 'Прізвище',
            dataIndex: 'familyName',
            width: '15%'
        },
        {
            title: 'Ім\'я',
            dataIndex: 'name',
            width: '15%'
        },
        {
            title: 'По-батькові',
            dataIndex: 'additionalName',
            width: '15%'
        },
        {
            title: 'Склад сім\'ї',
            dataIndex: 'familyStructure',
            width: '10%'
        },
        {
            title: 'Дата подання заяви',
            dataIndex: 'recordDecisionDate',
            width: '10%'
        },
        {
            title: 'Номер рішення про взяття на облік',
            dataIndex: 'recordDecisionNumber',
            width: '15%'
        },
        {
            title: 'Дата рішення',
            dataIndex: 'decisionDate',
            width: '10%'
        },
        {
            title: 'Дата включення до списку першочерговиків',
            dataIndex: 'priorityDecisionDate',
            width: '15%'
        },
        {
            title: 'Номер включення до списку першочерговиків',
            dataIndex: 'priorityDecisionNumber',
            width: '15%'
        },
        {
            title: 'Дата надання житлового приміщення',
            dataIndex: 'provisionDecisionDate',
            width: '15%'
        },
        {
            title: 'Номер надання житлового приміщення',
            dataIndex: 'provisionDecisionNumber',
            width: '15%'
        },
        {
            title: 'Дата зняття з обліку',
            dataIndex: 'exclusionDecisionDate',
            width: '15%'
        },
        {
            title: 'Номер зняття з обліку',
            dataIndex: 'exclusionDecisionNumber',
            width: '15%'
        },
        {
            title: 'Дії',
            dataIndex: 'actions',
            width: '10%',
            render: (_, { id }) => (
                <div className="btn-sticky" style={{ justifyContent: 'center' }}>
                    <Button
                        title="Перегляд"
                        icon={viewIcon}
                        onClick={() => handleView(id)}
                    />
                    <Button
                        title="Редагувати"
                        icon={editIcon}
                        onClick={() => handleEdit(id)}
                    />
                    <Button
                        title="Видалити"
                        icon={deleteIcon}
                        onClick={() => handleDelete(id)}
                    />
                </div>
            )
        }
    ], [handleView, handleEdit, handleDelete]);

    const tableData = useMemo(() => {
        if (data?.items?.length) {
            return data.items.map((item) => {
                const formatDate = (date) => {
                    if (!date) return 'Немає даних';
                    const d = new Date(date);
                    return `${d.getDate().toString().padStart(2, '0')}.${(d.getMonth() + 1).toString().padStart(2, '0')}.${d.getFullYear()}`;
                };

                return {
                    ...item,
                    recordDecisionDate: formatDate(item.recordDecisionDate),
                    decisionDate: formatDate(item.decisionDate),
                    priorityDecisionDate: formatDate(item.priorityDecisionDate),
                    provisionDecisionDate: formatDate(item.provisionDecisionDate),
                    exclusionDecisionDate: formatDate(item.exclusionDecisionDate),
                    recordDecisionNumber: item.recordDecisionNumber || 'Немає даних',
                    priorityDecisionNumber: item.priorityDecisionNumber || 'Немає даних',
                    provisionDecisionNumber: item.provisionDecisionNumber || 'Немає даних',
                    exclusionDecisionNumber: item.exclusionDecisionNumber || 'Немає даних'
                };
            });
        }
        return [];
    }, [data]);

    if (loading) return <SkeletonPage />;
    if (error) return <div>Error: {error.message}</div>;

    return (
        <div className="open-data">
            <div className="page-container__header">
                <h1>Відкриті дані</h1>
            </div>
            <div className="page-filter">
                <Input
                    placeholder="Пошук за прізвищем або ідентифікатором"
                    value={search}
                    onChange={handleSearch}
                />
            </div>
            <div className="page-container__content">
                <Table
                    columns={columns}
                    dataSource={tableData}
                    pagination={{
                        current: pagination.page,
                        pageSize: pagination.limit,
                        total: data.totalItems,
                        onChange: handlePageChange
                    }}
                />
            </div>
        </div>
    );
};

export default Index43;
