const { sqlRequest } = require("../../../helpers/database");

class AuthRepository {

    async findOneUserByName(username) {
        let sql = `select users_id, username, last_name, first_name, middle_name, permission, password, is_active, enabled from admin.users`
        sql += ` Inner Join admin.access_group ON access_group.id=users.access_group where username = ?`
        return await sqlRequest(sql, [username])
    }

    async getUserById(userId) {
        let sql = `select last_name, first_name, permission, users_id, username, enabled, is_active from admin.users`
        sql += ` Inner Join admin.access_group ON access_group.id=users.access_group where users_id = ?`
        return await sqlRequest(sql, [userId])
    }

    async insertInfoUser(users_id, ip, hostname, user_agent, details, description, type_error) {
        return await sqlRequest('INSERT INTO log.secure(uid, ip, description, action, hostname, user_agent, details) VALUES (?, ?, ?, ?, ?,?,?)', [users_id, ip, description, type_error, hostname, user_agent, details])
    }

    async findIp(ip) {
        return await sqlRequest('SELECT ip, date FROM admin.black_list where ip=?', [ip])
    }


    async enabledRegistry(id) {
        return await sqlRequest('select name from admin.doc_template where doct_id = ? and enabled = true', [id])
    }

    async foundCategoryId(id) {
        return await sqlRequest('select id_category from blog.blog_pages where id = ?', [id])
    }

}

module.exports = new AuthRepository();