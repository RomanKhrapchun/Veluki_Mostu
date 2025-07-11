const { sqlRequest } = require("../../../helpers/database");
const { buildWhereCondition } = require("../../../utils/function");


class KindergartenRepository {

    async getDebtByDebtorId(debtId, displayFieldsUsers) {
        let sql = `select ${displayFieldsUsers.map(field => ` ${field}`)} from ower.kindergarten_debt where id = ?`
        return await sqlRequest(sql, [debtId])
    }

    async findDebtByFilter(limit, offset, title, whereConditions = {}, displayFieldsUsers = []) {
        const values = [];
        let sql = `select json_agg(rw) as data,
            max(cnt) as count
            from (
            select json_build_object(${displayFieldsUsers.map(field => `'${field}', ${field}`).join(', ')})  as rw,
            count(*) over () as cnt
            from ower.kindergarten_debt
            where 1=1`

        if (Object.keys(whereConditions).length) {
            const data = buildWhereCondition(whereConditions)
            sql += data.text;
            values.push(...data.value)
        }

        if (title) {
            sql += ` and child_name ILIKE ?`
            values.push(`%${title}%`)
        }

        values.push(limit)
        values.push(offset)
        sql += ` order by id desc limit ? offset ? ) q`
        return await sqlRequest(sql, [...values])
    }

    async getRequisite() {
        return await sqlRequest('select * from ower.kindergarten_settings')
    }

}

module.exports = new KindergartenRepository();