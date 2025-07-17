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
                            <div className="print-card__header-spacer"></div>
                            <div className="print-card__info-right">
                                <h1 className="print-card__name" style={{ 
                                    fontSize: '16px', 
                                    fontWeight: 'bold', 
                                    marginBottom: '8px',
                                    textAlign: 'right' 
                                }}>
                                    {data.name}
                                </h1>
                                <p className="print-card__id" style={{ 
                                    fontSize: '16px', 
                                    fontWeight: 'bold',
                                    marginBottom: '16px',
                                    textAlign: 'right' 
                                }}>
                                    і.к. ХХХХХХХ{data?.identification?.slice(-3) || '000'}
                                </p>
                            </div>
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

                        {/* Вступний текст - ✅ 13pt */}
                        <p style={{ 
                            textAlign: 'justify', 
                            marginBottom: '16px', 
                            lineHeight: '1.4',
                            fontSize: '13pt' // ✅ 13pt для основного тексту
                        }}>
                            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{territory_title} повідомляє, що відповідно до даних ГУ ДПС у {GU_DPS_region}, 
                            станом {formatDateUa(data.date)} у Вас наявна заборгованість до бюджету {territory_title_instrumental}, а саме:
                        </p>

                        {/* ✅ НОВА: Основна таблиця з використанням tableRows */}
                        {data.tableRows && Array.isArray(data.tableRows) && data.tableRows.length > 0 ? (
                            <div style={{ marginBottom: '20px' }}>
                                <table style={{ 
                                    width: '100%', 
                                    borderCollapse: 'collapse',
                                    border: '1px solid #000',
                                    fontSize: '11pt' // ✅ 11pt для таблиці
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '12pt' // ✅ 12pt для заголовків
                                            }}>
                                                Податкова адреса платника
                                            </th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '12pt' // ✅ 12pt для заголовків
                                            }}>
                                                Кадастровий номер
                                            </th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '12pt' // ✅ 12pt для заголовків
                                            }}>
                                                Нарахування
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {data.tableRows.map((row, index) => (
                                            <tr key={index}>
                                                <td style={{ 
                                                    border: '1px solid #000', 
                                                    padding: '8px',
                                                    verticalAlign: 'top',
                                                    fontSize: '11pt' // ✅ 11pt для даних
                                                }}>
                                                    {row.taxAddress || 'Адреса не вказана'}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #000', 
                                                    padding: '8px',
                                                    textAlign: 'center',
                                                    verticalAlign: 'top',
                                                    fontSize: '11pt' // ✅ 11pt для даних
                                                }}>
                                                    {row.cadastralNumber || ''}
                                                </td>
                                                <td style={{ 
                                                    border: '1px solid #000', 
                                                    padding: '8px',
                                                    textAlign: 'right',
                                                    verticalAlign: 'top',
                                                    fontSize: '11pt' // ✅ 11pt для даних
                                                }}>
                                                    {row.amount}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ) : data.debt && Array.isArray(data.debt) && data.debt.length > 0 ? (
                            // ✅ Fallback для старого формату
                            <div style={{ marginBottom: '20px' }}>
                                <table style={{ 
                                    width: '100%', 
                                    borderCollapse: 'collapse',
                                    border: '1px solid #000',
                                    fontSize: '11pt'
                                }}>
                                    <thead>
                                        <tr style={{ backgroundColor: '#f5f5f5' }}>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '12pt'
                                            }}>
                                                Податкова адреса платника
                                            </th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '12pt'
                                            }}>
                                                Кадастровий номер
                                            </th>
                                            <th style={{ 
                                                border: '1px solid #000', 
                                                padding: '8px', 
                                                textAlign: 'center',
                                                fontWeight: 'bold',
                                                fontSize: '12pt'
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
                                                        verticalAlign: 'top',
                                                        fontSize: '11pt'
                                                    }}>
                                                        {data.tax_address || 'Адреса не вказана'}
                                                    </td>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '8px',
                                                        textAlign: 'center',
                                                        verticalAlign: 'top',
                                                        fontSize: '11pt'
                                                    }}>
                                                        {data.cadastral_number || ''}
                                                    </td>
                                                    <td style={{ 
                                                        border: '1px solid #000', 
                                                        padding: '8px',
                                                        textAlign: 'right',
                                                        verticalAlign: 'top',
                                                        fontSize: '11pt'
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

                        {/* ✅ ОНОВЛЕНА: Підсумкова секція з правильними сумами */}
                        {(data.tableRows && data.tableRows.length > 0) || (data.debt && data.debt.length > 0) ? (
                            <div style={{ 
                                marginBottom: '20px',
                                fontSize: '13pt' // ✅ 13pt для основного тексту
                            }}>
                                {/* ✅ Заборгованість з земельного податку (ТІЛЬКИ земельний податок) */}
                                <p style={{ 
                                    margin: '8px 0 4px 0',
                                    fontSize: '13pt',
                                    lineHeight: '1.2'
                                }}>
                                    Заборгованість з земельного податку з{' '}
                                    <u>фіз. осіб</u> на суму{' '}
                                    <strong>
                                        {/* ✅ ВИКОРИСТОВУЄМО landTaxAmount з бекенду */}
                                        {data.landTaxAmount || 
                                            (() => {
                                                // Fallback: обчислюємо тільки земельний податок
                                                if (data.tableRows) {
                                                    const landTaxTotal = data.tableRows
                                                        .filter(row => row.debtType === 'land_debt')
                                                        .reduce((sum, row) => sum + parseFloat(row.amount), 0);
                                                    return landTaxTotal.toFixed(2);
                                                } else if (data.debt) {
                                                    const landTaxTotal = data.debt
                                                        .filter(item => item.debtText?.includes('земельний'))
                                                        .reduce((sum, item) => {
                                                            const match = item.debtText?.match(/(\d+[,.]?\d*)/);
                                                            return sum + (match ? parseFloat(match[1].replace(',', '.')) : 0);
                                                        }, 0);
                                                    return landTaxTotal.toFixed(2);
                                                }
                                                return '0.00';
                                            })()
                                        } грн.
                                    </strong>
                                </p>
                                
                                {/* ✅ Загальна сума (всі борги) */}
                                <p style={{ 
                                    margin: '4px 0 8px 0',
                                    fontSize: '13pt',
                                    lineHeight: '1.2'
                                }}>
                                    <strong>
                                        Загальна сума:{' '}
                                        {/* ✅ ВИКОРИСТОВУЄМО totalAmount з бекенду */}
                                        {data.totalAmount || 
                                            (() => {
                                                // Fallback: обчислюємо загальну суму всіх боргів
                                                if (data.tableRows) {
                                                    const totalSum = data.tableRows.reduce((sum, row) => 
                                                        sum + parseFloat(row.amount), 0);
                                                    return totalSum.toFixed(2);
                                                } else if (data.debt) {
                                                    const totalSum = data.debt.reduce((sum, item) => {
                                                        const match = item.debtText?.match(/(\d+[,.]?\d*)/);
                                                        return sum + (match ? parseFloat(match[1].replace(',', '.')) : 0);
                                                    }, 0);
                                                    return totalSum.toFixed(2);
                                                }
                                                return '0.00';
                                            })()
                                        } грн
                                    </strong>
                                </p>
                            </div>
                        ) : null}

                        {/* ✅ Контактна інформація з правильним розміром тексту */}
                        <div className="print-card__footer-info">
                            <p style={{ 
                                marginBottom: '12px',
                                fontSize: '13pt', // ✅ 13pt для основного тексту
                                textAlign: 'justify'
                            }}>
                                В разі виникнення питань по даній заборгованості, звертайтесь у ГУ ДПС у {GU_DPS_region} за номером телефона {phone_number_GU_DPS}.
                            </p>
                            
                            <p style={{ 
                                marginBottom: '12px',
                                fontSize: '13pt', // ✅ 13pt для основного тексту
                                textAlign: 'justify'
                            }}>
                                Просимо терміново погасити утворену Вами заборгованість до бюджету {territory_title_instrumental}. Несвоєчасна сплата суми заборгованості призведе до нарахувань штрафних санкцій та пені.
                            </p>
                            
                            <p style={{ 
                                marginBottom: '16px',
                                fontSize: '13pt', // ✅ 13pt для основного тексту
                                textAlign: 'justify'
                            }}>
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
                                textAlign: 'right', // ✅ Справа як на зразку
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