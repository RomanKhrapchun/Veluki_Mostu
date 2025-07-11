import React from 'react';
import "./Skeleton.css"

const Skeleton = ({style, count = 1}) => {
    const skeletons = []
    for (let i = 0; i < count; i++) {
        skeletons.push(<div key={i} className="skeleton" style={style}></div>);
    }
    return (
        <React.Fragment>{skeletons}</React.Fragment>
    )
};

export default Skeleton;