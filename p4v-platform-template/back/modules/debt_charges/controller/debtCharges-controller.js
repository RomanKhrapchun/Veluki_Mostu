
const debtChargesService = require("../service/debtCharges-service");
const Logger = require("../../../utils/logger");

class DebtChargesController {

    // Додати цей метод до існуючого debtChargesController

    async generateTaxNotification(request, reply) {
        try {
            console.log('🔍 Tax notification generation requested for ID:', request.params.id);
            
            const result = await debtChargesService.generateTaxNotificationById(request, reply);
            
            // Якщо сервіс повертає результат напряму (як у debtor), просто повертаємо його
            return result;
            
        } catch (error) {
            console.error('❌ Tax notification controller error:', error);
            Logger.error(error.message, { stack: error.stack });
            
            if (error?.response?.status === 401) {
                return reply.status(401).send({
                    message: "Не авторизований"
                });
            }
            
            return reply.status(400).send({
                message: error.message || 'Помилка при генерації податкового повідомлення'
            });
        }
    }

    async getDebtChargeById(request, reply) {
        try {
            const debtChargeData = await debtChargesService.getDebtChargeById(request)
            return reply.send(debtChargeData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async findDebtChargesByFilter(request, reply) {
        try {
            const debtChargesData = await debtChargesService.findDebtChargesByFilter(request)
            return reply.send(debtChargesData)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async uploadExcelFile(request, reply) {
        try {
            const uploadResult = await debtChargesService.processExcelUpload(request)
            return reply.send(uploadResult)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send({ message: error.message })
        }
    }

    async getStatistics(request, reply) {
        try {
            const stats = await debtChargesService.getStatistics(request)
            return reply.send(stats)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }

    async getReferenceData(request, reply) {
        try {
            const data = await debtChargesService.getReferenceData(request)
            return reply.send(data)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }
}

module.exports = new DebtChargesController();