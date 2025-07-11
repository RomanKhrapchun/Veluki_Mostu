import React, {useState, useEffect, useContext} from 'react';
import {
    useLocation,
    Outlet,
} from 'react-router-dom';
import './Home.css'
import {Context} from '../../main';
import {observer} from 'mobx-react-lite';
import Login from '../Login/Login';
import Loader from "../../components/Loader/Loader";
import Header from "../../components/Header/Header";
import {generateBreadcrumb, getKey} from "../../utils/function";
import Breadcrumb from "../../components/common/Breadcrumb/Breadcrumb";


const HomePage = () => {
    const {pathname} = useLocation()
    const isVisibleBreadcrumb = pathname.split('/').filter(v => v).length > 0
    const {store} = useContext(Context)
    const [selectedKey, setSelectedKey] = useState('')
    const [title, SetTitle] = useState('')
    const [routes, SetRoutes] = useState([])

    useEffect(() => {
        store.checkAuth()
    }, [store])

    useEffect(() => {
        if (store.isAuth) {
            const activeBreadcrumb = generateBreadcrumb(pathname, store?.user?.access_group)
            const title = getKey(pathname === '/' ? '/' : pathname.split('/')[1], store?.user?.access_group)
            SetRoutes(activeBreadcrumb)
            if (pathname === '/Profile') {
                SetTitle('Профіль')
            } else if (pathname.includes('add')) {
                SetTitle('Додати')
            } else if (pathname.includes('edit')) {
                SetTitle('Редагувати')
            } else if (pathname.includes('access')) {
                SetTitle('Доступ')
            } else {
                SetTitle(title)
            }
            setSelectedKey(pathname === '/' ? '/' : pathname.split('/')[1])
        }
    }, [pathname, store.isAuth, store.user])

    if (store.isLoading) {
        return (
            <div className="form-wrapper">
                <Loader/>
            </div>
        )
    }

    if (!store.isAuth) {
        return (<Login/>)
    }

    return (
        <React.Fragment>
            <Header selectedKey={selectedKey} activeKey={selectedKey}/>
            <main className="main">
                <div className="main__container">
                    <div className="main__inner">
                        {isVisibleBreadcrumb && (
                            <Breadcrumb title={title} routes={routes}/>
                        )}
                        <Outlet/>
                    </div>
                </div>
            </main>
        </React.Fragment>
    );
};

const Home = observer(HomePage);
export default Home;