import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {uuid_v4} from "../utils/function";

const usePortal = (id) => {
    const [portalContainer] = useState(() => {
        const container = document.createElement('div');
        container.setAttribute('id', id ? `${id}-portal` : `${uuid_v4()}-portal`);
        return container;
    });

    useEffect(() => {
        document.body.appendChild(portalContainer);
        return () => {
            document.body.removeChild(portalContainer);
        };
    }, [portalContainer]);

    return portalContainer;
};

const Portal = ({ id, children }) => {
    const target = usePortal(id);
    return createPortal(children, target);
};

export default Portal;