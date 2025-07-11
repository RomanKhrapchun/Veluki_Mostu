import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch';
import ViewCard from '../../../components/Cards/ViewCard';
import Loader from '../../../components/Loader/Loader';
import PageError from '../../ErrorPage/PageError';
import Button from '../../../components/common/Button/Button';
import { generateIcon, iconMap } from '../../../utils/constants';

const backIcon = generateIcon(iconMap.back);
const editIcon = generateIcon(iconMap.edit);

const Index3View = () => {
    const { id } = useParams(); 
    const navigate = useNavigate();
    const { data, status, error } = useFetch(`api/opendata/3/${id}`);

    if (status === 'loading') {
        return <Loader />;
    }

    if (status === 'error') {
        return <PageError title="Помилка завантаження" statusError={error?.status} />;
    }

    return (
        <div>
            <div className="btn-group" style={{ marginBottom: '10px' }}>
                <Button icon={backIcon} onClick={() => navigate(-1)}>
                    Назад
                </Button>
                <Button icon={editIcon} onClick={() => navigate(`/opendata/3/edit/${id}`)}>
                    Редагувати
                </Button>
            </div>
            <ViewCard
                dataSource={[
                    { label: 'UID', value: data.uid },
                    { label: 'Назва', value: data.title },
                    { label: 'Дійсний з', value: data.validFrom },
                    { label: 'Дійсний до', value: data.validThrough },
                    { label: 'URL', value: data.url },
                    { label: 'Текст', value: data.text },
                    { label: 'ID правового акту', value: data.legalActId },
                    { label: 'Тип правового акту', value: data.legalActType },
                    { label: 'Назва правового акту', value: data.legalActTitle },
                    { label: 'Дата прийняття правового акту', value: data.legalActDateAccepted },
                    { label: 'Номер правового акту', value: data.legalActNum },
                    { label: 'Назва видавця', value: data.publisherName },
                    { label: 'Ідентифікатор видавця', value: data.publisherIdentifier },
                ]}
            />
        </div>
    );
};

export default Index3View;