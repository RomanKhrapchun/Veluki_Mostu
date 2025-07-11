const { RouterGuard } = require('../../../helpers/Guard');
const { accessLevel } = require('../../../utils/constants');
const { viewLimit } = require('../../../utils/ratelimit');
const debtorController = require('../controller/debtor-controller');
const { debtorFilterSchema, debtorInfoSchema } = require('../schema/debot-schema');

const routes = async (fastify) => {
    fastify.post("/filter", { schema: debtorFilterSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, debtorController.findDebtByFilter);
    fastify.get("/info/:id", { schema: debtorInfoSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }), config: viewLimit }, debtorController.getDebtByDebtorId);
    fastify.get("/generate/:id", { schema: debtorInfoSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, debtorController.generateWordByDebtId);
    fastify.get("/print/:id", { schema: debtorInfoSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, debtorController.printDebtId);
}

module.exports = routes;