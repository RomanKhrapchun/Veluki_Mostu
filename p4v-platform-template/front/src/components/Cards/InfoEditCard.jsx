import {noDataAvailable} from "../../utils/constants";

const InfoEditCard = ({createUser, create_date, editUser, editDate}) => {
    return (
        <div className="table-elements">
            <div className="table-main">
                <div className="table-wrapper">
                    <table className="table table--alt">
                        <caption className="table__caption">
                            Історія редагування
                        </caption>
                        <tbody>
                        <tr>
                            <td>Створення</td>
                            <td>
                                {createUser}
                                {create_date  ?? noDataAvailable}
                            </td>
                        </tr>
                        <tr>
                            <td>Редагування</td>
                            <td>
                                {editUser}
                                {editDate ?? noDataAvailable}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default InfoEditCard;