import React from 'react';
import Tooltip from "../Tooltip/Tooltip";
import classNames from "classnames";

const FormItem = ({
                      children,
                      error = "",
                      tooltip = "",
                      label = "",
                      required = false,
                      fullWidth = false,
                      htmlFor,
                  }) => {

    const classes = classNames({"components-container__full-width": fullWidth})
    return (
        <div className={classes}>
            {htmlFor && label ? (
                <label htmlFor={htmlFor}>
                    {label}{required ? '*' : null}
                </label>
            ) : <React.Fragment>
                {label}{required ? '*' : null}
            </React.Fragment>
            }
            {tooltip && <Tooltip caption={tooltip}/>}
            {React.cloneElement(children, {id: htmlFor})}
            {error && <p className="paragraph paragraph--sm input-error">{error}</p>}
        </div>
    );
};

export default FormItem;