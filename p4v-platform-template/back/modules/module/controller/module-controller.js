const moduleService = require('../service/module-service')
const Logger = require('../../../utils/logger')
const { createSuccessMessage, updateSuccessMessage, deleteSuccessMessage } = require("../../../utils/messages")
class ModuleController {

    async allModules(request, reply) {
        try {
            const moduleData = await moduleService.allModules(request)
            return reply.send(moduleData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async moduleById(request, reply) {
        try {
            const moduleData = await moduleService.moduleById(request)
            return reply.send(moduleData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async addModule(request, reply) {
        try {
            await moduleService.addModule(request)
            return reply.send(createSuccessMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async updateModuleById(request, reply) {
        try {
            await moduleService.updateModuleById(request)
            return reply.send(updateSuccessMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async deleteModuleById(request, reply) {
        try {
            await moduleService.deleteModuleById(request)
            return reply.send(deleteSuccessMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async getAllModules(request, reply) {
        try {
            const moduleData = await moduleService.getAllModules(request)
            return reply.send(moduleData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async allRegistry(request, reply) {
        try {
            const registryData = await moduleService.allRegistry(request)
            return reply.send(registryData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async addRegistry(request, reply) {
        try {
            await moduleService.addRegistry(request)
            return reply.send(createSuccessMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async updateRegistryById(request, reply) {
        try {
            await moduleService.updateRegistryById(request)
            return reply.send(updateSuccessMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async deleteRegistryById(request, reply) {
        try {
            await moduleService.deleteRegistryById(request)
            return reply.send(deleteSuccessMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async registryById(request, reply) {
        try {
            const registryData = await moduleService.registryById(request)
            return reply.send(registryData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

}

module.exports = new ModuleController()