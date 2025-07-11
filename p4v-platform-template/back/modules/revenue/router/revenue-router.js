
const { accessLevel } = require("../../../utils/constants")
const { RouterGuard } = require("../../../helpers/Guard")
const revenueController = require("../controller/revenue-controller")
const { accountPlanSchema, accountPlanIdSchema, settlementsSchema, settlementsIdSchema, payerTypesSchema, payerTypesIdSchema, payerDatabaseSchema, payerDatabaseIdSchema, dataInvoicesSchema, dataInvoicesIdSchema, filterSchema,accountPlanSearchSchema } = require("../schema/revenue-schema")

async function routes(fastify, options) {
    // Account Plan routes
    fastify.post("/account-plan/filter", { schema: filterSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getAccountPlans);
    fastify.get("/account-plan/:id", { schema: accountPlanIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getAccountPlanById);
    fastify.post("/account-plan", { schema: accountPlanSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.INSERT }) }, revenueController.createAccountPlan);
    fastify.put("/account-plan/:id", { schema: accountPlanIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.EDIT }) }, revenueController.updateAccountPlan);
    fastify.delete("/account-plan/:id", { schema: accountPlanIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.DELETE }) }, revenueController.deleteAccountPlan);
    fastify.get("/account-plan/search/:account", { schema: accountPlanSearchSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getAccountPlanByIban);
    
    // Settlements routes
    fastify.post("/settlements/filter", { schema: filterSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getSettlements);
    fastify.get("/settlements/:id", { schema: settlementsIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getSettlementById);
    fastify.post("/settlements", { schema: settlementsSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.INSERT }) }, revenueController.createSettlement);
    fastify.put("/settlements/:id", { schema: settlementsIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.EDIT }) }, revenueController.updateSettlement);
    fastify.delete("/settlements/:id", { schema: settlementsIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.DELETE }) }, revenueController.deleteSettlement);
    fastify.get("/settlements/byDistrictId/:id", { schema: settlementsIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getSettlementsByDistrictId);
    // Payer Types routes
    fastify.post("/payer-types/filter", { schema: filterSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getPayerTypes);
    fastify.get("/payer-types/:id", { schema: payerTypesIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getPayerTypeById);
    fastify.post("/payer-types", { schema: payerTypesSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.INSERT }) }, revenueController.createPayerType);
    fastify.put("/payer-types/:id", { schema: payerTypesIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.EDIT }) }, revenueController.updatePayerType);
    fastify.delete("/payer-types/:id", { schema: payerTypesIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.DELETE }) }, revenueController.deletePayerType);

    // Payer Database routes
    fastify.post("/payer-database/filter", { schema: filterSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getPayerDatabase);
    fastify.get("/payer-database/:id", { schema: payerDatabaseIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getPayerDatabaseById);
    fastify.post("/payer-database", { schema: payerDatabaseSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.INSERT }) }, revenueController.createPayerDatabase);
    fastify.put("/payer-database/:id", { schema: payerDatabaseIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.EDIT }) }, revenueController.updatePayerDatabase);
    fastify.delete("/payer-database/:id", { schema: payerDatabaseIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.DELETE }) }, revenueController.deletePayerDatabase);

    // Data Invoices routes
    fastify.post("/invoices/filter", { schema: filterSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getDataInvoices);
    fastify.get("/invoices/:id", { schema: dataInvoicesIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getDataInvoiceById);
    fastify.post("/invoices", { schema: dataInvoicesSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.INSERT }) }, revenueController.createDataInvoice);
    fastify.put("/invoices/:id", { schema: dataInvoicesIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.EDIT }) }, revenueController.updateDataInvoice);
    fastify.delete("/invoices/:id", { schema: dataInvoicesIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.DELETE }) }, revenueController.deleteDataInvoice);
    
    // Helper routes
    fastify.get("/districts", { preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getDistricts);
    
    // Invoice Details route
    fastify.post("/invoice-details/filter", { schema: filterSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getInvoiceDetails);
    fastify.get("/invoice-details/:id", { schema: dataInvoicesIdSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, revenueController.getInvoiceDetailById);
}

module.exports = routes;
