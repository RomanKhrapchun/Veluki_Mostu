const accessGroupsService = require("../service/accessGroups-serviсe")
const Logger = require("../../../utils/logger")
const { createSuccessMessage, updateSuccessMessage, deleteSuccessMessage } = require("../../../utils/messages")

class AccessGroupsController {

    async findRoleByFilter(request, reply) {
        try {
            const accessGroupData = await accessGroupsService.findRoleByFilter(request)
            return reply.send(accessGroupData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async getRoleById(request, reply) {
        try {
            const accessGroupData = await accessGroupsService.getRoleById(request)
            return reply.send(accessGroupData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async createRole(request, reply) {
        try {
            await accessGroupsService.createRole(request)
            return reply.send(createSuccessMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async updateRole(request, reply) {
        try {
            await accessGroupsService.updateRole(request)
            return reply.send(updateSuccessMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async deleteRole(request, reply) {
        try {
            await accessGroupsService.deleteRole(request)
            return reply.send(deleteSuccessMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async getAllAccessGroups(request, reply) {
        try {
            const accessGroupsData = await accessGroupsService.getAllAccessGroups()
            return reply.send(accessGroupsData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async getAllAccessGroupByTitle(request, reply) {
        try {
            const accessGroupsData = await accessGroupsService.getAllAccessGroupByTitle(request, reply)
            return reply.send(accessGroupsData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

}

module.exports = new AccessGroupsController()