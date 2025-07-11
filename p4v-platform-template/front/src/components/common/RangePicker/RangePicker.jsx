import React, {useEffect, useState} from 'react';
import Input from "../Input/Input";
import {isValidDate} from "../../../utils/function";

const RangePicker = ({value, onChange, disabled, name, endRangeTitle, startRangeTitle}) => {
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const handleStartDateChange = (newStartDate) => {
        setStartDate(newStartDate);
        if (!newStartDate && !endDate) {
            onChange?.(name, '')
        } else {
            onChange?.(name, `${newStartDate}_${endDate}`);
        }
    };

    const handleEndDateChange = (newEndDate) => {
        setEndDate(newEndDate);
        if (!newEndDate && !startDate) {
            onChange?.(name, '')
        } else {
            onChange?.(name, `${startDate}_${newEndDate}`)
        }
    };

    useEffect(() => {
        if (value && typeof value === 'string' && value.split('_').length === 2) {
            const [start, end] = value.split('_');
            if (isValidDate(start) || isValidDate(end)) {
                setStartDate(start);
                setEndDate(end);
            } else {
                setStartDate('');
                setEndDate('');
            }
        } else {
            setStartDate('');
            setEndDate('');
        }
    }, [value]);

    return (
        <React.Fragment>
            <div style={{display: "flex", flexDirection: "column", gap: '10px'}}>
                <label>
                    <p className={"input-description"}>{startRangeTitle}</p>
                    <Input
                        type="date"
                        name={"startDate"}
                        className="datepicker"
                        disabled={disabled}
                        value={startDate}
                        onChange={(_, value) => handleStartDateChange(value)}
                    />
                </label>
                <label>
                    <p className={"input-description"}>{endRangeTitle}</p>
                    <Input
                        type="date"
                        name={"endDate"}
                        disabled={disabled}
                        className="datepicker"
                        value={endDate}
                        onChange={(_, value) => handleEndDateChange(value)}
                    />
                </label>
            </div>
        </React.Fragment>
    );
};

export default React.memo(RangePicker);