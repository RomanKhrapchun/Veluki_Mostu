import React from 'react';
import {useParams, useNavigate} from 'react-router-dom'
import useFetch from "../../hooks/useFetch";
import Loader from "../../components/Loader/Loader";
import PageError from "../ErrorPage/PageError";
import Button from "../../components/common/Button/Button";
import {generateIcon, iconMap, formatDate, STATUS, noDataAvailable, operationsItem} from "../../utils/constants";
import Badge from "../../components/common/Badge/Badge";

const onBackIcon = generateIcon(iconMap.back)

const LogView = () => {
    const {id} = useParams()
    const navigate = useNavigate()
    const {data, status, error} = useFetch(`api/log/${id}`, {
        method: 'get',
    })

    if (status === STATUS.ERROR) {
        return <PageError statusError={error.status} title={error.message}/>
    }

    return (
        <React.Fragment>
            {status === STATUS.PENDING ? <Loader/> : null}
            {status === STATUS.SUCCESS ? (
                <React.Fragment>
                    <div className="btn-group" style={{marginBottom: '10px'}}>
                        <Button icon={onBackIcon} onClick={() => navigate('/logs')}>
                            Повернутись до реєстру
                        </Button>
                    </div>
                    <div className="table-elements">
                        <div className="table-main">
                            <div className="table-wrapper">
                                <table className="table table--alt">
                                    <caption className="table__caption">
                                        Основна інформація
                                    </caption>
                                    <tbody>
                                    <tr>
                                        <td>Операція</td>
                                        <td>
                                            {data[0]?.action ? (
                                                (() => {
                                                    const operation = operationsItem.find(item => item.value === data[0].action);
                                                    return (
                                                        <Badge
                                                            caption={operation ? operation.label : "Невідома операція"}
                                                            theme={data[0].action === 'DELETE' ? "negative" : "positive"}
                                                        />
                                                    );
                                                })()
                                            ) : noDataAvailable}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Таблиця</td>
                                        <td>
                                            {data[0]?.['schema_name'] && data[0]?.['schema_name'] ?
                                                `${data[0]?.['schema_name']}.${data[0]?.['table_name']}`: noDataAvailable}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Ім&apos;я користувача сесії</td>
                                        <td>
                                            {data[0]?.['session_user_name'] ?? noDataAvailable}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Адреса віддаленого підключення</td>
                                        <td>
                                            {data[0]?.['client_addr'] ?? noDataAvailable}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Порт віддаленого підключення</td>
                                        <td>
                                            {data[0]?.['client_port'] ?? noDataAvailable}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Назва підключення</td>
                                        <td>
                                            {data[0]?.['application_name'] ?? noDataAvailable}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Ідентифікатор транзакції</td>
                                        <td>
                                            {data[0]?.['transaction_id'] ?? noDataAvailable}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Дата і година на початок транзакції</td>
                                        <td>
                                            {data[0]?.['action_stamp_tx'] ? formatDate(data[0]['action_stamp_tx']) : noDataAvailable}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>Змінені колонки</td>
                                        <td>
                                            {data[0]?.['changed_fields'] && data[0]['changed_fields'].join(',')}
                                        </td>
                                    </tr>
                                    <tr>
                                        <td>ID об&apos;єкту</td>
                                        <td>
                                            {data[0]?.['row_pk_id'] ?? noDataAvailable}
                                        </td>
                                    </tr>
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
}
export default LogView;