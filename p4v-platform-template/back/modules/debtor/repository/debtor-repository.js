const { sqlRequest } = require("../../../helpers/database");
const { buildWhereCondition } = require("../../../utils/function");
const {getSafeSortField, validateSortDirection} = require("../../../utils/constants");




class DebtorRepository {

    async getDebtByDebtorId(debtId, displayFieldsUsers) {
        let sql = `select ${displayFieldsUsers.map(field => ` ${field}`)} from ower.ower where id = ?`
        return await sqlRequest(sql, [debtId])
    }

    async findDebtByFilter(limit, offset, title, whereConditions = {}, displayFieldsUsers = [], sortBy = 'name', sortDirection = 'asc') {
        const values = [];
        
        // Валідуємо параметри сортування
        const safeSortField = getSafeSortField(sortBy);
        const safeSortDirection = validateSortDirection(sortDirection);
        
        // Додаємо total_debt до JSON об'єкта
        const totalDebtExpression = '(COALESCE(non_residential_debt, 0) + COALESCE(residential_debt, 0) + COALESCE(land_debt, 0) + COALESCE(orenda_debt, 0) + COALESCE(mpz, 0))';
        
        // Створюємо JSON поля включаючи total_debt
        const jsonFields = displayFieldsUsers.map(field => `'${field}', ${field}`).join(', ');
        
        let sql = `select json_agg(
            json_build_object(
                ${jsonFields},
                'total_debt', ${totalDebtExpression}
            )
        ) as data,
        max(cnt) as count
        from (
            select *,
            ${totalDebtExpression} as total_debt_calc,
            count(*) over () as cnt
            from ower.ower
            where 1=1`;

        // Додаємо WHERE умови
        if (Object.keys(whereConditions).length) {
            const data = buildWhereCondition(whereConditions);
            sql += data.text;
            values.push(...data.value);
        }

        // Додаємо фільтрацію по назві
        if (title) {
            sql += ` and name ILIKE ?`;
            values.push(`%${title}%`);
        }

        // Додаємо сортування
        if (sortBy === 'total_debt') {
            // Сортування по обчисленому полю
            sql += ` order by total_debt_calc ${safeSortDirection.toUpperCase()}`;
        } else if (sortBy === 'name') {
            // Сортування по імені без урахування регістру
            sql += ` order by LOWER(name) ${safeSortDirection.toUpperCase()}`;
        } else {
            // Стандартне сортування
            sql += ` order by ${safeSortField} ${safeSortDirection.toUpperCase()}`;
        }
        
        // Додаємо вторинне сортування для стабільності
        if (sortBy !== 'id') {
            sql += `, id ${safeSortDirection.toUpperCase()}`;
        }

        // Додаємо пагінацію
        values.push(limit);
        values.push(offset);
        sql += ` limit ? offset ?`;
        
        sql += ` ) q`;

        console.log('🔍 SQL Query:', sql);
        console.log('🔍 Values:', values);
        console.log('🔄 Sort by:', sortBy, 'Direction:', sortDirection);

        return await sqlRequest(sql, [...values]);
    }

    async getRequisite() {
        return await sqlRequest('select * from ower.settings')
    }

}

module.exports = new DebtorRepository();