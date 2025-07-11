const openDataController = require('../controller/openData.controller');
const openDataSchema = require('../schema/openData.schema');


const routes = async (fastify) => {
    
    fastify.post('/filter', {
        schema: openDataSchema,
        handler: openDataController.getOpenData
    })
    fastify.post('/', {
        schema: openDataSchema,
        handler: openDataController.createOpenData
    })
    fastify.post('/:tableId', {
        handler: openDataController.fetchAllFromTable
    });
    fastify.get('/:tableId/:id', {
        handler: openDataController.getOpenDataById
    });
    fastify.put('/:tableId/:id', {
        handler: openDataController.updateOpenData
    });

}

module.exports = routes