import React, {useMemo} from 'react';
import {useParams, useNavigate} from 'react-router-dom'
import Button from "../../components/common/Button/Button";
import ViewCard from '../../components/Cards/ViewCard';
import useFetch from "../../hooks/useFetch";
import {generateIcon, iconMap, STATUS} from "../../utils/constants";
import Loader from "../../components/Loader/Loader";
import PageError from "../ErrorPage/PageError";

const onBackIcon = generateIcon(iconMap.back)
const RegistryListView = () => {
    const {registryId} = useParams()
    const navigate = useNavigate()
    const {error, status, data} = useFetch(`api/module/registry/${registryId}`)

    const tableData = useMemo(() => {
        if (typeof data === "object" && Object.keys(data).length) {
            return {
                columns: [
                    {
                        title: 'ID', dataIndex: 'doct_id',
                    },
                    {
                        title: 'Код', dataIndex: 'title',
                    },
                    {
                        title: 'Назва реєстру', dataIndex: 'name',
                    },
                    {
                        title: 'ID модуля', dataIndex: 'module',
                    },
                    {
                        title: 'Опис', dataIndex: 'info',
                    },
                    {
                        title: 'Порядок', dataIndex: 'ord',
                    },
                ],
                data: data.map(el => ({
                    key: el.doct_id,
                    doct_id: el.doct_id,
                    module: el.module,
                    title: el.title,
                    name: el.name,
                    info: el.info,
                    ord: el.ord,
                    enabled: el.enabled,
                    uid: el.uid,
                    create_date: el.create_date,
                    editor_id: el.editor_id,
                    editor_date: el.editor_date,
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
                        <Button icon={onBackIcon} onClick={() => navigate('/registry')}>
                            Повернутись до реєстру
                        </Button>
                    </div>
                    <ViewCard dataSource={tableData.data} columns={tableData.columns}/>
                </React.Fragment>
            ) : null}
        </React.Fragment>);
}
export default RegistryListView;