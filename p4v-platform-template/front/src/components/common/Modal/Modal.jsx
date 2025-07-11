import './Modal.css'
import Button from "../Button/Button";
import classNames from "classnames";
import Loader from "../../Loader/Loader";

const Modal = ({
                   children,
                   className,
                   onClose,
                   onOk,
                   title = 'Модальне вікно',
                   cancelText = 'Відмінити',
                   okText = 'Ок',
                   confirmLoading = false,
               }) => {

    const classes = classNames("modal-window-wrapper", className)

    return (
        <div className={classes}>
            <div className="modal-window">
                <h3 className="title title--sm modal-window__title">
                    {title}
                </h3>
                {children}
                <div className="modal-window__bottom">
                    <div className="btn-group">
                        <Button
                            className="btn--secondary"
                            onClick={onClose}
                            disabled={confirmLoading}>
                            {cancelText}
                        </Button>
                        <Button
                            disabled={confirmLoading}
                            icon={confirmLoading
                                ? <Loader loadingType="dataType" className="loader--sm" childStyle={{backgroundColor:'white'}}/> : null}
                            onClick={onOk}>
                            {confirmLoading ? null : okText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Modal;