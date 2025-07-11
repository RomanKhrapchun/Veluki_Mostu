const { RouterGuard } = require('../../../helpers/Guard');
const { accessLevel } = require('../../../utils/constants');
const { viewLimit } = require('../../../utils/ratelimit');
const kindergartenController = require('../controller/kindergarten-controller');
const { kindergartenFilterSchema, kindergartenInfoSchema } = require('../schema/kindergarten-schema');

const routes = async (fastify) => {
    fastify.post("/filter", { schema: kindergartenFilterSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, kindergartenController.findDebtByFilter);
    fastify.get("/info/:id", { schema: kindergartenInfoSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }), config: viewLimit }, kindergartenController.getDebtByDebtorId);
    fastify.get("/generate/:id", { schema: kindergartenInfoSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, kindergartenController.generateWordByDebtId);
    fastify.get("/print/:id", { schema: kindergartenInfoSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, kindergartenController.printDebtId);
}

module.exports = routes;