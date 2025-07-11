import {card} from "../../utils/constants";

const EmptyCard = ({infoMessage = '', errorMessage = ''}) => {
    return (
        <div className="table-elements">
            <div className="table-main">
                <div className="table-wrapper">
                    <table className="table table--alt">
                        <thead>
                        <tr>
                            <th style={{width: '300px'}}>
                                {infoMessage ?? card.mainInfo}
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td>
                                {errorMessage ?? card.errorMessage}
                            </td>
                        </tr>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default EmptyCard;