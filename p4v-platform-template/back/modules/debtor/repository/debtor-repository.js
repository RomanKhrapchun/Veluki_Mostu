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
                
                // Отримуємо ВСІ кадастрові дані для цього ПІБ
                const cadasterRepository = require("../../cadaster/repository/cadaster-repository");
                const cadastralData = await cadasterRepository.getAllCadastralDataByPayerName(debtorName);
                
                console.log(`📊 Кадастрові дані для ${debtorName}:`, cadastralData);
                
                // Ініціалізуємо поля як null
                debtorData[0].cadastral_number = null;
                debtorData[0].tax_address = null;
                
                // Якщо є кадастрові номери - збираємо їх через кому
                if (cadastralData.cadastralNumbers && cadastralData.cadastralNumbers.length > 0) {
                    debtorData[0].cadastral_number = cadastralData.cadastralNumbers.join(', ');
                }
                
                // Якщо є податкова адреса (але немає кадастрових номерів) - записуємо адресу
                if (!debtorData[0].cadastral_number && cadastralData.taxAddress) {
                    debtorData[0].tax_address = cadastralData.taxAddress;
                }
                
                // ❌ ВИМКНЕНО: НЕ додаємо кадастрові суми, оскільки в БД вже правильні значення
                // Залишаємо land_debt як є в базі даних
                console.log(`✅ Залишаємо land_debt як в БД: ${debtorData[0].land_debt} для ${debtorName}`);
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
            sql += ` order by total_debt_calc ${safeSortDirection.toUpperCase()}`;
        } else if (sortBy === 'name') {
            sql += ` order by LOWER(name) ${safeSortDirection.toUpperCase()}`;
        } else if (sortBy === 'cadastral_number') {
            sql += ` order by CASE WHEN cadastral_data.cadastral_number IS NOT NULL THEN 0 ELSE 1 END, cadastral_data.cadastral_number ${safeSortDirection.toUpperCase()}`;
        } else {
            sql += ` order by ${safeSortField} ${safeSortDirection.toUpperCase()}`;
        }
        
        // Додаємо вторинне сортування для стабільності
        if (sortBy !== 'id') {
            sql += `, id ${safeSortDirection.toUpperCase()}`;
        }

        // Додаємо пагінацію
        values.push(limit);
        values.push(offset);
        
        sql += ` limit ? offset ? ) main_query
        LEFT JOIN LATERAL (
            -- НОВА ЛОГІКА: Отримуємо об'єднані кадастрові номери для кожного боржника
            SELECT 
                CASE 
                    WHEN COUNT(CASE WHEN c.cadastral_number IS NOT NULL 
                                    AND c.cadastral_number != '' 
                                    AND NOT c.cadastral_number LIKE 'AUTO_%' 
                                    AND LENGTH(c.cadastral_number) > 5 
                                THEN 1 END) > 0 
                    THEN STRING_AGG(
                        DISTINCT c.cadastral_number, 
                        ', ' 
                        ORDER BY c.cadastral_number
                    ) FILTER (
                        WHERE c.cadastral_number IS NOT NULL 
                        AND c.cadastral_number != '' 
                        AND NOT c.cadastral_number LIKE 'AUTO_%' 
                        AND LENGTH(c.cadastral_number) > 5
                    )
                    ELSE NULL 
                END as cadastral_number
            FROM ower.cadaster_records c 
            WHERE c.payer_name = main_query.name
        ) cadastral_data ON true`;

        console.log('🔍 Final SQL:', sql);
        console.log('🔍 Values:', values);

        try {
            const result = await sqlRequest(sql, [...values]);
            
            // НОВА ЛОГІКА: Після отримання результатів, оновлюємо land_debt з кадастру
            if (result.length > 0 && result[0].data) {
                await this.updateLandDebtFromCadaster(result[0].data);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Database error in findDebtByFilter:', error);
            throw new Error("Не вдалося виконати запит до бази даних.");
        }
    }

    // НОВА ФУНКЦІЯ: Оновлення land_debt з даних кадастру
    async updateLandDebtFromCadaster(debtors) {
        if (!Array.isArray(debtors)) return;
            
        const cadasterRepository = require("../../cadaster/repository/cadaster-repository");
            
        for (let debtor of debtors) {
            try {
                // Отримуємо всі кадастрові дані для цього боржника
                const cadastralData = await cadasterRepository.getAllCadastralDataByPayerName(debtor.name);
                    
                // ❌ ВИМКНЕНО: НЕ змінюємо land_debt, оскільки в БД вже правильні значення
                // Тільки додаємо кадастрові номери для відображення
                console.log(`✅ Залишаємо land_debt як в БД: ${debtor.land_debt} для ${debtor.name}`);
                    
                // Перерахунок total_debt БЕЗ додавання кадастру
                const nonResidential = parseFloat(debtor.non_residential_debt) || 0;
                const residential = parseFloat(debtor.residential_debt) || 0;
                const landDebt = parseFloat(debtor.land_debt) || 0; // Беремо як є з БД
                const orenda = parseFloat(debtor.orenda_debt) || 0;
                const mpz = parseFloat(debtor.mpz) || 0;
                    
                const totalDebt = Math.round((nonResidential + residential + landDebt + orenda + mpz) * 100) / 100;
                    
                debtor.total_debt = totalDebt;
                    
                console.log(`📊 Загальний борг для ${debtor.name}: ${totalDebt} (БЕЗ додавання кадастру)`);
            } catch (error) {
                console.error(`❌ Помилка обробки даних для ${debtor.name}:`, error);
                // Продовжуємо для інших боржників
            }
        }
    }

    async getRequisite() {
        try {
            console.log('🏦 Getting requisites from ower.settings');
            const result = await sqlRequest('select * from ower.settings ORDER BY date DESC LIMIT 1');
            
            if (!result.length) {
                console.log('⚠️ No settings found in database');
            } else {
                console.log('✅ Settings found for date:', result[0].date);
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error getting requisites:', error);
            throw error;
        }
    }
}

module.exports = new DebtorRepository();