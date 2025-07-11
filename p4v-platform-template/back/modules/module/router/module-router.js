const { RouterGuard } = require("../../../helpers/Guard");
const { accessLevel } = require("../../../utils/constants");
const { viewLimit } = require("../../../utils/ratelimit");
const moduleController = require("../controller/module-controller");
const { moduleFilterSchema, moduleInfoSchema, createModuleSchema, updateModuleSchema, registerFilterSchema, registerInfoSchema, createRegistrySchema, updateRegistrySchema } = require("../schema/module-schema");

const routes = async (fastify) => {
    fastify.post("/allModule", { schema: moduleFilterSchema, preParsing: RouterGuard({ permissionLevel: "modules", permissions: accessLevel.VIEW }) }, moduleController.allModules);
    fastify.get("/info/:moduleId", { schema: moduleInfoSchema, preParsing: RouterGuard({ permissionLevel: "modules", permissions: accessLevel.VIEW }), config: viewLimit }, moduleController.moduleById);
    fastify.post("/", { schema: createModuleSchema, preParsing: RouterGuard({ permissionLevel: "modules", permissions: accessLevel.INSERT }) }, moduleController.addModule);
    fastify.put("/:moduleId", { schema: updateModuleSchema, preParsing: RouterGuard({ permissionLevel: "modules", permissions: accessLevel.EDIT }) }, moduleController.updateModuleById);
    fastify.delete("/:moduleId", { schema: moduleInfoSchema, preParsing: RouterGuard({ permissionLevel: "modules", permissions: accessLevel.DELETE }) }, moduleController.deleteModuleById);
    fastify.get("/all", { preParsing: RouterGuard() }, moduleController.getAllModules);
    fastify.post("/allRegistry", { schema: registerFilterSchema, preParsing: RouterGuard({ permissionLevel: "registry", permissions: accessLevel.VIEW }) }, moduleController.allRegistry);
    fastify.get("/registry/:registryId", { schema: registerInfoSchema, preParsing: RouterGuard({ permissionLevel: "registry", permissions: accessLevel.VIEW }) }, moduleController.registryById);
    fastify.post("/registry", { schema: createRegistrySchema, preParsing: RouterGuard({ permissionLevel: "registry", permissions: accessLevel.INSERT }) }, moduleController.addRegistry);
    fastify.put("/registry/:registryId", { schema: updateRegistrySchema, preParsing: RouterGuard({ permissionLevel: "registry", permissions: accessLevel.EDIT }) }, moduleController.updateRegistryById);
    fastify.delete("/registry/:registryId", { schema: registerInfoSchema, preParsing: RouterGuard({ permissionLevel: "registry", permissions: accessLevel.DELETE }) }, moduleController.deleteRegistryById);
}

module.exports = routes;