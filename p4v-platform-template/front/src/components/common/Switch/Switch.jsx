import React, {useState} from 'react';
import classNames from "classnames";
import './Switch.css'

const Switch = ({
                    checked = 'Так',
                    unChecked = 'Ні',
                    name,
                    onChange,
                    className,
                    value = false,
                    disabled,
                    ...attrs
                }) => {

    const [isChecked, setIsChecked] = useState(value ? true : false);
    const classes = classNames("checkbox-wrapper", className)

    return (
        <React.Fragment>
            <div className={classes}>
                <div className="checkbox-main">
                    <input
                        {...attrs}
                        className="checkbox"
                        name={name}
                        type="checkbox"
                        disabled={disabled}
                        checked={isChecked}
                        onChange={(e) => {
                            setIsChecked(!isChecked)
                            onChange?.(name, e.target.checked)
                        }}/>
                    <span className="checkbox-label" onClick={(event) => {
                        const newChecked = !isChecked;
                        setIsChecked(newChecked);
                        onChange?.(name, newChecked);
                    }}>
                        <span>{checked}</span>
                        <span>{unChecked}</span>
                    </span>
                </div>
            </div>
        </React.Fragment>
    );
};

export default Switch;

