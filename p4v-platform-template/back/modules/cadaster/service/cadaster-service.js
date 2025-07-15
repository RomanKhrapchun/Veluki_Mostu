const cadasterRepository = require('../repository/cadaster-repository');
const logRepository = require('../../log/repository/log-repository');
const { displayCadasterFields } = require('../../../utils/constants');
const { fieldsListMissingError, NotFoundErrorMessage } = require('../../../utils/messages');
const { paginationData } = require('../../../utils/function');

class CadasterService {

    async findCadasterByFilter(request) {
        const page = request?.body?.page || 1;
        const limit = request?.body?.limit || 16;
        const title = request?.body?.title || null; // ✅ ЗМІНЕНО: title замість search
        const sortBy = request?.body?.sort_by || 'id';
        const sortDirection = request?.body?.sort_direction || 'desc';
        
        // Умови фільтрування
        const whereConditions = {};
        
        // Фільтрування за ПІБ платника
        if (request?.body?.payer_name) {
            whereConditions.payer_name = request.body.payer_name;
        }
        
        // Фільтрування за адресою платника
        if (request?.body?.payer_address) {
            whereConditions.payer_address = request.body.payer_address;
        }
        
        // Фільтрування за податковою адресою платника
        if (request?.body?.tax_address) {
            whereConditions.tax_address = request.body.tax_address;
        }
        
        // Фільтрування за кадастровим номером
        if (request?.body?.cadastral_number) {
            whereConditions.cadastral_number = request.body.cadastral_number;
        }
        
        // Фільтрування за IBAN
        if (request?.body?.iban) {
            whereConditions.iban = request.body.iban;
        }

        if (!Object.keys(displayCadasterFields).length) {
            throw new Error(fieldsListMissingError);
        }

        try {
            console.log('🔍 Cadaster filter request:', {
                page,
                limit,
                title, // ✅ ЗМІНЕНО: title замість search
                whereConditions,
                sortBy,
                sortDirection
            });

            // ✅ ВИПРАВЛЕНО: Правильний порядок параметрів
            const offset = (page - 1) * limit;
            const cadasterData = await cadasterRepository.findCadasterByFilter(
                limit, 
                offset, 
                title, // ✅ ЗМІНЕНО: title замість search
                whereConditions, 
                displayCadasterFields,
                sortBy,
                sortDirection
            );

            // ✅ ВИПРАВЛЕНО: Змінено умову логування
            if (Object.keys(whereConditions).length > 0 || title) {
                await logRepository.createLog({
                    row_pk_id: null,
                    uid: request?.user?.id,
                    action: 'SEARCH', // Змінено з 'SELECT' на 'SEARCH'
                    client_addr: request?.ip,
                    application_name: `Фільтрування кадастрових записів`,
                    action_stamp_tx: new Date(),
                    action_stamp_stm: new Date(),
                    action_stamp_clk: new Date(),
                    schema_name: 'ower',
                    table_name: 'cadaster_records',
                    oid: '16504',
                });
            }
            
            console.log('✅ Cadaster data retrieved successfully:', {
                totalRecords: cadasterData[0]?.count || 0,
                dataLength: cadasterData[0]?.data?.length || 0
            });
            
            return paginationData(cadasterData[0], page, limit);
        } catch (error) {
            console.error('❌ Error in findCadasterByFilter:', error);
            throw new Error("Не вдалося виконати запит до бази даних. Будь ласка, спробуйте ще раз пізніше або зверніться до адміністратора системи.");
        }
    }

    async getCadasterById(request) {
        if (!Object.keys([displayCadasterFields]).length) {
            throw new Error(fieldsListMissingError);
        }
        
        try {
            const cadasterData = await cadasterRepository.getCadasterById(
                request?.params?.id, 
                displayCadasterFields
            );
            
            if (!cadasterData.length) {
                throw new Error(NotFoundErrorMessage);
            }
            
            return cadasterData[0];
        } catch (error) {
            console.error('❌ Error in getCadasterById:', error);
            throw error;
        }
    }

    async createCadaster(request) {
        try {
            const cadasterData = {
                payer_name: request.body.payer_name,
                payer_address: request.body.payer_address,
                iban: request.body.iban,
                plot_area: request.body.plot_area,
                land_tax: request.body.land_tax,
                tax_address: request.body.tax_address,
                cadastral_number: request.body.cadastral_number,
                uid: request?.user?.id
            };

            const result = await cadasterRepository.createCadaster(cadasterData);
            
            await logRepository.createLog({
                row_pk_id: result[0]?.id,
                uid: request?.user?.id,
                action: 'INSERT',
                client_addr: request?.ip,
                application_name: 'Створення кадастрового запису',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'cadaster_records',
                oid: '16504',
            });
            
            return result[0];
        } catch (error) {
            console.error('❌ Error in createCadaster:', error);
            throw error;
        }
    }

    async updateCadasterById(request) {
        try {
            const cadasterData = {
                payer_name: request.body.payer_name,
                payer_address: request.body.payer_address,
                iban: request.body.iban,
                plot_area: request.body.plot_area,
                land_tax: request.body.land_tax,
                tax_address: request.body.tax_address,
                cadastral_number: request.body.cadastral_number,
                editor_id: request?.user?.id
            };

            const result = await cadasterRepository.updateCadasterById(request?.params?.id, cadasterData);
            
            await logRepository.createLog({
                row_pk_id: request?.params?.id,
                uid: request?.user?.id,
                action: 'UPDATE',
                client_addr: request?.ip,
                application_name: 'Оновлення кадастрового запису',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'cadaster_records',
                oid: '16504',
            });
            
            return result[0];
        } catch (error) {
            console.error('❌ Error in updateCadasterById:', error);
            throw error;
        }
    }

    async deleteCadasterById(request) {
        try {
            const result = await cadasterRepository.deleteCadasterById(request?.params?.id);
            
            await logRepository.createLog({
                row_pk_id: request?.params?.id,
                uid: request?.user?.id,
                action: 'DELETE',
                client_addr: request?.ip,
                application_name: 'Видалення кадастрового запису',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'cadaster_records',
                oid: '16504',
            });
            
            return result[0];
        } catch (error) {
            console.error('❌ Error in deleteCadasterById:', error);
            throw error;
        }
    }

    // Додатковий метод для отримання кадастрових номерів по ПІБ (для debtor модуля)
    async getCadastralNumberByPayerName(payerName) {
        try {
            return await cadasterRepository.getCadastralNumberByPayerName(payerName);
        } catch (error) {
            console.error('❌ Error in getCadastralNumberByPayerName:', error);
            return null;
        }
    }
}

module.exports = new CadasterService();