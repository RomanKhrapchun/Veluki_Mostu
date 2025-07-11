import React from 'react';
import TableRowCell from "./TableRowCell";

const style = { textAlign: 'center' };

const TableRow = ({ data, columns }) => {
    return (
        <>
            {data?.length > 0
                ? (data.map((item, rowIndex) => {
                    if (!item) return null;
                    return (
                        <tr key={item.key || item.id || rowIndex}>
                            {columns.map((column, colIndex) => {
                                if (!column) return null;
                                return (
                                    <TableRowCell 
                                        key={`${item.key || item.id}-${column.dataIndex || colIndex}`} 
                                        item={item} 
                                        column={column}
                                        rowIndex={rowIndex}
                                    />
                                );
                            })}
                        </tr>
                    );
                }))
                : (
                    <tr>
                        <td colSpan={columns.length} style={style}>
                            Відсутні дані
                        </td>
                    </tr>
                )
            }
        </>
    );
};

export default TableRow;