const { RouterGuard } = require('../../../helpers/Guard');
const { accessLevel } = require('../../../utils/constants');
const { viewLimit, updateLimit } = require('../../../utils/ratelimit');
const userController = require('../controller/user-controller');
const { profileSchema, userInfoSchema, userFilterSchema, createUserSchema, updateUserSchema } = require('../schema/user-schema');

const routes = async (fastify) => {
    fastify.get("/menu", { preParsing: RouterGuard() }, userController.generateMenu);
    fastify.get("/profile", { preParsing: RouterGuard(), config: viewLimit }, userController.getUserProfileById);
    fastify.put("/profile", { schema: profileSchema, preParsing: RouterGuard(), config: updateLimit }, userController.updateUserProfileById);
    fastify.post("/filter", { schema: userFilterSchema, preParsing: RouterGuard({ permissionLevel: "user", permissions: accessLevel.VIEW }) }, userController.findUsersByFilter);
    fastify.get("/info/:id", { schema: userInfoSchema, preParsing: RouterGuard({ permissionLevel: "user", permissions: accessLevel.VIEW }), config: viewLimit }, userController.getUserById);
    fastify.post("/", { schema: createUserSchema, preParsing: RouterGuard({ permissionLevel: "user", permissions: accessLevel.INSERT }) }, userController.createUser);
    fastify.put("/:userId", { schema: updateUserSchema, preParsing: RouterGuard({ permissionLevel: "user", permissions: accessLevel.EDIT }) }, userController.updateUserById);
    fastify.delete("/:id", { schema: userInfoSchema, preParsing: RouterGuard({ permissionLevel: "user", permissions: accessLevel.DELETE }) }, userController.deleteUser);
    fastify.post("/all", { preParsing: RouterGuard() }, userController.getAllUsers);
}

module.exports = routes;