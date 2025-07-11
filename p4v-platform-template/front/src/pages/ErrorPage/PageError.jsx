import './PageError.css'
import {Link} from "react-router-dom";
const PageError = ({statusError = "404", title='Схоже, цієї сторінки не знайдено.'}) => {
    return (
        <div className="page-error">
            <h1 className="title title--main">
                {statusError}
            </h1>
            <h3 className="title title--sm">
                {title}
            </h3>
            <Link to="/" className="btn">
                На головну
            </Link>
        </div>
    );
};

export default PageError;