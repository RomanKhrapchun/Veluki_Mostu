const { sqlRequest } = require('../../../helpers/database')
const Logger = require('../../../utils/logger')

class CnapRepository {
    
    async getServices(filter) {
        const offset = (filter.page - 1) * filter.limit
        const searchCondition = filter.search ? `AND (s.name ILIKE '%${filter.search}%' OR s.identifier ILIKE '%${filter.search}%')` : ''
        
        const query = `
            SELECT 
                s.id, 
                s.identifier, 
                s.name, 
                s.price, 
                s.edrpou, 
                s.iban, 
                s.create_date,
                s.executor_id
            FROM admin.cnap_services s
            WHERE 1=1 ${searchCondition} AND s.enabled = true
            ORDER BY s.create_date DESC
            LIMIT $1 OFFSET $2
        `
        
        const countQuery = `
            SELECT COUNT(*) as total
            FROM admin.cnap_services s
            WHERE 1=1 ${searchCondition} AND s.enabled = true
        `
        
        const [items, count] = await Promise.all([
            sqlRequest(query, [filter.limit, offset]),
            sqlRequest(countQuery)
        ])
        
        return {
            items,
            totalItems: parseInt(count[0].total)
        }
    }
    async getServicesWithExecutors() {
        const query = `
            SELECT 
                s.id,
                s.name,
                s.price,
                s.identifier,
                s.executor_id,
                e.name as executor_name
            FROM admin.cnap_services s
            LEFT JOIN admin.cnap_executors e ON s.executor_id = e.id
            WHERE s.enabled = true
            ORDER BY 
                CASE WHEN e.name IS NULL THEN 1 ELSE 0 END,
                e.name ASC, 
                s.name ASC
        `
        
        const items = await sqlRequest(query)
        return { items }
    }

    // Методи для роботи з виконавцями
    async getExecutors() {
        const query = `
            SELECT 
                e.id,
                e.name,
                COUNT(s.id) as services_count
            FROM admin.cnap_executors e
            LEFT JOIN admin.cnap_services s ON e.id = s.executor_id
            GROUP BY e.id, e.name
            ORDER BY e.name ASC
        `
        
        const items = await sqlRequest(query)
        return { items }
    }

    async createExecutor(executorData) {
        const query = `
            INSERT INTO admin.cnap_executors (name)
            VALUES ($1)
            RETURNING id, name
        `
        
        const result = await sqlRequest(query, [executorData.name])
        return result[0]
    }

    async updateExecutor(id, executorData) {
        const query = `
            UPDATE admin.cnap_executors 
            SET name = $1
            WHERE id = $2
            RETURNING id, name
        `
        
        const result = await sqlRequest(query, [executorData.name, id])
        return result[0]
    }

    async deleteExecutor(id) {
        // Перевіряємо чи є послуги, прив'язані до цього виконавця
        const checkQuery = `
            SELECT COUNT(*) as count 
            FROM admin.cnap_services 
            WHERE executor_id = $1
        `
        
        const checkResult = await sqlRequest(checkQuery, [id])
        const servicesCount = parseInt(checkResult[0].count)
        
        if (servicesCount > 0) {
            throw new Error(`Cannot delete executor. There are ${servicesCount} services linked to this executor.`)
        }
        
        const query = `
            DELETE FROM admin.cnap_executors 
            WHERE id = $1 
            RETURNING id, name
        `
        
        const result = await sqlRequest(query, [id])
        return result[0]
    }

    // Оновлення послуги з виконавцем
    async updateServiceExecutor(serviceId, executorId) {
        const query = `
            UPDATE admin.cnap_services 
            SET executor_id = $1
            WHERE id = $2
            RETURNING id, name, executor_id
        `
        
        const result = await sqlRequest(query, [executorId, serviceId])
        return result[0]
    }
    async getServiceById(id) {
        const query = `
            SELECT id, identifier, name, price, edrpou, iban, create_date
            FROM admin.cnap_services
            WHERE id = $1
        `
        const result = await sqlRequest(query, [id])
        return result[0]
    }

    async getServiceByIdentifier(identifier) {
        const query = `
            SELECT id, identifier, name, price, edrpou, iban, create_date
            FROM admin.cnap_services
            WHERE identifier = $1
        `
        const result = await sqlRequest(query, [identifier])
        return result[0]
    }

    async createService(queryData) {
        try {
            const result = await sqlRequest(queryData.query, queryData.values);
            
            if (!result || result.length === 0) {
                throw new Error('Помилка при створенні послуги')
            }
            
            return result[0];
        } catch (error) {
            // Обробка помилки унікальності
            if (error.code === '23505') { // unique_violation
                const duplicateError = new Error('Послуга з таким ідентифікатором вже існує')
                duplicateError.statusCode = 409
                throw duplicateError
            }
            
            Logger.error('Error in repository createService:', error);
            throw error;
        }
    }

    async updateService(id, serviceData) {
        const { identifier, name, price, edrpou, iban } = serviceData
        const query = `
            UPDATE admin.cnap_services 
            SET identifier = $1, 
                name = $2, 
                price = $3::decimal, 
                edrpou = $4, 
                iban = $5,
                update_date = NOW()
            WHERE id = $6 
            RETURNING id, identifier, name, price, edrpou, iban, create_date, update_date
        `
        const params = [identifier, name, price, edrpou, iban, id]
        
        const result = await sqlRequest(query, params)
        if (!result.length) {
            const error = new Error('Service not found')
            error.statusCode = 404
            throw error
        }
        return result[0]
    }

    async deleteService(id) {
        const query = `
            UPDATE admin.cnap_services 
            SET enabled = false,
                update_date = NOW()
            WHERE id = $1
            RETURNING id
        `
        const result = await sqlRequest(query, [id])
        if (!result.length) {
            const error = new Error('Service not found')
            error.statusCode = 404
            throw error
        }
        return result[0]
    }

    async getAccounts(filter) {
        const offset = (filter.page - 1) * filter.limit
        const searchCondition = filter.search ? `AND (a.account_number ILIKE '%${filter.search}%' OR a.payer ILIKE '%${filter.search}%')` : ''
        
        const query = `
            SELECT 
                a.id,
                a.account_number,
                a.date,
                a.time,
                s.name as service_name,
                s.identifier as service_code,
                a.administrator,
                a.payer,
                a.amount,
                a.create_date
            FROM admin.cnap_accounts a
            JOIN admin.cnap_services s ON s.identifier = a.service_id
            WHERE 1=1 ${searchCondition}
            ORDER BY a.create_date DESC
            LIMIT $1 OFFSET $2
        `
        const countQuery = `
            SELECT COUNT(*) as total
            FROM admin.cnap_accounts a
            WHERE 1=1 ${searchCondition}
        `
        
        const [items, count] = await Promise.all([
            sqlRequest(query, [filter.limit, offset]),
            sqlRequest(countQuery)
        ])
        
        return {
            items,
            totalItems: parseInt(count[0].total)
        }
    }

    async getAccountById(id) {
        const query = `
            SELECT 
                a.id,
                a.account_number,
                a.date,
                a.time,
                s.name as service_name,
                s.identifier as service_code,
                a.administrator,
                a.payer,
                a.amount,
                a.create_date
            FROM admin.cnap_accounts a
            JOIN admin.cnap_services s ON s.identifier = a.service_id
            WHERE a.id = $1
        `
        const result = await sqlRequest(query, [id])
        return result[0]
    }

    async getAccountByNumber(accountNumber) {
        const query = `
            SELECT a.*, s.name as service_name
            FROM admin.cnap_accounts a
            LEFT JOIN admin.cnap_services s ON s.identifier = a.service_id
            WHERE a.account_number = $1
        `
        const result = await sqlRequest(query, [accountNumber])
        return result[0]
    }

    async createAccount(accountData) {
        const { account_number, service_code, administrator, payer, amount, time } = accountData
        const query = `
            INSERT INTO admin.cnap_accounts (
                account_number, service_id, administrator, 
                date, time, payer, amount
            )
            VALUES (
                $1, $2, $3, 
                CURRENT_DATE, $6::time, $4, $5::decimal
            )
            RETURNING 
                id, account_number, service_id, administrator,
                date, time, payer, amount, create_date
        `
        const params = [account_number, service_code, administrator, payer, amount, time]
        
        const result = await sqlRequest(query, params)
        return result[0]
    }
    async getAccountsWithStatus(filter) {
        const offset = (filter.page - 1) * filter.limit
        const searchCondition = filter.search ? `AND (a.account_number ILIKE '%${filter.search}%' OR a.payer ILIKE '%${filter.search}%')` : ''
        
        const query = `
            SELECT 
                a.id,
                a.account_number,
                a.date,
                a.time,
                s.name as service_name,
                s.identifier as service_code,
                a.administrator,
                a.payer,
                a.amount,
                a.create_date,
                ov.operation_id,
                ov.transaction_id,
                -- Якщо запис є в cnap_operation_view - значить оплата пройшла
                CASE 
                    WHEN ov.cnap_id IS NOT NULL THEN true 
                    ELSE false 
                END as can_download_receipt
            FROM admin.cnap_accounts a
            JOIN admin.cnap_services s ON s.identifier = a.service_id
            LEFT JOIN public.cnap_operation_view ov ON ov.cnap_id = a.id
            WHERE 1=1 ${searchCondition}
            ORDER BY a.create_date DESC
            LIMIT $1 OFFSET $2
        `
        const countQuery = `
            SELECT COUNT(*) as total
            FROM admin.cnap_accounts a
            WHERE 1=1 ${searchCondition}
        `
        
        const [items, count] = await Promise.all([
            sqlRequest(query, [filter.limit, offset]),
            sqlRequest(countQuery)
        ])
        
        return {
            items,
            totalItems: parseInt(count[0].total)
        }
    }
    
    async getOperationDataForReceipt(cnapId) {
        // Просто перевіряємо чи є запис в cnap_operation_view
        const query = `
            SELECT 
                cnap_id,
                account_number,
                operation_id,
                transaction_id
            FROM public.cnap_operation_view
            WHERE cnap_id = $1
            LIMIT 1
        `
        const result = await sqlRequest(query, [cnapId])
        return result[0]
    }
}

module.exports = new CnapRepository()
