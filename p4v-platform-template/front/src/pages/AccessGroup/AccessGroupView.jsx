import React, {useMemo} from 'react';
import {useParams, useNavigate} from 'react-router-dom'
import Button from "../../components/common/Button/Button";
import ViewCard from '../../components/Cards/ViewCard';
import useFetch from "../../hooks/useFetch";
import {generateIcon, iconMap, STATUS} from "../../utils/constants";
import Loader from "../../components/Loader/Loader";
import PageError from "../ErrorPage/PageError";
import Badge from "../../components/common/Badge/Badge";

const onBackIcon = generateIcon(iconMap.back)

const AccessGroupView = () => {
    const {roleId} = useParams()
    const navigate = useNavigate()
    const {error, status, data} = useFetch(`api/accessGroup/info/${roleId}`)

    const accessGroupData = useMemo(() => {
        if (typeof data === "object" && Object.keys(data).length) {
            return {
                columns: [
                    {
                        title: 'ID', dataIndex: 'id',
                    }, {
                        title: 'Назва', dataIndex: 'access_group_name',
                    }, {
                        title: 'Опис', dataIndex: 'info',
                    }, {
                        title: 'Статус',
                        dataIndex: 'enabled',
                        render: (enabled) => (<Badge caption={`${enabled ? 'Увімкнено' : 'Вимкнено'}`}
                                                     theme={`${enabled ? 'positive' : 'negative'}`}/>),
                    },
                ],
                data: data.map(el => ({
                    key: el.id,
                    id: el.id,
                    access_group_name: el.access_group_name,
                    info: el.info,
                    enabled: el.enabled,
                    permission: el.permission,
                    uid: el.uid,
                    create_date: el.create_date,
                    editor_id: el.editor_id,
                    editor_date: el.editor_date,
                }))
            }
        }
        return {columns: [], data: []};
    }, [data])

    if (status === STATUS.ERROR) {
        return <PageError statusError={error.status} title={error.message}/>
    }

    return (
        <React.Fragment>
            {status === STATUS.PENDING ? <Loader/> : null}
            {status === STATUS.SUCCESS ? (
                <React.Fragment>
                    <div className="btn-group" style={{marginBottom: '10px'}}>
                        <Button icon={onBackIcon} onClick={() => navigate('/group')}>
                            Повернутись до реєстру
                        </Button>
                    </div>

                    <ViewCard dataSource={accessGroupData.data} columns={accessGroupData.columns}/>
                </React.Fragment>
            ) : null}
        </React.Fragment>
    )
}

export default AccessGroupView;