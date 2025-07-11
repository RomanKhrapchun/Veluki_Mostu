import React, {useEffect, useState, useRef, useContext} from 'react';
import '../Select/Select.css'
import classNames from "classnames";
import Input from "../Input/Input";
import useDebounce from "../../../hooks/useDebounce";
import Loader from "../../Loader/Loader";
import {Context} from "../../../main";
import {useNavigate} from "react-router-dom";
import {generateIcon, iconMap} from "../../../utils/constants";
import {useNotification} from "../../../hooks/useNotification";
import {cleanValue} from "../../../utils/function";

const closeIcon = generateIcon(iconMap.close)
const arrowIcon = generateIcon(iconMap.arrowUp)
const searchIcon = generateIcon(iconMap.search, 'input-icon')

const AsyncSelect = ({
                         placeholder = "Виберіть...",
                         value,
                         className,
                         name,
                         isMulti = false,
                         isClearable = false,
                         isSearchable = false,
                         onChange,
                         disabled = false,
                         noOptionsMessage = "Нічого не знайдено",
                         optionTextMessage = "Введіть текст",
                         options,
                         loadOptions,
                     }) => {

    const [state, setState] = useState({
        showMenu: false,
        searchValue: "",
        isLoading: false,
        options: Array.isArray(options) ? options : [],
        isSearch: false,
    });

    const {store} = useContext(Context)
    const notification = useNotification()
    const navigate = useNavigate()
    const debouncedValue = useDebounce(state.searchValue, 500)
    const classes = classNames("select", className, {"select--disabled": disabled, "select--active": state.showMenu})
    const inputRef = useRef(null);
    const searchRef = useRef(null);
    const firstRender = useRef(true)

    useEffect(() => {
        const handler = (e) => {
            if (inputRef.current && !inputRef.current.contains(e.target)) {
                if (state.showMenu) {
                    setState((prevState) => ({
                        ...prevState, showMenu: false,
                    }));
                }
            }
        };

        document.addEventListener("click", handler);
        return () => {
            document.removeEventListener("click", handler);
        };
    }, [state.showMenu]);

    useEffect(() => {
        if (state.showMenu && searchRef.current) {
            setState((prevState) => ({...prevState, searchValue: ""}));
            searchRef.current.focus();
        }
    }, [state.showMenu]);


    useEffect(() => {
        const abortController = new AbortController();
        if (firstRender.current) {
            firstRender.current = false
            return;
        }
        const fetchData = async () => {
            try {
                setState(prevState => ({
                    ...prevState,
                    isLoading: true,
                    isSearch: true,
                }))
                const result = await loadOptions(debouncedValue, abortController.signal)
                setState(prevState => ({
                    ...prevState,
                    options: result,
                    isLoading: false,
                }))

            } catch (error) {
                if (error?.response?.status === 401) {
                    notification({
                        type: 'warning',
                        title: "Помилка",
                        message: error?.response?.data?.message ? error.response.data.message : error.message,
                        placement: 'top',
                    })
                    store.logOff()
                    return navigate('/')
                }
                setState(prevState => ({
                    ...prevState,
                    isLoading: false,
                    options: [],
                }))
            }
        }
        if (debouncedValue && typeof loadOptions === 'function') {
            fetchData();
        }

        return () => {
            abortController.abort();
        };
    }, [debouncedValue, loadOptions, navigate, store, notification])

    const clearOptions = () => {
        isMulti ? onChange?.(name, []) : onChange?.(name, null)
    }

    const selectOption = (option) => {
        if (isMulti && Array.isArray(value)) {
            if (value.includes(option)) {
                onChange?.(name, value.filter(t => t !== option))
            } else {
                onChange?.(name, [...value, option])
            }
        } else {
            if (isMulti && !Array.isArray(value) && value && value !== option) {
                onChange?.(name, [value, option])
            } else if (isMulti && !Array.isArray(value) && value === option) {
                onChange?.(name, [])
            } else {
                onChange?.(name, option)
            }

        }
    }

    const isOptionSelected = (option) => {
        return isMulti && Array.isArray(value) ? value.includes(option) : option === value
    }

    const handleInputClick = () => {
        setState((prevState) => ({...prevState, showMenu: !prevState.showMenu, isSearch: false}));
    }

    const onSearch = (_, value) => {
        setState((prevState) => ({
            ...prevState,
            searchValue: value,
        }));
    }

    return (<div className={classes} ref={inputRef}>
        <div
            className="select__top"
            tabIndex="0"
            title={`${!state.showMenu ? "Показати варіанти" : "Приховати варіанти"}`}
            onClick={handleInputClick}>
            {
                (!cleanValue(value, isMulti) || cleanValue(value, isMulti).length === 0)
                    ? (<p className="select__output">{placeholder}</p>)
                    : <ul className={"select__output select__output--list"}>
                            {
                                isMulti && Array.isArray(value) ? value.map((element, index) => (
                                    <li key={index} className="select__output-item">
                                        {element?.label}
                                        <button
                                            className="select__output-item-remove"
                                            title="Видалити варіант"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                selectOption(element);
                                            }}
                                        >
                                            {closeIcon}
                                        </button>
                                    </li>
                                )) : isMulti && value ? (
                                    <li className="select__output-item">
                                        {value?.label}
                                        <button
                                            className="select__output-item-remove"
                                            title="Видалити варіант"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                selectOption(value);
                                            }}
                                        >
                                            {closeIcon}
                                        </button>
                                    </li>
                                ) : <li>{value?.label}</li>
                            }
                        </ul>
            }
            {isClearable && isMulti && value?.length > 0 ? (
                <button className="select__close" title="Видалити" onClick={
                    (e) => {
                        e.stopPropagation()
                        clearOptions()
                    }
                }>
                    {closeIcon}
                </button>) : null
            }
            <div className="select__top-arrow">
                {arrowIcon}
            </div>
        </div>
        {state.showMenu && (
            <div className="select__dropdown">
                {isSearchable && (
                    <Input
                        className={"full-width"}
                        ref={searchRef}
                        icon={searchIcon}
                        value={state.searchValue}
                        type="text"
                        placeholder="Пошук"
                        onChange={onSearch}
                    />)}
                {state.isLoading
                    ? <Loader loadingType="dataType" className="loader--sm"/>
                    : ((!state.options || !state.options?.length) && !state.isSearch)
                        ? <p className="paragraph paragraph--sm"
                             style={{textAlign: 'center', padding: '8px 12px'}}>{optionTextMessage}</p>
                        : (state.isSearch && !state.options?.length)
                            ? <p className="paragraph paragraph--sm"
                                 style={{textAlign: 'center', padding: '8px 12px'}}>{noOptionsMessage}</p>
                            : (
                                <ul className="select__options">
                                    {state.options.map((option, index) => {
                                        if (!option || !option?.value || !option?.label) return null
                                        return (<li key={index}>
                                            <button
                                                tabIndex={0}
                                                onClick={(e) => {
                                                    selectOption(option)
                                                    if (!isMulti) setState((prevState) => ({
                                                        ...prevState, showMenu: !prevState.showMenu
                                                    }));
                                                }}
                                                key={index}
                                                style={{
                                                    backgroundColor: `${isOptionSelected(option) ? "var(--blue)" : ""}`,
                                                    color: `${isOptionSelected(option) ? "var(--white)" : ""}`
                                                }}
                                                className="select__options-item"
                                            >
                                                {option?.label}
                                            </button>
                                        </li>)
                                    })}
                                </ul>
                            )
                }
            </div>)}
    </div>);
};

export default React.memo(AsyncSelect);