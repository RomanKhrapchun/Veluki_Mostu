import React, {createContext, useEffect, useMemo, useState} from 'react';
import Notification from "../components/common/Notification/Notification";
import {uuid_v4} from "../utils/function";
import classNames from "classnames";
import Portal from "../hooks/usePortal";
import {ALLOWED_PLACEMENTS} from "../utils/constants";

export const NotificationContext = createContext({
    createNotification: ({type, duration, title, message, placement}) => {
    },
});
const NotificationProvider = ({children}) => {
    const [notifications, setNotifications] = useState([])
    const [placements, setPlacements] = useState({})
    const createNotification = (info) => {
        const { placement = 'topRight' } = info;
        const newPlacement = ALLOWED_PLACEMENTS.includes(placement) ? placement : 'topRight';

        const newNotification = {
            ...info,
            id: uuid_v4(),
            placement: newPlacement,
        };
        setNotifications(prevState => [...prevState, newNotification])
    }
    const deleteNotification = (id) => {
        setNotifications(notifications.filter(el => el.id !== id))
    }

    const contextValue = useMemo(() => ({createNotification}), []);

    useEffect(() => {
        const nextPlacements = {}
        notifications.forEach((element) => {
            const {placement = 'topRight'} = element
            nextPlacements[placement] = nextPlacements[placement] || []
            nextPlacements[placement].push(element)
        })
        setPlacements(nextPlacements)
    }, [notifications])

    return (<NotificationContext.Provider value={contextValue}>
        {children}
        {
            <Portal id={"notification"}>
                {
                    Object.keys(placements)?.map((element) => (
                        <div
                            key={element}
                            className={classNames('notification-container',
                                {
                                    'notification-container--top notification-container--right': element === 'topRight',
                                    'notification-container--top notification-container--left': element === 'topLeft',
                                    'notification-container--bottom notification-container--left': element === 'bottomLeft',
                                    'notification-container--bottom notification-container--right': element === 'bottomRight',
                                    'notification-container--top': element === 'top',
                                    'notification-container--bottom': element === 'bottom',
                                }
                                , 'notification-container--active')}>
                            {placements[element]?.map((element) => {
                                return <Notification
                                    key={element.id}
                                    onClose={() => deleteNotification(element.id)}
                                    autoClose={true}
                                    {...element}
                                />
                            })}
                        </div>))
                }
            </Portal>
}

    </NotificationContext.Provider>);
};

const NotificationComponent = React.memo(NotificationProvider);
export default NotificationComponent;