const { AuthGuard } = require("../../../helpers/Guard");
const { loginLimit } = require("../../../utils/ratelimit");
const authController = require("../controller/auth-controller");
const loginSchema = require("../schema/auth-schema");

const routes = async (fastify) => {
    fastify.get("/login", { preHandler: AuthGuard }, authController.checkAuth)
    fastify.post("/login", { schema: loginSchema, config: loginLimit, }, authController.login)
    fastify.post("/logout", { preHandler: AuthGuard }, authController.logout)
}

module.exports = routes;