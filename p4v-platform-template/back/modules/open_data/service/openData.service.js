const openDataRepository = require('../repository/openData.repository');

class OpenDataService {
    async fetchOpenData(filter) {
        return await openDataRepository.fetchOpenData(filter);
    }

    async getOpenDataById(tableId,id) {
        return await openDataRepository.getOpenDataById(tableId,id);
    }

    async createOpenData(openData) {
        return await openDataRepository.createOpenData(openData);
    }

    async updateOpenData(tableId, id, openData) {
        return await openDataRepository.updateOpenData(tableId, id, openData);
    }

    async deleteOpenData(id) {
        return await openDataRepository.deleteOpenData(id);
    }

    async fetchAllFromTable(tableId) {
        return await openDataRepository.fetchAllFromTable(tableId);
    }
}

module.exports = new OpenDataService();
