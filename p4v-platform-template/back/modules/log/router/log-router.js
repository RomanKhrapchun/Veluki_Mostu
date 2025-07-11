const { RouterGuard } = require('../../../helpers/Guard');
const logController = require('../controller/log-controller');
const { logInfoSchema, logFilterSchema, securelogFilterSchema, blackListSchema, insertBlackListSchema } = require('../schema/log-schema');
const { viewLimit } = require('../../../utils/ratelimit');
const { accessLevel } = require('../../../utils/constants');

const routes = async (fastify) => {
    fastify.post("/", { schema: logFilterSchema, preParsing: RouterGuard({ permissionLevel: "logs", permissions: accessLevel.VIEW }) }, logController.getAllLogs);
    fastify.get("/:id", { schema: logInfoSchema, preParsing: RouterGuard({ permissionLevel: "logs", permissions: accessLevel.VIEW }), config: viewLimit }, logController.findLogById);
    fastify.post("/secure", { schema: securelogFilterSchema, preParsing: RouterGuard({ permissionLevel: "secure", permissions: accessLevel.VIEW }) }, logController.allSecureLog);
    fastify.post("/blacklist/all", { schema: blackListSchema, preParsing: RouterGuard({ permissionLevel: "blacklist", permissions: accessLevel.VIEW }) }, logController.allBlackListIp);
    fastify.post("/blacklist", { schema: insertBlackListSchema, preParsing: RouterGuard({ permissionLevel: "blacklist", permissions: accessLevel.INSERT }) }, logController.addToBlacklistIP);
    fastify.delete("/blacklist/:id", { schema: logInfoSchema, preParsing: RouterGuard({ permissionLevel: "blacklist", permissions: accessLevel.DELETE }) }, logController.removeFromBlacklistIP);
    fastify.post("/detailed", { schema: logFilterSchema, preParsing: RouterGuard({ permissionLevel: "reports", permissions: accessLevel.VIEW }) }, logController.detailedLog);
}

module.exports = routes;