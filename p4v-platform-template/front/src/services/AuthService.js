import API from "../http"
import {fetchTimeout} from "../utils/constants";

export default class AuthService {
    static async login(username, password) {
        return API.post('api/auth/login', { username, password }, {timeout: fetchTimeout})
    }

    static async logout() {
        return API.post('api/auth/logout',null,{timeout: fetchTimeout})
    }

    static async checkAuth() {
        return API.get('api/auth/login',{timeout:fetchTimeout})
    }
}