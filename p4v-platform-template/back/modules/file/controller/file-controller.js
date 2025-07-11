const fileService = require('../service/file-service')
const Logger = require("../../../utils/logger");
class FileController {

    async uploadFile(request, reply) {
        try {
            const result = await fileService.uploadFile(request, reply);
            return reply.send(result)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async deleteFile(request, reply) {
        try {
            const result = await fileService.deleteFile(request, reply)
            return reply.send(result)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

}

module.exports = new FileController()