import React from 'react';

const TableHeader = ({columns}) => {
    const getSortHint = (column) => {
        if (!column.sortable) return '';
        
        // Якщо колонка активна, показуємо поточний напрямок
        if (column.sortIcon) {
            const isDesc = column.headerClassName?.includes('active');
            return isDesc ? 'Клікніть для сортування за зростанням' : 'Клікніть для сортування за спаданням';
        }
        
        // Для неактивних колонок
        return 'Клікніть для сортування';
    };

    return (
        <tr>
            {columns.map((column, index) => (
                <th 
                    key={index}
                    onClick={column.sortable ? column.onHeaderClick : undefined}
                    className={`${column.sortable ? 'sortable-header' : ''} ${column.headerClassName || ''}`}
                    data-sort-hint={getSortHint(column)}
                    title={column.sortable ? getSortHint(column) : ''}
                    style={{
                        cursor: column.sortable ? 'pointer' : 'default',
                        userSelect: 'none',
                        position: 'relative',
                        ...(column.headerStyle || {})
                    }}
                >
                    <div className="header-content">
                        <span>{column.title}</span>
                        {column.sortable && (
                            <span className="sort-icon-wrapper">
                                {column.sortIcon}
                            </span>
                        )}
                    </div>
                </th>
            ))}
        </tr>
    );
};
    
    export default React.memo(TableHeader);