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
    const { error, status, data } = useFetch(`api/debtor/print/${debtId}`);

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
                        {/* Заголовок з ПІБ та і.к. */}
                        <div className="print-card__header">
                            <h1 className="print-card__name" style={{ 
                                fontSize: '16px', 
                                fontWeight: 'bold', 
                                marginBottom: '8px',
                                textAlign: 'center' 
                            }}>
                                {data.name}
                            </h1>
                            <p className="print-card__id" style={{ 
                                fontSize: '14px', 
                                fontWeight: 'bold',
                                marginBottom: '16px',
                                textAlign: 'center' 
                            }}>
                                і.к. ХХХХХХХ{data?.identification?.slice(-3) || '000'}
                            </p>
                        </div>

                        {/* Назва документа */}
                        <div className="print-card__title" style={{ 
                            fontSize: '16px', 
                            fontWeight: 'bold',
                            textAlign: 'center',
                            marginBottom: '16px' 
                        }}>
                            Інформаційне повідомлення
                        </div>

                        {/* Вступний текст */}
                        <p style={{ textAlign: 'justify', marginBottom: '16px', lineHeight: '1.4' }}>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{territory_title} повідомляє, що відповідно до даних ГУ ДПС у {GU_DPS_region}, 
                            станом {formatDateUa(data.date)} у Вас наявна заборгованість до бюджету {territory_title_instrumental}, а саме:
                        </p>

                        {/* Основна таблиця з нарахуваннями */}
                        {data.debt && Array.isArray(data.debt) && data.debt.length > 0 ? (
                            <div style={{ marginBottom: '20px' }}>
                                <table style={{ 
                                    width: '100%', 
                                    borderCollapse: 'collapse',
                                    border: '1px solid #000',
                                    fontSize: '12px'
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold'
                                            }}>
                                                Податкова адреса платника
                                            </th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold'
                                            }}>
                                                Кадастровий номер
                                            </th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold'
                                            }}>
                                                Нарахування
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.debt.map((item, index) => {
                                            // Парсимо суму з debtText
                                            const amountMatch = item.debtText?.match(/(\d+[,.]?\d*)\s*грн/);
                                            const amount = amountMatch ? amountMatch[1] : '0.00';
                                            
                                            return (
                                                <tr key={index}>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '8px',
                                                        verticalAlign: 'top'
                                                    }}>
                                                        {data.tax_address || 'Адреса не вказана'}
                                                    </td>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                        verticalAlign: 'top'
                                                    }}>
                                                        {data.cadastral_number || ''}
                                                    </td>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '8px',
                                                        textAlign: 'right',
                                                        verticalAlign: 'top'
                                                    }}>
                                                        {amount}
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        ) : (
                            <p>Немає даних про заборгованість.</p>
                        )}

                        {/* Підсумкова секція */}
                        {data.debt && Array.isArray(data.debt) && data.debt.length > 0 && (
                            <div style={{ 
                                marginBottom: '20px',
                                padding: '12px',
                                backgroundColor: '#f9f9f9',
                                border: '1px solid #ddd',
                                borderRadius: '4px'
                            }}>
                                {/* Окрема заборгованість з земельного податку */}
                                <blockquote style={{ 
                                    margin: '0 0 10px 0',
                                    padding: '8px',
                                    borderLeft: '3px solid #007bff',
                                    backgroundColor: '#fff'
                                }}>
                                    Заборгованість з земельного податку з фіз. осіб на суму{' '}
                                    <strong>
                                        {(() => {
                                            // Обчислюємо загальну суму земельного податку
                                            const landTaxTotal = data.debt
                                                .filter(item => item.debtText?.includes('земельний'))
                                                .reduce((sum, item) => {
                                                    const match = item.debtText?.match(/(\d+[,.]?\d*)/);
                                                    return sum + (match ? parseFloat(match[1].replace(',', '.')) : 0);
                                                }, 0);
                                            return landTaxTotal.toFixed(2);
                                        })()} грн.
                                    </strong>
                                    <br />
                                    <strong>
                                        Загальна сума:{' '}
                                        {(() => {
                                            // Обчислюємо загальну суму всіх боргів
                                            const totalSum = data.debt.reduce((sum, item) => {
                                                const match = item.debtText?.match(/(\d+[,.]?\d*)/);
                                                return sum + (match ? parseFloat(match[1].replace(',', '.')) : 0);
                                            }, 0);
                                            return totalSum.toFixed(2).replace('.', ',');
                                        })()} грн
                                    </strong>
                                </blockquote>
                            </div>
                        )}

                        {/* Контактна інформація */}
                        <div className="print-card__footer-info">
                            <p style={{ marginBottom: '12px' }}>
                                В разі виникнення питань по даній заборгованості, звертайтесь у ГУ ДПС у {GU_DPS_region} за номером телефона {phone_number_GU_DPS}.
                            </p>
                            
                            <p style={{ marginBottom: '12px' }}>
                                Просимо терміново погасити утворену Вами заборгованість до бюджету {territory_title_instrumental}. Несвоєчасна сплата суми заборгованості призведе до нарахувань штрафних санкцій та пені.
                            </p>
                            
                            <p style={{ marginBottom: '16px' }}>
                                Перевірити заборгованість можна у застосунках{' '}
                                <a href={website_url} target="_blank" rel="noopener noreferrer">
                                    «{website_name}»
                                </a>{' '}
                                або через чат-бот в Telegram{' '}
                                <a href={telegram_url} target="_blank" rel="noopener noreferrer">
                                    «{telegram_name}»
                                </a>.
                                Вони дозволяють отримати актуальну інформацію щодо стану вашої заборгованості та оплатити її онлайн за допомогою QR-коду, що розміщений нижче.
                            </p>
                            
                            {/* QR-код */}
                            <div className="print-card__qr-section" style={{ 
                                textAlign: 'center',
                                marginTop: '20px'
                            }}>
                                <img 
                                    src={logo} 
                                    alt={alt_qr_code} 
                                    className="print-card__qr-code"
                                    style={{ 
                                        width: '120px',
                                        height: '120px',
                                        border: '1px solid #ddd'
                                    }}
                                />
                                <div className="print-card__qr-info">
                                    <p className="print-card__qr-text" style={{ 
                                        fontSize: '12px',
                                        marginTop: '8px'
                                    }}>
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
                            onClick={() => navigate('/debtor')}
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