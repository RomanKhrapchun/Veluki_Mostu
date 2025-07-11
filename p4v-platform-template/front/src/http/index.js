import axios from "axios";
//export const API_URL = 'http://localhost:3020'
export const API_URL = '/'
const API = axios.create({
    withCredentials: true,
    baseURL: API_URL,
})
export default API;