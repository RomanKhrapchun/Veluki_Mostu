const logService = require("../service/log-service")
const Logger = require("../../../utils/logger")
const { blockedIPMessage, unblockedIPNotification } = require("../../../utils/messages")

class LogController {

    async getAllLogs(request, reply) {
        try {
            const logData = await logService.getAllLogs(request)
            return reply.send(logData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async findLogById(request, reply) {
        try {
            const logData = await logService.findLogById(request)
            return reply.send(logData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async allSecureLog(request, reply) {
        try {
            const logData = await logService.allSecureLog(request)
            return reply.send(logData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async allBlackListIp(request, reply) {
        try {
            const logData = await logService.allBlackListIp(request)
            return reply.send(logData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async addToBlacklistIP(request, reply) {
        try {
            await logService.addToBlacklistIP(request)
            return reply.send(blockedIPMessage)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async removeFromBlacklistIP(request, reply) {
        try {
            await logService.removeFromBlacklistIP(request)
            return reply.send(unblockedIPNotification)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async detailedLog(request, reply) {
        try {
            const logData = await logService.detailedLog(request)
            return reply.send(logData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

}

module.exports = new LogController()