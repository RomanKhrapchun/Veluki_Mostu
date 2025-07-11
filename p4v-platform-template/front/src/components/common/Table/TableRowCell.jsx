import React from 'react';

const TableRowCell = ({ item, column, rowIndex }) => {
    const renderCellContent = () => {
        // Якщо є кастомна render функція
        if (column.render && typeof column.render === 'function') {
            try {
                return column.render(item[column.dataIndex], item, rowIndex);
            } catch (error) {
                console.error('Помилка в render функції:', error);
                return item[column.dataIndex] || '';
            }
        }
        
        // Звичайне відображення значення
        const value = item[column.dataIndex];
        return value !== null && value !== undefined ? value : '';
    };

    return (
        <td>
            {renderCellContent()}
        </td>
    );
};

export default React.memo(TableRowCell);