import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button/Button';
import ViewCard from '../../../components/Cards/ViewCard';
import { fetchFunction } from '../../../utils/function';
import { useNotification } from '../../../hooks/useNotification';
import Loader from '../../../components/Loader/Loader';
import PageError from '../../ErrorPage/PageError';

const Index2View = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const notification = useNotification();

    const [loading, setLoading] = useState(true);
    const [data, setData] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const response = await fetchFunction(`api/opendata/2/${id}`, {
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

        if (id) {
            fetchData();
        }
    }, [id]);

    if (loading) {
        return <Loader />;
    }

    if (error) {
        return <PageError title="Помилка завантаження" statusError={error} />;
    }

    const tableData = [
        { label: 'Ідентифікатор', value: data?.identifier || 'Немає даних' },
        { label: 'Посада', value: data?.positionName || 'Немає даних' },
        { label: 'Назва підрозділу', value: data?.unitName || 'Немає даних' },
        { label: 'Значення', value: data?.value || 'Немає даних' },
    ];

    return (
        <div>
            <div className="btn-group" style={{ marginBottom: '10px' }}>
                <Button onClick={() => navigate(-1)}>Назад</Button>
                <Button
                    type="primary"
                    onClick={() => navigate(`/opendata/2/edit/${id}`)}
                >
                    Редагувати
                </Button>
            </div>
            <ViewCard data={tableData} />
        </div>
    );
};

export default Index2View;