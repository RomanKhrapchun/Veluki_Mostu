import {useEffect, useRef, useState} from 'react';
import './Expander.css'
import classNames from "classnames";
import {debounce} from "../../../utils/function";
import Button from "../Button/Button";
import {generateIcon, iconMap} from "../../../utils/constants";
import {useNavigate} from "react-router-dom";

const Expander = ({subMenuItem, value, label = "menuItem", icon, activeKey, onClick, selectedKey}) => {
        const [isOpen, setIsOpen] = useState(selectedKey)
        const navigate = useNavigate()
        const expander = useRef(null)

        useEffect(() => {
            if (expander.current) {
                const list = expander.current.querySelector('.expander__list');
                if (isOpen) {
                    expander.current.style.height = `${list.offsetHeight}px`;
                    expander.current.style.marginTop = 'var(--mg-sm)'
                    expander.current.style.visibility = 'visible';
                    const handleResize = debounce(() => {
                        expander.current.style.height = `${list.offsetHeight}px`;
                    }, 200)

                    window.addEventListener('resize', handleResize);
                    return () => {
                        window.removeEventListener('resize', handleResize);
                    };
                } else {
                    expander.current.style.height = `0px`;
                    expander.current.style.marginTop = '0px'
                    expander.current.style.visibility = 'hidden';
                }
            }
        }, [isOpen]);

        return (
            Array.isArray(subMenuItem) && subMenuItem.length > 0 ? (
                <div className="expander">
                    <Button className={classNames('btn--left expander__trigger', {"expander--active": isOpen})}
                            onClick={() => setIsOpen(!isOpen)}
                            icon={icon ? generateIcon(iconMap[icon]) : null}
                    >
                        {label}
                    </Button>
                    <div ref={expander} className="expander__list-wrapper">
                        {<ul className="expander__list">
                            {subMenuItem.map((item, index) => {
                                    return (
                                        <li key={index}>
                                            <Button
                                                className={classNames('btn--left expander__item', {"btn--active": activeKey === item.key})}
                                                icon={item.icon ? generateIcon(iconMap[item.icon]) : null}
                                                onClick={() => {
                                                    onClick(item.key)
                                                    navigate(item.key)
                                                }}>
                                                {item.module_name ?? "menuItem"}
                                            </Button>
                                        </li>
                                    )
                                }
                            )}

                        </ul>}
                    </div>
                </div>
            ) : (
                <Button className={`btn--left header__nav-button ${activeKey === value ? " btn--active" : ""}`}
                        icon={icon ? generateIcon(iconMap[icon]) : null}
                        onClick={() => {
                            onClick(value)
                            navigate(value)
                        }}
                >
                    {label}
                </Button>
            )
        );
    }
;

export default Expander;