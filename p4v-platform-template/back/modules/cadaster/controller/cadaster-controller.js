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
            // ✅ ВИПРАВЛЕНО: Повертаємо структурований error замість сирого об'єкта
            return reply.status(400).send({
                error: true,
                message: error.message || "Не вдалося виконати запит до бази даних. Будь ласка, спробуйте ще раз пізніше або зверніться до адміністратора системи."
            });
        }
    }

    async getCadasterById(request, reply) {
        try {
            const cadasterData = await cadasterService.getCadasterById(request);
            return reply.send(cadasterData);
        } catch (error) {
            Logger.error(error.message, { stack: error.stack });
            return reply.status(400).send({
                error: true,
                message: error.message || "Не вдалося отримати кадастровий запис."
            });
        }
    }

    async createCadaster(request, reply) {
        try {
            await cadasterService.createCadaster(request);
            return reply.send(createSuccessMessage);
        } catch (error) {
            Logger.error(error.message, { stack: error.stack });
            return reply.status(400).send({
                error: true,
                message: error.message || "Не вдалося створити кадастровий запис."
            });
        }
    }

    async updateCadasterById(request, reply) {
        try {
            await cadasterService.updateCadasterById(request);
            return reply.send(updateSuccessMessage);
        } catch (error) {
            Logger.error(error.message, { stack: error.stack });
            return reply.status(400).send({
                error: true,
                message: error.message || "Не вдалося оновити кадастровий запис."
            });
        }
    }

    async deleteCadasterById(request, reply) {
        try {
            await cadasterService.deleteCadasterById(request);
            return reply.send(deleteSuccessMessage);
        } catch (error) {
            Logger.error(error.message, { stack: error.stack });
            return reply.status(400).send({
                error: true,
                message: error.message || "Не вдалося видалити кадастровий запис."
            });
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
            return reply.status(400).send({
                success: false,
                error: true,
                message: error.message || "Не вдалося завантажити файл."
            });
        }
    }

}

module.exports = new CadasterController();