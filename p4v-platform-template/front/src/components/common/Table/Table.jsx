import React from 'react';
import TableHeader from "./TableHeader";
import TableRow from "./TableRow";
const Table = ({columns, dataSource}) => {

    return (
        <React.Fragment>
            {Array.isArray(columns) && Array.isArray(dataSource) && columns.length > 0  ? (
                <div className="table-wrapper">
                    <table className="table" style={{width: '100%'}}>
                        <thead>
                        <TableHeader columns={columns}/>
                        </thead>
                        <tbody>
                        <TableRow data={dataSource} columns={columns}/>
                        </tbody>
                    </table>
                </div>
            ) : null}
        </React.Fragment>
    )
};

export default React.memo(Table);