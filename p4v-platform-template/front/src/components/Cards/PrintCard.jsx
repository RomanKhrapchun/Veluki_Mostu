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
                            {/* Додаємо кадастровий номер ТІЛЬКИ якщо він є та валідний */}
                            {data?.cadastral_number && 
                             data.cadastral_number.trim() !== '' && 
                             !data.cadastral_number.startsWith('AUTO_') &&
                             data.cadastral_number.length > 5 && (
                                <p className="print-card__cadastral">Кадастровий номер: {data.cadastral_number}</p>
                            )}
                        </div>
                        <div className="print-card__title">Інформаційне повідомлення</div>
                        <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{territory_title} повідомляє, що відповідно до даних ГУ ДПС у {GU_DPS_region},
                            станом {formatDateUa(data.date)} у Вас наявна заборгованість до бюджету {territory_title_instrumental},&nbsp; а саме:
                        </p>
                        {data.debt && Array.isArray(data.debt) && data.debt.length ?
                            data.debt.map((debt, debtIndex) => (
                                <React.Fragment key={debtIndex}>
                                    {debt.map((item, itemIndex) => (
                                        <React.Fragment key={itemIndex}>
                                            <p className="print-card__payment-title">
                                                {debtIndex + 1}.&nbsp;{item.debtText}
                                            </p>
                                            <div className="print-card__content">
                                                <h4>{item.requisiteText}</h4>
                                                <table className="print-card__table">
                                                    <tbody>
                                                    {item.table.map((row, index) => (
                                                        <tr key={index}>
                                                            <td className="print-card__table-cell">{row.label}</td>
                                                            <td className="print-card__table-cell">{row.value}</td>
                                                        </tr>
                                                    ))}
                                                    <tr>
                                                        <td className="print-card__table-cell"><strong>Сума</strong></td>
                                                        <td className="print-card__table-cell"><strong>{item.amount} грн</strong></td>
                                                    </tr>
                                                    </tbody>
                                                </table>
                                            </div>
                                        </React.Fragment>
                                    ))}
                                </React.Fragment>
                            )) : null}
                        <p>
                            В разі виникнення питань по даній заборгованості, звертайтесь у ГУ ДПС у {GU_DPS_region} за номером телефона {phone_number_GU_DPS}.
                        </p>
                        <p>
                            Просимо терміново погасити утворену Вами заборгованість до бюджету {territory_title_instrumental}. Несвоєчасна сплата суми
                            заборгованості призведе до нарахувань штрафних санкцій та пені.
                        </p>
                        <p>
                            Перевірити заборгованість можна у застосунках <a
                            href={website_url}>«{website_name}»</a> або
                            через чат-бот в Telegram <a href={telegram_url}>«{telegram_name}»</a>. Вони дозволяють
                            отримати актуальну інформацію щодо стану вашої заборгованості та оплатити її онлайн за
                            допомогою QR-коду, що розміщений нижче.
                        </p>
                        <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                            <img src={logo} alt={alt_qr_code} style={{width: 128, height: 128}}/>
                        </div>
                    </div>
                    <div className="print-card__buttons" ref={ref}>
                        <Button onClick={() => navigate('/debtor')} icon={backIcon}>
                            Повернутись до реєстру
                        </Button>
                        <Button onClick={handlePrint} icon={printIcon}>
                            Роздрукувати
                        </Button>
                    </div>
                </React.Fragment>
            ) : null}
        </React.Fragment>
    );
};

export default PrintCard;