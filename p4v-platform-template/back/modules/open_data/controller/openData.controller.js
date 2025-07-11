const openDataService = require('../service/openData.service');
const Logger = require('../../../utils/logger');

class OpenDataController {
    async getOpenData(request, reply) {
        try {
            const filter = request.body;
            const result = await openDataService.fetchOpenData(filter);
            return reply.send(result);
        } catch (error) {
            Logger.error('Error in getOpenData:', error);
            return reply.status(500).send({ message: error.message });
        }
    }

    async getOpenDataById(request, reply) {
        try {
            const { tableId, id } = request.params;
            const result = await openDataService.getOpenDataById(tableId, id);
            return reply.send(result);
        } catch (error) {
            Logger.error('Error in getOpenDataById:', error);
            return reply.status(500).send({ message: error.message });
        }
    }

    async createOpenData(request, reply) {
        try {
            const openData = request.body;
            const result = await openDataService.createOpenData(openData);
            return reply.send(result);
        } catch (error) {
            Logger.error('Error in createOpenData:', error);
            return reply.status(500).send({ message: error.message });
        }
    }

    async updateOpenData(request, reply) {
        try {
            const { tableId, id } = request.params; // Get tableId and id from params
            const openData = request.body; // Get updated data from request body
            const updatedOpenData = await openDataService.updateOpenData(tableId, id, openData);
            return reply.send(updatedOpenData);
        } catch (error) {
            Logger.error('Error in updateOpenData:', error);
            return reply.status(500).send({ message: error.message });
        }
    }

    async deleteOpenData(request, reply) {
        try {
            const { id } = request.params;
            await openDataService.deleteOpenData(id);
            return reply.status(204).send();
        } catch (error) {
            Logger.error('Error in deleteOpenData:', error);
            return reply.status(500).send({ message: error.message });
        }
    }

    async fetchAllFromTable(request, reply) {
        try {
            const { tableId } = request.params;
            const result = await openDataService.fetchAllFromTable(tableId);
            return reply.send(result);
        } catch (error) {
            Logger.error('Error in fetchAllFromTable:', error);
            return reply.status(500).send({ message: error.message });
        }
    }
}

module.exports = new OpenDataController();
