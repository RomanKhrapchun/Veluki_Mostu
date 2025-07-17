const { sqlRequest } = require("../../../helpers/database");
const { buildCadasterWhereCondition } = require("../../../utils/function");

class CadasterRepository {

    async findCadasterByFilter(limit, offset, title, whereConditions = {}, displayFields = [], sortBy = 'payer_name', sortDirection = 'asc') {
        const values = [];
        
        const safeSortField = ['payer_name', 'payer_address', 'iban', 'plot_area', 'land_tax', 'tax_address', 'cadastral_number', 'id']
            .includes(sortBy) ? sortBy : 'payer_name';
        const safeSortDirection = ['asc', 'desc'].includes(sortDirection?.toLowerCase()) ? sortDirection.toLowerCase() : 'asc';
        
        const displayFieldsList = displayFields.map(field => `${field}`).join(', ');
        
        const totalCountSql = `select count(*) as count from ower.cadaster_records where 1=1`;
        
        let sql = `select json_agg(json_build_object(${displayFields.map(field => `'${field}', ${field}`).join(', ')})) as data,
                max(cnt) as count
                from (
                select *,
                count(*) over () as cnt
                from ower.cadaster_records
                where 1=1`;

        if (Object.keys(whereConditions).length) {
            const data = this.buildCadasterWhereCondition(whereConditions);
            sql += data.text;
            values.push(...data.value);
        }

        if (title) {
            sql += ` and payer_name ILIKE ?`;
            values.push(`%${title}%`);
        }

        sql += ` order by ${safeSortField} ${safeSortDirection.toUpperCase()}`;
        
        values.push(limit);
        values.push(offset);
        
        sql += ` limit ? offset ? ) q`;

        console.log('🔍 Final SQL:', sql);
        console.log('🔍 Values:', values);

        try {
            return await sqlRequest(sql, [...values]);
        } catch (error) {
            console.error('❌ Database error in findCadasterByFilter:', error);
            throw new Error("Не вдалося виконати запит до бази даних. Будь ласка, спробуйте ще раз пізніше або зверніться до адміністратора системи.");
        }
    }

    buildCadasterWhereCondition(whereConditions) {
        const values = [];
        
        const filteredConditions = Object.keys(whereConditions).filter(key => {
            const value = whereConditions[key];
            return value !== null && value !== undefined && value !== '';
        });

        if (filteredConditions.length === 0) {
            return {
                text: '',
                value: [],
            };
        }

        const conditions = filteredConditions.map(key => {
            const value = whereConditions[key];
            
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
            
            if (key === 'plot_area' || key === 'land_tax') {
                values.push(value);
                return `${key} = ?`;
            }
            
            values.push(value);
            return `${key} = ?`;

        }).filter(condition => condition !== null);
        
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

    // СТАРИЙ МЕТОД (залишаємо для сумісності)
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

    // НОВИЙ МЕТОД: отримання всіх даних кадастру для одного ПІБ
    async getAllCadastralDataByPayerName(payerName) {
        const sql = `
            SELECT 
                cadastral_number, 
                tax_address, 
                land_tax,
                plot_area,
                payer_address
            FROM ower.cadaster_records 
            WHERE payer_name = ? 
            ORDER BY id ASC
        `;
        try {
            const result = await sqlRequest(sql, [payerName]);
            
            if (result.length === 0) {
                return {
                    cadastralNumbers: [],
                    totalLandTax: 0,
                    taxAddress: null,
                    plotArea: 0
                };
            }

            // Збираємо всі кадастрові номери (тільки валідні)
            const validCadastralNumbers = result
                .map(row => row.cadastral_number)
                .filter(num => num && 
                            num.trim() !== '' && 
                            !num.startsWith('AUTO_') && 
                            num.length > 5)
                .filter((num, index, arr) => arr.indexOf(num) === index); // унікальні

            // ВИПРАВЛЕНО: Правильне сумування з округленням
            const totalLandTax = result
                .reduce((sum, row) => {
                    const landTax = parseFloat(row.land_tax) || 0;
                    return sum + landTax;
                }, 0);
            
            // Округлюємо до 2 знаків після коми
            const roundedTotalLandTax = Math.round(totalLandTax * 100) / 100;

            // ВИПРАВЛЕНО: Правильне сумування площі з округленням
            const totalPlotArea = result
                .reduce((sum, row) => {
                    const plotArea = parseFloat(row.plot_area) || 0;
                    return sum + plotArea;
                }, 0);
            
            // Округлюємо площу до 4 знаків після коми
            const roundedTotalPlotArea = Math.round(totalPlotArea * 10000) / 10000;

            // Беремо першу доступну податкову адресу
            const taxAddress = result.find(row => row.tax_address && row.tax_address.trim() !== '')?.tax_address || null;

            console.log(`📊 Кадастрові дані для ${payerName}:`, {
                записів: result.length,
                кадастрових_номерів: validCadastralNumbers.length,
                загальний_податок: roundedTotalLandTax,
                загальна_площа: roundedTotalPlotArea
            });

            return {
                cadastralNumbers: validCadastralNumbers,
                totalLandTax: roundedTotalLandTax,
                taxAddress: taxAddress,
                plotArea: roundedTotalPlotArea
            };
        } catch (error) {
            console.error('❌ Database error in getAllCadastralDataByPayerName:', error);
            return {
                cadastralNumbers: [],
                totalLandTax: 0,
                taxAddress: null,
                plotArea: 0
            };
        }
    }

    // Метод для масового завантаження кадастрових записів з Excel файлу
    async bulkCreateCadaster(cadasterArray) {
        try {
            if (!Array.isArray(cadasterArray) || !cadasterArray.length) {
                throw new Error('Немає даних для завантаження');
            }

            console.log(`📊 Початок масового вставлення ${cadasterArray.length} кадастрових записів`);
            
            const batchSize = 100;
            let totalImported = 0;
            
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
                }
            }
            
            return inserted;
        } catch (error) {
            console.error('❌ Помилка батч вставки:', error);
            return 0;
        }
    }

    async getIndividualCadastralRecords(payerName) {
        const sql = `
            SELECT 
                id,
                cadastral_number, 
                tax_address, 
                land_tax,
                plot_area,
                payer_address
            FROM ower.cadaster_records 
            WHERE payer_name = ? 
            ORDER BY 
                CASE 
                    WHEN cadastral_number IS NOT NULL 
                        AND cadastral_number != '' 
                        AND NOT cadastral_number LIKE 'AUTO_%' 
                        AND LENGTH(cadastral_number) > 5 
                    THEN 0 
                    ELSE 1 
                END,
                id ASC
        `;
        
        try {
            const result = await sqlRequest(sql, [payerName]);
            
            console.log(`📊 Individual cadastral records for ${payerName}:`, {
                total_records: result.length,
                records: result.map(r => ({
                    id: r.id,
                    cadastral: r.cadastral_number,
                    tax: r.land_tax,
                    address: r.tax_address ? r.tax_address.substring(0, 50) + '...' : null
                }))
            });

            return result;
        } catch (error) {
            console.error('❌ Database error in getIndividualCadastralRecords:', error);
            return [];
        }
    }
}

module.exports = new CadasterRepository();