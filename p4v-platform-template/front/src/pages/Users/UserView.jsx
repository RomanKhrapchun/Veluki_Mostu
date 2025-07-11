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
const UserView = () => {
    const {userId} = useParams()
    const navigate = useNavigate()
    const {error, status, data} = useFetch(`api/users/info/${userId}`)

    const tableData = useMemo(() => {
        if (typeof data === "object" && Object.keys(data).length) {
            return {
                columns: [
                    {
                        title: 'ID', dataIndex: 'users_id',
                    }, {
                        title: 'Логін', dataIndex: 'username',
                    }, {
                        title: 'Ім\'я', dataIndex: 'first_name',
                    }, {
                        title: 'Прізвище', dataIndex: 'last_name',
                    }, {
                        title: 'По-батькові', dataIndex: 'middle_name',
                    }, {
                        title: 'Електронна скринька', dataIndex: 'email',
                    }, {
                        title: 'Номер телефону', dataIndex: 'phone',
                    }, {
                        title: 'Статус активації',
                        dataIndex: 'is_active',
                        render: (is_active) => (<Badge caption={`${is_active ? 'Так' : 'Ні'}`}
                                                       theme={`${is_active ? 'positive' : 'negative'}`}/>),
                    },  {
                        title: 'Ip-адреса', dataIndex: 'ip_address',
                    },
                ],
                data: data.map(el => ({
                    key: el.users_id,
                    users_id: el.users_id,
                    username: el.username,
                    first_name: el.first_name,
                    last_name: el.last_name,
                    middle_name: el.middle_name,
                    email: el.email,
                    phone: el.phone,
                    is_active: el.is_active,
                    ip_address: el.ip_address,
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
                        <Button icon={onBackIcon} onClick={() => navigate('/user')}>
                            Повернутись до реєстру
                        </Button>
                    </div>
                    <ViewCard dataSource={tableData.data} columns={tableData.columns}/>
                </React.Fragment>
            ) : null}
        </React.Fragment>);
}
export default UserView;