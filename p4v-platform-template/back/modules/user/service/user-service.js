
const userRepository = require("../repository/user-repository");
const bcrypt = require('bcrypt');
const {
    allowedUserTableFilterFields,
    displayFieldsUsers,
    displayUserProfileFields,
    allowUserProfileUpdateFields,
    displayInfoUsers,
} = require("../../../utils/constants");
const { fieldsListMissingError, NotFoundErrorMessage, existingUsernameEmailError, updateDataError, deleteError } = require("../../../utils/messages")
const { paginate, paginationData, filterRequestBody, filterData } = require("../../../utils/function");
const logRepository = require("../../log/repository/log-repository");

class UserService {

    async generateMenu() {
        const result = await userRepository.generateMenu()
        return result
    }

    async getUserProfileById(request) {
        if (!Object.keys([displayUserProfileFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        return await userRepository.getUserProfileById(request?.user?.id, displayUserProfileFields)
    }

    async updateUserProfileById(request) {
        const data = filterData(request.body, allowUserProfileUpdateFields)
        const userData = filterRequestBody(data)
        if (userData?.password) {
            userData.password = await bcrypt.hash(userData.password, 8)
        } else {
            delete userData.password
        }
        const result = await userRepository.updateUserProfileById(request?.user?.id, userData)
        if (!result.length) {
            throw new Error(updateDataError)
        }
    }

    async findUsersByFilter(request) {
        const { page = 1, limit = 16, title, ...whereConditions } = request.body
        const { offset } = paginate(page, limit)
        const allowedFields = allowedUserTableFilterFields.filter(el => whereConditions.hasOwnProperty(el)).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {})
        const userData = await userRepository.findUsersByFilter(limit, offset, title, allowedFields, displayFieldsUsers)
        return paginationData(userData[0], page, limit)
    }

    async getUserById(request) {
        if (!Object.keys([displayInfoUsers]).length) {
            throw new Error(fieldsListMissingError)
        }
        const result = await userRepository.getUserById(request?.params?.id, displayInfoUsers)
        if (!result.length) {
            throw new Error(NotFoundErrorMessage)
        }
        return result
    }

    async createUser(request) {
        const { password, username, email } = request.body
        const searchUser = await userRepository.findUserByLoginAndEmail(username, email)
        if (searchUser.length >= 1) {
            throw new Error(existingUsernameEmailError)
        }
        const userData = filterRequestBody(request.body)
        userData.password = await bcrypt.hash(password, 10)
        await userRepository.createUser(Object.assign(userData, { 'uid': request?.user?.id }));
    }

    async updateUser(request) {
        const { email, username } = request.body
        const searchUser = await userRepository.findUserByLoginAndEmail(username, email, request.params.userId)
        if (searchUser.length >= 1) {
            throw new Error(existingUsernameEmailError)
        }
        const userData = filterRequestBody(request.body)
        if (userData?.password) {
            userData.password = await bcrypt.hash(userData.password, 10)
        } else {
            delete userData.password
        }
        const result = await userRepository.updateUser(request.params.userId, Object.assign(userData, { 'editor_id': request?.user?.id }))
        if (!result.length) {
            throw new Error(updateDataError)
        }
    }

    async deleteUser(request) {
        const result = await userRepository.deleteUser(request.params.id)
        if (!result.length) {
            throw new Error(deleteError)
        }
        await logRepository.updateDeleteRecord(request?.user?.id, result[0].users_id)
    }

    async getAllUsers(request) {
        const { title } = request.body
        return await userRepository.getAllUsers(title, 25)
    }
}


module.exports = new UserService();