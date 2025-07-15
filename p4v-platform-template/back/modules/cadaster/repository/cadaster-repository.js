const { sqlRequest } = require("../../../helpers/database");
const { buildWhereCondition } = require("../../../utils/function");

class CadasterRepository {

    async findCadasterByFilter(limit, offset, title, whereConditions = {}, displayFields = [], sortBy = 'id', sortDirection = 'desc') {
        const { getSafeCadasterSortField, validateSortDirection } = require("../../../utils/constants");
        const values = [];
        
        // Валідуємо параметри сортування з безпечними значеннями за замовчуванням
        const safeSortField = getSafeCadasterSortField ? getSafeCadasterSortField(sortBy) : (sortBy || 'id');
        const safeSortDirection = validateSortDirection ? validateSortDirection(sortDirection) : (sortDirection || 'desc');
        
        console.log('🔄 Repository sorting params:', { sortBy, sortDirection, safeSortField, safeSortDirection });
        
        let sql = `SELECT json_agg(rw) as data, 
                   max(cnt) as count 
                   FROM (
                       SELECT json_build_object(${displayFields.map(field => `'${field}', ${field}`).join(', ')}) as rw,
                       count(*) over () as cnt
                       FROM ower.cadaster_records
                       WHERE 1=1`;

        // ✅ ВИПРАВЛЕНО: Використовуємо спеціальну функцію для cadaster
        if (Object.keys(whereConditions).length) {
            const data = this.buildCadasterWhereCondition(whereConditions);
            sql += data.text;
            values.push(...data.value);
        }

        // ✅ ДОДАНО: Загальний пошук по title (як в debtor)
        if (title) {
            sql += ` AND (payer_name ILIKE ? OR cadastral_number ILIKE ? OR payer_address ILIKE ? OR tax_address ILIKE ?)`;
            values.push(`%${title}%`, `%${title}%`, `%${title}%`, `%${title}%`);
        }

        // Додаємо сортування
        if (sortBy === 'payer_name') {
            // Сортування по імені без урахування регістру
            sql += ` ORDER BY LOWER(payer_name) ${safeSortDirection.toUpperCase()}`;
        } else {
            // Стандартне сортування
            sql += ` ORDER BY ${safeSortField} ${safeSortDirection.toUpperCase()}`;
        }
        
        // Вторинне сортування для стабільності
        if (sortBy !== 'id') {
            sql += `, id ${safeSortDirection.toUpperCase()}`;
        }

        values.push(limit);
        values.push(offset);
        sql += ` LIMIT ? OFFSET ? ) q`;

        console.log('🔍 Final SQL:', sql);
        console.log('🔍 Values:', values);

        try {
            return await sqlRequest(sql, [...values]);
        } catch (error) {
            console.error('❌ Database error in findCadasterByFilter:', error);
            throw new Error("Не вдалося виконати запит до бази даних. Будь ласка, спробуйте ще раз пізніше або зверніться до адміністратора системи.");
        }
    }

    // Спеціальна функція для WHERE умов таблиці cadaster з підтримкою ILIKE
    buildCadasterWhereCondition(whereConditions) {
        const values = [];
        
        // Фільтруємо умови, щоб уникнути null/undefined значень
        const filteredConditions = Object.keys(whereConditions).filter(key => {
            const value = whereConditions[key];
            return value !== null && value !== undefined && value !== '';
        });

        // Якщо після фільтрації не залишилось умов, повертаємо порожню умову
        if (filteredConditions.length === 0) {
            return {
                text: '',
                value: [],
            };
        }

        const conditions = filteredConditions.map(key => {
            const value = whereConditions[key];
            
            // ✅ ILIKE пошук для текстових полів (нечутливий до регістру)
            if (key === 'payer_name') {
                values.push(`%${value}%`);
                return `payer_name ILIKE ?`;
            }
            
            if (key === 'payer_address') {
                values.push(`%${value}%`);
                return `payer_address ILIKE ?`;
            }
            
            if (key === 'tax_address') {
                values.push(`%${value}%`);
                return `tax_address ILIKE ?`;
            }
            
            if (key === 'cadastral_number') {
                values.push(`%${value}%`);
                return `cadastral_number ILIKE ?`;
            }
            
            if (key === 'iban') {
                values.push(`%${value}%`);
                return `iban ILIKE ?`;
            }
            
            // Для числових полів - точне співпадіння
            if (key === 'plot_area' || key === 'land_tax') {
                values.push(value);
                return `${key} = ?`;
            }
            
            // Загальний випадок - точне співпадіння
            values.push(value);
            return `${key} = ?`;

        }).filter(condition => condition !== null);
        
        // Перевіряємо, чи залишились умови після обробки
        if (conditions.length === 0) {
            return {
                text: '',
                value: [],
            };
        }
        
        return {
            text: ' AND ' + conditions.join(' AND '),
            value: values,
        };
    }

    async getCadasterById(id, displayFields = []) {
        let sql = `SELECT ${displayFields.map(field => ` ${field}`)} FROM ower.cadaster_records WHERE id = ?`;
        try {
            return await sqlRequest(sql, [id]);
        } catch (error) {
            console.error('❌ Database error in getCadasterById:', error);
            throw new Error("Не вдалося отримати кадастровий запис.");
        }
    }

    async createCadaster(cadasterData) {
        const sql = `INSERT INTO ower.cadaster_records (${Object.keys(cadasterData).map(field => `${field}`).join(", ")}) 
                     VALUES (${Object.keys(cadasterData).map(el => '?').join(", ")}) 
                     RETURNING id`;
        try {
            return await sqlRequest(sql, [...Object.values(cadasterData)]);
        } catch (error) {
            console.error('❌ Database error in createCadaster:', error);
            throw new Error("Не вдалося створити кадастровий запис.");
        }
    }

    async updateCadasterById(id, cadasterData) {
        let sql = `UPDATE ower.cadaster_records 
                   SET ${Object.keys(cadasterData).map(field => `${field} = ?`).join(', ')}
                   WHERE id = ? 
                   RETURNING id`;
        try {
            return await sqlRequest(sql, [...Object.values(cadasterData), id]);
        } catch (error) {
            console.error('❌ Database error in updateCadasterById:', error);
            throw new Error("Не вдалося оновити кадастровий запис.");
        }
    }

    async deleteCadasterById(id) {
        try {
            return await sqlRequest('DELETE FROM ower.cadaster_records WHERE id = ? RETURNING id', [id]);
        } catch (error) {
            console.error('❌ Database error in deleteCadasterById:', error);
            throw new Error("Не вдалося видалити кадастровий запис.");
        }
    }

    // Метод для отримання кадастрового номера по ПІБ платника
    async getCadastralNumberByPayerName(payerName) {
        const sql = `SELECT cadastral_number FROM ower.cadaster_records WHERE payer_name = ? ORDER BY id DESC LIMIT 1`;
        try {
            const result = await sqlRequest(sql, [payerName]);
            return result.length > 0 ? result[0].cadastral_number : null;
        } catch (error) {
            console.error('❌ Database error in getCadastralNumberByPayerName:', error);
            return null;
        }
    }

    // Метод для масового завантаження кадастрових записів з Excel файлу
    async bulkCreateCadaster(cadasterArray) {
        try {
            if (!Array.isArray(cadasterArray) || !cadasterArray.length) {
                throw new Error('Немає даних для завантаження');
            }

            console.log(`📊 Початок масового вставлення ${cadasterArray.length} кадастрових записів`);
            
            const batchSize = 100; // Обробляємо по 100 записів за раз
            let totalImported = 0;
            
            // Розбиваємо дані на батчі для кращої продуктивності
            for (let i = 0; i < cadasterArray.length; i += batchSize) {
                const batch = cadasterArray.slice(i, i + batchSize);
                const batchResult = await this.insertCadasterBatch(batch);
                totalImported += batchResult;
                
                console.log(`✅ Батч ${Math.floor(i/batchSize) + 1} завершено: ${batchResult} записів`);
            }

            console.log(`✅ Всього вставлено: ${totalImported} з ${cadasterArray.length}`);
            
            return {
                imported: totalImported,
                total: cadasterArray.length
            };

        } catch (error) {
            console.error('❌ Помилка масового завантаження:', error);
            throw new Error("Помилка масового завантаження кадастрових записів.");
        }
    }

    async insertCadasterBatch(batch) {
        try {
            let inserted = 0;
            
            for (const record of batch) {
                try {
                    await this.createCadaster(record);
                    inserted++;
                } catch (error) {
                    console.error('❌ Помилка вставки запису:', error);
                    // Продовжуємо обробку інших записів
                }
            }
            
            return inserted;
        } catch (error) {
            console.error('❌ Помилка батч вставки:', error);
            return 0;
        }
    }
}

module.exports = new CadasterRepository();