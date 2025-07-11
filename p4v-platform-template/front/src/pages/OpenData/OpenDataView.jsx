import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { generateIcon, iconMap } from '../../utils/constants';
import Button from '../../components/common/Button/Button';
import PageError from '../ErrorPage/PageError';
import SkeletonPage from '../../components/common/Skeleton/SkeletonPage';

const backIcon = generateIcon(iconMap.back)
const downloadIcon = generateIcon(iconMap.download)

const OpenDataView = () => {
    const navigate = useNavigate()
    const { id } = useParams()
    const { error, status, data } = useFetch(`api/opendata/${id}`, {
        method: 'get'
    })

    const handleBack = useCallback(() => {
        navigate('/opendata')
    }, [navigate])

    const handleDownload = useCallback(async () => {
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
    }, [id])

    if (error) return <PageError />

    if (status === 'loading') return <SkeletonPage />

    return (
        <div className="page-container">
            <div className="page-container__header">
                <Button
                    type="text"
                    icon={backIcon}
                    onClick={handleBack}
                >
                    Назад
                </Button>
                <Button
                    type="primary"
                    icon={downloadIcon}
                    onClick={handleDownload}
                >
                    Завантажити
                </Button>
            </div>
            <div className="page-container__content">
                <div className="view-container">
                    <div className="view-container__item">
                        <div className="view-container__label">Назва набору даних:</div>
                        <div className="view-container__value">{data?.name}</div>
                    </div>
                    <div className="view-container__item">
                        <div className="view-container__label">Опис:</div>
                        <div className="view-container__value">{data?.description}</div>
                    </div>
                    <div className="view-container__item">
                        <div className="view-container__label">Дата оновлення:</div>
                        <div className="view-container__value">{data?.updateDate}</div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default OpenDataView;
