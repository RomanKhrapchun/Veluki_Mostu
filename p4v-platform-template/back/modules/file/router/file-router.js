const { RouterGuard } = require('../../../helpers/Guard')
const fileController = require('../controller/file-controller');
const { filesDeleteSchema, filesArraySchema } = require('../schema/file-schema');

const routes = async (fastify) => {
    fastify.post("/", { schema: filesArraySchema, preParsing: RouterGuard() }, fileController.uploadFile);
    fastify.delete("/:location/:id", { schema: filesDeleteSchema, preParsing: RouterGuard() }, fileController.deleteFile);
}

module.exports = routes;