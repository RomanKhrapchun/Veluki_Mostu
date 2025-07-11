import { useState, useEffect } from 'react';
import classNames from "classnames";

const LazyImage = ({ src, alt = "", className, width, height }) => {
    const [loading, setLoading] = useState(true);
    const [currentSrc, updateSrc] = useState(null);
    const [error, setError] = useState(false);
    const classes = classNames('img-container', className)

    useEffect(() => {
        const imageToLoad = new Image();

        const handleLoad = () => {
            setLoading(false);
            setError(false);
            updateSrc(src);
        };

        const handleError = () => {
            setLoading(false);
            setError(true);
        };

        imageToLoad.src = src;
        imageToLoad.onload = handleLoad;
        imageToLoad.onerror = handleError;

        return () => {
            imageToLoad.onload = null;
            imageToLoad.onerror = null;
        };
    }, [src]);

    if (loading || error) {
        return (
            <div className={classes}>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="100%" height='100%' strokeWidth="1.5"
                     stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M6.827 6.175A2.31 2.31 0 0 1 5.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 0 0 2.25 2.25h15A2.25 2.25 0 0 0 21.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 0 0-1.134-.175 2.31 2.31 0 0 1-1.64-1.055l-.822-1.316a2.192 2.192 0 0 0-1.736-1.039 48.774 48.774 0 0 0-5.232 0 2.192 2.192 0 0 0-1.736 1.039l-.821 1.316Z"/>
                    <path strokeLinecap="round" strokeLinejoin="round"
                          d="M16.5 12.75a4.5 4.5 0 1 1-9 0 4.5 4.5 0 0 1 9 0ZM18.75 10.5h.008v.008h-.008V10.5Z"/>
                </svg>
            </div>
        );
    }

    return (
        <div>
            <img
                src={currentSrc}
                width={width}
                height={height}
                className={className}
                alt={alt}
            />
        </div>
    );
};

export default LazyImage;