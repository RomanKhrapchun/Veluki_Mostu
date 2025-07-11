const { sqlRequest } = require("../../../helpers/database");
const { buildWhereCondition } = require("../../../utils/function");


class DistrictRepository {

    async getDebtByDebtorId(debtId, displayFieldsUsers) {
        let sql = `select ${displayFieldsUsers.map(field => ` ${field}`)} from ower.ower where id = ?`
        return await sqlRequest(sql, [debtId])
    }

    async findDebtByFilter(id,limit, offset, title, whereConditions = {}, displayFieldsUsers = []) {
        const values = [];
        let sql = `select json_agg(rw) as data,
            max(cnt) as count
            from (
            select json_build_object(${displayFieldsUsers.map(field => `'${field}', ${field}`).join(', ')})  as rw,
            count(*) over () as cnt
            from ower.ower
            where 1=1`

        if (Object.keys(whereConditions).length) {
            const data = buildWhereCondition(whereConditions)
            sql += data.text;
            values.push(...data.value)
        }

        if (title) {
            sql += ` and name ILIKE ?`
            values.push(`%${title}%`)
        }
        if (id === 1) {
            sql += ` and district = 'Миклашівський округ'`;
        } else if (id === 2) {
            sql += ` and district = 'Верхньобілківський округ'`;
        } else if (id === 3) {
            sql += ` and district = 'Чижиківський округ'`;
        } else if (id === 4) {
            sql += ` and district = 'Чорнушовицький округ'`;
        }
    

        values.push(limit)
        values.push(offset)
        sql += ` order by id desc limit ? offset ? ) q`
        return await sqlRequest(sql, [...values])
    }

    async getRequisite() {
        return await sqlRequest('select * from ower.settings')
    }

}

module.exports = new DistrictRepository();