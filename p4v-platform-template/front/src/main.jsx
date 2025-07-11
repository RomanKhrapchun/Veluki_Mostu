import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import Store from './store/store';
import NotificationProvider from "./provider/NotificationProvider";
import {createContext} from "react";
const store = new Store();
export const Context = createContext({
    store,
})

createRoot(document.getElementById('root')).render(
    <NotificationProvider>
        <Context.Provider value={{store}}>
            <App/>
        </Context.Provider>
    </NotificationProvider>
)
