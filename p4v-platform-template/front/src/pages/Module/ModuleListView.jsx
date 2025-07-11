import React, {useMemo} from 'react';
import {useParams, useNavigate} from 'react-router-dom'
import Button from "../../components/common/Button/Button";
import ViewCard from '../../components/Cards/ViewCard';
import useFetch from "../../hooks/useFetch";
import {generateIcon, iconMap, STATUS} from "../../utils/constants";
import Loader from "../../components/Loader/Loader";
import PageError from "../ErrorPage/PageError";

const onBackIcon = generateIcon(iconMap.back)
const ModuleListView = () => {
    const {moduleId} = useParams()
    const navigate = useNavigate()
    const {error, status, data} = useFetch(`api/module/info/${moduleId}`)

    const tableData = useMemo(() => {
        if (typeof data === "object" && Object.keys(data).length) {
            return {
                columns: [
                    {
                        title: 'ID', dataIndex: 'module_id',
                    },
                    {
                        title: 'Код', dataIndex: 'module',
                    },
                    {
                        title: 'Назва модуля', dataIndex: 'module_name',
                    },
                    {
                        title: 'Версія', dataIndex: 'install_version',
                    },
                    {
                        title: 'Автор', dataIndex: 'author',
                    },
                    {
                        title: 'Порядок', dataIndex: 'ord',
                    },
                    {
                        title: 'Схема', dataIndex: 'schema_name',
                    },
                    {
                        title: 'Попередня версія', dataIndex: 'prev_version',
                    },
                    {
                        title: 'Остання версія', dataIndex: 'last_version',
                    },
                ],
                data: data.map(el => ({
                    key: el.module_id,
                    module_id: el.module_id,
                    module: el.module,
                    module_name: el.module_name,
                    install_version: el.install_version,
                    author: el.author,
                    ord: el.ord,
                    schema_name: el.schema_name,
                    prev_version: el.prev_version,
                    last_version: el.last_version,
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
                        <Button icon={onBackIcon} onClick={() => navigate('/modules')}>
                            Повернутись до реєстру
                        </Button>
                    </div>
                    <ViewCard dataSource={tableData.data} columns={tableData.columns}/>
                </React.Fragment>
            ) : null}
        </React.Fragment>);
}
export default ModuleListView;