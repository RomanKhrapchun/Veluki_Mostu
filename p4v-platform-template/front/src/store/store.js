import {makeAutoObservable} from "mobx";
import AuthService from "../services/AuthService";

export default class Store {
    user = {}
    isLoading = true
    isAuth = false
    isError = false
    errorMessage = ""

    constructor() {
        makeAutoObservable(this)
    }

    setAuth(boolean) {
        this.isAuth = boolean
    }

    setLoading(boolean) {
        this.isLoading = boolean
    }

    setError(boolean, message = "") {
        this.isError = boolean
        this.errorMessage = message
    }

    setUser(userInfo) {
        this.user = userInfo
    }

    logOff() {
        this.isAuth = false
        this.user = {}
    }

    async login(username, password) {
        this.setLoading(true)
        this.setError(false)
        try {
            const response = await AuthService.login(username, password)
            this.setAuth(true)
            this.setUser(response.data)
        } catch (error) {
            this.setAuth(false)
            this.setError(true, `${error?.response?.data?.message ? error.response.data.message : 'Сервер тимчасово недоступний'}`)
        } finally {
            this.setLoading(false)
        }
    }

    async logout() {
        this.setLoading(true)
        try {
            await AuthService.logout()
        } catch (error) {
        } finally {
            this.setUser({})
            this.setAuth(false)
            this.setLoading(false)
        }
    }

    async checkAuth() {
        try {
            const response = await AuthService.checkAuth()
            this.setAuth(true)
            this.setUser(response.data)
        } catch (error) {
        } finally {
            this.setLoading(false)
        }
    }
}