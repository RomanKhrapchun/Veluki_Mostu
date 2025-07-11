import React, {useRef} from 'react';
import Button from "../common/Button/Button.jsx";
import {useNavigate, useParams} from "react-router-dom";
import './PrintCard.css'
import logo from '../../assets/qr-code.png'
import useFetch from "../../hooks/useFetch.jsx";
import {
    alt_qr_code,
    generateIcon,
    iconMap,
    phone_number_GU_DPS,
    GU_DPS_region,
    STATUS, telegram_name, telegram_url,
    territory_title,
    territory_title_instrumental, website_name, website_url
} from "../../utils/constants.jsx";
import Loader from "../Loader/Loader.jsx";
import PageError from "../../pages/ErrorPage/PageError.jsx";
import {formatDateUa} from "../../utils/function.js";
const backIcon = generateIcon(iconMap.back)
const printIcon = generateIcon(iconMap.print)

const PrintCard = () => {
    const ref = useRef(null)
    const {debtId} = useParams()
    const navigate = useNavigate()
    const {error, status, data} = useFetch(`api/debtor/print/${debtId}`)
    const handlePrint = () => {
        if(ref.current) {
            ref.current.style.display = 'none';
        }
        window.print();
        if(ref.current) {
            ref.current.style.display = 'flex';
        }
    };

    if (status === STATUS.PENDING) {
        return <Loader/>
    }

    if (status === STATUS.ERROR) {
        return <div style={{display: 'flex', justifyContent: 'center', minHeight: '100vh'}}>
            <PageError statusError={error.status} title={error.message}/>
        </div>
    }

    return (
        <React.Fragment>
            {status === STATUS.SUCCESS ? (
                <React.Fragment>
                    <div className="print-card">
                        <div className="print-card__header">
                            <p className="print-card__name">{data.name}</p>
                            <p className="print-card__id">і.к. ХХХХХХХ{data?.identification}</p>
                        </div>
                        <div className="print-card__title">Інформаційне повідомлення</div>
                        <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{territory_title} повідомляє, що відповідно до даних ГУ ДПС у {GU_DPS_region},
                            станом {formatDateUa(data.date)} у Вас наявна заборгованість до бюджету {territory_title_instrumental},&nbsp; а саме:
                        </p>
                        {data.debt && Array.isArray(data.debt) && data.debt.length ? (
                            data.debt.map((innerArray, index) => (
                                innerArray.map((el, innerIndex) => (
                                    <div className="print-card__content" key={`${index}-${innerIndex}`}>
                                        <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{el.debtText}</p>
                                        <p className="print-card__payment-title">{el.requisiteText}</p>
                                        <table className="print-card__table">
                                            <tbody>
                                            {el.table.map((cell, cellIndex) => (
                                                <tr className="print-card__table-row" key={cellIndex}>
                                                    <td className="print-card__table-cell">
                                                        <p><strong>{cell.label}</strong></p>
                                                    </td>
                                                    <td className="print-card__table-cell">
                                                        <p>{cell.value}</p>
                                                    </td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ))
                            ))
                        ) : null}
                        <p>&nbsp;</p>
                        <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;В разі виникнення питань по даній заборгованості, звертатись у ГУ ДПС у {GU_DPS_region} за номером телефона {phone_number_GU_DPS}.</p>
                        <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Просимо терміново погасити утворену Вами податкову заборгованість до бюджету {territory_title_instrumental}. Несвоєчасна сплата суми заборгованості призведе до нарахувань
                            штрафних санкцій та пені.</p>
                        <p>&nbsp;</p>
                        <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Перевірити заборгованість можна у застосунках &laquo;{website_name}&raquo;
                            <a href={website_url} target={"_blank"}>{website_url}</a> та чат - бот в Telegram &laquo;{telegram_name}&raquo; <a href={telegram_url} target={"_blank"}>{telegram_url}</a>, які надають
                            можливість миттєвого отримання актуальної інформації про стан заборгованості по податках і зборах перед бюджетом
                            {territory_title_instrumental}, реквізити для сплати та можливість оплатити онлайн, або за QR &ndash; кодом, який розміщений нижче.
                        </p>
                        <div>
                            <img src={logo} width={100} height={100} alt={alt_qr_code}/>
                        </div>
                        <div className="print-card__buttons" ref={ref}>
                            <Button
                                icon={backIcon}
                                onClick={() => navigate('/debtor')}>
                                Повернутись
                            </Button>
                            <Button
                                icon={printIcon}
                                onClick={handlePrint}>
                                Друк
                            </Button>
                        </div>
                    </div>
                </React.Fragment>
            ) : null
            }
        </React.Fragment>)
};

export default PrintCard;