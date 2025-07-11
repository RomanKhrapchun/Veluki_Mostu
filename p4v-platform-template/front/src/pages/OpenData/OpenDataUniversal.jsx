import React from 'react';
import { useParams, Navigate } from 'react-router-dom';
import Index43 from './43_housingRegistry/Index43';
import Index43View from './43_housingRegistry/Index43View';
import Index43Edit from './43_housingRegistry/Index43Edit';
import Index1_1 from './1_enterprises/Index1_1';
import Index1_1View from './1_enterprises/Index1_1View';
import Index1_1Edit from './1_enterprises/Index1_1Edit';
import Index1_2 from './1_enterprises/Index1_2';
import Index1_2View from './1_enterprises/Index1_2View';
import Index1_2Edit from './1_enterprises/Index1_2Edit';
import Index1_3 from './1_enterprises/Index1_3';
import Index1_3View from './1_enterprises/Index1_3View';
import Index1_3Edit from './1_enterprises/Index1_3Edit';
import Index2 from './2_organizStructure/Index2';
import Index2View from './2_organizStructure/Index2View';
import Index2Edit from './2_organizStructure/Index2Edit';
import Index3 from './3_normatives/Index3';
import Index3View from './3_normatives/Index3View';
import Index3Edit from './3_normatives/Index3Edit';
import Index4 from './4_ reports/Index4';
import Index4View from './4_ reports/Index4View';
import Index4Edit from './4_ reports/Index4Edit';


const OpenDataUniversal = () => {
    // ✅ ВИПРАВЛЕННЯ: Додано деструктуризацію id
    const { tableId, action, id } = useParams(); 

    // Logic to determine which component to render based on the tableId and action
    let component;
    switch (tableId) {
        
        case '1.1':
            if (action === 'view') {
                component = <Index1_1View id={id} />;
            } else if (action === 'edit') {
                component = <Index1_1Edit id={id} />;
            } else {
                component = <Index1_1 />; 
            }
            break;
        case '1.2':
            if (action === 'view') {
                component = <Index1_2View id={id} />;
            } else if (action === 'edit') {
                component = <Index1_2Edit id={id} />;
            } else {
                component = <Index1_2 />; // Default to Index1_2 if no action is specified
            }
            break;
        case '1.3':
            if (action === 'view') {
                component = <Index1_3View id={id} />;
            } else if (action === 'edit') {
                component = <Index1_3Edit id={id} />;
            } else {
                component = <Index1_3 />; // Default to Index1_3 if no action is specified
            }
            break;
        case '2':
            if (action === 'view') {
                component = <Index2View id={id} />;
            } else if (action === 'edit') {
                component = <Index2Edit id={id} />;
            } else {
                component = <Index2 />; // Default to Index2 if no action is specified
            }
            break;
        case '3':
            if (action === 'view') {
                component = <Index3View id={id} />;
            } else if (action === 'edit') {
                component = <Index3Edit id={id} />;
            } else {
                component = <Index3 />; // Default to Index3 if no action is specified
            }
            break;
        case '4':
            if (action === 'view') {
                component = <Index4View id={id} />;
            } else if (action === 'edit') {
                component = <Index4Edit id={id} />;
            } else {
                component = <Index4 />; // Default to Index4 if no action is specified
            }
            break;
        case '43':
            if (action === 'view') {
                component = <Index43View id={id} />;
            } else if (action === 'edit') {
                component = <Index43Edit id={id} />;
            } else {
                component = <Index43 />; // Default to Index43 if no action is specified
            }
            break;
        default:
            component = <Navigate to="/not-found" />; // Redirect to a not found page or similar
    }

    return component;
};

export default OpenDataUniversal;