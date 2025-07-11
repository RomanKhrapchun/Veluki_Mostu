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

const PayerDatabaseCreate = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const [loading, setLoading] = useState(false);
    const [districts, setDistricts] = useState([]);
    const [settlements, setSettlements] = useState([]);
    const [payerTypes, setPayerTypes] = useState([]);
    const [formData, setFormData] = useState({
        edrpou: '',
        district_id: null,
        settlement_id: null,
        payer_type_id: null,
        payer_name: ''
    });

    useEffect(() => {
        // Fetch districts, settlements and payer types for dropdowns
        const fetchData = async () => {
            try {
                const [districtsResponse, payerTypesResponse] = await Promise.all([
                    fetchFunction('api/revenue/districts'),
                    fetchFunction('api/revenue/payer-types'),
                ]);

                setDistricts(districtsResponse.data.map(district => ({
                    value: district.id,
                    label: district.district_name
                })));

                setPayerTypes(payerTypesResponse.data.map(type => ({
                    value: type.id,
                    label: type.type_name
                })));
            } catch (error) {
                notification({
                    type: 'error',
                    title: "Помилка",
                    message: "Не вдалося завантажити довідники",
                    placement: 'top',
                });
            }
        };

        fetchData();
    }, [notification]);

    useEffect(() => {
        // Fetch settlements when district changes
        const fetchSettlements = async () => {
            if (formData.district_id) {
                try {
                    const response = await fetchFunction(`api/revenue/settlements/by-district/${formData.district_id}`);
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
    }, [formData.district_id, notification]);

    const handleBack = useCallback(() => {
        navigate('/revenue/payer-database');
    }, [navigate]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        handleChange(name, value);
    };

    const handleDistrictChange = (selected) => {
        handleChange('district_id', selected ? selected.value : null);
        // Reset settlement when district changes
        handleChange('settlement_id', null);
    };

    const handleSettlementChange = (selected) => {
        handleChange('settlement_id', selected ? selected.value : null);
    };

    const handlePayerTypeChange = (selected) => {
        handleChange('payer_type_id', selected ? selected.value : null);
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            // Validate form
            if (!formData.edrpou || !formData.district_id || !formData.settlement_id || !formData.payer_type_id || !formData.payer_name) {
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: "Заповніть всі обов'язкові поля",
                    placement: 'top',
                });
                return;
            }

            await fetchFunction('api/revenue/payer-database', {
                method: 'post',
                data: formData
            });

            notification({
                type: 'success',
                title: "Успіх",
                message: "Платника успішно створено",
                placement: 'top',
            });

            navigate('/revenue/payer-database');
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
                    Створення платника
                </div>
                {/*<div className="page-container__actions">
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
                </div>*/}
            </div>
            <div className="page-container__content">
                <div className="card">
                    <div className="card__header">
                        <h2>Інформація про платника</h2>
                    </div>
                    <div className="card__content">
                        <FormItem
                            label="ЄДРПОУ:"
                            required
                            fullWidth
                        >
                            <Input
                                name="edrpou"
                                value={formData.edrpou}
                                onChange={handleInputChange}
                                placeholder="Введіть ЄДРПОУ"
                            />
                        </FormItem>

                        <FormItem
                            label="Назва платника:"
                            required
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
                            label="Округ:"
                            required
                            fullWidth
                        >
                            <Select
                                options={districts}
                                onChange={handleDistrictChange}
                                value={districts.find(option => option.value === formData.district_id) || null}
                                placeholder="Оберіть округ"
                                isClearable
                            />
                        </FormItem>

                        <FormItem
                            label="Населений пункт:"
                            required
                            fullWidth
                        >
                            <Select
                                options={settlements}
                                onChange={handleSettlementChange}
                                value={settlements.find(option => option.value === formData.settlement_id) || null}
                                placeholder="Оберіть населений пункт"
                                isDisabled={!formData.district_id}
                                isClearable
                            />
                        </FormItem>

                        <FormItem
                            label="Тип платника:"
                            required
                            fullWidth
                        >
                            <Select
                                options={payerTypes}
                                onChange={handlePayerTypeChange}
                                value={payerTypes.find(option => option.value === formData.payer_type_id) || null}
                                placeholder="Оберіть тип платника"
                                isClearable
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

export default PayerDatabaseCreate;