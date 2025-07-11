// файл: back/modules/sportcomplex/service/sportscomplex-service.js

const sportsComplexRepository = require("../repository/sportscomplex-repository");
const logRepository = require("../../log/repository/log-repository");
const logger = require("../../../utils/logger");
const { paginate, paginationData } = require("../../../utils/function");
const { allowedRequisitesFilterFields, allowedServicesFilterFields, allowedBillsFilterFields, displayRequisitesFilterFields, displayServicesFilterFields, displayBillsFilterFields} = require("../../../utils/constants");
const { createRequisiteWord } = require("../../../utils/generateDocx");
const { buildWhereCondition } = require("../../../utils/function");

class SportsComplexService {
    async findRequisitesByFilter(request) {
        const { page = 1, limit = 16, ...whereConditions } = request.body;
        const { offset } = paginate(page, limit);
        const allowedFields = allowedRequisitesFilterFields.filter(el => whereConditions.hasOwnProperty(el)).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {});

        const data = await sportsComplexRepository.findRequisitesByFilter(limit, offset, displayRequisitesFilterFields, allowedFields);

        if (Object.keys(whereConditions).length > 0) {
            await logRepository.createLog({
                row_pk_id: null,
                uid: request?.user?.id,
                action: 'SEARCH',
                client_addr: request?.ip,
                application_name: 'Пошук реквізитів',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'public',
                table_name: 'requisites',
                oid: '16504',
            });
        }

        return paginationData(data[0], page, limit, data[1]);
    }
    
    async findPoolServicesByFilter(request) {
        const { page = 1, limit = 16, ...whereConditions } = request.body;
        const { offset } = paginate(page, limit);
        const allowedFields = allowedServicesFilterFields.filter(el => whereConditions.hasOwnProperty(el)).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {});

        const data = await sportsComplexRepository.findPoolServicesByFilter(limit, offset, displayServicesFilterFields, allowedFields);

        if (Object.keys(whereConditions).length > 0) {
            await logRepository.createLog({
                row_pk_id: null,
                uid: request?.user?.id,
                action: 'SEARCH',
                client_addr: request?.ip,
                application_name: 'Пошук послуг басейну',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'public',
                table_name: 'services',
                oid: '16505',
            });
        }

        return paginationData(data[0], page, limit, data[1]);
    }

    async getById(id) {
        try {
            return await sportsComplexRepository.getById(id);
        } catch (error) {
            logger.error("[SportsComplexService][getById]", error);
            throw error;
        }
    }

    async generateWordById(id) {
        try {
            const data = await sportsComplexRepository.getRequisite(id);
            
            // Логування операції
            await logRepository.createLog({
                row_pk_id: id,
                uid: request?.user?.id,
                action: 'GENERATE_DOC',
                client_addr: request?.ip,
                application_name: 'Генерування документа реквізитів',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'public',
                table_name: 'requisites',
                oid: '16504',
            });
            
            return await createRequisiteWord(data);
        } catch (error) {
            logger.error("[SportsComplexService][generateWordById]", error);
            throw error;
        }
    }

    async printById(id) {
        try {
            return await sportsComplexRepository.getRequisite(id);
        } catch (error) {
            logger.error("[SportsComplexService][printById]", error);
            throw error;
        }
    }

    // Нові методи для функціоналу рахунків

    async createPoolService(request) {
        try {
            const { name, unit, price, service_group_id } = request.body;
            const result = await sportsComplexRepository.createPoolService({
                name,
                unit,
                price,
                service_group_id
            });
            
            // Логування операції
            await logRepository.createLog({
                row_pk_id: result.id,
                uid: request?.user?.id,
                action: 'INSERT',
                client_addr: request?.ip,
                application_name: 'Створення послуги басейну',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'public',
                table_name: 'services',
                oid: '16505',
            });
            
            return { success: true, message: 'Послугу успішно створено' };
        } catch (error) {
            logger.error("[SportsComplexService][createPoolService]", error);
            throw error;
        }
    }

    async createRequisite(request) {
        try {
            const { kved, iban, edrpou, service_group_id } = request.body;
            const result = await sportsComplexRepository.createRequisite({
                kved,
                iban,
                edrpou,
                service_group_id
            });
            
            // Логування операції
            await logRepository.createLog({
                row_pk_id: result.id,
                uid: request?.user?.id,
                action: 'INSERT',
                client_addr: request?.ip,
                application_name: 'Створення реквізитів',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'public',
                table_name: 'requisites',
                oid: '16504',
            });
            
            return { success: true, message: 'Реквізити успішно створено' };
        } catch (error) {
            logger.error("[SportsComplexService][createRequisite]", error);
            throw error;
        }
    }

    async getServiceGroups() {
        try {
            return await sportsComplexRepository.getServiceGroups();
        } catch (error) {
            logger.error("[SportsComplexService][getServiceGroups]", error);
            throw error;
        }
    }

    async getServicesByGroup(id) {
        try {
            // Додамо логування для діагностики
            console.log(`Getting services for group ID: ${id}`);
            const result = await sportsComplexRepository.getServicesByGroup(id);
            console.log(`Found ${result.length} services for group ID: ${id}`);
            return result;
        } catch (error) {
            logger.error("[SportsComplexService][getServicesByGroup]", error);
            throw error;
        }
    }

async createBill(request) {
    try {
        const { account_number, payer, service_id, quantity, status } = request.body;
        console.log("createBill: Отримані дані:", request.body);
        
        // Перевірка, чи service_id є числовим
        const serviceIdNumber = parseInt(service_id);
        if (isNaN(serviceIdNumber)) {
            throw new Error('Неправильний формат ID послуги');
        }
        
        const result = await sportsComplexRepository.createBill({
            account_number,
            payer,
            service_id: serviceIdNumber, // Гарантуємо, що це число
            quantity: parseInt(quantity),
            status
        });
        
        // Логування операції
        await logRepository.createLog({
            row_pk_id: result.id,
            uid: request?.user?.id,
            action: 'INSERT',
            client_addr: request?.ip,
            application_name: 'Створення рахунку',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'public',
            table_name: 'payments',
            oid: '16506',
        });
        
        return { 
            success: true, 
            message: 'Рахунок успішно створено',
            id: result.id
        };
    } catch (error) {
        logger.error("[SportsComplexService][createBill]", error);
        throw error;
    }
}

    async findBillsByFilter(request) {
        try {
            const { page = 1, limit = 16, ...whereConditions} = request.body;
            const { offset } = paginate(page, limit);
            
            const allowedFields = allowedBillsFilterFields.filter(el => whereConditions.hasOwnProperty(el)).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {});

            const data = await sportsComplexRepository.findBillsByFilter(limit, offset, displayBillsFilterFields, allowedFields);
            
            // Логування операції пошуку, якщо є фільтри
            if (Object.keys(whereConditions).length > 0) {
                await logRepository.createLog({
                    row_pk_id: null,
                    uid: request?.user?.id,
                    action: 'SEARCH',
                    client_addr: request?.ip,
                    application_name: 'Пошук рахунків',
                    action_stamp_tx: new Date(),
                    action_stamp_stm: new Date(),
                    action_stamp_clk: new Date(),
                    schema_name: 'public',
                    table_name: 'payments',
                    oid: '16506',
                });
            }
            
            return paginationData(data[0], page, limit, data[1]);
        } catch (error) {
            logger.error("[SportsComplexService][findBillsByFilter]", error);
            throw error;
        }
    }

    async getBillById(id) {
        try {
            return await sportsComplexRepository.getBillById(id);
        } catch (error) {
            logger.error("[SportsComplexService][getBillById]", error);
            throw error;
        }
    }

    async updateBillStatus(request) {
        try {
            const { id } = request.params;
            const { status } = request.body;
            
            const result = await sportsComplexRepository.updateBillStatus(id, status);
            
            if (!result) {
                throw new Error('Рахунок не знайдено');
            }
            
            // Логування операції
            await logRepository.createLog({
                row_pk_id: id,
                uid: request?.user?.id,
                action: 'UPDATE',
                client_addr: request?.ip,
                application_name: 'Зміна статусу рахунку',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'public',
                table_name: 'payments',
                oid: '16506',
            });
            
            return { success: true, message: `Статус рахунку успішно змінено на "${status}"` };
        } catch (error) {
            logger.error("[SportsComplexService][updateBillStatus]", error);
            throw error;
        }
    }

    async generateBillReceipt(request, reply) {
        try {
            const { id } = request.params;
            
            // Отримуємо дані рахунку
            const bill = await sportsComplexRepository.getBillById(id);
            
            if (!bill) {
                throw new Error('Рахунок не знайдено');
            }
            
            // Перевіряємо статус рахунку
            if (bill.status !== 'Оплачено') {
                throw new Error('Неможливо згенерувати квитанцію для неоплаченого рахунку');
            }
            
            // Генеруємо PDF квитанцію
            const pdfBuffer = await createPDF({
                title: 'Квитанція про оплату',
                accountNumber: bill.account_number,
                payer: bill.payer,
                serviceGroup: bill.service_group,
                serviceName: bill.service_name,
                unit: bill.unit,
                quantity: bill.quantity,
                totalPrice: bill.total_price,
                date: new Date(bill.updated_at).toLocaleDateString('uk-UA')
            });
            
            // Логування операції
            await logRepository.createLog({
                row_pk_id: id,
                uid: request?.user?.id,
                action: 'GENERATE_DOC',
                client_addr: request?.ip,
                application_name: 'Генерування квитанції',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'public',
                table_name: 'payments',
                oid: '16506',
            });
            
            return pdfBuffer;
        } catch (error) {
            logger.error("[SportsComplexService][generateBillReceipt]", error);
            throw error;
        }
    }

    async createServiceGroup(request) {
        try {
            const { name } = request.body;
            const result = await sportsComplexRepository.createServiceGroup({ name });
            
            // Логування операції
            await logRepository.createLog({
                row_pk_id: result.id,
                uid: request?.user?.id,
                action: 'INSERT',
                client_addr: request?.ip,
                application_name: 'Створення групи послуг',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'public',
                table_name: 'service_groups',
                oid: '16503',
            });
            
            return result;
        } catch (error) {
            logger.error("[SportsComplexService][createServiceGroup]", error);
            throw error;
        }
    }

    async updateRequisite(request) {
        try {
            const { id } = request.params;
            const { kved, iban, edrpou, service_group_id } = request.body;
            
            const result = await sportsComplexRepository.updateRequisite(id, {
                kved,
                iban,
                edrpou,
                service_group_id
            });
            
            if (!result) {
                throw new Error('Реквізити не знайдено');
            }
            
            // Логування операції
            await logRepository.createLog({
                row_pk_id: id,
                uid: request?.user?.id,
                action: 'UPDATE',
                client_addr: request?.ip,
                application_name: 'Оновлення реквізитів',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'public',
                table_name: 'requisites',
                oid: '16504',
            });
            
            return { success: true, message: 'Реквізити успішно оновлено' };
        } catch (error) {
            logger.error("[SportsComplexService][updateRequisite]", error);
            throw error;
        }
    }

    async getServiceById(id) {
        try {
            return await sportsComplexRepository.getServiceById(id);
        } catch (error) {
            logger.error("[SportsComplexService][getServiceById]", error);
            throw error;
        }
    }

    async updateService(request) {
        try {
            const { id } = request.params;
            const { name, unit, price, service_group_id } = request.body;
            
            const result = await sportsComplexRepository.updateService(id, {
                name,
                unit,
                price,
                service_group_id
            });
            
            // Логування операції
            await logRepository.createLog({
                row_pk_id: id,
                uid: request?.user?.id,
                action: 'UPDATE',
                client_addr: request?.ip,
                application_name: 'Оновлення послуги басейну',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'public',
                table_name: 'services',
                oid: '16505',
            });
            
            return { success: true, message: 'Послугу успішно оновлено' };
        } catch (error) {
            logger.error("[SportsComplexService][updateService]", error);
            throw error;
        }
    }
}

module.exports = new SportsComplexService();