import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from "react-router-dom";
import { fetchFunction } from "../../utils/function";
import PageError from "../ErrorPage/PageError";
import SkeletonPage from "../../components/common/Skeleton/SkeletonPage";
import Button from "../../components/common/Button/Button";
import ViewCard from "../../components/Cards/ViewCard";
import { generateIcon, STATUS } from "../../utils/constants";

const backIcon = generateIcon('back');
const printIcon = generateIcon('print');

const BillDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [bill, setBill] = useState(null);
    const [status, setStatus] = useState(STATUS.PENDING);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadBill = async () => {
            try {
                const response = await fetchFunction(`/api/sportscomplex/bills/${id}`, {
                    method: 'get'
                });
                setBill(response.data);
                setStatus(STATUS.SUCCESS);
            } catch (err) {
                setError(err);
                setStatus(STATUS.ERROR);
            }
        };

        loadBill();
    }, [id]);

    const handlePrint = async () => {
        try {
            const response = await fetchFunction(`/api/sportscomplex/bills/${id}/receipt`, {
                method: 'get',
                responseType: 'blob'
            });

            const blob = response.data;
            const url = window.URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.setAttribute("download", `receipt-${bill.account_number}.docx`);
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (e) {
            alert("Не вдалося сформувати документ.");
        }
    };

    if (status === STATUS.PENDING) return <SkeletonPage />;
    if (status === STATUS.ERROR) return <PageError title="Не вдалося завантажити рахунок" statusError="500" />;

    return (
        <div className="container m-t">
            <Button
                className="m-b"
                icon={backIcon}
                onClick={() => navigate(-1)}
            >
                Повернутись до реєстру
            </Button>

            <ViewCard
            columns={[
                { title: 'ID', dataIndex: 'id' },
                { title: 'Номер рахунку', dataIndex: 'account_number' },
                { title: 'Платник', dataIndex: 'payer' },
                { title: 'Група послуг', dataIndex: 'service_group' },
                { title: 'Послуга', dataIndex: 'service_name' },
                { title: 'Одиниці', dataIndex: 'unit' },
                { title: 'Кількість', dataIndex: 'quantity' },
                { title: 'Сума', dataIndex: 'total_price', render: (val) => `${val} грн` },
                { title: 'Статус', dataIndex: 'status' },
            ]}
            dataSource={[bill]}
            />

            <Button
                className="btn--primary m-t"
                icon={printIcon}
                onClick={() => navigate(`/bills/${bill.id}/print`)}
            >
                Роздрукувати
            </Button>
        </div>
    );
};

export default BillDetails;
