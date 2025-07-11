const FormSeparator = ({caption = "", style}) => {

    return (
        <div className="components-container__full-width">
            <h2 className="title title--sm" style={style}>
                {caption}
            </h2>
        </div>
    );
};

export default FormSeparator;