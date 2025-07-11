const cnapController = require('../controller/cnap.controller')
const { 
    serviceFilterSchema, 
    serviceInfoSchema, 
    accountFilterSchema, 
    accountInfoSchema, 
    createServiceSchema, 
    updateServiceSchema,
    createAccountSchema,
    createExecutorSchema,
    updateExecutorSchema,
    executorInfoSchema,
    updateServiceExecutorSchema
} = require('../schema/cnap.schema')

const routes = async (fastify) => {
    // ===== ACCOUNTS =====
    fastify.post('/accounts/filter-with-status', {
        schema: accountFilterSchema,
        handler: cnapController.getAccountsWithStatus
    })

    fastify.get('/accounts/:id/receipt-availability', {
        schema: accountInfoSchema,
        handler: cnapController.checkReceiptAvailability
    })

    fastify.get('/accounts/:id/receipt/download', {
        schema: accountInfoSchema,
        handler: cnapController.downloadReceipt
    })

    fastify.get('/accounts/:id/receipt/preview', {
        schema: accountInfoSchema,
        handler: cnapController.previewReceipt
    })

    fastify.post('/accounts/filter', {
        schema: accountFilterSchema,
        handler: cnapController.getAccounts
    })

    fastify.get('/accounts/:id', {
        schema: accountInfoSchema,
        handler: cnapController.getAccountById
    })

    fastify.post('/accounts', {
        schema: createAccountSchema,
        handler: cnapController.createAccount
    })

    fastify.get("/account/print/:id", { 
        schema: serviceInfoSchema,
        handler: cnapController.printDebtId
    })

    // ===== SERVICES =====
    // Специфічні маршрути перед параметризованими
    fastify.get('/services/with-executors', {
        handler: cnapController.getServicesWithExecutors
    })

    fastify.post('/services/filter', {
        schema: serviceFilterSchema,
        handler: cnapController.getServices
    })

    fastify.post('/services', {
        schema: createServiceSchema,
        handler: cnapController.createService
    })

    fastify.put('/services/:serviceId/executor', {
        schema: updateServiceExecutorSchema,
        handler: cnapController.updateServiceExecutor
    })

    fastify.get('/services/:id', {
        schema: serviceInfoSchema,
        handler: cnapController.getServiceById
    })

    fastify.put('/services/:id', {
        schema: updateServiceSchema,
        handler: cnapController.updateService
    })

    fastify.delete('/services/:id', {
        schema: serviceInfoSchema,
        handler: cnapController.deleteService
    })

    // ===== EXECUTORS =====
    fastify.get('/executors', {
        handler: cnapController.getExecutors
    })

    fastify.post('/executors', {
        schema: createExecutorSchema,
        handler: cnapController.createExecutor
    })

    fastify.put('/executors/:id', {
        schema: updateExecutorSchema,
        handler: cnapController.updateExecutor
    })

    fastify.delete('/executors/:id', {
        schema: executorInfoSchema,
        handler: cnapController.deleteExecutor
    })
}

module.exports = routes