import React, {useContext, useState} from 'react';
import {observer} from 'mobx-react-lite';
import './Login.css'
import logo from '../../assets/logo.png'
import Button from "../../components/common/Button/Button";
import Input from "../../components/common/Input/Input";
import Footer from "../../components/Footer/Footer";
import {Context} from "../../main";
import {useNotification} from "../../hooks/useNotification";
import {altCityName, generateIcon, iconMap, siteName} from "../../utils/constants";

const usernameIcon = generateIcon(iconMap.profile, "input-icon")
const passwordIcon = generateIcon(iconMap.password, "input-icon")
const styleInput = {width: '300px'}
const LoginPage = () => {
    const {store} = useContext(Context)
    const notification = useNotification()
    const [state, setState] = useState({
        username: '',
        password: '',
    })
    const onChangeHandler = (name, value) => {
        if (name === 'username') {
            value = value.replaceAll(' ', '')
        }
        setState(prevState => ({
            ...prevState,
            [name]: value,
        }))
    }

    const onSubmit = async (e) => {
        e.preventDefault();
        if (state.username && state.password) {
            await store.login(state.username, state.password)
            setState({username: '', password: ''})
            if (store.isError) notification({
                type: "warning",
                title: "Помилка авторизації",
                message: store.errorMessage,
                placement: "top"
            });
        }
    }

    return (
        <React.Fragment>
            <main className="main">
                <div className="main__container">
                    <div className="main__inner">
                        <div className="page-login">
                            <div className={"page-login__logo"}>
                                <img src={logo} alt={altCityName} style={{width:"90px",height:"110px"}}/>
                            </div>
                            <h3 className="title title--sm title--mb-20">
                                {siteName}
                            </h3>
                            <form onSubmit={onSubmit} className="page-login__form" autoComplete="off">
                                <Input
                                    autoComplete="username"
                                    style={styleInput}
                                    icon={usernameIcon}
                                    value={state.username}
                                    type="text"
                                    name="username"
                                    placeholder="Логін"
                                    required
                                    onChange={onChangeHandler}
                                />
                                <Input
                                    style={styleInput}
                                    autoComplete="current-password"
                                    icon={passwordIcon}
                                    type="password"
                                    value={state.password}
                                    name="password"
                                    placeholder="Пароль"
                                    required
                                    onChange={onChangeHandler}
                                />
                                <Button type="submit" disabled={store.isLoading}>
                                    Вхід
                                </Button>
                            </form>
                        </div>
                    </div>
                </div>
            </main>
            <Footer year={2024}/>
        </React.Fragment>
    );
};
const Login = observer(LoginPage);
export default Login;