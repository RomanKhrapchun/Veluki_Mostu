import classNames from "classnames";

const Button = ({
                    children,
                    onClick,
                    className,
                    textAlign,
                    disabled = false,
                    icon,
                    type,
                    iconPosition,
                    active = false,
                    ...attrs
                }) => {

    const classes = classNames(
        'btn',
        className,
        {
            'btn--active': active,
            'btn--left': textAlign === 'left',
        },
    )

    return (
        <button
            {...attrs}
            className={classes}
            disabled={disabled}
            type={type}
            onClick={onClick}>
            {iconPosition === 'right' ? (
                <>
                    {children && <span>{children}</span>}
                    {icon}
                </>
            ) : (
                <>
                    {icon}
                    {children && <span>{children}</span>}
                </>
            )}
        </button>
    );
};

export default Button;