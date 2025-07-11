import React from 'react';
import './PrintCard.css';

const PrintBillCard = ({ data }) => {
    const { account_number, payer, service_group, service_name, unit, quantity, total_price, status } = data;

    return (
        <div className="print-card">
            <h1 className="print-card__title">Рахунок №{account_number}</h1>
            <table className="print-card__table">
                <tbody>
                    <tr>
                        <td>Платник:</td>
                        <td>{payer}</td>
                    </tr>
                    <tr>
                        <td>Група послуг:</td>
                        <td>{service_group}</td>
                    </tr>
                    <tr>
                        <td>Послуга:</td>
                        <td>{service_name}</td>
                    </tr>
                    <tr>
                        <td>Одиниці:</td>
                        <td>{unit}</td>
                    </tr>
                    <tr>
                        <td>Кількість:</td>
                        <td>{quantity}</td>
                    </tr>
                    <tr>
                        <td>Сума:</td>
                        <td>{total_price} грн</td>
                    </tr>
                    <tr>
                        <td>Статус:</td>
                        <td>{status}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    );
};

export default PrintBillCard;
