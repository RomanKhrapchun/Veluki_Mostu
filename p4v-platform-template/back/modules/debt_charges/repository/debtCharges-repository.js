
class DebtChargesRepository {

    async getDebtChargeById(chargeId, displayFieldsDebtCharges) {
        let sql = `select ${displayFieldsDebtCharges.map(field => ` ${field}`)} from ower.debt_charges where id = $1`
        return await sqlRequest(sql, [chargeId])
    }

    async findDebtChargesByFilter(limit, offset, title, whereConditions = {}, displayFieldsDebtCharges = [], sortBy = 'document_date', sortDirection = 'desc') {
        const values = [];
        let paramIndex = 1;
        
        // Валідуємо параметри сортування для debt_charges
        const allowedSortFields = [
            'id', 'tax_number', 'payer_name', 'document_date', 
            'delivery_date', 'amount', 'status', 'tax_classifier'
        ];
        const safeSortField = allowedSortFields.includes(sortBy) ? sortBy : 'document_date';
        const safeSortDirection = ['asc', 'desc'].includes(sortDirection?.toLowerCase()) ? sortDirection.toLowerCase() : 'desc';
        
        // Створюємо JSON поля
        const jsonFields = displayFieldsDebtCharges.map(field => `'${field}', ${field}`).join(', ');
        
        let sql = `select json_agg(
            json_build_object(
                ${jsonFields}
            )
        ) as data,
        max(cnt) as count
        from (
            select *,
            count(*) over () as cnt
            from ower.debt_charges
            where 1=1`;

        // Додаємо WHERE умови для debt_charges
        if (Object.keys(whereConditions).length) {
            const data = this.buildDebtChargesWhereCondition(whereConditions);
            sql += data.text;
            values.push(...data.value);
        }

        // Додаємо фільтрацію по назві платника
        if (title) {
            sql += ` and payer_name ILIKE $${paramIndex}`;
            values.push(`%${title}%`);
            paramIndex++;
        }

        // Додаємо сортування
        if (sortBy === 'payer_name') {
            // Сортування по імені без урахування регістру
            sql += ` order by LOWER(payer_name) ${safeSortDirection.toUpperCase()}`;
        } else {
            // Стандартне сортування
            sql += ` order by ${safeSortField} ${safeSortDirection.toUpperCase()}`;
        }
        
        // Додаємо вторинне сортування для стабільності
        if (sortBy !== 'id') {
            sql += `, id ${safeSortDirection.toUpperCase()}`;
        }

        // Додаємо пагінацію
        sql += ` limit $${paramIndex} offset $${paramIndex + 1}`;
        values.push(limit);
        values.push(offset);
        
        sql += ` ) q`;

        console.log('🔍 SQL Query:', sql);
        console.log('🔍 Values:', values);
        console.log('🔄 Sort by:', sortBy, 'Direction:', sortDirection);

        return await sqlRequest(sql, [...values]);
    }

    // Окрема функція для WHERE умов таблиці debt_charges
    buildDebtChargesWhereCondition(whereConditions) {
        const values = []
        let paramIndex = 1;
        
        // Фільтруємо умови, щоб уникнути null значень
        const filteredConditions = Object.keys(whereConditions).filter(key => {
            return whereConditions[key] !== null && whereConditions[key] !== undefined;
        });

        // Якщо після фільтрації не залишилось умов, повертаємо порожню умову
        if (filteredConditions.length === 0) {
            return {
                text: '',
                value: [],
            };
        }

        const conditions = filteredConditions.map(key => {
            // Фільтр по сумі (діапазон)
            if (key === 'amount_from') {
                if (whereConditions[key] === null || whereConditions[key] === undefined) {
                    return null;
                }
                values.push(parseFloat(whereConditions[key]));
                return `amount >= $${paramIndex++}`;
            }
            
            if (key === 'amount_to') {
                if (whereConditions[key] === null || whereConditions[key] === undefined) {
                    return null;
                }
                values.push(parseFloat(whereConditions[key]));
                return `amount <= $${paramIndex++}`;
            }

            // Фільтр по датах (діапазон)
            if (key === 'date_from') {
                if (whereConditions[key] === null || whereConditions[key] === undefined) {
                    return null;
                }
                values.push(whereConditions[key]);
                return `document_date >= $${paramIndex++}`;
            }
            
            if (key === 'date_to') {
                if (whereConditions[key] === null || whereConditions[key] === undefined) {
                    return null;
                }
                values.push(whereConditions[key]);
                return `document_date <= $${paramIndex++}`;
            }

            // Фільтр по датах вручення (діапазон)
            if (key === 'delivery_date_from') {
                if (whereConditions[key] === null || whereConditions[key] === undefined) {
                    return null;
                }
                values.push(whereConditions[key]);
                return `delivery_date >= $${paramIndex++}`;
            }
            
            if (key === 'delivery_date_to') {
                if (whereConditions[key] === null || whereConditions[key] === undefined) {
                    return null;
                }
                values.push(whereConditions[key]);
                return `delivery_date <= $${paramIndex++}`;
            }

            // Пошук по податковому номеру (LIKE)
            if (key === 'tax_number') {
                values.push(`%${whereConditions[key]}%`);
                return `tax_number ILIKE $${paramIndex++}`;
            }

            // Пошук по назві платника (LIKE)
            if (key === 'payer_name') {
                values.push(`%${whereConditions[key]}%`);
                return `payer_name ILIKE $${paramIndex++}`;
            }

            // Точне співпадіння для статусу та класифікатора
            if (key === 'status' || key === 'tax_classifier') {
                values.push(whereConditions[key]);
                return `${key} = $${paramIndex++}`;
            }

            // Загальний випадок - точне співпадіння
            values.push(whereConditions[key]);
            return `${key} = $${paramIndex++}`;

        }).filter(condition => condition !== null); // Фільтруємо null умови
        
        // Перевіряємо, чи залишились умови після обробки
        if (conditions.length === 0) {
            return {
                text: '',
                value: [],
            };
        }
        
        return {
            text: ' and ' + conditions.join(' and '),
            value: values,
        }
    }

    async createDebtCharge(debtChargeData) {
        const {
            tax_number,
            payer_name,
            payment_info,
            tax_classifier,
            account_number,
            full_document_id,
            document_date,
            delivery_date,
            amount,
            status
        } = debtChargeData;

        const sql = `
            INSERT INTO ower.debt_charges (
                tax_number, payer_name, payment_info, tax_classifier,
                account_number, full_document_id, document_date,
                delivery_date, amount, status
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            RETURNING *
        `;

        const values = [
            tax_number, payer_name, payment_info, tax_classifier,
            account_number, full_document_id, document_date,
            delivery_date, amount, status
        ];

        return await sqlRequest(sql, values);
    }
    
    async truncateDebtCharges() {
        console.log('🗑️ Truncating debt_charges table...');
        try {
            const result = await sqlRequest('TRUNCATE TABLE ower.debt_charges RESTART IDENTITY');
            console.log('✅ Table debt_charges truncated successfully');
            return result;
        } catch (error) {
            console.error('❌ Error truncating debt_charges table:', error);
            throw error;
        }
    }

    async bulkCreateDebtCharges(debtChargesArray) {
        if (!debtChargesArray.length) {
            console.log('⚠️ Empty array provided to bulkCreateDebtCharges');
            return { imported: 0, total: 0 };
        }

        console.log(`📊 Bulk inserting ${debtChargesArray.length} records`);

        try {
            // Робимо невеликими батчами для уникнення проблем з великими запитами
            const BATCH_SIZE = 100;
            let totalImported = 0;

            for (let i = 0; i < debtChargesArray.length; i += BATCH_SIZE) {
                const batch = debtChargesArray.slice(i, i + BATCH_SIZE);
                console.log(`📦 Processing batch ${Math.floor(i/BATCH_SIZE) + 1}, records: ${batch.length}`);
                
                const batchResult = await this.insertBatch(batch);
                totalImported += batchResult;
                
                console.log(`✅ Batch inserted: ${batchResult} records`);
            }

            console.log(`✅ Total inserted: ${totalImported} out of ${debtChargesArray.length}`);
            
            return {
                imported: totalImported,
                total: debtChargesArray.length
            };

        } catch (error) {
            console.error('❌ Bulk insert error:', error);
            throw error;
        }
    }
    async insertBatch(batch) {
        if (!batch.length) return 0;

        // Генеруємо VALUES для batch insert
        const valueGroups = [];
        const allParams = [];
        let paramIndex = 1;

        batch.forEach(charge => {
            const groupPlaceholders = [];
            for (let i = 0; i < 10; i++) {
                groupPlaceholders.push(`$${paramIndex++}`);
            }
            valueGroups.push(`(${groupPlaceholders.join(', ')})`);
            
            allParams.push(
                charge.tax_number || null,
                charge.payer_name || null,
                charge.payment_info || null,
                charge.tax_classifier || null,
                charge.account_number || null,
                charge.full_document_id || null,
                charge.document_date || null,
                charge.delivery_date || null,
                charge.amount || 0,
                charge.status || 'Не вручено'
            );
        });

        const sql = `
        INSERT INTO ower.debt_charges (
            tax_number, payer_name, payment_info, tax_classifier,
            account_number, full_document_id, document_date,
            delivery_date, amount, status
        ) VALUES ${valueGroups.join(', ')}
    `;

        console.log(`📝 SQL query length: ${sql.length}`);
        console.log(`📊 Parameters count: ${allParams.length}`);
        console.log(`📊 Expected placeholders: ${batch.length * 10}`);

        // Виконуємо запит
        try {
            await sqlRequest(sql, allParams);
            console.log(`✅ Batch inserted successfully: ${batch.length} records`);
            return batch.length;
        } catch (error) {
            console.error(`❌ Batch insert error:`, error.message);
            throw error;
        }
    }
    async truncateDebtCharges() {
        return await sqlRequest('TRUNCATE TABLE ower.debt_charges RESTART IDENTITY');
    }

    async getDebtChargesStatistics() {
        const sql = `
            SELECT 
                COUNT(*) as total_charges,
                SUM(amount) as total_amount,
                AVG(amount) as avg_amount,
                COUNT(CASE WHEN status = 'Не вручено' THEN 1 END) as not_delivered,
                COUNT(CASE WHEN status = 'Вручено' THEN 1 END) as delivered,
                COUNT(CASE WHEN status = 'Сплачено' THEN 1 END) as paid,
                COUNT(CASE WHEN status = 'Скасовано' THEN 1 END) as cancelled,
                COUNT(CASE WHEN delivery_date < CURRENT_DATE AND status NOT IN ('Сплачено', 'Скасовано') THEN 1 END) as overdue
            FROM ower.debt_charges
        `;
        
        return await sqlRequest(sql);
    }

    async getUniqueStatuses() {
        const sql = 'SELECT DISTINCT status FROM ower.debt_charges WHERE status IS NOT NULL ORDER BY status';
        const result = await sqlRequest(sql);
        return result.map(row => row.status);
    }

    async getUniqueClassifiers() {
        const sql = 'SELECT DISTINCT tax_classifier FROM ower.debt_charges WHERE tax_classifier IS NOT NULL ORDER BY tax_classifier';
        const result = await sqlRequest(sql);
        return result.map(row => row.tax_classifier);
    }
    async getRequisite() {
        const sql = `
            SELECT 
                id,
                date,
                file,
                non_residential_debt_purpose,
                non_residential_debt_account,
                non_residential_debt_edrpou,
                non_residential_debt_recipientname,
                residential_debt_purpose,
                residential_debt_account,
                residential_debt_edrpou,
                residential_debt_recipientname,
                land_debt_purpose,
                land_debt_account,
                land_debt_edrpou,
                land_debt_recipientname,
                orenda_debt_purpose,
                orenda_debt_account,
                orenda_debt_edrpou,
                orenda_debt_recipientname,
                mpz_purpose,
                mpz_account,
                mpz_edrpou,
                mpz_recipientname
            FROM ower.settings 
            ORDER BY date DESC 
            LIMIT 1
        `;
        
        console.log('🏦 Getting settings/requisites for tax notification');
        const result = await sqlRequest(sql);
        
        if (!result.length) {
            console.log('⚠️ No settings found');
        } else {
            console.log('✅ Settings found for date:', result[0].date);
        }
        
        return result;
    }
}

module.exports = new DebtChargesRepository();