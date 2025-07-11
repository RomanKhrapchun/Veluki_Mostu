import React, { useCallback, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../main';
import { generateIcon, iconMap } from '../../utils/constants';
import Button from '../../components/common/Button/Button';
import Input from '../../components/common/Input/Input';
import Select from '../../components/common/Select/Select';
import { useNotification } from "../../hooks/useNotification";
import { fetchFunction } from "../../utils/function";
import FormItem from '../../components/common/FormItem/FormItem';

// Icons definition
const backIcon = generateIcon(iconMap.back)
const saveIcon = generateIcon(iconMap.save)

const DataInvoicesCreate = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const [loading, setLoading] = useState(false);
    const [districts, setDistricts,] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [suggestions, setSuggestions] = useState([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [selectedDistrictId, setSelectedDistrictId] = useState(null);
    const numericFields = ['debit', 'year', 'month'];
    const [months] = useState([
        { value: 1, label: 'Січень' },
        { value: 2, label: 'Лютий' },
        { value: 3, label: 'Березень' },
        { value: 4, label: 'Квітень' },
        { value: 5, label: 'Травень' },
        { value: 6, label: 'Червень' },
        { value: 7, label: 'Липень' },
        { value: 8, label: 'Серпень' },
        { value: 9, label: 'Вересень' },
        { value: 10, label: 'Жовтень' },
        { value: 11, label: 'Листопад' },
        { value: 12, label: 'Грудень' }
    ]);

    // Changed initial state: use string for date instead of Date object
    const [formData, setFormData] = useState({
        program_edrpou: '',
        invoice_date: new Date().toISOString().slice(0, 10), // Store as YYYY-MM-DD string
        edrpou: '',
        payer_name: '',
        debit: 0,
        payment_purpose: '',
        account: '',
        year: new Date().getFullYear(),
        month: new Date().getMonth() + 1,
        district_id: null,
        settlement_id: null,
        tax_code: '',
        tax_name: '',
        tax_type: '',
        payer_type: ''
    });

    useEffect(() => {
        // Fetch districts
        const fetchDistricts = async () => {
            try {
                const response = await fetchFunction('api/revenue/districts');
                setDistricts(response.data.map(district => ({
                    value: district.id,
                    label: district.district_name
                })));
            } catch (error) {
                notification({
                    type: 'error',
                    title: "Помилка",
                    message: "Не вдалося завантажити округи",
                    placement: 'top',
                });
            }
        };
        // const fetchSettlements = async () => {
        //     try {
        //         const response = await fetchFunction(`api/revenue/settlements/${formData.district_id}`);
        //         setSettlements(response.data.map(settlement => ({
        //             value: settlement.id,
        //             label: settlement.settlement_name
        //         })));
        //     } catch (error) {
        //         notification({
        //             type: 'error',
        //             title: "Помилка",
        //             message: "Не вдалося завантажити округи",
        //             placement: 'top',
        //         });
        //     }
        // };

        fetchDistricts();
        //fetchSettlements();
    }, [notification]);

    useEffect(() => {
        // Fetch settlements when district changes
        const fetchSettlements = async () => {
            if (selectedDistrictId) {
                try {
                    const response = await fetchFunction(`api/revenue/settlements/byDistrictId/${selectedDistrictId}`);
                    setSettlements(response.data.map(settlement => ({
                        value: settlement.id,
                        label: settlement.settlement_name
                    })));
                } catch (error) {
                    notification({
                        type: 'error',
                        title: "Помилка",
                        message: "Не вдалося завантажити населені пункти",
                        placement: 'top',
                    });
                }
            } else {
                setSettlements([]);
            }
        };

        fetchSettlements();
    }, [selectedDistrictId, notification]);

    useEffect(() => {
        //console.log('Fetching suggestions for:', formData.account); 
        // Створюємо змінну для відстеження актуальності запиту
        let isActive = true;
    
        const fetchSuggestions = async () => {
            // Якщо рахунок менше 4 символів, очищаємо suggestions
            if (!formData.account) {
                setSuggestions([]);
                setShowSuggestions(false);
                return;
            }
    
            try {
                // Додаємо затримку перед запитом, щоб уникнути занадто частих викликів
                await new Promise(resolve => setTimeout(resolve, 300));
    
                // Перевіряємо, чи запит все ще актуальний
                if (!isActive) return;
    
                const response = await fetchFunction(`api/revenue/account-plan/search/${formData.account.replace(/^UA/, '')}`, {
                    method: 'get',
                    data: { query: formData.account.replace(/^UA/, '') }
                });
    
                // Перевіряємо, чи запит все ще актуальний
                if (!isActive) return;
    
                // Фільтруємо suggestions
                const validSuggestions = (response.data || [])
                    .filter(item => 
                        item && 
                        typeof item === 'object' && 
                        item.iban && 
                        typeof item.iban === 'string'
                    );
    
                // Оновлюємо стан, якщо запит все ще актуальний
                if (isActive) {
                    setSuggestions(validSuggestions);
                    setShowSuggestions(validSuggestions.length > 0);
                }
            } catch (error) {
                // Перевіряємо, чи запит все ще актуальний
                if (isActive) {
                    console.error('Suggestions fetch error:', error);
                    setSuggestions([]);
                    setShowSuggestions(false);
                }
            }
        };
    
        // Викликаємо функцію
        fetchSuggestions();
    
        // Функція очищення
        return () => {
            isActive = false;
        };
    }, [formData.account]);
    useEffect(() => {
        const selected = suggestions.find(s => {
            const cleanedIban = s.iban?.replace(/^UA/, '').toLowerCase();
            const userInput = formData.account?.replace(/^UA/, '').toLowerCase();
            return cleanedIban === userInput;
        });
    
        if (selected) {
            handleChange('tax_code', selected.classification_code || '');
            handleChange('tax_name', selected.classification_name || '');
            handleChange('tax_type', selected.tax_type || '');
        }
    }, [formData.account, suggestions]);
    

    const handleBack = useCallback(() => {
        navigate('/revenue/data-invoices');
    }, [navigate]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    
    const handleInputChange = (eOrName, maybeValue) => {
        if (eOrName && eOrName.target) {
            const { name, value } = eOrName.target;
    
            const processedValue = numericFields.includes(name)
                ? Number(value)
                : value;
    
            handleChange(name, processedValue);
        } else {
            const processedValue = numericFields.includes(eOrName)
                ? Number(maybeValue)
                : maybeValue;
    
            handleChange(eOrName, processedValue);
        }
    };
    

    const handleDistrictChange = async (name, selected) => {
        const id = selected ? Number(selected.value) : null;
        handleChange(name, id);
        handleChange('settlement_id', null);
    
        if (id) {
            try {
                const response = await fetchFunction(`api/revenue/settlements/byDistrictId/${id}`);
                setSettlements(response.data.map(settlement => ({
                    value: settlement.id,
                    label: settlement.settlement_name
                })));
            } catch (error) {
                notification({
                    type: 'error',
                    title: "Помилка",
                    message: "Не вдалося завантажити населені пункти",
                    placement: 'top',
                });
            }
        } else {
            setSettlements([]);
        }
    };
    
    
    const handleSettlementChange = (name,selected) => {
        handleChange(name, selected ? Number(selected.value) : null);
        
    };

    const handleMonthChange = (name, selected) => {
        handleChange(name, selected ? selected.value : null);
      };
      
      

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // Validate form
            if (!formData.program_edrpou || !formData.invoice_date || !formData.debit || !formData.payment_purpose || !formData.account || !formData.year || !formData.month) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: "Заповніть всі обов'язкові поля",
                    placement: 'top',
                });
                return;
            }

            // Create a copy of formData with the date formatted properly for API
            const submitData = {
                ...formData,
                //invoice_date: new Date(formData.invoice_date).toISOString(),
                // No need to format invoice_date as it's already stored as string
            };

            await fetchFunction('api/revenue/data-invoices', {
                method: 'post',
                data: submitData
            });

            notification({
                type: 'success',
                title: "Успіх",
                message: "Рахунок успішно створено",
                placement: 'top',
            });

            navigate('/revenue/data-invoices');
        } catch (error) {
            notification({
                type: 'error',
                title: "Помилка",
                message: error?.response?.data?.message || error.message,
                placement: 'top',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="page-container">
            <div className="page-container__header">
                <div className="page-container__title">
                    Створення рахунку
                </div>
                <div className="page-container__actions">
                </div>
            </div>
            <div className="page-container__content">
                <div className="card">
                    <div className="card__header">
                        <h2>Інформація про рахунок</h2>
                    </div>
                    <div className="card__content">
                        <FormItem
                            label="ЄДРПОУ програми:"
                            required
                            fullWidth
                        >
                            <Input
                                name="program_edrpou"
                                value={formData.program_edrpou}
                                onChange={handleInputChange}
                                placeholder="Введіть ЄДРПОУ програми"
                            />
                        </FormItem>

                        <FormItem
                            label="Дата рахунку:"
                            required
                            fullWidth
                        >
                            <Input
                                type="date"
                                name="invoice_date"
                                value={formData.invoice_date} // No need to format - already a string
                                onChange={handleInputChange}
                                placeholder="Оберіть дату"
                            />
                        </FormItem>

                        <FormItem
                            label="ЄДРПОУ платника:"
                            fullWidth
                        >
                            <Input
                                name="edrpou"
                                value={formData.edrpou}
                                onChange={handleInputChange}
                                placeholder="Введіть ЄДРПОУ платника"
                            />
                        </FormItem>

                        <FormItem
                            label="Назва платника:"
                            fullWidth
                        >
                            <Input
                                name="payer_name"
                                value={formData.payer_name}
                                onChange={handleInputChange}
                                placeholder="Введіть назву платника"
                            />
                        </FormItem>

                        <FormItem
                            label="Сума:"
                            required
                            fullWidth
                        >
                            <Input
                                name="debit"
                                value={formData.debit}
                                onChange={handleInputChange}
                                placeholder="Введіть суму"
                                type="number"
                            />
                        </FormItem>

                        <FormItem
                            label="Призначення платежу:"
                            required
                            fullWidth
                        >
                            <Input
                                name="payment_purpose"
                                value={formData.payment_purpose}
                                onChange={handleInputChange}
                                placeholder="Введіть призначення платежу"
                            />
                        </FormItem>

                        <FormItem label="Рахунок:" required fullWidth>
  <div style={{ position: 'relative' }}>
    <Input
      name="account"
      value={formData.account}
      onChange={handleInputChange}
      placeholder="Введіть номер рахунку"
      onFocus={() => setShowSuggestions(true)}
      onBlur={() => setTimeout(() => setShowSuggestions(false), 150)} // затримка, щоб дозволити клік
    />
    {showSuggestions && Array.isArray(suggestions) && suggestions.length > 0 && (
      <ul
        className="suggestions-list"
        style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 1000,
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '4px',
          maxHeight: '200px',
          overflowY: 'auto',
          listStyle: 'none',
          margin: 0,
          padding: '5px 0'
        }}
      >
        {suggestions
          .filter(acc => acc && typeof acc === 'object' && acc.iban)
          .map((acc, index) => (
            <li
            onClick={() => {
                const ibanWithPrefix = acc.iban.startsWith('UA') ? acc.iban : 'UA' + acc.iban;
        
                // Задаємо IBAN
                handleChange('account', ibanWithPrefix);
                setShowSuggestions(false);
        
                // Заповнюємо дані податку
                handleChange('tax_code', acc.classification_code || '');
                handleChange('tax_name', acc.classification_name || '');
                handleChange('tax_type', acc.tax_type || '');
            }}
        >
            {acc.iban}
            </li>
          ))}
      </ul>
    )}
  </div>
</FormItem>


                        <FormItem
                            label="Рік:"
                            required
                            fullWidth
                        >
                            <Input
                                name="year"
                                value={formData.year}
                                onChange={handleInputChange}
                                placeholder="Введіть рік"
                                type="number"
                            />
                        </FormItem>

                        <FormItem
                            label="Місяць:"
                            required
                            fullWidth
                        >
                            <Select
                                options={months}
                                value={months.find(option => option.value === Number(formData.month)) || null}
                                onChange={handleMonthChange}
                                placeholder="Оберіть місяць"
                                name="month"
                            />
                        </FormItem>

                        <FormItem
                            label="Округ:"
                            fullWidth
                        >
                            <Select
                                options={districts}
                                onChange={handleDistrictChange}
                                value={districts.find(option => option.value === Number(formData.district_id)) || null}
                                placeholder="Оберіть округ"
                                name="district_id"
                                isClearable
                            />
                        </FormItem>

                        <FormItem
                            label="Населений пункт:"
                            fullWidth
                        >
                            <Select
                                options={settlements}
                                onChange={handleSettlementChange}
                                value={settlements.find(option => option.value === Number(formData.settlement_id)) || null}
                                placeholder="Оберіть населений пункт"
                                name="settlement_id"
                                isDisabled={!formData.district_id}
                                isClearable
                            />
                        </FormItem>

                        <FormItem
                            label="Код податку:"
                            fullWidth
                        >
                            <Input
                                name="tax_code"
                                value={formData.tax_code}
                                onChange={handleInputChange}
                                placeholder="Введіть код податку"
                            />
                        </FormItem>

                        <FormItem
                            label="Назва податку:"
                            fullWidth
                        >
                            <Input
                                name="tax_name"
                                value={formData.tax_name}
                                onChange={handleInputChange}
                                placeholder="Введіть назву податку"
                            />
                        </FormItem>

                        <FormItem
                            label="Тип податку:"
                            fullWidth
                        >
                            <Input
                                name="tax_type"
                                value={formData.tax_type}
                                onChange={handleInputChange}
                                placeholder="Введіть тип податку"
                            />
                        </FormItem>

                        <div className="btn-group" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                            <Button
                                type="default"
                                icon={backIcon}
                                onClick={handleBack}
                            >
                                Назад
                            </Button>
                            <Button
                                type="primary"
                                icon={saveIcon}
                                onClick={handleSubmit}
                                loading={loading}
                            >
                                Зберегти
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DataInvoicesCreate;