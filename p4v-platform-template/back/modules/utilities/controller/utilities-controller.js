const utilitiesService = require("../service/utilities-service");
const Logger = require("../../../utils/logger")

class utilitiesController {

    async getDebtByUtilitiesId(request, reply) {
        try {
            const { id } = request.params;
            // Перевірка, чи id є числовим рядком
            if (!/^\d+$/.test(id)) {
                return reply.status(400).send({ error: "The 'id' " });
            }


            const utilityData = await utilitiesService.getDebtByUtilitiesId(request)
            return reply.send(utilityData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async findDebtByFilter(request, reply) {
        try {
            const utilityData = await utilitiesService.findDebtByFilter(request)
            return reply.send(utilityData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async generateWordByDebtId(request, reply) {
        try {
            const utilityData = await utilitiesService.generateWordByDebtId(request, reply)
            return reply.send(utilityData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async printDebtId(request, reply) {
        try {
            const utilityData = await utilitiesService.printDebtId(request, reply)
            return reply.send(utilityData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

}


module.exports = new utilitiesController();