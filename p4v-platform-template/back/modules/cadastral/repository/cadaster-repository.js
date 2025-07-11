const { sqlRequest } = require("../../../helpers/database");
const { buildWhereCondition } = require("../../../utils/function");

class CadasterRepository {

    async findCadasterByFilter(limit, offset, search, whereConditions = {}, displayFields = []) {
        const values = [];
        let sql = `SELECT json_agg(rw) as data, 
                   max(cnt) as count 
                   FROM (
                       SELECT json_build_object(${displayFields.map(field => `'${field}', ${field}`).join(', ')}) as rw,
                       count(*) over () as cnt
                       FROM ower.cadaster_records
                       WHERE 1=1`;

        if (Object.keys(whereConditions).length) {
            const data = buildWhereCondition(whereConditions);
            sql += data.text;
            values.push(...data.value);
        }

        if (search) {
            sql += ` AND (payer_name ILIKE ? OR cadastral_number ILIKE ? OR payer_address ILIKE ?)`;
            values.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        values.push(limit);
        values.push(offset);
        sql += ` ORDER BY id DESC LIMIT ? OFFSET ? ) q`;

        return await sqlRequest(sql, [...values]);
    }

    async getCadasterById(id, displayFields = []) {
        let sql = `SELECT ${displayFields.map(field => ` ${field}`)} FROM ower.cadaster_records WHERE id = ?`;
        return await sqlRequest(sql, [id]);
    }

    async createCadaster(cadasterData) {
        const sql = `INSERT INTO ower.cadaster_records (${Object.keys(cadasterData).map(field => `${field}`).join(", ")}) 
                     VALUES (${Object.keys(cadasterData).map(el => '?').join(", ")}) 
                     RETURNING id`;
        return await sqlRequest(sql, [...Object.values(cadasterData)]);
    }

    async updateCadasterById(id, cadasterData) {
        let sql = `UPDATE ower.cadaster_records 
                   SET ${Object.keys(cadasterData).map(field => `${field} = ?`).join(', ')}, 
                       updated_at = CURRENT_TIMESTAMP 
                   WHERE id = ? 
                   RETURNING id`;
        return await sqlRequest(sql, [...Object.values(cadasterData), id]);
    }

    async deleteCadasterById(id) {
        return await sqlRequest('DELETE FROM ower.cadaster_records WHERE id = ? RETURNING id', [id]);
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
            console.error('❌ Помилка масового вставлення:', error);
            throw error;
        }
    }

    async insertCadasterBatch(batch) {
        if (!batch.length) return 0;

        // Генеруємо VALUES для batch insert
        const valueGroups = [];
        const allParams = [];
        let paramIndex = 1;

        batch.forEach(record => {
            const groupPlaceholders = [];
            for (let i = 0; i < 9; i++) { // 9 полів для вставки
                groupPlaceholders.push(`$${paramIndex++}`);
            }
            valueGroups.push(`(${groupPlaceholders.join(', ')})`);
            
            allParams.push(
                record.payer_name || null,
                record.payer_address || null,
                record.iban || null,
                record.plot_area || 0,
                record.land_tax || 0,
                record.tax_address || null,
                record.cadastral_number || null,
                record.uid || null,
                new Date() // created_at
            );
        });

        const sql = `
        INSERT INTO ower.cadaster_records (
            payer_name, payer_address, iban, plot_area,
            land_tax, tax_address, cadastral_number, uid, created_at
        ) VALUES ${valueGroups.join(', ')}
        ON CONFLICT (cadastral_number) DO NOTHING
        `;

        const result = await sqlRequest(sql, allParams);
        return batch.length; // Повертаємо кількість оброблених записів
    }

    // Очищення таблиці кадастрових записів (опціонально)
    async truncateCadaster() {
        return await sqlRequest('TRUNCATE TABLE ower.cadaster_records RESTART IDENTITY', []);
    }

}

module.exports = new CadasterRepository();