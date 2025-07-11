// файл: back/modules/sportcomplex/repository/sportscomplex-repository.js

const { sqlRequest } = require("../../../helpers/database");
const logger = require("../../../utils/logger");
const { buildWhereCondition } = require("../../../utils/function");

class SportsComplexRepository {
    async findRequisitesByFilter(limit, offset, displayFields, allowedFields) {
        try {
            // Перетворюємо масив полів на рядок для SQL
            const displayFieldsStr = displayFields.map(field => 
                field.includes('.') ? field : `r.${field}`).join(', ');
            
            // Підготовка SQL-запиту у форматі, схожому на debtor
            let sql = `
                SELECT json_agg(rw) as data,
                max(cnt) as count
                FROM (
                    SELECT json_build_object(
                        'id', r.id,
                        'kved', r.kved,
                        'iban', r.iban,
                        'edrpou', r.edrpou,
                        'group_name', sg.name
                    ) as rw,
                    count(*) over() as cnt
                    FROM sport.requisites r
                    LEFT JOIN sport.service_groups sg ON r.service_group_id = sg.id
                    WHERE 1=1`;
            
            const values = [];
            let paramIndex = 1;
            
            // Додаємо фільтри, якщо вони є
            for (const key in allowedFields) {
                sql += ` AND r.${key} ILIKE $${paramIndex}`;
                values.push(`%${allowedFields[key]}%`);
                paramIndex++;
            }
            
            // Додаємо сортування, ліміт та офсет
            sql += ` ORDER BY r.id DESC LIMIT $${paramIndex} OFFSET $${paramIndex+1}) q`;
            values.push(limit, offset);
            
            // Виконуємо запит
            const result = await sqlRequest(sql, values);
            
            // Повертаємо у тому ж форматі, як і debtor
            return result;
        } catch (error) {
            console.error("SQL Error:", error);
            logger.error("[SportsComplexRepository][findRequisitesByFilter]", error);
            throw error;
        }
    }

    async findPoolServicesByFilter(limit, offset, displayFields, allowedFields) {
        try {
            // Використовуємо JSON_AGG та JSON_BUILD_OBJECT як і в інших методах для узгодженості
            let sql = `
                SELECT json_agg(rw) as data,
                COALESCE(max(cnt), 0) as count
                FROM (
                    SELECT json_build_object(
                        'id', s.id,
                        'name', s.name,
                        'unit', s.unit,
                        'price', s.price,
                        'service_group_id', s.service_group_id
                    ) as rw,
                    count(*) over() as cnt
                    FROM sport.services s
                    WHERE 1 = 1`;
            
            const values = [];
            let paramIndex = 1;
            
            // Додаємо фільтри з параметризацією
            for (const key in allowedFields) {
                sql += ` AND s.${key} ILIKE $${paramIndex}`;
                values.push(`%${allowedFields[key]}%`);
                paramIndex++;
            }
            
            // Додаємо сортування, ліміт та офсет
            sql += ` ORDER BY s.id DESC LIMIT $${paramIndex} OFFSET $${paramIndex+1}) q`;
            values.push(limit, offset);
            
            // Виконуємо запит
            return await sqlRequest(sql, values);
        } catch (error) {
            logger.error("[SportsComplexRepository][findPoolServicesByFilter]", error);
            throw error;
        }
    }

    async getById(id) {
        const sql = `SELECT * FROM sport.requisites WHERE id = $1`;
        try {
            const result = await sqlRequest(sql, [id]);
            return result[0];
        } catch (error) {
            logger.error("[getById]", error);
            throw error;
        }
    }

    async getRequisite(id) {
        const sql = `
            SELECT r.*, sg.name AS group_name
            FROM sport.requisites r
            LEFT JOIN sport.service_groups sg ON sg.id = r.service_group_id
            WHERE r.id = $1
        `;
        try {
            const result = await sqlRequest(sql, [id]);
            return result[0];
        } catch (error) {
            logger.error("[getRequisite]", error);
            throw error;
        }
    }

    // Нові методи для роботи з рахунками

    async createPoolService(data) {
        const sql = `
            INSERT INTO sport.services 
            (name, unit, price, service_group_id) 
            VALUES ($1, $2, $3, $4)
            RETURNING id`;
        try {
            const result = await sqlRequest(sql, [data.name, data.unit, data.price, data.service_group_id]);
            return result[0];
        } catch (error) {
            logger.error("[SportsComplexRepository][createPoolService]", error);
            throw error;
        }
    }

    async createRequisite(data) {
        const sql = `
            INSERT INTO sport.requisites 
            (kved, iban, edrpou, service_group_id) 
            VALUES ($1, $2, $3, $4)
            RETURNING id`;
        try {
            const result = await sqlRequest(sql, [data.kved, data.iban, data.edrpou, data.service_group_id]);
            return result[0];
        } catch (error) {
            logger.error("[SportsComplexRepository][createRequisite]", error);
            throw error;
        }
    }

    async getServiceGroups() {
        const sql = `SELECT id, name FROM sport.service_groups ORDER BY id`;
        try {
            return await sqlRequest(sql);
        } catch (error) {
            logger.error("[SportsComplexRepository][getServiceGroups]", error);
            throw error;
        }
    }
    
    async getServicesByGroup(groupId) {
        try {
            // Додаткова перевірка вхідних даних
            const parsedId = parseInt(groupId, 10);
            if (isNaN(parsedId)) {
                console.error(`Invalid group ID: ${groupId}`);
                return []; // Повертаємо порожній масив замість помилки
            }
            
            const sql = `
                SELECT 
                    id, 
                    name, 
                    unit, 
                    price, 
                    service_group_id
                FROM sport.services
                WHERE service_group_id = $1
                ORDER BY name
            `;
            
            const result = await sqlRequest(sql, [parsedId]);
            
            // Форматуємо дані перед поверненням
            return result.map(service => ({
                id: service.id,
                name: service.name,
                unit: service.unit,
                price: service.price,
                service_group_id: service.service_group_id
            }));
        } catch (error) {
            console.error("SQL error in getServicesByGroup:", error);
            logger.error("[SportsComplexRepository][getServicesByGroup]", error);
            return []; // Повертаємо порожній масив у випадку помилки
        }
    }

    async createBill(data) {
        try {
            // Додамо більше логування і перевірок
            console.log("createBill: Отримані дані:", data);
            console.log("createBill: Тип service_id:", typeof data.service_id);
            
            // Перетворюємо service_id на число, якщо це рядок
            const serviceId = typeof data.service_id === 'string' 
                ? parseInt(data.service_id, 10) 
                : data.service_id;
            
            console.log("createBill: Перетворений service_id:", serviceId);
                
            // Спочатку отримуємо інформацію про послугу для розрахунку загальної вартості
            const serviceInfo = await sqlRequest(
                `SELECT id, name, price FROM sport.services WHERE id = $1`,
                [serviceId]
            );
            
            console.log("createBill: Результат запиту послуги:", serviceInfo);
            
            if (!serviceInfo || !serviceInfo.length) {
                // Виконаємо додатковий запит для діагностики
                const allServices = await sqlRequest(
                    `SELECT id, name FROM sport.services LIMIT 10`
                );
                console.log("createBill: Всі доступні послуги:", allServices);
                
                throw new Error('Послугу не знайдено. ID: ' + serviceId);
            }
            
            const totalPrice = serviceInfo[0].price * data.quantity;
            
            // Створюємо рахунок
            const sql = `
                INSERT INTO sport.payments
                (account_number, payer, service_id, quantity, total_price, status)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING id`;
                
            const result = await sqlRequest(sql, [
                data.account_number,
                data.payer,
                serviceId,  // Використовуємо перетворений ID
                data.quantity,
                totalPrice,
                data.status
            ]);
            
            return result[0];
        } catch (error) {
            console.error("createBill: Помилка:", error);
            logger.error("[SportsComplexRepository][createBill]", error);
            throw error;
        }
    }

    async findBillsByFilter(limit, offset, displayFields, allowedFields) {
        try {
            // Підготовка SQL-запиту
            let sql = `
                SELECT json_agg(rw) as data,
                COALESCE(max(cnt), 0) as count
                FROM (
                    SELECT json_build_object(
                        'id', p.id,
                        'account_number', p.account_number,
                        'payer', p.payer,
                        'service_group', sg.name,
                        'service_name', s.name,
                        'unit', s.unit,
                        'quantity', p.quantity,
                        'total_price', p.total_price,
                        'status', p.status
                    ) as rw,
                    count(*) over() as cnt
                    FROM sport.payments p
                    LEFT JOIN sport.services s ON p.service_id = s.id
                    LEFT JOIN sport.service_groups sg ON s.service_group_id = sg.id
                    WHERE 1=1`;
            
            const values = [];
            let paramIndex = 1;
            
            // Додаємо фільтри, якщо вони є
            for (const key in allowedFields) {
                if (key === 'service_name') {
                    sql += ` AND s.name ILIKE $${paramIndex}`;
                } else if (key === 'status') {
                    sql += ` AND p.status ILIKE $${paramIndex}`;
                } else {
                    sql += ` AND p.${key} ILIKE $${paramIndex}`;
                }
                values.push(`%${allowedFields[key]}%`);
                paramIndex++;
            }
            
            // Додаємо сортування, ліміт та офсет
            sql += ` ORDER BY p.id DESC LIMIT $${paramIndex} OFFSET $${paramIndex+1}) q`;
            values.push(limit, offset);
            
            // Виконуємо запит
            return await sqlRequest(sql, values);
        } catch (error) {
            logger.error("[SportsComplexRepository][findBillsByFilter]", error);
            throw error;
        }
    }

    async getBillById(id) {
        try {
            const sql = `
                SELECT 
                    p.id,
                    p.account_number,
                    p.payer,
                    sg.id AS service_group_id,
                    sg.name AS service_group,
                    s.id AS service_id,
                    s.name AS service_name,
                    s.unit,
                    p.quantity,
                    p.total_price,
                    p.status
                FROM 
                    sport.payments p
                JOIN 
                    sport.services s ON p.service_id = s.id
                JOIN 
                    sport.service_groups sg ON s.service_group_id = sg.id
                WHERE 
                    p.id = $1
            `;
            const result = await sqlRequest(sql, [id]);
            return result[0];
        } catch (error) {
            logger.error("[SportsComplexRepository][getBillById]", error);
            throw error;
        }
    }

    async updateBillStatus(id, status) {
        try {
            const sql = `
                UPDATE sport.payments
                SET status = $2
                WHERE id = $1
                RETURNING id
            `;
            const result = await sqlRequest(sql, [id, status]);
            return result[0];
        } catch (error) {
            logger.error("[SportsComplexRepository][updateBillStatus]", error);
            throw error;
        }
    }

    /*async updateBillStatus(id, status) {
        try {
            const sql = `
                UPDATE sport.payments
                SET status = $2, updated_at = CURRENT_TIMESTAMP
                WHERE id = $1
                RETURNING id
            `;
            const result = await sqlRequest(sql, [id, status]);
            return result[0];
        } catch (error) {
            logger.error("[SportsComplexRepository][updateBillStatus]", error);
            throw error;
        }
    }*/

    async createServiceGroup(data) {
        const sql = `
            INSERT INTO sport.service_groups (name) 
            VALUES ($1)
            RETURNING id, name`;
        try {
            const result = await sqlRequest(sql, [data.name]);
            return result[0];
        } catch (error) {
            logger.error("[SportsComplexRepository][createServiceGroup]", error);
            throw error;
        }
    }

    async updateRequisite(id, data) {
        try {
            const sql = `
                UPDATE sport.requisites
                SET 
                    kved = $1,
                    iban = $2,
                    edrpou = $3,
                    service_group_id = $4
                WHERE id = $5
                RETURNING id
            `;
            
            const result = await sqlRequest(sql, [
                data.kved,
                data.iban,
                data.edrpou,
                data.service_group_id,
                id
            ]);
            
            return result[0];
        } catch (error) {
            logger.error("[SportsComplexRepository][updateRequisite]", error);
            throw error;
        }
    }

    async getServiceById(id) {
        try {
            const sql = `
                SELECT s.*, sg.name AS group_name
                FROM sport.services s
                LEFT JOIN sport.service_groups sg ON s.service_group_id = sg.id
                WHERE s.id = $1
            `;
            const result = await sqlRequest(sql, [id]);
            return result[0];
        } catch (error) {
            logger.error("[SportsComplexRepository][getServiceById]", error);
            throw error;
        }
    }

    async updateService(id, data) {
        try {
            const sql = `
                UPDATE sport.services
                SET 
                    name = $1,
                    unit = $2,
                    price = $3,
                    service_group_id = $4
                WHERE id = $5
                RETURNING id
            `;
            
            const result = await sqlRequest(sql, [
                data.name,
                data.unit,
                data.price,
                data.service_group_id,
                id
            ]);
            
            return result[0];
        } catch (error) {
            logger.error("[SportsComplexRepository][updateService]", error);
            throw error;
        }
    }
}

module.exports = new SportsComplexRepository();