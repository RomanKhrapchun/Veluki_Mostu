// src/pages/KindergartenDebtorsList.jsx
import React, {
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
  } from 'react';
  import { useNavigate } from 'react-router-dom';
  
  import useFetch from '../../hooks/useFetch.jsx';
  import { fetchFunction, hasOnlyAllowedParams, validateFilters } from '../../utils/function.js';
  
  import Table from '../../components/common/Table/Table.jsx';
  import Pagination from '../../components/common/Pagination/Pagination.jsx';
  import Input from '../../components/common/Input/Input.jsx';
  import Button from '../../components/common/Button/Button.jsx';
  import Dropdown from '../../components/common/Dropdown/Dropdown.jsx';
  import Modal from '../../components/common/Modal/Modal.jsx';
  import SkeletonPage from '../../components/common/Skeleton/SkeletonPage.jsx';
  import PageError from '../ErrorPage/PageError.jsx';
  
  import { generateIcon, iconMap, STATUS } from '../../utils/constants.jsx';
  import { useNotification } from '../../hooks/useNotification.js';
  import { Context } from '../../main.jsx';
  import classNames from 'classnames';
  import { Transition } from 'react-transition-group';
  
  // ── іконки ────────────────────────────────────────────────────────────────────
  const viewIcon = generateIcon(iconMap.view);
  const downloadIcon = generateIcon(iconMap.download);
  const editIcon = generateIcon(iconMap.edit);
  const filterIcon = generateIcon(iconMap.filter);
  const searchIcon = generateIcon(iconMap.search, 'input-icon');
  const dropDownIcon = generateIcon(iconMap.arrowDown);
  
  const dropDownStyle = { width: '100%' };
  const childDropDownStyle = { justifyContent: 'center' };
  
  const KindergartenDebtorsList = () => {
    const navigate = useNavigate();
    const notification = useNotification();
    const { store } = useContext(Context);
    const nodeRef = useRef(null);
  
    // ── стан ────────────────────────────────────────────────────────────────────
    const [stateKD, setStateKD] = useState({
      isOpen: false,
      selectData: {},
      confirmLoading: false,
      itemId: null,
      sendData: { limit: 16, page: 1 },
    });
  
    const isFirstRun = useRef(true);
  
    const { error, status, data, retryFetch } = useFetch(
      'api/kindergarten/filter',
      { method: 'post', data: stateKD.sendData },
    );
  
    const startRecord =
      ((stateKD.sendData.page || 1) - 1) * stateKD.sendData.limit + 1;
    const endRecord = Math.min(
      startRecord + stateKD.sendData.limit - 1,
      data?.totalItems || 1,
    );
  
    // ── повторне завантаження при зміні параметрів ───────────────────────────────
    useEffect(() => {
      if (isFirstRun.current) {
        isFirstRun.current = false;
        return;
      }
      retryFetch('api/kindergarten/filter', {
        method: 'post',
        data: stateKD.sendData,
      });
    }, [stateKD.sendData, retryFetch]);
  
    // ── колонки таблиці ─────────────────────────────────────────────────────────
    const columnTable = useMemo(
      () => [
        { title: 'ID', dataIndex: 'id' },
        { title: 'Дата', dataIndex: 'date' },
        { title: 'П.І.Б', dataIndex: 'child_name' },
        {
          title: 'Заборгованість (₴)',
          dataIndex: 'debt_amount',
          /*render: (value) => value.toLocaleString('uk-UA'),*/
        },
        { title: 'Група', dataIndex: 'group_number' },
        { title: 'Садочок', dataIndex: 'kindergarten_name' },
        {
          title: 'Дія',
          dataIndex: 'action',
          render: (_, { id }) => (
            <div className="btn-sticky" style={{ justifyContent: 'center' }}>
              {/* <Button
                title="Перегляд"
                icon={viewIcon}
                onClick={() => navigate(`/kindergarten-debtor/${id}`)}
              />
              <Button
                title="Завантажити"
                icon={downloadIcon}
                onClick={() => handleOpenModal(id)}
              /> */}
              <Button
                title="Друк"
                icon={editIcon}
                onClick={() => navigate(`/kindergarten/${id}/print`)}
              />
            </div>
          ),
        },
      ],
      [navigate],
    );
  
    // ── дані для таблиці ────────────────────────────────────────────────────────
    const tableData = useMemo(() => {
      if (data?.items?.length) {
        return data.items.map((el) => ({
          key: el.id,
          id: el.id,
          date: el.date, // очікується yyyy-mm-dd або dd.mm.yyyy
          child_name: el.child_name,
          debt_amount: el.debt_amount,
          group_number: el.group_number,
          kindergarten_name: el.kindergarten_name,
        }));
      }
      return [];
    }, [data]);
  
    // ── меню вибору “записів на сторінку” ────────────────────────────────────────
    const itemMenu = [
      ...[16, 32, 48].map((limit) => ({
        label: String(limit),
        key: String(limit),
        onClick: () => {
          if (stateKD.sendData.limit !== limit) {
            setStateKD((prev) => ({
              ...prev,
              sendData: { ...prev.sendData, limit, page: 1 },
            }));
          }
        },
      })),
    ];
  
    // ── хендлери фільтрів / пагінації ───────────────────────────────────────────
    const filterHandleClick = () =>
      setStateKD((prev) => ({ ...prev, isOpen: !prev.isOpen }));
  
    const onHandleChange = (name, value) =>
      setStateKD((prev) => ({
        ...prev,
        selectData: { ...prev.selectData, [name]: value },
      }));
  
    const resetFilters = () => {
      if (Object.values(stateKD.selectData).some(Boolean)) {
        setStateKD((prev) => ({ ...prev, selectData: {} }));
      }
      if (!hasOnlyAllowedParams(stateKD.sendData, ['limit', 'page'])) {
        setStateKD((prev) => ({
          ...prev,
          sendData: { limit: prev.sendData.limit, page: 1 },
        }));
      }
    };
  
    const applyFilter = () => {
      const isAnyInputFilled = Object.values(stateKD.selectData).some((v) =>
        Array.isArray(v) ? v.length : v,
      );
      if (!isAnyInputFilled) return;
  
      const validation = validateFilters(stateKD.selectData);
      if (!validation.error) {
        setStateKD((prev) => ({
          ...prev,
          sendData: { ...validation, limit: prev.sendData.limit, page: 1 },
        }));
      } else {
        notification({
          type: 'warning',
          placement: 'top',
          title: 'Помилка',
          message: validation.message ?? 'Щось пішло не так.',
        });
      }
    };
  
    const onPageChange = useCallback(
      (page) => {
        if (stateKD.sendData.page !== page) {
          setStateKD((prev) => ({
            ...prev,
            sendData: { ...prev.sendData, page },
          }));
        }
      },
      [stateKD.sendData.page],
    );
  
    // ── модальне вікно "Завантажити" ─────────────────────────────────────────────
    const handleOpenModal = (id) => {
      setStateKD((prev) => ({ ...prev, itemId: id }));
      document.body.style.overflow = 'hidden';
    };
  
    const handleCloseModal = () => {
      setStateKD((prev) => ({ ...prev, itemId: null }));
      document.body.style.overflow = 'auto';
    };
  
    const handleGenerate = async () => {
      if (!stateKD.itemId) return;
      try {
        setStateKD((prev) => ({ ...prev, confirmLoading: true }));
        const fetchData = await fetchFunction(
          `api/kindergarten/generate/${stateKD.itemId}`,
          { method: 'get', responseType: 'blob' },
        );
        notification({
          placement: 'top',
          duration: 2,
          title: 'Успіх',
          message: 'Успішно сформовано.',
          type: 'success',
        });
        const blob = fetchData.data;
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'debtor-info.docx';
        document.body.appendChild(link);
        link.click();
        link.remove();
      } catch (err) {
        if (err?.response?.status === 401) {
          notification({
            type: 'warning',
            title: 'Помилка',
            message: 'Не авторизований',
            placement: 'top',
          });
          store.logOff();
          return navigate('/');
        }
        notification({
          type: 'warning',
          title: 'Помилка',
          message: err?.response?.data?.message ?? err.message,
          placement: 'top',
        });
      } finally {
        setStateKD((prev) => ({
          ...prev,
          confirmLoading: false,
          itemId: null,
        }));
        document.body.style.overflow = 'auto';
      }
    };
  
    // ── рендер ──────────────────────────────────────────────────────────────────
    if (status === STATUS.ERROR) {
      return <PageError title={error.message} statusError={error.status} />;
    }
  
    return (
      <>
        {status === STATUS.PENDING && <SkeletonPage />}
  
        {status === STATUS.SUCCESS && (
          <>
            <div className="table-elements">
              <div className="table-header">
                <h2 className="title title--sm">
                  {data?.items?.length ? (
                    <>
                      Показує{' '}
                      {startRecord !== endRecord
                        ? `${startRecord}-${endRecord}`
                        : startRecord}{' '}
                      з {data?.totalItems || 1}
                    </>
                  ) : (
                    <>Записів не знайдено</>
                  )}
                </h2>
  
                <div className="table-header__buttons">
                  <Dropdown
                    icon={dropDownIcon}
                    iconPosition="right"
                    style={dropDownStyle}
                    childStyle={childDropDownStyle}
                    caption={`Записів: ${stateKD.sendData.limit}`}
                    menu={itemMenu}
                  />
                  <Button
                    className="table-filter-trigger"
                    onClick={filterHandleClick}
                    icon={filterIcon}
                  >
                    Фільтри
                  </Button>
                </div>
              </div>
  
              <div className="table-main">
                <div
                  style={{ width: data?.items?.length ? 'auto' : '100%' }}
                  className={classNames('table-and-pagination-wrapper', {
                    'table-and-pagination-wrapper--active': stateKD.isOpen,
                  })}
                >
                  <Table columns={columnTable} dataSource={tableData} />
                  <Pagination
                    className="m-b"
                    currentPage={Number(data?.currentPage) || 1}
                    totalCount={data?.totalItems || 1}
                    pageSize={stateKD.sendData.limit}
                    onPageChange={onPageChange}
                  />
                </div>
  
                {/* ───────────── ФІЛЬТРИ ───────────── */}
                <div
                  className={`table-filter ${
                    stateKD.isOpen ? 'table-filter--active' : ''
                  }`}
                >
                  <h3 className="title title--sm">Фільтри</h3>
  
                  <div className="btn-group">
                    <Button onClick={applyFilter}>Застосувати</Button>
                    <Button className="btn--secondary" onClick={resetFilters}>
                      Скинути
                    </Button>
                  </div>
  
                  <div className="table-filter__item">
                    <Input
                      icon={searchIcon}
                      name="full_name"
                      type="text"
                      placeholder="Введіть ПІБ"
                      value={stateKD.selectData.full_name || ''}
                      onChange={onHandleChange}
                    />
                  </div>
  
                  <div className="table-filter__item">
                    <Input
                      icon={searchIcon}
                      name="group_name"
                      type="text"
                      placeholder="Група садочку"
                      value={stateKD.selectData.group_name || ''}
                      onChange={onHandleChange}
                    />
                  </div>
  
                  <div className="table-filter__item">
                    <Input
                      icon={searchIcon}
                      name="kindergarten_name"
                      type="text"
                      placeholder="Назва садочку"
                      value={stateKD.selectData.kindergarten_name || ''}
                      onChange={onHandleChange}
                    />
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
  
        {/* ───────────── МОДАЛЬНЕ ПІДТВЕРДЖЕННЯ ───────────── */}
        <Transition in={!!stateKD.itemId} timeout={200} unmountOnExit nodeRef={nodeRef}>
          {(state) => (
            <Modal
              className={state === 'entered' ? 'modal-window-wrapper--active' : ''}
              onClose={handleCloseModal}
              onOk={handleGenerate}
              confirmLoading={stateKD.confirmLoading}
              cancelText="Скасувати"
              okText="Так, сформувати"
              title="Підтвердження формування довідки"
            >
              <p className="paragraph">
                Ви впевнені, що бажаєте сформувати довідку боржника?
              </p>
            </Modal>
          )}
        </Transition>
      </>
    );
  };
  
  export default KindergartenDebtorsList;
  