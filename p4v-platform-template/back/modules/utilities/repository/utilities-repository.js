const { sqlRequest } = require("../../../helpers/database");
const { buildWhereCondition } = require("../../../utils/function");


class utilitiesRepository {

    async getDebtByUtilitiesId(debtId, displayFieldsUsers) {
        let sql = `select ${displayFieldsUsers.map(field => ` ${field}`)} from ower.water_billing where payerident = ?`
        return await sqlRequest(sql, [debtId])
    }

    async findDebtByFilter(limit, offset, title, whereConditions = {}, displayFieldsUsers = []) {
        const values = [];
        let sql = `select json_agg(rw) as data,
            max(cnt) as count
            from (
            select json_build_object(${displayFieldsUsers.map(field => `'${field}', ${field}`).join(', ')})  as rw,
            count(*) over () as cnt
            from ower.water_billing
            where 1=1`

        if (Object.keys(whereConditions).length) {
            const data = buildWhereCondition(whereConditions)
            sql += data.text;
            values.push(...data.value)
        }

        if (title) {
            sql += ` and fio ILIKE ?`
            values.push(`%${title}%`)
        }
        if (whereConditions.service) {
            sql += ` and service = ?`;
            values.push(whereConditions.service);
        }

        values.push(limit)
        values.push(offset)
        sql += ` order by id desc limit ? offset ? ) q`
        return await sqlRequest(sql, [...values])
    }

    async getRequisite() {
        return await sqlRequest('select * from ower.water_settings')
    }

}

module.exports = new utilitiesRepository();