import {useState, useEffect, useCallback, useContext} from 'react';
import {fetchFunction} from "../utils/function";
import {useNavigate} from "react-router-dom";
import {Context} from "../main";
import {useNotification} from "./useNotification";
import axios from "axios";
import {STATUS} from "../utils/constants"

function useFetch(url, options) {
    const {store} = useContext(Context)
    const navigate = useNavigate()
    const notification = useNotification()
    const [state, setState] = useState(
        {
            url,
            options,
            data: [],
            status: STATUS.IDLE,
            error: {
                status: '',
                message: '',
            },
        }
    )

    useEffect(() => {
        let isCancelled = false;
        const abortController = new AbortController();
        const fetchData = async () => {
            setState(prevState => ({
                ...prevState,
                status: STATUS.PENDING,
            }))

            try {
                const response = await fetchFunction(state.url,
                    {...state.options, signal: abortController.signal})
                if (!isCancelled) {
                    setState(prevState => ({
                        ...prevState,
                        status: STATUS.SUCCESS,
                        data: response.data ?? [],
                    }))
                }
            } catch (error) {
                if (axios.isCancel(error)) {
                    return;
                }
                if (error?.response?.status === 401) {
                    notification({
                        type: 'warning',
                        title: "Помилка",
                        message: error?.response?.data?.message ? error.response.data.message : error.message,
                        placement: 'top',
                    })
                    store.logOff()
                    return navigate('/')
                }

                setState(prevState => ({
                    ...prevState,
                    status: STATUS.ERROR,
                    data: [],
                    error: {
                        status: error?.response?.status ?? 400,
                        message: error?.response?.data?.message ? error.response.data.message : error.message,
                    },
                }))
            }
        }
        fetchData();
        return () => {
            isCancelled = true;
            abortController.abort();
        };
    }, [state.options, state.url, navigate, store, notification]);

    const retryFetch = useCallback((retryUrl, retryOptions) => {
        setState({
            url: retryUrl,
            options: retryOptions,
            data: [],
            status: STATUS.IDLE,
            error: {
                status: '',
                message: '',
            },
        });
    }, []);

    return {error: state.error, status: state.status, data: state.data, retryFetch};
}

export default useFetch;