const { sqlRequest } = require("../../../helpers/database");
const { buildWhereCondition } = require("../../../utils/function");

class LogRepository {

    async allLogs(itemsLength, cursor, sort, whereConditions = {}) {
        const sortOrder = sort;
        const limit = parseInt(itemsLength + 1);
        const values = [];
        let query = `SELECT logger.id, schema_name, table_name, action, row_pk_id, action_stamp_tx, users.username 
            FROM log.logger 
            left join admin.users on users_id = logger.uid
            left join admin.access_group on access_group.id = users.access_group
            WHERE 1=1 `;

        if (Object.keys(whereConditions).length) {
            let result = ' and ';
            const conditions = Object.keys(whereConditions).map(key => {
                if (key === 'uid' && whereConditions[key].includes(',')) {
                    const splitData = whereConditions[key].split(',')
                    values.push(splitData)
                    return `logger.uid = any (array[?::text[]])`
                } else if (key === 'access_group_id') {
                    values.push(whereConditions[key])
                    return `access_group.id = ?`
                }
                else if (key === 'uid') {
                    values.push(whereConditions[key])
                    return `logger.uid = ?`
                }
                else if (whereConditions[key].includes(',')) {
                    const splitData = whereConditions[key].split(',')
                    values.push(splitData)
                    return `${key} = any (array[?::text[]])`
                }
                else if (whereConditions[key].includes('_')) {
                    const [date1, date2] = whereConditions[key].split('_')
                    values.push(date1, date2)
                    return `${key} BETWEEN ? AND ?`
                }
                else {
                    values.push(whereConditions[key])
                    return `${key} = ?`
                }
            });
            result += conditions.join(' and ');
            query += result;
        }

        if (cursor) {
            query += ` and logger.id  ${sortOrder === 'ASC' ? '>' : '<'} ?`
            values.push(cursor)
        }

        query += ` ORDER BY logger.id ${sortOrder} LIMIT ${limit}`;
        return await sqlRequest(query, [...values])
    }

    async findLogById(idLog, displayFields) {
        return await sqlRequest(`select ${displayFields.map(field => ` ${field}`).join(', ')} from log.logger where id = ?`, [idLog])
    }

    async allSecureLog(itemsLength, cursor, sort, whereConditions = {}) {
        const limit = parseInt(itemsLength + 1);
        const values = [];
        let query = `SELECT secure.id, secure.ip, description, action, hostname, user_agent, details, date_add, users.username FROM log.secure` +
            ` left join admin.users on users.users_id = secure.uid WHERE 1=1`;

        if (Object.keys(whereConditions).length) {
            let result = ' and ';
            const conditions = Object.keys(whereConditions).map(key => {
                if (key === 'uid' && whereConditions[key].includes(',')) {
                    const splitData = whereConditions[key].split(',')
                    values.push(splitData)
                    return `secure.uid = any (array[?::text[]])`
                } else if (key === 'uid') {
                    values.push(whereConditions[key])
                    return `secure.uid = ?`
                }
                if (whereConditions[key].includes(',')) {
                    const splitData = whereConditions[key].split(',')
                    values.push(splitData)
                    return `${key} = any (array[?::text[]])`
                }
                else if (whereConditions[key].includes('_')) {
                    const [date1, date2] = whereConditions[key].split('_')
                    values.push(date1, date2)
                    return `${key} BETWEEN ? AND ?`
                }
                else {
                    values.push(whereConditions[key])
                    return `${key} = ?`
                }
            });
            result += conditions.join(' and ');
            query += result;
        }

        if (cursor) {
            query += ` and secure.id  ${sort === 'ASC' ? '>' : '<'} ?`
            values.push(cursor)
        }

        query += ` ORDER BY secure.id ${sort} LIMIT ${limit}`;
        return await sqlRequest(query, [...values])
    }

    async allBlackListIp(limit, offset, whereConditions = {}, displayFields = []) {
        const values = [];
        let sql = `select json_agg(rw) as data,
            max(cnt) as count
            from (
            select json_build_object(${displayFields.map(field => `'${field}', ${field}`).join(', ')})  as rw,
            count(*) over () as cnt
            from admin.black_list
            where 1=1`

        if (Object.keys(whereConditions).length) {
            const data = buildWhereCondition(whereConditions)
            sql += data.text;
            values.push(...data.value)
        }

        values.push(limit)
        values.push(offset)
        sql += ` order by id desc limit ? offset ? ) q`
        return await sqlRequest(sql, [...values])
    }

    async addToBlacklistIP(data) {
        const sql = `INSERT INTO admin.black_list (${Object.keys(data).map(field => `${field}`).join(", ")}) VALUES (${Object.keys(data).map(el => '?').join(", ")})`
        return await sqlRequest(sql, [...Object.values(data)])
    }

    async removeFromBlacklistIP(id) {
        return await sqlRequest('DELETE FROM admin.black_list WHERE id=? RETURNING id', [id])
    }

    async updateDeleteRecord(uid, id_record) {
        return await sqlRequest('UPDATE log.logger SET uid=? WHERE row_pk_id=? and action=\'DELETE\' RETURNING id', [uid, id_record])
    }

    async createLog(data) {
        const sql = `INSERT INTO log.logger (${Object.keys(data).map(field => `${field}`).join(", ")}) VALUES (${Object.keys(data).map(el => '?').join(", ")})`
        return await sqlRequest(sql, [...Object.values(data)])
    }

    async detailedLog(limit, offset, whereConditions = {}) {
        const values = [];
        let sql= `
        select json_agg(rw) as data,
            max(cnt) as count
            from (
            select json_build_object(
            'fullName', 
            (SELECT COALESCE(u.last_name, '') || ' ' || COALESCE(u.first_name, '') || ' ' || COALESCE(u.middle_name, '') 
             FROM admin.users u WHERE u.users_id = l.uid),
            'month_name', 
            CASE 
                WHEN EXTRACT(MONTH FROM l.action_stamp_tx) = 1 THEN 'Січень'
                WHEN EXTRACT(MONTH FROM l.action_stamp_tx) = 2 THEN 'Лютий'
                WHEN EXTRACT(MONTH FROM l.action_stamp_tx) = 3 THEN 'Березень'
                WHEN EXTRACT(MONTH FROM l.action_stamp_tx) = 4 THEN 'Квітень'
                WHEN EXTRACT(MONTH FROM l.action_stamp_tx) = 5 THEN 'Травень'
                WHEN EXTRACT(MONTH FROM l.action_stamp_tx) = 6 THEN 'Червень'
                WHEN EXTRACT(MONTH FROM l.action_stamp_tx) = 7 THEN 'Липень'
                WHEN EXTRACT(MONTH FROM l.action_stamp_tx) = 8 THEN 'Серпень'
                WHEN EXTRACT(MONTH FROM l.action_stamp_tx) = 9 THEN 'Вересень'
                WHEN EXTRACT(MONTH FROM l.action_stamp_tx) = 10 THEN 'Жовтень'
                WHEN EXTRACT(MONTH FROM l.action_stamp_tx) = 11 THEN 'Листопад'
                WHEN EXTRACT(MONTH FROM l.action_stamp_tx) = 12 THEN 'Грудень'
            END,
            'year', EXTRACT(YEAR FROM l.action_stamp_tx),
            'print_count', COUNT(*) FILTER (WHERE l.action = 'PRINT'),
            'generate_count', COUNT(*) FILTER (WHERE l.action = 'GENERATE_DOC'),
            'search_count', COUNT(*) FILTER (WHERE l.action = 'SEARCH')
        ) AS rw,
       count(*) over () as cnt
    FROM 
        log.logger l
    WHERE l.action IN ('PRINT', 'GENERATE_DOC', 'SEARCH') `
    if (whereConditions?.year) {
        sql += ` AND EXTRACT(YEAR FROM l.action_stamp_tx) = ? `
        values.push(whereConditions.year)
    }

    if (whereConditions?.month) {
        sql += ` AND EXTRACT(MONTH FROM l.action_stamp_tx) = ? `
        values.push(whereConditions?.month)
    }
    values.push(limit)
    values.push(offset)
    sql+=`GROUP BY l.uid, EXTRACT(MONTH FROM l.action_stamp_tx), EXTRACT(YEAR FROM l.action_stamp_tx) limit ? offset ?) q`

        return await sqlRequest(sql, [...values])
    }

}

module.exports = new LogRepository();