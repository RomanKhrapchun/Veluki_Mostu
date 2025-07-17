import React, { useRef } from 'react';
import Button from "../common/Button/Button.jsx";
import { useNavigate, useParams } from "react-router-dom";
import './PrintCard.css';
import logo from '../../assets/qr-code.png';
import useFetch from "../../hooks/useFetch.jsx";
import { 
    generateIcon, 
    iconMap, 
    STATUS, 
    territory_title, 
    phone_number_GU_DPS, 
    GU_DPS_region, 
    website_url, 
    alt_qr_code, 
    website_url_p4v, 
    territory_title_instrumental, 
    telegram_name, 
    telegram_url, 
    website_name 
} from "../../utils/constants.jsx";
import Loader from "../Loader/Loader.jsx";
import PageError from "../../pages/ErrorPage/PageError.jsx";
import { formatDateUa } from "../../utils/function.js";

const backIcon = generateIcon(iconMap.back);
const printIcon = generateIcon(iconMap.print);

const PrintCard = () => {
    const ref = useRef(null);
    const { debtId } = useParams();
    const navigate = useNavigate();
    const { error, status, data } = useFetch(`api/debtcharges/print/${debtId}`);

    const handlePrint = () => {
        if (ref.current) {
            ref.current.style.display = 'none';
        }
        window.print();
        if (ref.current) {
            ref.current.style.display = 'flex';
        }
    };

    if (status === STATUS.PENDING) {
        return <Loader />;
    }

    if (status === STATUS.ERROR) {
        return <div style={{ display: 'flex', justifyContent: 'center', minHeight: '100vh' }}>
            <PageError statusError={error.status} title={error.message} />
        </div>;
    }

    return (
        <React.Fragment>
            {status === STATUS.SUCCESS ? (
                <React.Fragment>
                    <div className="print-card">
                        <div className="print-card__header">
                            <div className="print-card__header-spacer"></div>
                            <div className="print-card__info-right">
                                <p className="print-card__name">{data.name}</p>
                                <p className="print-card__id">і.к. ХХХХХХХ{data?.identification}</p>
                                {/* Додаємо кадастровий номер ТІЛЬКИ якщо він є та валідний */}
                                {data?.cadastral_number && 
                                 data.cadastral_number.trim() !== '' && 
                                 !data.cadastral_number.startsWith('AUTO_') &&
                                 data.cadastral_number.length > 5 && (
                                    <p className="print-card__cadastral">Кадастровий номер: {data.cadastral_number}</p>
                                )}
                            </div>
                        </div>
                        <div className="print-card__title">Інформаційне повідомлення</div>
                        <div className="print-card__main-text">
                            <p>{territory_title} повідомляє, що відповідно до даних ГУ ДПС у {GU_DPS_region}, станом {formatDateUa(data.date)} р. у Вас наявна заборгованість до бюджету {territory_title_instrumental}, а саме:</p>
                        </div>
                        
                        {data.debt && Array.isArray(data.debt) && data.debt.length ? 
                            data.debt.map((debt, debtIndex) => (
                                <React.Fragment key={debtIndex}>
                                    {debt.map((item, itemIndex) => {
                                        // Перевіряємо, чи це земельний податок
                                        const isLandTax = item.debtText && item.debtText.includes('земельному податку');
                                        
                                        return (
                                            <div key={itemIndex} className="print-card__debt-section">
                                                {/* Текст заборгованості */}
                                                <div className="print-card__debt-text">
                                                    {(() => {
                                                        // Розділяємо текст на основну частину та податкову адресу
                                                        let mainText = item.debtText;
                                                        let taxAddress = '';
                                                        
                                                        const addressMatch = mainText.match(/Податкова адреса платника:\s*(.+)\.?$/);
                                                        if (addressMatch) {
                                                            taxAddress = addressMatch[1].trim();
                                                            mainText = mainText.replace(/\.\s*Податкова адреса платника:.*$/, '.');
                                                        }
                                                        
                                                        return (
                                                            <>
                                                                <p className="print-card__debt-main">{mainText}</p>
                                                                {/* Для земельного податку НЕ показуємо адресу тут, бо вона буде в таблиці */}
                                                                {!isLandTax && taxAddress && (
                                                                    <p className="print-card__tax-address">
                                                                        <span className="print-card__tax-label">Податкова адреса платника:</span> {taxAddress}.
                                                                    </p>
                                                                )}
                                                            </>
                                                        );
                                                    })()}
                                                </div>
                                                
                                                {/* Відображення реквізитів або таблиці залежно від типу податку */}
                                                {isLandTax ? (
                                                    // Таблиця для земельного податку
                                                    <div className="print-card__land-tax-section">
                                                        <table className="print-card__land-tax-table">
                                                            <thead>
                                                                <tr>
                                                                    <th>Платник</th>
                                                                    <th>Податкова адреса платника</th>
                                                                    <th>Кадастровий номер</th>
                                                                    <th>Нарахування</th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                <tr>
                                                                    <td>{data.name || 'Не вказано'}</td>
                                                                    <td>
                                                                        {(() => {
                                                                            // Витягуємо податкову адресу з тексту або з даних
                                                                            const addressMatch = item.debtText.match(/Податкова адреса платника:\s*(.+)\.?$/);
                                                                            if (addressMatch) {
                                                                                return addressMatch[1].trim();
                                                                            }
                                                                            return item.taxAddress || data.tax_address || 'Не вказано';
                                                                        })()}
                                                                    </td>
                                                                    <td>
                                                                        {(() => {
                                                                            // Обробляємо кадастрові номери (можуть бути через кому)
                                                                            let cadastralDisplay = 'Не вказано';
                                                                            
                                                                            if (data?.cadastral_number && data.cadastral_number.trim() !== '') {
                                                                                // Якщо є кадастрові номери - відображаємо їх
                                                                                cadastralDisplay = data.cadastral_number;
                                                                            } else if (item.cadastralNumber && item.cadastralNumber.trim() !== '') {
                                                                                // Альтернативно беремо з item
                                                                                cadastralDisplay = item.cadastralNumber;
                                                                            }
                                                                            
                                                                            return cadastralDisplay;
                                                                        })()}
                                                                    </td>
                                                                    <td>
                                                                        {(() => {
                                                                            // Витягуємо суму з тексту заборгованості
                                                                            const amountMatch = item.debtText.match(/в сумі\s+(\d+[,.]?\d*)\s+грн/);
                                                                            if (amountMatch) {
                                                                                return `${amountMatch[1]} грн`;
                                                                            }
                                                                            return item.amount || 'Не вказано';
                                                                        })()}
                                                                    </td>
                                                                </tr>
                                                            </tbody>
                                                        </table>
                                                        
                                                        {/* Реквізити для оплати під таблицею */}
                                                        <div className="print-card__requisites">
                                                            <p className="print-card__requisites-line">
                                                                <span className="print-card__requisites-label">{item.requisiteText}</span> Отримувач - {item.recipientInfo}
                                                            </p>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Звичайні реквізити в одному рядку для інших податків
                                                    <div className="print-card__requisites">
                                                        <p className="print-card__requisites-line">
                                                            <span className="print-card__requisites-label">{item.requisiteText}</span> Отримувач - {item.recipientInfo}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </React.Fragment>
                            )) : null}
                        
                        <div className="print-card__footer-info">
                            <p>
                                В разі виникнення питань по даній заборгованості, звертайтесь у ГУ ДПС у {GU_DPS_region} за номером телефона {phone_number_GU_DPS}.
                            </p>
                            <p>
                                Просимо терміново погасити утворену Вами заборгованість до бюджету {territory_title_instrumental}. Несвоєчасна сплата суми заборгованості призведе до нарахувань штрафних санкцій та пені.
                            </p>
                            <p>
                                Перевірити заборгованість можна у застосунках <a href={website_url}>«{website_name}»</a> або через чат-бот в Telegram <a href={telegram_url}>«{telegram_name}»</a>.
                            </p>
                            <p>&nbsp;</p>
                            <div className="print-card__qr-section">
                                <img src={logo} alt={alt_qr_code} className="print-card__qr-code" />
                                <div className="print-card__qr-info">
                                    <p className="print-card__qr-text">
                                        <a href={website_url_p4v} target="_blank" rel="noopener noreferrer">
                                            {website_url_p4v}
                                        </a>
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="print-card__actions" ref={ref}>
                        <Button
                            title="Назад"
                            icon={backIcon}
                            type="primary"
                            onClick={() => navigate('/debt-charges')}
                        />
                        <Button
                            title="Друк"
                            icon={printIcon}
                            type="primary"
                            onClick={handlePrint}
                        />
                    </div>
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
};

export default PrintCard;