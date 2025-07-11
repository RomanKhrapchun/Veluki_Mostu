import {useCallback, useContext, useState} from 'react';
import logo from "../../assets/logo.png";
import './Header.css'
import Menu from "../Menu/Menu";
import classNames from "classnames";
import {Context} from "../../main";
import {altCityName, cityCouncil, cityName} from "../../utils/constants.jsx";

const Header = ({activeKey, selectedKey}) => {
    const [isOpen, setIsOpen] = useState(false);
    const {store} = useContext(Context)

    const toggleMenu = useCallback(() => {
        setIsOpen(!isOpen);
    }, [isOpen])

    return (
        <header className="header">
            <div className="header__top">
                <div className="header__container">
                    <div className="header__top-inner">
                        <div className="header__logo">
                            <div className={"header__logo-img"}>
                                <img src={logo} alt={altCityName} style={{width: "55px", height: "65px"}}/>
                            </div>
                            <p className="header__logo-text">
                                {cityName} <br/> {cityCouncil}
                            </p>
                        </div>
                        <button
                            className={classNames('header__top-burger-btn', {"header__top-burger-btn--active": isOpen})}
                            aria-label={`${isOpen ? "Приховати навігаційне меню" : "Показати навігаційне меню"}`}
                            aria-expanded={isOpen} aria-controls="header__nav" onClick={toggleMenu}>
                            <span></span><span></span><span></span>
                        </button>
                        <div
                            className={classNames("header__top-closing-field", {"header__top-closing-field--active": isOpen})}
                            title={`${isOpen ? "Приховати навігаційне меню" : "Показати навігаційне меню"}`}
                            onClick={() => {
                                if (isOpen) setIsOpen(false)
                            }}
                        >
                        </div>
                    </div>
                </div>
            </div>

            <nav className={`header__nav ${isOpen ? "header__nav--active" : ""}`} id="header__nav">
                {isOpen && (
                    <Menu
                        menu={store.user?.access_group}
                        activeKey={activeKey}
                        selectedKey={selectedKey}
                        isSearch
                        onClick={toggleMenu}
                    />
                )}
            </nav>
        </header>
    );
};
export default Header;