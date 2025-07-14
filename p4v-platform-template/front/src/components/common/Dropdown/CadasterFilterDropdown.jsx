import React, { useRef, useEffect } from 'react';
import Input from "../Input/Input";
import Button from "../Button/Button";
import "./FilterDropdown.css"; // Використовуємо існуючі стилі

const CadasterFilterDropdown = ({ 
    isOpen, 
    onClose, 
    filterData, 
    onFilterChange, 
    onApplyFilter, 
    onResetFilters, 
    searchIcon 
}) => {
    const dropdownRef = useRef(null);

    // Закриття по кліку поза межами
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            document.addEventListener('touchstart', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('touchstart', handleClickOutside);
        };
    }, [isOpen, onClose]);

    // Закриття по Escape
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    return (
        <div className="filter-dropdown" ref={dropdownRef}>
            <div className="filter-dropdown__arrow"></div>
            
            <div className="filter-dropdown__content">
                <div className="filter-dropdown__header">
                    <h3 className="filter-dropdown__title">Фільтри кадастру</h3>
                    <button 
                        className="filter-dropdown__close"
                        onClick={onClose}
                        title="Закрити"
                    >
                        ✕
                    </button>
                </div>

                <div className="filter-dropdown__body">
                    {/* ПІБ платника */}
                    <div className="filter-dropdown__item">
                        <label className="filter-dropdown__label">ПІБ платника</label>
                        <Input
                            icon={searchIcon}
                            name="payer_name"
                            type="text"
                            placeholder="Введіть ПІБ платника"
                            value={filterData?.payer_name || ''}
                            onChange={onFilterChange}
                        />
                    </div>

                    {/* Кадастровий номер */}
                    <div className="filter-dropdown__item">
                        <label className="filter-dropdown__label">Кадастровий номер</label>
                        <Input
                            icon={searchIcon}
                            name="cadastral_number"
                            type="text"
                            placeholder="Введіть кадастровий номер"
                            value={filterData?.cadastral_number || ''}
                            onChange={onFilterChange}
                        />
                    </div>

                    {/* Адреса платника */}
                    <div className="filter-dropdown__item">
                        <label className="filter-dropdown__label">Адреса платника</label>
                        <Input
                            icon={searchIcon}
                            name="payer_address"
                            type="text"
                            placeholder="Введіть адресу платника"
                            value={filterData?.payer_address || ''}
                            onChange={onFilterChange}
                        />
                    </div>

                    {/* IBAN */}
                    <div className="filter-dropdown__item">
                        <label className="filter-dropdown__label">IBAN</label>
                        <Input
                            icon={searchIcon}
                            name="iban"
                            type="text"
                            placeholder="Введіть IBAN"
                            value={filterData?.iban || ''}
                            onChange={onFilterChange}
                        />
                    </div>

                    {/* Податкова адреса */}
                    <div className="filter-dropdown__item">
                        <label className="filter-dropdown__label">Податкова адреса</label>
                        <Input
                            icon={searchIcon}
                            name="tax_address"
                            type="text"
                            placeholder="Введіть податкову адресу"
                            value={filterData?.tax_address || ''}
                            onChange={onFilterChange}
                        />
                    </div>
                </div>

                {/* Кнопки дій */}
                <div className="filter-dropdown__footer">
                    <Button 
                        className="filter-dropdown__apply"
                        onClick={onApplyFilter}
                    >
                        Застосувати
                    </Button>
                    <Button 
                        className="filter-dropdown__reset"
                        onClick={onResetFilters}
                    >
                        Скинути
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default CadasterFilterDropdown;