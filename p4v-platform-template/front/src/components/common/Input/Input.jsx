import {forwardRef} from 'react';
import classNames from "classnames";

const Input = forwardRef(({
                              className,
                              value,
                              onChange,
                              name,
                              disabled = false,
                              placeholder,
                              icon,
                              style,
                              type,
                              ...attrs
                          }, ref) => {

    const classes = classNames({'input': type !== 'date'}, className)

    return (
        icon ? (
            <div className="input-wrapper">
                {icon}
                <input
                    {...attrs}
                    ref={ref}
                    type={type}
                    name={name}
                    style={style}
                    className={classes}
                    value={value ?? ''}
                    onChange={(e) => onChange?.(name, e.target.value)}
                    disabled={disabled}
                    placeholder={placeholder}
                />
            </div>
        ) : (
            <input
                {...attrs}
                ref={ref}
                type={type}
                name={name}
                style={style}
                className={classes}
                value={value ?? ''}
                onChange={(e) => onChange?.(name, e.target.value)}
                disabled={disabled}
                placeholder={placeholder}
            />
        )
    )
});

Input.displayName = 'Input';
export default Input;