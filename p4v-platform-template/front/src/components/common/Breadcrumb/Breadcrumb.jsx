import './Breadcrumb.css'
import {Link, useLocation} from "react-router-dom";

const Breadcrumb = ({title, routes = [], itemRender}) => {
    const {pathname} = useLocation()
    const route = pathname.split('/').filter(v => v)
    route.unshift('/')
    const defaultItemRender = (routes) => {
        if (Array.isArray(routes) && routes.length === 0) {
            routes = route
        }
        return routes.map((element, index) => {
            const isLastItem = routes.indexOf(element) === routes.length - 1;
            if (isLastItem) {
                return <li key={index}>
                    <Link className="link link--inactive">
                        {element.breadcrumbName || element.path || element}
                    </Link>
                </li>
            } else {
                return <li key={index}>
                    <Link to={element.path || element} className="link">
                        {element.breadcrumbName || element.path || element}
                    </Link>
                </li>
            }
        })
    }

    return (<section className="page-title">
        <div className="page-title__top">
            <h1 className="title title--main">
                {title}
            </h1>
        </div>
        {routes && (<ul className="breadcrumb">
            {typeof itemRender === 'function' ? itemRender(routes) : defaultItemRender(routes)}
        </ul>)}
    </section>);
};

export default Breadcrumb;
