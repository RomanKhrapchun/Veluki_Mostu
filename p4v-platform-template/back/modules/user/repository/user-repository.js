const { sqlRequest } = require("../../../helpers/database");
const { buildWhereCondition } = require("../../../utils/function");


class UserRepository {

    async generateMenu() {
        const sql = `select mod.module_name, mod.module_id, 
            (select json_agg(item)
            from (select t.title as module_id, t.name as module_name, t.title as key from admin.doc_template t where t.module = mod.module_id and t.enabled = true order by ord) item
            ) as children
            from admin.module mod where mod.enabled=true order by ord`
        return await sqlRequest(sql)
    }

    async getUserProfileById(userId, displayFieldsUsers) {
        let sql = `select ${displayFieldsUsers.map(field => ` ${field}`)} from admin.users where users_id = ?`
        return await sqlRequest(sql, [userId])
    }

    async updateUserProfileById(userId, userData) {
        let sql = `UPDATE admin.users SET ${Object.keys(userData).map(field => `${field} = ?`).join(', ')} where users_id = ? RETURNING users_id`
        return await sqlRequest(sql, [...Object.values(userData), userId])
    }

    async findUsersByFilter(limit, offset, title, whereConditions = {}, displayFieldsUsers = []) {
        const values = [];
        let sql = `select json_agg(rw) as data,
            max(cnt) as count
            from (
            select json_build_object(${displayFieldsUsers.map(field => `'${field}', ${field}`).join(', ')})  as rw,
            count(*) over () as cnt
            from admin.users u
            left join admin.access_group on access_group.id=u.access_group
            where 1=1`

        if (Object.keys(whereConditions).length) {
            const data = buildWhereCondition(whereConditions)
            sql += data.text;
            values.push(...data.value)
        }

        if (title) {
            sql += ` and (username ILIKE ? OR last_name ILIKE ?)`
            values.push(`%${title}%`)
            values.push(`%${title}%`)
        }

        values.push(limit)
        values.push(offset)
        sql += ` order by users_id desc limit ? offset ? ) q`
        return await sqlRequest(sql, [...values])
    }

    async getUserById(userId, displayFieldsUsers) {
        let sql = `select (select concat(last_name || \' \' || first_name) from admin.users where users_id=u.uid) as uid,` +
            ` (select concat(last_name || \' \' || first_name) from admin.users where users_id=u.editor_id) as editor_id,` +
            ` u.create_date, u.editor_date, ${displayFieldsUsers.map(field => ` ${field}`)}` +
            ` from admin.users u where u.users_id = ?`
        return await sqlRequest(sql, [userId])
    }

    async createUser(userData) {
        const sql = `INSERT INTO admin.users (${Object.keys(userData).map(field => `${field}`).join(", ")}) VALUES (${Object.keys(userData).map(el => '?').join(", ")})`
        return await sqlRequest(sql, [...Object.values(userData)])
    }

    async updateUser(userId, userData) {
        let sql = `UPDATE admin.users SET ${Object.keys(userData).map(field => `${field} = ?`).join(', ')} where users_id = ? RETURNING users_id`
        return await sqlRequest(sql, [...Object.values(userData), userId])
    }

    async deleteUser(userId) {
        return await sqlRequest('DELETE FROM admin.users where users_id = ? RETURNING users_id', [userId])
    }

    async getAllUsers(title, limit = 10) {
        const values = [];
        let sql = 'select users_id, username from admin.users where 1=1'
        if (title) {
            sql += ` and username ILIKE ?`
            values.push(`%${title}%`)
        }
        values.push(limit)
        sql += ' order by users_id limit ?'
        return await sqlRequest(sql, [...values])
    }

    async findUserByLoginAndEmail(username, email, id) {
        if (id) {
            return await sqlRequest('select users_id from admin.users where (username = ? or (email = ?)) and users_id <> ?', [username, email, id])
        }
        else {
            return await sqlRequest('select users_id, username, email from admin.users where username = ? or email = ? ', [username, email])
        }
    }

}

module.exports = new UserRepository();