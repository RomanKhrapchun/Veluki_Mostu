import './dashboard.css'
import {dashboardMessage, siteName} from "../../utils/constants.jsx";
const Dashboard = () => {

    return (
        <div className="page-home">
            <div className="page-home__container">
                <div className="page-home__inner">
                    <h1 className="title title--main">
                        {siteName}
                    </h1>
                    <p className="paragraph paragraph--lg">
                        {dashboardMessage}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;