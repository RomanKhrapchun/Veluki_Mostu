
import React, { useRef, useEffect, useState } from 'react';
import Input from "../Input/Input";
import Button from "../Button/Button";

const FilterDropdown = ({ 
    isOpen, 
    onClose, 
    filterData, 
    onFilterChange, 
    onApplyFilter, 
    onResetFilters, 
    searchIcon 
}) => {
    const dropdownRef = useRef(null);
    // ДОДАНО: стан для відкриття/закриття dropdown типу податку
    const [isTaxTypeOpen, setIsTaxTypeOpen] = useState(false);

    // Опції для типів податків
    const taxTypeOptions = [
        { value: '', label: 'Всі типи податків' },
        { value: 'mpz', label: 'МПЗ' },
        { value: 'residential_debt', label: 'Житлова нерухомість' },
        { value: 'non_residential_debt', label: 'Нежитлова нерухомість' },
        { value: 'land_debt', label: 'Земельний податок' },
        { value: 'orenda_debt', label: 'Орендна плата' }
    ];

    // ДОДАНО: отримуємо поточну назву вибраного типу
    const selectedTaxType = taxTypeOptions.find(option => option.value === (filterData?.tax_type || ''));

    // ДОДАНО: функція для вибору типу податку
    const handleTaxTypeSelect = (value) => {
        onFilterChange('tax_type', value);
        setIsTaxTypeOpen(false);
    };

    // Закриття по кліку поза межами
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                onClose();
                // ДОДАНО: закриваємо також dropdown типу податку
                setIsTaxTypeOpen(false);
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
                // ДОДАНО: закриваємо також dropdown типу податку
                setIsTaxTypeOpen(false);
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
            {/* Стрілочка що вказує на кнопку */}
            <div className="filter-dropdown__arrow"></div>
            
            {/* Контент фільтра */}
            <div className="filter-dropdown__content">
                <div className="filter-dropdown__header">
                    <h3 className="filter-dropdown__title">Фільтри</h3>
                    <button 
                        className="filter-dropdown__close"
                        onClick={onClose}
                        title="Закрити"
                    >
                        ✕
                    </button>
                </div>

                <div className="filter-dropdown__body">
                    {/* Поле для пошуку по прізвищу */}
                    <div className="filter-dropdown__item">
                        <Input
                            icon={searchIcon}
                            name="title"
                            type="text"
                            placeholder="Введіть прізвище"
                            value={filterData?.title || ''}
                            onChange={onFilterChange}
                        />
                    </div>

                    {/* Поле для ІПН */}
                    <div className="filter-dropdown__item">
                        <label className="filter-dropdown__label">ІПН</label>
                        <Input
                            icon={searchIcon}
                            name="identification"
                            type="text"
                            minLength="3"
                            placeholder="Введіть 3 останні цифри ІПН"
                            value={filterData?.identification || ''}
                            onChange={onFilterChange}
                        />
                    </div>

                    {/* ВИПРАВЛЕНИЙ: Тип податку */}
                    <div className="filter-dropdown__item">
                        <label className="filter-dropdown__label">Тип податку</label>
                        <div className="filter-dropdown__custom-select">
                            <div 
                                className="filter-dropdown__select-input"
                                onClick={() => setIsTaxTypeOpen(!isTaxTypeOpen)}
                            >
                                <span>{selectedTaxType?.label || 'Всі типи податків'}</span>
                                <span className={`filter-dropdown__select-arrow ${isTaxTypeOpen ? 'open' : ''}`}>▼</span>
                            </div>
                            {isTaxTypeOpen && (
                                <div className="filter-dropdown__select-options">
                                    {taxTypeOptions.map(option => (
                                        <div 
                                            key={option.value}
                                            className={`filter-dropdown__select-option ${
                                                (filterData?.tax_type || '') === option.value ? 'selected' : ''
                                            }`}
                                            onClick={() => handleTaxTypeSelect(option.value)}
                                        >
                                            {option.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Тільки з боргами */}
                    <div className="filter-dropdown__item">
                        <label className="filter-dropdown__label filter-dropdown__checkbox-label">
                            <input 
                                type="checkbox" 
                                name="only_debtors"
                                checked={filterData?.only_debtors || false} 
                                onChange={(e) => onFilterChange('only_debtors', e.target.checked)}
                            />
                            <span className="filter-dropdown__checkbox-text">
                                Показувати тільки з боргами
                            </span>
                        </label>
                    </div>

                    {/* Поля для суми боргу */}
                    <div className="filter-dropdown__item">
                        <label className="filter-dropdown__label">Сума боргу (₴)</label>
                        
                        <div className="filter-dropdown__sublabel">
                            Діапазон від ₴ до ₴
                        </div>
                        <div className="filter-dropdown__range">
                            <Input
                                icon={searchIcon}
                                name="debt_amount_min"
                                type="number"
                                step="0.01"
                                placeholder="Від"
                                value={filterData?.debt_amount_min || ''}
                                onChange={onFilterChange}
                            />
                            <span className="filter-dropdown__range-separator">-</span>
                            <Input
                                icon={searchIcon}
                                name="debt_amount_max"
                                type="number"
                                step="0.01"
                                placeholder="До"
                                value={filterData?.debt_amount_max || ''}
                                onChange={onFilterChange}
                            />
                        </div>

                        {/* Точна сума */}
                        <div className="filter-dropdown__sublabel">
                            Точна сума боргу (₴)
                        </div>
                        <Input
                            icon={searchIcon}
                            name="debt_amount"
                            type="number"
                            step="0.01"
                            placeholder="Напр. 5000"
                            value={filterData?.debt_amount || ''}
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

export default FilterDropdown;