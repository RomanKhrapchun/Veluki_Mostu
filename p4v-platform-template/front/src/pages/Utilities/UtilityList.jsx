import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useFetch from "../../hooks/useFetch";
import Table from "../../components/common/Table/Table";
import Button from "../../components/common/Button/Button";
import PageError from "../ErrorPage/PageError";
import classNames from "classnames";
import Pagination from "../../components/common/Pagination/Pagination";
import Input from "../../components/common/Input/Input";
import { fetchFunction, hasOnlyAllowedParams, validateFilters } from "../../utils/function";
import Modal from "../../components/common/Modal/Modal";
import { Transition } from 'react-transition-group';
import Select from "../../components/common/Select/Select";
import { useNotification } from "../../hooks/useNotification";
import { Context } from "../../main";
import Dropdown from "../../components/common/Dropdown/Dropdown";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";
import { generateIcon, iconMap, STATUS } from "../../utils/constants";

// Іконки
const deleteIcon = generateIcon(iconMap.delete);
const editIcon = generateIcon(iconMap.edit);
const viewIcon = generateIcon(iconMap.view);
const downloadIcon = generateIcon(iconMap.download);
const addIcon = generateIcon(iconMap.add);
const filterIcon = generateIcon(iconMap.filter);
const searchIcon = generateIcon(iconMap.search, 'input-icon');
const dropDownIcon = generateIcon(iconMap.arrowDown);
const dropDownStyle = { width: '100%' };
const childDropDownStyle = { justifyContent: 'center' };

const serviceOptions = [
    { value: 'ТПВ', label: 'ТПВ' },
    { value: 'Квартирна плата', label: 'Квартирна плата' },
];

const UtilityList = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const [stateUtility, setStateUtility] = useState({
        isOpen: false,
        confirmLoading: false,
        itemId: null,
        selectData: {},
        sendData: {
            limit: 16,
            page: 1,
        }
    });
    const nodeRef = useRef(null);
    const isFirstRun = useRef(true);
    const { error, status, data, retryFetch } = useFetch('api/utilities/filter', {
        method: 'post',
        data: stateUtility.sendData
    });
    const startRecord = ((stateUtility.sendData.page || 1) - 1) * stateUtility.sendData.limit + 1;
    const endRecord = Math.min(startRecord + stateUtility.sendData.limit - 1, data?.totalItems || 1);

    useEffect(() => {
        if (isFirstRun.current) {
            isFirstRun.current = false;
            return;
        }
        retryFetch('api/utilities/filter', {
            method: 'post',
            data: stateUtility.sendData,
        });
    }, [stateUtility.sendData, retryFetch]);

    const handleOpenModal = (recordId) => {
        setStateUtility(prevState => ({
            ...prevState,
            itemId: recordId,
        }));
        document.body.style.overflow = 'hidden';
    };

    const handleCloseModal = () => {
        setStateUtility(prevState => ({
            ...prevState,
            itemId: null,
        }));
        document.body.style.overflow = 'auto';
    };

    const handleGenerate = async () => {
        if (stateUtility.itemId) {
            try {
                setStateUtility(prevState => ({
                    ...prevState,
                    confirmLoading: true,
                }));
                const fetchData = await fetchFunction(`api/utilities/generate/${stateUtility.itemId}`, {
                    method: 'get',
                    responseType: 'blob'
                });
                notification({
                    placement: "top",
                    duration: 2,
                    title: 'Успіх',
                    message: "Успішно сформовано.",
                    type: 'success'
                });
                const blob = fetchData.data;
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'generated.docx';
                document.body.appendChild(a);
                a.click();
                a.remove();
            } catch (error) {
                if (error?.response?.status === 401) {
                    notification({
                        type: 'warning',
                        title: "Помилка",
                        message: error?.response?.status === 401 ? "Не авторизований" : error.message,
                        placement: 'top',
                    });
                    store.logOff();
                    return navigate('/');
                }
                notification({
                    type: 'warning',
                    title: "Помилка",
                    message: error?.response?.data?.message ? error.response.data.message : error.message,
                    placement: 'top',
                });
            } finally {
                setStateUtility(prevState => ({
                    ...prevState,
                    confirmLoading: false,
                    itemId: null,
                }));
                document.body.style.overflow = 'auto';
            }
        }
    };

    const columnTable = useMemo(() => {
        return [
            { title: 'Платник', dataIndex: 'payerident' },
            { title: 'П.І.Б', dataIndex: 'fio' },
            { title: 'Послуга', dataIndex: 'service' },
            {
                title: 'Сума', dataIndex: 'charge',
                render: (_, { charge }) => <span>{Number(charge).toFixed(2)}</span>
            },
            { title: 'Адреса', dataIndex: 'adress' },
            {
                title: 'Дія', dataIndex: 'action',
                render: (_, { payerident, charge }) => (
                    <div className="btn-sticky" style={{ justifyContent: 'center' }}>
                        <Button title="Перегляд" icon={viewIcon} onClick={() => navigate(`/utilities/${payerident}`)} />
                        {(charge > 0) && (
                            <>
                                <Button title="Завантажити" icon={downloadIcon} onClick={() => handleOpenModal(payerident)} />
                                <Button title="Реквізити" icon={editIcon} onClick={() => navigate(`/utilities/${payerident}/print`)} />
                            </>
                        )}
                    </div>
                ),
            }
        ];
    }, [navigate]);

    const tableData = useMemo(() => {
        if (data?.items?.length) {
            return data.items.map(el => ({
                key: el.payerident,
                payerident: el.payerident,
                fio: el.fio,
                service: el.service,
                charge: el.charge,
                adress: el.adress,
            }));
        }
        return [];
    }, [data]);

    const itemMenu = [
        { label: '16', key: '16', onClick: () => setStateUtility(prev => ({ ...prev, sendData: { ...prev.sendData, limit: 16, page: 1 } })) },
        { label: '32', key: '32', onClick: () => setStateUtility(prev => ({ ...prev, sendData: { ...prev.sendData, limit: 32, page: 1 } })) },
        { label: '48', key: '48', onClick: () => setStateUtility(prev => ({ ...prev, sendData: { ...prev.sendData, limit: 48, page: 1 } })) },
    ];

    const filterHandleClick = () => {
        setStateUtility(prevState => ({
            ...prevState,
            isOpen: !prevState.isOpen,
        }));
    };

    const addHandleClick = () => {
        navigate('/utility/add');
    };

    const onHandleChange = (name, value) => {
        setStateUtility(prevState => ({
            ...prevState,
            selectData: {
                ...prevState.selectData,
                [name]: value?.value || value 
            }
        }));
    };

    const resetFilters = () => {
        setStateUtility(prevState => ({
            ...prevState,
            selectData: {},
            sendData: {
                limit: prevState.sendData.limit,
                page: 1,
            }
        }));
    };

    const applyFilter = () => {
        const isAnyInputFilled = Object.values(stateUtility.selectData).some(value => value && (Array.isArray(value) ? value.length > 0 : true));
        if (isAnyInputFilled) {
            const dataValidation = validateFilters(stateUtility.selectData);
            if (!dataValidation.error) {
                setStateUtility(prevState => ({
                    ...prevState,
                    sendData: {
                        ...prevState.sendData,
                        ...prevState.selectData,
                        page: 1,
                    }
                }));
            } else {
                notification({
                    type: 'warning',
                    placement: 'top',
                    title: 'Помилка',
                    message: dataValidation.message ?? 'Щось пішло не так.',
                });
            }
        }
    };

    const onPageChange = useCallback((page) => {
        setStateUtility(prevState => ({
            ...prevState,
            sendData: {
                ...prevState.sendData,
                page,
            }
        }));
    }, []);

    if (status === STATUS.ERROR) {
        return <PageError title={error.message} statusError={error.status} />;
    }

    return (
        <React.Fragment>
            {status === STATUS.PENDING ? <SkeletonPage /> : null}
            {status === STATUS.SUCCESS ?
                <React.Fragment>
                    <div className="table-elements">
                        <div className="table-header">
                            <h2 className="title title--sm">
                                {data?.items && Array.isArray(data?.items) && data?.items.length > 0 ?
                                    <React.Fragment>
                                        Показує {startRecord !== endRecord ? `${startRecord}-${endRecord}` : startRecord} з {data?.totalItems || 1}
                                    </React.Fragment> : <React.Fragment>Записів не знайдено</React.Fragment>
                                }
                            </h2>
                            <div className="table-header__buttons">
                                <Button icon={addIcon} onClick={addHandleClick}>Додати</Button>
                                <Dropdown
                                    icon={dropDownIcon}
                                    iconPosition="right"
                                    style={dropDownStyle}
                                    childStyle={childDropDownStyle}
                                    caption={`Записів: ${stateUtility.sendData.limit}`}
                                    menu={itemMenu} />
                                <Button className="table-filter-trigger" onClick={filterHandleClick} icon={filterIcon}>Фільтри</Button>
                            </div>
                        </div>
                        <div className="table-main">
                            <div style={{ width: `${data?.items?.length > 0 ? 'auto' : '100%'}` }}
                                className={classNames("table-and-pagination-wrapper", { "table-and-pagination-wrapper--active": stateUtility.isOpen })}>
                                <Table columns={columnTable} dataSource={tableData} />
                                <Pagination
                                    className="m-b"
                                    currentPage={parseInt(data?.currentPage) || 1}
                                    totalCount={data?.totalItems || 1}
                                    pageSize={stateUtility.sendData.limit}
                                    onPageChange={onPageChange} />
                            </div>
                            <div className={`table-filter ${stateUtility.isOpen ? "table-filter--active" : ""}`}>
                                <h3 className="title title--sm">Фільтри</h3>
                                <div className="btn-group">
                                    <Button onClick={applyFilter}>Застосувати</Button>
                                    <Button className="btn--secondary" onClick={resetFilters}>Скинути</Button>
                                </div>
                                <div className="table-filter__item">
                                    <Input
                                        icon={searchIcon}
                                        name="title"
                                        type="text"
                                        placeholder="Введіть номер платника або ПІБ"
                                        value={stateUtility.selectData?.title || ''}
                                        onChange={onHandleChange} />
                                </div>
                                <div className="table-filter__item">
                                    <h4 className="input-description">Послуга</h4>
                                    <Select
                                        name="service"
                                        placeholder="Виберіть послугу..."
                                        options={serviceOptions}
                                        //value={stateUtility.selectData?.service || null}
                                        value={stateUtility.selectData?.service ? { value: stateUtility.selectData.service, label: serviceOptions.find(opt => opt.value === stateUtility.selectData.service)?.label } : null}
                                        onChange={onHandleChange} />
                                </div>
                            </div>
                        </div>
                    </div>
                </React.Fragment> : null
            }
            <Transition in={!!stateUtility.itemId} timeout={200} unmountOnExit nodeRef={nodeRef}>
                {state => (
                    <Modal
                        className={`${state === 'entered' ? "modal-window-wrapper--active" : ""}`}
                        onClose={handleCloseModal}
                        onOk={handleGenerate}
                        confirmLoading={stateUtility.confirmLoading}
                        cancelText="Скасувати"
                        okText="Так, сформувати"
                        title="Підтвердження формування реквізитів">
                        <p className="paragraph">Ви впевнені, що бажаєте виконати операцію "Сформувати реквізити"?</p>
                    </Modal>
                )}
            </Transition>
        </React.Fragment>
    );
};

export default UtilityList;