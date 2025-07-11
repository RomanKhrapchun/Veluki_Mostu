import {useEffect, useState} from 'react';

const UseDebounce = (value, delay = 500) => {
    const [debouncedValue, setDebounceValue] = useState(value)

    useEffect(() => {
        const id = setTimeout(() => {
            setDebounceValue(value)
        }, delay)
        return () => {
            clearTimeout(id)
        }

    }, [value, delay])
    return  debouncedValue
}

export default UseDebounce;