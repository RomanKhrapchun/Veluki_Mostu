const cadasterService = require("../service/cadaster-service");
const Logger = require("../../../utils/logger");
const { createSuccessMessage, updateSuccessMessage, deleteSuccessMessage } = require("../../../utils/messages");

class CadasterController {

    async findCadasterByFilter(request, reply) {
        try {
            const cadasterData = await cadasterService.findCadasterByFilter(request);
            return reply.send(cadasterData);
        } catch (error) {
            Logger.error(error.message, { stack: error.stack });
            reply.status(400).send(error);
        }
    }

    async getCadasterById(request, reply) {
        try {
            const cadasterData = await cadasterService.getCadasterById(request);
            return reply.send(cadasterData);
        } catch (error) {
            Logger.error(error.message, { stack: error.stack });
            reply.status(400).send(error);
        }
    }

    async createCadaster(request, reply) {
        try {
            await cadasterService.createCadaster(request);
            return reply.send(createSuccessMessage);
        } catch (error) {
            Logger.error(error.message, { stack: error.stack });
            reply.status(400).send(error);
        }
    }

    async updateCadasterById(request, reply) {
        try {
            await cadasterService.updateCadasterById(request);
            return reply.send(updateSuccessMessage);
        } catch (error) {
            Logger.error(error.message, { stack: error.stack });
            reply.status(400).send(error);
        }
    }

    async deleteCadasterById(request, reply) {
        try {
            await cadasterService.deleteCadasterById(request);
            return reply.send(deleteSuccessMessage);
        } catch (error) {
            Logger.error(error.message, { stack: error.stack });
            reply.status(400).send(error);
        }
    }

    async uploadExcelFile(request, reply) {
        try {
            const result = await cadasterService.processExcelUpload(request);
            return reply.send({
                success: true,
                message: `Успішно завантажено кадастрових записів: ${result.imported} із ${result.total}`,
                data: result
            });
        } catch (error) {
            Logger.error(error.message, { stack: error.stack });
            reply.status(400).send({
                success: false,
                message: error.message
            });
        }
    }

}

module.exports = new CadasterController();