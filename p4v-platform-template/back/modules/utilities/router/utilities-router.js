const { RouterGuard } = require('../../../helpers/Guard');
const { accessLevel } = require('../../../utils/constants');
const { viewLimit } = require('../../../utils/ratelimit');
const utilitiesController = require('../controller/utilities-controller');
const { utilitiesFilterSchema, utilitiesInfoSchema } = require('../schema/utilities-schema');

const routes = async (fastify) => {
    fastify.post("/filter", { schema: utilitiesFilterSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, utilitiesController.findDebtByFilter);
    fastify.get("/info/:id", { schema: utilitiesInfoSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }), config: viewLimit }, utilitiesController.getDebtByUtilitiesId);
    fastify.get("/generate/:id", { schema: utilitiesInfoSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, utilitiesController.generateWordByDebtId);
    fastify.get("/print/:id", { schema: utilitiesInfoSchema, preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) }, utilitiesController.printDebtId);
}

module.exports = routes;