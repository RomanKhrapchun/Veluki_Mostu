const { sqlRequest } = require("../../../helpers/database");
const { buildWhereCondition } = require("../../../utils/function");
const { getSafeSortField, validateSortDirection } = require("../../../utils/constants");

class DebtorRepository {

    async getDebtByDebtorId(debtId, displayFieldsUsers) {
        // Базовий запит для отримання даних боржника
        let sql = `select ${displayFieldsUsers.map(field => ` ${field === 'cadastral_number' || field === 'tax_address' ? 'NULL as ' + field : field}`)} from ower.ower where id = ?`
        
        try {
            const debtorData = await sqlRequest(sql, [debtId]);
            
            // Якщо знайдено боржника і потрібна кадастрова інформація
            if (debtorData.length > 0 && (displayFieldsUsers.includes('cadastral_number') || displayFieldsUsers.includes('tax_address'))) {
                const debtorName = debtorData[0].name;
                
                // Шукаємо кадастрову інформацію (номер або адреса можуть бути окремо)
                const cadastralSql = `SELECT cadastral_number, tax_address 
                                    FROM ower.cadaster_records 
                                    WHERE payer_name = ? 
                                    ORDER BY id DESC LIMIT 1`;
                const cadastralResult = await sqlRequest(cadastralSql, [debtorName]);
                
                // Ініціалізуємо поля як null
                debtorData[0].cadastral_number = null;
                debtorData[0].tax_address = null;
                
                // Додаємо кадастрову інформацію до результату
                if (cadastralResult.length > 0) {
                    // Перевіряємо чи є валідний кадастровий номер
                    const validCadastralNumber = cadastralResult[0].cadastral_number && 
                                            cadastralResult[0].cadastral_number.trim() !== '' &&
                                            !cadastralResult[0].cadastral_number.startsWith('AUTO_') &&
                                            cadastralResult[0].cadastral_number.length > 5;
                    
                    // Перевіряємо чи є податкова адреса
                    const validTaxAddress = cadastralResult[0].tax_address && 
                                        cadastralResult[0].tax_address.trim() !== '';
                    
                    // Логіка відповідно до вимог:
                    if (validCadastralNumber) {
                        // 1. Якщо є валідний кадастровий номер - записуємо тільки його
                        debtorData[0].cadastral_number = cadastralResult[0].cadastral_number;
                        // tax_address залишається null
                    } else if (validTaxAddress) {
                        // 2. Якщо немає кадастрового номера, але є податкова адреса - записуємо тільки адресу
                        debtorData[0].tax_address = cadastralResult[0].tax_address;
                        // cadastral_number залишається null
                    }
                    // 3. Якщо немає ні номера, ні адреси - обидва поля залишаються null
                }
            }
            
            return debtorData;
        } catch (error) {
            console.error('❌ Database error in getDebtByDebtorId:', error);
            throw new Error("Не вдалося отримати дані боржника.");
        }
    }

    async findDebtByFilter(limit, offset, title, whereConditions = {}, displayFieldsUsers = [], sortBy = 'name', sortDirection = 'asc') {
        const values = [];
        
        // Валідуємо параметри сортування
        const safeSortField = getSafeSortField(sortBy);
        const safeSortDirection = validateSortDirection(sortDirection);
        
        // Додаємо total_debt до JSON об'єкта
        const totalDebtExpression = '(COALESCE(non_residential_debt, 0) + COALESCE(residential_debt, 0) + COALESCE(land_debt, 0) + COALESCE(orenda_debt, 0) + COALESCE(mpz, 0))';
        
        // Створюємо JSON поля включаючи total_debt і cadastral_number
        const baseFields = displayFieldsUsers.filter(field => field !== 'cadastral_number');
        const jsonFields = baseFields.map(field => `'${field}', ${field}`).join(', ');
        
        let sql = `select json_agg(
            json_build_object(
                ${jsonFields},
                'total_debt', ${totalDebtExpression},
                'cadastral_number', cadastral_data.cadastral_number
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
        } else if (sortBy === 'cadastral_number') {
            // Спеціальне сортування для кадастрового номера - спочатку ті що мають номери, потім без
            sql += ` order by CASE WHEN cadastral_data.cadastral_number IS NOT NULL THEN 0 ELSE 1 END, cadastral_data.cadastral_number ${safeSortDirection.toUpperCase()}`;
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
        
        // ✅ ВИПРАВЛЕНО: Фільтруємо AUTO номери та некоректні кадастрові номери
        sql += ` limit ? offset ?
        ) ower_data
        LEFT JOIN (
            SELECT DISTINCT ON (payer_name) payer_name, cadastral_number 
            FROM ower.cadaster_records 
            WHERE cadastral_number IS NOT NULL 
                AND cadastral_number != '' 
                AND cadastral_number NOT LIKE 'AUTO_%'
                AND LENGTH(cadastral_number) > 5
            ORDER BY payer_name, id DESC
        ) cadastral_data ON ower_data.name = cadastral_data.payer_name`;

        console.log('🔍 SQL Query:', sql);
        console.log('🔍 Values:', values);
        console.log('🔄 Sort by:', sortBy, 'Direction:', sortDirection);

        try {
            return await sqlRequest(sql, [...values]);
        } catch (error) {
            console.error('❌ Database error in findDebtByFilter:', error);
            throw error;
        }
    }

    async getRequisite() {
        try {
            return await sqlRequest('select * from ower.settings');
        } catch (error) {
            console.error('❌ Database error in getRequisite:', error);
            throw error;
        }
    }
}

module.exports = new DebtorRepository();