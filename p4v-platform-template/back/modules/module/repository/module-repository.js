const { buildWhereCondition } = require("../../../utils/function");

class ModuleRepository {

    async allModules(limit, offset, title, whereConditions = {}, displayFields = []) {
        const values = [];
        let sql = `select json_agg(rw) as data,
            max(cnt) as count
            from (
            select json_build_object(${displayFields.map(field => `'${field}', ${field}`).join(', ')})  as rw,
            count(*) over () as cnt
            from admin.module
            where 1=1`

        if (Object.keys(whereConditions).length) {
            const data = buildWhereCondition(whereConditions)
            sql += data.text;
            values.push(...data.value)
        }

        if (title) {
            sql += ` and (module_name ILIKE ?)`
            values.push(`%${title}%`)
        }

        values.push(limit)
        values.push(offset)
        sql += ` order by ord asc limit ? offset ? ) q`
        return await sqlRequest(sql, [...values])
    }

    async addModule(moduleData) {
        const sql = `INSERT INTO admin.module (${Object.keys(moduleData).map(field => `${field}`).join(", ")}) VALUES (${Object.keys(moduleData).map(el => '?').join(", ")})`
        return await sqlRequest(sql, [...Object.values(moduleData)])
    }

    async updateModuleById(moduleId, moduleData) {
        let sql = `UPDATE admin.module SET ${Object.keys(moduleData).map(field => `${field} = ?`).join(', ')} where module_id = ? RETURNING module_id`
        return await sqlRequest(sql, [...Object.values(moduleData), moduleId])
    }

    async deleteModuleById(moduleId) {
        return await sqlRequest('DELETE FROM admin.module where module_id = ? RETURNING module_id', [moduleId])
    }

    async moduleById(moduleId, displayModuleFields) {
        let sql = `select (select concat(last_name || \' \' || first_name) from admin.users where users_id=a.uid) as uid,` +
            ` (select concat(last_name || \' \' || first_name) from admin.users where users_id=a.editor_id) as editor_id,` +
            ` a.create_date, a.editor_date, ${displayModuleFields.map(field => ` ${field}`)} from admin.module a where module_id=?`
        return await sqlRequest(sql, [moduleId])
    }

    async getAllModules() {
        return await sqlRequest('select module_id, module_name from admin.module where 1=1 order by ord')
    }

    async allRegistry(limit, offset, title, whereConditions = {}, displayFields = []) {
        const values = [];
        let sql = `select json_agg(rw) as data,
            max(cnt) as count
            from (
            select json_build_object(${displayFields.map(field => `'${field}', ${field}`).join(', ')})  as rw,
            count(*) over () as cnt
            from admin.doc_template
            where 1=1`

        if (Object.keys(whereConditions).length) {
            const data = buildWhereCondition(whereConditions)
            sql += data.text;
            values.push(...data.value)
        }

        if (title) {
            sql += ` and (name ILIKE ?)`
            values.push(`%${title}%`)
        }

        values.push(limit)
        values.push(offset)
        sql += ` order by module asc, ord asc limit ? offset ? ) q`
        return await sqlRequest(sql, [...values])
    }

    async addRegistry(registryData) {
        const sql = `INSERT INTO admin.doc_template (${Object.keys(registryData).map(field => `${field}`).join(", ")}) VALUES (${Object.keys(registryData).map(el => '?').join(", ")})`
        return await sqlRequest(sql, [...Object.values(registryData)])
    }

    async updateRegistryById(registryId, registryData) {
        let sql = `UPDATE admin.doc_template SET ${Object.keys(registryData).map(field => `${field} = ?`).join(', ')} where doct_id = ? RETURNING doct_id`
        return await sqlRequest(sql, [...Object.values(registryData), registryId])
    }

    async deleteRegistryById(registryId) {
        return await sqlRequest('DELETE FROM admin.doc_template where doct_id = ? RETURNING doct_id', [registryId])
    }

    async registryById(registryId, displayRegistryFields) {
        let sql = `select (select concat(last_name || \' \' || first_name) from admin.users where users_id=a.uid) as uid,` +
            ` (select concat(last_name || \' \' || first_name) from admin.users where users_id=a.editor_id) as editor_id,` +
            ` a.create_date, a.editor_date, ${displayRegistryFields.map(field => ` ${field}`)} from admin.doc_template a where doct_id=?`
        return await sqlRequest(sql, [registryId])
    }

}

module.exports = new ModuleRepository();