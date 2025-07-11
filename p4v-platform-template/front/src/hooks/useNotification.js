import {useContext} from "react";
import {NotificationContext} from "../provider/NotificationProvider";

export const useNotification = () => {
    const {createNotification} = useContext(NotificationContext);

    return createNotification;
};