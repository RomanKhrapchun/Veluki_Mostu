import React, {useEffect, useState, useRef, useMemo} from 'react';
import "./Select.css"
import classNames from "classnames";
import Input from "../Input/Input";
import {generateIcon, iconMap} from "../../../utils/constants";
import {cleanValue} from "../../../utils/function";

const closeIcon = generateIcon(iconMap.close)
const arrowIcon = generateIcon(iconMap.arrowUp)
const searchIcon = generateIcon(iconMap.search, 'input-icon')

const Select = ({
                    placeholder = "Виберіть...",
                    value,
                    options = [],
                    isMulti = false,
                    isClearable = false,
                    isSearchable = false,
                    onChange,
                    name,
                    className,
                    disabled = false,
                    noOptionsMessage = "Нічого не знайдено",
                }) => {

    const [state, setState] = useState({
        showMenu: false,
        searchValue: "",
    });
    const classes = classNames("select ", className, {"select--disabled": disabled, "select--active": state.showMenu})
    const inputRef = useRef(null);
    const searchRef = useRef(null);

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
        setState((prevState) => ({...prevState, searchValue: ""}));
        if (state.showMenu && searchRef.current) {
            searchRef.current.focus();
        }
    }, [state.showMenu]);

    const clearOptions = () => {
        isMulti ? onChange?.(name, []) : onChange?.(name, null)
    }
    const selectOption = (option) => {
        if (isMulti) {
            if (Array.isArray(value)) {
                const isOptionSelected = value.some((t) => t.value === option.value);
                if (isOptionSelected) {
                    onChange?.(name, value.filter((t) => t.value !== option.value));
                } else {
                    onChange?.(name, [...value, option]);
                }
            } else {
                if (value && value.value !== option.value) {
                    onChange?.(name, [value, option]);
                } else if (value && value.value === option?.value) {
                    onChange?.(name, []);
                } else {
                    onChange?.(name, [option]);
                }
            }
        } else {
            onChange?.(name, option);
        }
    };

    const isOptionSelected = (option) => {
        if (isMulti) {
            if (Array.isArray(value)) {
                return value.some((selected) => selected.value === option.value && selected.label === option.label);
            }
            return value?.value === option.value && value?.label === option.label;
        } else {
            if (Array.isArray(value) && value.length) {
                return option.value === value[0]?.value && option.label === value[0]?.label;
            } else {
                return option.value === value?.value && option.label === value?.label;
            }
        }
    }

    const handleInputClick = () => {
        setState((prevState) => ({...prevState, showMenu: !prevState.showMenu}));
    }

    const onSearch = (_, value) => {
        setState((prevState) => ({
            ...prevState, searchValue: value,
        }));
    }

    const getOptions = useMemo(() => {
        if (Array.isArray(options) && options.length > 0) {
            return options.filter((option) => option?.label?.toLowerCase()?.includes(state.searchValue.toLowerCase()));
        } else return [];
    }, [state.searchValue, options]);

    return (
        <div className={classes} ref={inputRef}>
            <div
                className="select__top"
                tabIndex="0"
                title={`${!state.showMenu ? "Показати варіанти" : "Приховати варіанти"}`}
                onClick={handleInputClick}>
                {
                    (!cleanValue(value, isMulti) || (isMulti && Array.isArray(value) && value.length === 0))
                        ? <p className="select__output">{placeholder}</p>
                        : <ul className={"select__output select__output--list"}>
                            {
                                isMulti
                                    ? Array.isArray(value)
                                        ? value.map((element, index) => (
                                            <li key={index} className="select__output-item">
                                                {element?.label}
                                                <button
                                                    type="button"
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
                                        ))
                                        : value && typeof value === 'object' && 'label' in value
                                            ? (
                                                <li className="select__output-item">
                                                    {value.label}
                                                    <button
                                                        type="button"
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
                                            )
                                            : null

                                    : Array.isArray(value) && value.length > 0
                                        ? <li>{value[0].label}</li>
                                        : value && typeof value === 'object' && Object.keys(value).length
                                            ? <li>{value.label}</li>
                                            : null
                            }
                        </ul>
                }
                {isClearable && (
                    (isMulti ?
                            (Array.isArray(value) && value.length > 0) || (typeof value === 'object' && 'label' in value && 'value' in value) :
                            (value && typeof value === 'object' && value !== null)
                    ) ? (
                        <button
                            className="select__close"
                            title="Видалити"
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                clearOptions();
                            }}
                        >
                            {closeIcon}
                        </button>
                    ) : null
                )}
                <div className="select__top-arrow">
                    {arrowIcon}
                </div>
            </div>
            {state.showMenu && (<div className="select__dropdown">
                {isSearchable && (<Input
                    className={"full-width"}
                    ref={searchRef}
                    icon={searchIcon}
                    value={state.searchValue}
                    type="text"
                    placeholder="Пошук"
                    onChange={onSearch}
                />)}
                {getOptions?.length > 0 ? (<ul className="select__options">
                    {getOptions?.map((option, index) => {
                        if (!option || (!option?.value && typeof option?.value !== 'boolean') || !option?.label) return null
                        return (<li key={index}>
                            <button
                                type="button"
                                tabIndex={0}
                                onClick={() => {
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
                                {option.label}
                            </button>
                        </li>)
                    })}
                </ul>) : (<p className="paragraph paragraph--sm" style={{textAlign: 'center', padding: '8px 12px'}}>
                    {noOptionsMessage}
                </p>)}
            </div>)}
        </div>);
};

export default React.memo(Select);
