import React from 'react';
import {formatDate} from "../../utils/constants";
import InfoEditCard from "./InfoEditCard";
import EmptyCard from "./EmptyCard";

const ViewCard = ({dataSource = [], columns = []}) => {

    if (!Array.isArray(columns) || !Array.isArray(dataSource) || columns.length === 0 || dataSource.length === 0) {
        return <EmptyCard/>;
    }

    return (
        <React.Fragment>
            <div className={"table-container"}>
                <div className="table-elements">
                    <div className="table-main">
                        <div className="table-wrapper">
                            <table className="table table--alt">
                                <caption className="table__caption">
                                    Основна інформація
                                </caption>
                                <tbody>
                                {columns.map((item, index) => {
                                    const value = item?.dataIndex ? dataSource[0][item.dataIndex] : null;
                                    return <tr key={index}>
                                        <td>{item?.title}</td>
                                        <td>{(value !== null || value === undefined) && item?.render ? item.render(value) : value}</td>
                                    </tr>
                                })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
                {(dataSource[0]?.create_date || dataSource[0]?.uid ||
                        dataSource[0]?.editor_id || dataSource[0]?.editor_date) &&
                    <InfoEditCard
                        createUser={dataSource[0]?.uid}
                        create_date={dataSource[0]?.create_date ? formatDate(dataSource[0].create_date, ' - ') : ''}
                        editUser={dataSource[0]?.editor_id}
                        editDate={dataSource[0]?.editor_date ? formatDate(dataSource[0].editor_date, ' - ') : ''}/>
                }
            </div>
        </React.Fragment>
    );
};

export default ViewCard;
