import React from 'react';
import { useParams, Navigate } from 'react-router-dom';



const DistrictUniversal = () => {
    const { districtId, debtId } = useParams(); // Destructure tableId, action, and id from params

    // Logic to determine which component to render based on the tableId and action
    let component;
    switch (districtId) {
        case '1':
            component = <Index43 />; // Default to Index43 if no action is specified
            break;
        case '2':

        case '3':

        case '4':
        // Add more cases for different tableIds as needed
        default:
            component = <Navigate to="/not-found" />; // Redirect to a not found page or similar
    }

    return component;
};

export default DistrictUniversal;
