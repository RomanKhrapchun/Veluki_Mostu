const sportsComplexController = require("../controller/sportscomplex-controller");
const {
    filterRequisitesSchema,
    filterPoolServicesSchema,
    filterBillsSchema,
    createServiceGroupSchema,
    getServiceGroupSchema,
    updateRequisiteSchema,
    updateServiceSchema
} = require("../schema/sportscomplex-schema");

async function sportsComplexRoutes(fastify, options) {
    fastify.post("/filter-requisites", {
        schema: filterRequisitesSchema,
        handler: sportsComplexController.findRequisitesByFilter
    });

    fastify.post("/filter-pool", {
        schema: filterPoolServicesSchema,
        handler: sportsComplexController.findPoolServicesByFilter
    });

    fastify.post("/services", {
        handler: sportsComplexController.createPoolService
    });

    fastify.post("/requisites", {
        handler: sportsComplexController.createRequisite
    });

    fastify.put("/requisites/:id", {
        schema: updateRequisiteSchema,
        handler: sportsComplexController.updateRequisite
    });

    // Новий ендпоінт для створення груп послуг
    fastify.post("/service-groups", {
        schema: createServiceGroupSchema,
        handler: sportsComplexController.createServiceGroup
    });
    
    // Ендпоінт для отримання всіх груп послуг
    fastify.get("/service-groups", {
        handler: sportsComplexController.getServiceGroups
    });
    
    // Ендпоінт для отримання послуг за групою
    fastify.get("/services-by-group/:id", {
        schema: getServiceGroupSchema,
        handler: sportsComplexController.getServicesByGroup
    });

    // Для отримання однієї послуги
    fastify.get("/service/:id", {
        handler: sportsComplexController.getServiceById
    });

    // Для оновлення послуги
    fastify.put("/services/:id", {
        schema: updateServiceSchema,
        handler: sportsComplexController.updateService
    });

    fastify.post("/bills/filter", {
        schema: filterBillsSchema,
        handler: sportsComplexController.findBillsByFilter
    });


    fastify.get("/bills/:id", sportsComplexController.getBillById);
    fastify.post("/bills", sportsComplexController.createBill);
    fastify.put("/bills/:id/status", sportsComplexController.updateBillStatus);
    fastify.get("/bills/:id/receipt", sportsComplexController.generateBillReceipt);

    fastify.get("/info/:id", sportsComplexController.getById);
    fastify.get("/generate/:id", sportsComplexController.generateWordById);
    fastify.get("/print/:id", sportsComplexController.printById);
}

module.exports = sportsComplexRoutes;