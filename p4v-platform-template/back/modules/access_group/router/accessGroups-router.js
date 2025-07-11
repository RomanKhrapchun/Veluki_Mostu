const { RouterGuard } = require('../../../helpers/Guard');
const { accessLevel } = require('../../../utils/constants');
const { viewLimit } = require('../../../utils/ratelimit');
const accessGroupsController = require('../controller/accessGroups-controller');
const { accessGroupFilterSchema, accessGroupInfoSchema, createAccessGroupSchema, updateAccessGroupSchema } = require('../schema/accessGroups-schema');

const routes = async (fastify) => {
    fastify.post("/filter", { schema: accessGroupFilterSchema, preParsing: RouterGuard({ permissionLevel: "group", permissions: accessLevel.VIEW }) }, accessGroupsController.findRoleByFilter);
    fastify.get("/info/:roleId", { schema: accessGroupInfoSchema, preParsing: RouterGuard({ permissionLevel: "group", permissions: accessLevel.VIEW }), config: viewLimit }, accessGroupsController.getRoleById);
    fastify.post("/", { schema: createAccessGroupSchema, preParsing: RouterGuard({ permissionLevel: "group", permissions: accessLevel.INSERT }) }, accessGroupsController.createRole);
    fastify.put("/:roleId", { schema: updateAccessGroupSchema, preParsing: RouterGuard({ permissionLevel: "group", permissions: accessLevel.EDIT }) }, accessGroupsController.updateRole);
    fastify.delete("/:roleId", { schema: accessGroupInfoSchema, preParsing: RouterGuard({ permissionLevel: "group", permissions: accessLevel.DELETE }) }, accessGroupsController.deleteRole);
    fastify.get("/all", { preParsing: RouterGuard() }, accessGroupsController.getAllAccessGroups);
    fastify.post("/all", { preParsing: RouterGuard() }, accessGroupsController.getAllAccessGroupByTitle);
}

module.exports = routes;