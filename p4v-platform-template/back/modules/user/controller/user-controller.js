const { updateSuccessMessage, createSuccessMessage, deleteSuccessMessage } = require("../../../utils/messages");
const userService = require("../service/user-service");
const Logger = require("../../../utils/logger")

class UserController {

    async generateMenu(request, reply) {
        try {
            const menuData = await userService.generateMenu()
            reply.send(menuData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async getUserProfileById(request, reply) {
        try {
            const userData = await userService.getUserProfileById(request)
            return reply.send(userData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async updateUserProfileById(request, reply) {
        try {
            await userService.updateUserProfileById(request)
            return reply.send(updateSuccessMessage)

        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async findUsersByFilter(request, reply) {
        try {
            const userData = await userService.findUsersByFilter(request)
            return reply.send(userData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async getUserById(request, reply) {
        try {
            const userData = await userService.getUserById(request)
            return reply.send(userData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async createUser(request, reply) {
        try {
            await userService.createUser(request)
            return reply.send(createSuccessMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async updateUserById(request, reply) {
        try {
            await userService.updateUser(request)
            return reply.send(updateSuccessMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async deleteUser(request, reply) {
        try {
            await userService.deleteUser(request)
            return reply.send(deleteSuccessMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async getAllUsers(request, reply) {
        try {
            const userData = await userService.getAllUsers(request)
            return reply.send(userData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

}


module.exports = new UserController();