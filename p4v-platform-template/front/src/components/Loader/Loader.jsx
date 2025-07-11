import React from 'react';
import './Loader.css'
import classNames from "classnames";

const Loader = ({loadingType, className,childStyle}) => {
    const classes = classNames("loader", className)
    return (
        <React.Fragment>
            {loadingType === 'dataType' ? (
                <div className={classes}>
                    <div className="loader__item" style={childStyle}></div>
                    <div className="loader__item" style={childStyle}></div>
                    <div className="loader__item" style={childStyle}></div>
                    <div className="loader__item" style={childStyle}></div>
                </div>
            ) : (
                <div className="page-loader">
                    <div className={classes}>
                        <div className="loader__item" style={childStyle}></div>
                        <div className="loader__item" style={childStyle}></div>
                        <div className="loader__item" style={childStyle}></div>
                        <div className="loader__item" style={childStyle}></div>
                    </div>
                </div>
            )}
        </React.Fragment>
    );
};

export default Loader;