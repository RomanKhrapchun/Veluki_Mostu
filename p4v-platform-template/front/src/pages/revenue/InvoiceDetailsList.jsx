
import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../main';
import { generateIcon, iconMap, STATUS } from '../../utils/constants';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Table from '../../components/common/Table/Table';
import Pagination from '../../components/common/Pagination/Pagination';
import useFetch from "../../hooks/useFetch";
import PageError from "../ErrorPage/PageError";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";

// Icons definition
const viewIcon = generateIcon(iconMap.view)
const addIcon = generateIcon(iconMap.plus)
const searchIcon = generateIcon(iconMap.search, 'input-icon')

const InvoiceDetailsList = () => {
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
    const { error, status, data, retryFetch } = useFetch('api/revenue/invoice-details/filter', {
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
        navigate(`/revenue/details/${id}`);
    }, [navigate]);

    const handleAdd = useCallback(() => {
        navigate('/revenue/details/create');
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

    const handlePageChange = useCallback((page) => {
        setState(prev => ({
            ...prev,
            sendData: {
                ...prev.sendData,
                page
            }
        }));
    }, []);

    const columns = useMemo(() => [
        {
            title: '№',
            dataIndex: 'id',
            width: '3%'
        },
        {
            title: 'ЄДРПОУ програми',
            dataIndex: 'program_edrpou',
            width: '8%'
        },
        {
            title: 'Дата рахунку',
            dataIndex: 'invoice_date',
            width: '6%'
        },
        {
            title: 'ЄДРПОУ',
            dataIndex: 'edrpou',
            width: '6%'
        },
        {
            title: 'Платник',
            dataIndex: 'payer_name',
            width: '10%'
        },
        {
            title: 'Дебіт',
            dataIndex: 'debit',
            width: '5%'
        },
        {
            title: 'Призначення платежу',
            dataIndex: 'payment_purpose',
            width: '12%'
        },
        {
            title: 'Рахунок',
            dataIndex: 'account',
            width: '5%'
        },
        {
            title: 'Рік',
            dataIndex: 'year',
            width: '4%'
        },
        {
            title: 'Місяць',
            dataIndex: 'month',
            width: '5%'
        },
        {
            title: 'Район',
            dataIndex: 'district_name',
            width: '8%'
        },
        {
            title: 'Населений пункт',
            dataIndex: 'settlement_name',
            width: '8%'
        },
        {
            title: 'Код класифікації',
            dataIndex: 'classification_code',
            width: '7%'
        },
        {
            title: 'Назва класифікації',
            dataIndex: 'classification_name',
            width: '7%'
        },
        {
            title: 'Дії',
            width: '5%',
            render: (_, record) => (
                <div className="btn-sticky" style={{ justifyContent: 'center' }}>
                    <Button
                        type="text"
                        title="Перегляд"
                        icon={viewIcon}
                        onClick={() => handleView(record.id)}
                    />
                </div>
            ),
            fixed: 'right'
        }
    ], [handleView]);

    const tableData = useMemo(() => {
        if (data?.items?.length) {
            return data.items.map(item => {
                // Форматуємо дату
                const date = new Date(item.invoice_date);
                const formattedDate = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getFullYear()}`;
                
                // Форматуємо числові значення
                const debit = parseFloat(item.debit);
                const formattedDebit = isNaN(debit) ? '0.00' : debit.toFixed(2);
                
                return {
                    key: item.id,
                    id: item.id,
                    program_edrpou: item.program_edrpou,
                    invoice_date: formattedDate,
                    edrpou: item.edrpou,
                    payer_name: item.payer_name,
                    debit: formattedDebit,
                    payment_purpose: item.payment_purpose,
                    account: item.account,
                    year: item.year,
                    month: item.month,
                    district_name: item.district_name,
                    settlement_name: item.settlement_name,
                    classification_code: item.classification_code,
                    classification_name: item.classification_name
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
                    Деталі рахунків
                </div>
                <Button
                    type="primary"
                    icon={addIcon}
                    onClick={handleAdd}
                >
                    Додати запис
                </Button>
            </div>
            <div className="page-filter">
                <Input
                    placeholder="Пошук за кодом або назвою"
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
                    scroll={{ x: 1500 }}
                />
            </div>
        </div>
    );
};

export default InvoiceDetailsList;
