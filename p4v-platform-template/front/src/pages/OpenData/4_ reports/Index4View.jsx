import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchFunction } from '../../../utils/function';
import SkeletonPage from '../../../components/common/Skeleton/SkeletonPage';
import PageError from '../../ErrorPage/PageError';
import Button from '../../../components/common/Button/Button';

const Index4View = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [data, setData] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const response = await fetchFunction(`api/opendata/4/${id}`, {
                method: 'GET',
            });

            if (response?.data) {
                setData(response.data);
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
    }, [id]);

    if (loading) {
        return <SkeletonPage />;
    }

    if (error) {
        return <PageError title="Помилка завантаження" statusError={error} />;
    }

    return (
        <div className="view-page">
            <h1>Деталі запису</h1>
            <div className="view-item">
                <strong>Ідентифікатор:</strong> {data.uid || 'Немає даних'}
            </div>
            <div className="view-item">
                <strong>Назва:</strong> {data.title || 'Немає даних'}
            </div>
            <div className="view-item">
                <strong>Дата затвердження:</strong> {data.acceptedDate || 'Немає даних'}
            </div>
            <div className="view-item">
                <strong>Дата оприлюднення:</strong> {data.issuedDate || 'Немає даних'}
            </div>
            <div className="view-item">
                <strong>Тип:</strong> {data.type || 'Немає даних'}
            </div>
            <div className="view-item">
                <strong>Посилання:</strong> <a href={data.url}>{data.url || 'Немає даних'}</a>
            </div>
            <div className="view-item">
                <strong>Текст:</strong> {data.text || 'Немає даних'}
            </div>
            <div className="view-item">
                <strong>Ім’я автора:</strong> {data.creatorName || 'Немає даних'}
            </div>
            <div className="view-item">
                <strong>Назва видавника:</strong> {data.publisherName || 'Немає даних'}
            </div>
            <div className="view-item">
                <strong>Ідентифікатор видавника:</strong> {data.publisherIdentifier || 'Немає даних'}
            </div>
            <div className="view-item">
                <strong>Всього запитів:</strong> {data.totalRequests || 'Немає даних'}
            </div>
            <div className="view-item">
                <strong>Від громадян України:</strong> {data.citizensUkraine || 'Немає даних'}
            </div>
            <div className="view-item">
                <strong>Від громадських організацій:</strong> {data.publicOrganizations || 'Немає даних'}
            </div>
            <Button onClick={() => navigate('/opendata/4')}>Назад</Button>
        </div>
    );
};

export default Index4View;