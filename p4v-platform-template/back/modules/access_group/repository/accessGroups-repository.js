const { sqlRequest } = require("../../../helpers/database");

class AccessRepository {

    async findRoleByFilter(limit, offset, title, displayFields = []) {
        const values = [];
        let sql = `select json_agg(rw) as data,
            max(cnt) as count
            from (
            select json_build_object(${displayFields.map(field => `'${field}', ${field}`).join(', ')})  as rw,
            count(*) over () as cnt
            from admin.access_group
            where 1=1`

        if (title) {
            sql += ` and (access_group_name ILIKE ?)`
            values.push(`%${title}%`)
        }

        sql += ' order by id desc limit ? offset ? ) q'
        values.push(limit)
        values.push(offset)
        return await sqlRequest(sql, [...values])
    }

    async getRoleById(roleId, displayFields) {
        let sql = `select (select concat(last_name || \' \' || first_name) from admin.users where users_id=a.uid) as uid,` +
            ` (select concat(last_name || \' \' || first_name) from admin.users where users_id=a.editor_id) as editor_id,` +
            ` a.create_date, a.editor_date, ${displayFields.map(field => ` ${field}`)} from admin.access_group a where id=?`
        return await sqlRequest(sql, [roleId])
    }

    async createRole(roleData) {
        const sql = `INSERT INTO admin.access_group (${Object.keys(roleData).map(field => `${field}`).join(", ")}) VALUES (${Object.keys(roleData).map(el => '?').join(", ")})`
        return await sqlRequest(sql, [...Object.values(roleData)])
    }

    async updateRole(roleId, roleData) {
        let sql = `UPDATE admin.access_group SET ${Object.keys(roleData).map(field => `${field} = ?`).join(', ')} where id = ? RETURNING id`
        return await sqlRequest(sql, [...Object.values(roleData), roleId])
    }

    async deleteRole(roleId) {
        return await sqlRequest('DELETE FROM admin.access_group where id = ? RETURNING id', [roleId])
    }

    async getAllAccessGroups() {
        return await sqlRequest('select id, access_group_name from admin.access_group where 1=1 and enabled = true')
    }

    async getAllAccessGroupByTitle(title, limit = 10) {
        const values = [];
        let sql = 'select id, access_group_name from admin.access_group where 1=1 and enabled = true'
        if (title) {
            sql += ` and access_group_name ILIKE ?`
            values.push(`%${title}%`)
        }
        values.push(limit)
        sql += ' order by id limit ?'
        return await sqlRequest(sql, [...values])
    }

}

module.exports = new AccessRepository()