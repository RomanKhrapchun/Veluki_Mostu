import React, {useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useNavigate} from 'react-router-dom'
import useFetch from "../../hooks/useFetch";
import Table from "../../components/common/Table/Table";
import {generateIcon, iconMap} from "../../utils/constants";
import Button from "../../components/common/Button/Button";
import PageError from "../ErrorPage/PageError";
import Pagination from "../../components/common/Pagination/Pagination";
import {useNotification} from "../../hooks/useNotification";
import {Context} from "../../main";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";

const viewIcon = generateIcon(iconMap.view)
const downloadIcon = generateIcon(iconMap.download)

const OpenDataList = () => {
    const navigate = useNavigate()
    const notification = useNotification()
    const {store} = useContext(Context)
    const [state, setState] = useState({
        sendData: {
            limit: 16,
            page: 1,
        }
    })
    
    const isFirstRun = useRef(true)
    const tableId = 'some-table-id'; // replace with actual table id
    const {error, status, data, retryFetch} = useFetch(`api/opendata/${tableId}`, {
        method: 'get'
    })

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        retryFetch()
    }, [state.sendData])

    const handleView = useCallback((id) => {
        navigate(`/opendata/${id}/view`)
    }, [navigate])

    const handleDownload = useCallback(async (id) => {
        try {
            const response = await fetchFunction(`api/opendata/${id}/download`, {
                method: 'get',
                responseType: 'blob'
            })
            const url = window.URL.createObjectURL(new Blob([response.data]))
            const link = document.createElement('a')
            link.href = url
            link.setAttribute('download', `dataset_${id}.csv`)
            document.body.appendChild(link)
            link.click()
            link.remove()
        } catch (e) {
            notification.error('Помилка при завантаженні набору даних')
        }
    }, [notification])

    const handlePageChange = (page) => {
        setState(prev => ({
            ...prev,
            sendData: {
                ...prev.sendData,
                page
            }
        }))
    }

    const columns = useMemo(() => [
        {
            title: '№',
            dataIndex: 'number',
            width: '5%',
            render: (_, __, index) => startRecord + index
        },
        {
            title: 'Назва набору даних',
            dataIndex: 'name',
            width: '30%'
        },
        {
            title: 'Опис',
            dataIndex: 'description',
            width: '30%'
        },
        {
            title: 'Дата оновлення',
            dataIndex: 'updateDate',
            width: '15%'
        },
        {
            title: 'Дії',
            dataIndex: 'action',
            width: '10%',
            render: (_, record) => (
                <div className="table-action">
                    <Button
                        type="text"
                        icon={viewIcon}
                        onClick={() => handleView(record.id)}
                    />
                    <Button
                        type="text"
                        icon={downloadIcon}
                        onClick={() => handleDownload(record.id)}
                    />
                </div>
            )
        }
    ], [handleView, handleDownload, startRecord])

    if (error) return <PageError/>

    if (status === 'loading') return <SkeletonPage/>

    return (
        <div className="page-container">
            <div className="page-container__header">
                <h1>Відкриті дані</h1>
                {store.user.access.includes('add_opendata') && (
                    <Button
                        type="primary"
                        onClick={() => navigate('/opendata/add')}
                    >
                        Додати набір даних
                    </Button>
                )}
            </div>
            <div className="page-container__content">
                <Table
                    columns={columns}
                    dataSource={data?.items || []}
                />
                <Pagination
                    currentPage={state.sendData.page}
                    totalItems={data?.totalItems || 0}
                    pageSize={state.sendData.limit}
                    onPageChange={handlePageChange}
                    showingRecords={`Показано ${startRecord}-${endRecord} з ${data?.totalItems || 0} записів`}
                />
            </div>
        </div>
    )
}

export default OpenDataList;
