import React, {useEffect, useState} from 'react';
import './Notification.css'
import {generateIcon, iconMap} from '../../../utils/constants'

const icon = {
    success: generateIcon(iconMap.success),
    info: generateIcon(iconMap.info),
    warning: generateIcon(iconMap.warning)
}
const Notification = (
    {
        type,
        duration = 4,
        title = "Notification title",
        message,
        onClose,
        autoClose,
    }
) => {

    const [isClosing, setIsClosing] = useState(false);

    useEffect(() => {
        if (isClosing) {
            const timeoutId = setTimeout(onClose, 150);
            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [isClosing, onClose]);

    useEffect(() => {
        if (autoClose && duration > 0) {
            const timeoutId = setTimeout(() => setIsClosing(true), duration * 1000);
            return () => {
                clearTimeout(timeoutId);
            };
        }
    }, [autoClose, duration]);

    return (
        <div className={`notification ${isClosing ? "notification--fadeOut" : ""}`}>
            <div className="notification__top">
                <div className="notification__icon">
                    {icon[type] || icon["info"]}
                </div>
                <h3 className="notification__title">{title}</h3>
                <button
                    className="notification__close"
                    onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsClosing(true);
                    }}
                >
                    <svg viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M11.414 10l6.293-6.293a1 1 0 10-1.414-1.414L10 8.586 3.707 2.293a1 1 0 00-1.414 1.414L8.586 10l-6.293 6.293a1 1 0 101.414 1.414L10 11.414l6.293 6.293A.998.998 0 0018 17a.999.999 0 00-.293-.707L11.414 10z"/>
                    </svg>
                </button>
            </div>
            <div className="notification__content">
                {message}
            </div>
        </div>)
};
export default React.memo(Notification);
