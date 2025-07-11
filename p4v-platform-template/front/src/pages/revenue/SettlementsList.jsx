
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

const SettlementsList = () => {
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
    const { error, status, data, retryFetch } = useFetch('api/revenue/settlements/filter', {
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
        navigate(`/revenue/settlements/${id}`);
    }, [navigate]);

    const handleAdd = useCallback(() => {
        navigate('/revenue/settlements/create');
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
            title: 'Населений пункт',
            dataIndex: 'settlement_name',
            width: '45%'
        },
        {
            title: 'Округ',
            dataIndex: 'district_name',
            width: '40%'
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
                return {
                    key: item.id,
                    id: item.id,
                    settlement_name: item.settlement_name,
                    district_name: item.district_name
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
                    Населені пункти
                </div>
                <Button
                    type="primary"
                    icon={addIcon}
                    onClick={handleAdd}
                >
                    Додати населений пункт
                </Button>
            </div>
            <div className="page-filter">
                <Input
                    placeholder="Пошук за назвою населеного пункту або округу"
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

export default SettlementsList;
