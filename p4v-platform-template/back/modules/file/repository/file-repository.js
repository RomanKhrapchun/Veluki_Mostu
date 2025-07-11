const { sqlRequest } = require("../../../helpers/database")

class FileRepository {

    async loadPath(path) {
        return await sqlRequest('select id from blog.blog_pages where id = ?', [path])
    }

}

module.exports = new FileRepository()