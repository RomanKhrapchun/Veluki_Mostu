
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../main';
import { generateIcon, iconMap, STATUS } from '../../utils/constants';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Table from '../../components/common/Table/Table';
import useFetch from "../../hooks/useFetch";
import PageError from "../ErrorPage/PageError";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";

// Icons definition
const viewIcon = generateIcon(iconMap.view)
const addIcon = generateIcon(iconMap.plus)
const searchIcon = generateIcon(iconMap.search, 'input-icon')

const PayerTypesList = () => {
    const navigate = useNavigate();
    const { store } = useContext(Context);
    const [state, setState] = useState({
        sendData: {
            limit: 10,
            page: 1,
            search: ''
        }
    });

    const isFirstRun = useRef(true);
    const { error, status, data, retryFetch } = useFetch('api/revenue/payer-types/filter', {
        method: 'post',
        data: state.sendData
    });

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        retryFetch();
    }, [state.sendData]);

    const handleView = useCallback((id) => {
        navigate(`/revenue/payer-types/${id}`);
    }, [navigate]);

    const handleAdd = useCallback(() => {
        navigate('/revenue/payer-types/create');
    }, [navigate]);

    const handleSearch = useCallback((_, value) => {
        setState(prev => ({
            ...prev,
            sendData: {
                ...prev.sendData,
                page: 1,
                search: value
            }
        }));
    }, []);

    const handlePageChange = (page) => {
        setState(prev => ({
            ...prev,
            sendData: {
                ...prev.sendData,
                page
            }
        }));
    };

    const columns = useMemo(() => [
        {
            title: '№',
            dataIndex: 'id',
            width: '5%'
        },
        {
            title: 'Тип платника',
            dataIndex: 'type_name',
            width: '55%'
        },
        {
            title: 'Дата створення',
            dataIndex: 'created_at',
            width: '20%'
        },
        {
            title: 'Дії',
            width: '10%',
            render: (_, record) => (
                <div className="btn-sticky" style={{ justifyContent: 'center' }}>
                    <Button
                        type="text"
                        title="Перегляд"
                        icon={viewIcon}
                        onClick={() => handleView(record.id)}
                    />
                </div>
            )
        }
    ], [handleView]);

    const tableData = useMemo(() => {
        if (data?.items?.length) {
            return data.items.map(item => {
                // Форматуємо дату
                const date = new Date(item.created_at);
                const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
                
                return {
                    key: item.id,
                    id: item.id,
                    type_name: item.type_name,
                    created_at: formattedDate
                };
            });
        }
        return [];
    }, [data]);

    if (status === STATUS.ERROR) {
        return <PageError title={error.message} statusError={error.status} />;
    }

    if (status === STATUS.LOADING) {
        return <SkeletonPage />;
    }

    return (
        <div className="page-container">
            <div className="page-container__header">
                <div className="page-container__title">
                    Типи платників
                </div>
                <Button
                    type="primary"
                    icon={addIcon}
                    onClick={handleAdd}
                >
                    Додати тип платника
                </Button>
            </div>
            <div className="page-filter">
                <Input
                    placeholder="Пошук за типом платника"
                    value={state.sendData.search}
                    onChange={handleSearch}
                    icon={searchIcon}
                />
            </div>
            <div className="page-container__content">
                <Table
                    columns={columns}
                    dataSource={tableData}
                    pagination={{
                        current: state.sendData.page,
                        pageSize: state.sendData.limit,
                        total: data?.totalItems || 0,
                        onChange: handlePageChange
                    }}
                />
            </div>
        </div>
    );
};

export default PayerTypesList;
