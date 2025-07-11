import React, { useRef } from 'react';
import Button from "../common/Button/Button.jsx";
import { useNavigate, useParams } from "react-router-dom";
import './PrintCard.css';
import useFetch from "../../hooks/useFetch.jsx";
import { generateIcon, iconMap, STATUS } from "../../utils/constants.jsx";
import Loader from "../Loader/Loader.jsx";
import PageError from "../../pages/ErrorPage/PageError.jsx";
import { formatDateUa } from "../../utils/function.js";
import { territory_title, phone_number_GU_DPS,GU_DPS_region, website_url,  alt_qr_code,website_url_p4v } from "../../utils/constants.jsx";
import logo from '../../assets/qr-code-p4v.png';

const backIcon = generateIcon(iconMap.back);
const printIcon = generateIcon(iconMap.print);

const PrintCNAPCard = () => {
    const ref = useRef(null);
    const { debtId } = useParams();
    const navigate = useNavigate();
    const { error, status, data } = useFetch(`api/cnap/account/print/${debtId}`);

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
                <div className="print-card">
                    <div className="print-card__header">
                        <p className="print-card__name">{data.name}</p>
                        <p className="print-card__id">І.К. ХХХХХХХ{data?.identification}</p>
                    </div>
                    <div className="print-card__title">Інформаційне повідомлення</div>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{territory_title} повідомляє, що відповідно до даних ГУ ДПС у {GU_DPS_region},
                        станом {formatDateUa(data.date)} у Вас наявна заборгованість до бюджету {territory_title} громади, а саме:
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
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Просимо терміново погасити утворену Вами адміністративну заборгованість до бюджету {territory_title}. Несвоєчасна сплата суми заборгованості призведе до нарахувань штрафних санкцій та пені.</p>
                    <p>&nbsp;</p>
                    <p>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Перевірити заборгованість можна у застосунках &laquo;Сервіс пошуку та оплати адміністративних послуг&raquo;
                        <a href={website_url} target={"_blank"}>{website_url_p4v}</a> , який надає
                        можливість миттєвого отримання актуальної інформації про стан заборгованості по адміністративним послугам і зборах перед бюджетом
                        {territory_title}, реквізити для сплати та можливість оплатити онлайн, або за QR &ndash; кодом, який розміщений нижче.
                    </p>
                    <div>
                        <img src={logo} width={100} height={100} alt={alt_qr_code} />
                    </div>
                    <div className="print-card__buttons" ref={ref}>
                        <Button
                            icon={backIcon}
                            onClick={() => navigate('/cnap/accounts')}>
                            Повернутись
                        </Button>
                        <Button
                            icon={printIcon}
                            onClick={handlePrint}>
                            Друк
                        </Button>
                    </div>
                </div>
            ) : null}
        </React.Fragment>
    );
};

export default PrintCNAPCard;
