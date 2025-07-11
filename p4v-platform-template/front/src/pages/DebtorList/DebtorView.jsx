import React, {useMemo} from 'react';
import {useParams, useNavigate} from 'react-router-dom'
import Button from "../../components/common/Button/Button";
import ViewCard from '../../components/Cards/ViewCard';
import useFetch from "../../hooks/useFetch";
import {generateIcon, iconMap, STATUS} from "../../utils/constants";
import Loader from "../../components/Loader/Loader";
import PageError from "../ErrorPage/PageError";

const onBackIcon = generateIcon(iconMap.back)
const UserView = () => {
    const {debtId} = useParams()
    const navigate = useNavigate()
    const {error, status, data} = useFetch(`api/debtor/info/${debtId}`)

    const tableData = useMemo(() => {
        if (typeof data === "object" && Object.keys(data).length) {
            return {
                columns: [
                    {
                        title: 'ID', dataIndex: 'id',
                    },
                    {
                        title: 'П.І.Б', dataIndex: 'name',
                    },
                    {
                        title: 'Дата боргу', dataIndex: 'date',
                    },
                    {
                        title: 'Нежитлова', dataIndex: 'non_residential_debt',
                    },
                    {
                        title: 'Житлова', dataIndex: 'residential_debt',
                    },
                    {
                        title: 'Податок на землю', dataIndex: 'land_debt',
                    },
                    {
                        title: 'Оренда землі', dataIndex: 'orenda_debt',
                    },
                    {
                        title: 'МПЗ', dataIndex: 'mpz',
                    },
                ],
                data: data.map(el => ({
                    key: el.id,
                    id: el.id,
                    name: el.name,
                    date: el.date,
                    non_residential_debt: el.non_residential_debt,
                    residential_debt: el.residential_debt,
                    land_debt: el.land_debt,
                    orenda_debt: el.orenda_debt,
                    mpz: el.mpz,
                }))
            }
        }
        return {columns: [], data: []};
    }, [data])

    if (status === STATUS.PENDING) {
        return <Loader/>
    }

    if (status === STATUS.ERROR) {
        return <PageError statusError={error.status} title={error.message}/>
    }

    return (
        <React.Fragment>
            {status === STATUS.SUCCESS ? (
                <React.Fragment>
                    <div className="btn-group" style={{marginBottom: '10px'}}>
                        <Button icon={onBackIcon} onClick={() => navigate('/debtor')}>
                            Повернутись до реєстру
                        </Button>
                    </div>
                    <ViewCard dataSource={tableData.data} columns={tableData.columns}/>
                </React.Fragment>
            ) : null}
        </React.Fragment>);
}
export default UserView;