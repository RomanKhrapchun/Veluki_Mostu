import React, {useEffect, useRef, useState} from 'react';
import './Dropdown.css'
import classNames from "classnames";
import Button from "../Button/Button";

const Dropdown = ({
                      menu,
                      icon,
                      className,
                      caption = "Button",
                      style,
                      childStyle,
                      iconPosition,
                      disabled
                  }) => {

    const [isOpen, setIsOpen] = useState(false)
    const ref = useRef(null)

    const classes = classNames('dropdown-wrapper', className)

    useEffect(() => {
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) {
                if (isOpen) {
                    setIsOpen(false)
                }
            }
        };

        document.addEventListener("click", handler);
        return () => {
            document.removeEventListener("click", handler);
        };
    }, [isOpen]);

    const handleInputClick = () => {
        setIsOpen(!isOpen)
    };

    return (
        <div ref={ref} className={classes} onClick={handleInputClick}>
            <Button icon={icon} iconPosition={iconPosition} disabled={disabled}>
                {caption}
            </Button>
            {Array.isArray(menu) && (
                <ul className={classNames("dropdown dropdown--right", {"dropdown--active": isOpen})} style={style}>
                    {
                        menu.map(item => {
                            return <li key={item.key}>
                                <button className="dropdown__item" onClick={item.onClick} style={childStyle}>
                                    {item.icon}
                                    <span>{item.label}</span>
                                </button>
                            </li>
                        })
                    }
                </ul>
            )}
        </div>
    );
};
export default React.memo(Dropdown);