const cadasterRepository = require("../repository/cadaster-repository");
const { fieldsListMissingError, NotFoundErrorMessage } = require("../../../utils/messages")
const { paginate, paginationData } = require("../../../utils/function");
const { displayCadasterFields, allowedCadasterTableFilterFields, allowedCadasterSortFields } = require("../../../utils/constants");
const logRepository = require("../../log/repository/log-repository");
const xlsx = require('xlsx');

class CadasterService {

    async findCadasterByFilter(request) {
        const { 
            page = 1, 
            limit = 16, 
            title, 
            sort_by = null, 
            sort_direction = 'asc',
            ...whereConditions 
        } = request.body;
        
        const { offset } = paginate(page, limit)
        const isValidSortField = sort_by && allowedCadasterSortFields.includes(sort_by);
        const isValidSortDirection = ['asc', 'desc'].includes(sort_direction?.toLowerCase());
    
        const validSortBy = isValidSortField ? sort_by : 'payer_name';
        const validSortDirection = isValidSortDirection ? sort_direction.toLowerCase() : 'asc';

        try {
            const cadasterData = await cadasterRepository.findCadasterByFilter(
                limit, 
                offset, 
                title, 
                whereConditions, 
                displayCadasterFields, 
                validSortBy, 
                validSortDirection
            );

            if (Object.keys(whereConditions).length > 0 || title) {
                await logRepository.createLog({
                    row_pk_id: null,
                    uid: request?.user?.id,
                    action: 'SEARCH',
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
                editor_id: request?.user?.id,
                editor_date: new Date()
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

    // СТАРА ФУНКЦІЯ (для сумісності)
    async getCadastralNumberByPayerName(payerName) {
        try {
            return await cadasterRepository.getCadastralNumberByPayerName(payerName);
        } catch (error) {
            console.error('❌ Error in getCadastralNumberByPayerName:', error);
            return null;
        }
    }

    // НОВА ФУНКЦІЯ: отримання всіх кадастрових даних для ПІБ
    async getAllCadastralDataByPayerName(payerName) {
        try {
            console.log(`🔍 Отримання всіх кадастрових даних для: ${payerName}`);
            const result = await cadasterRepository.getAllCadastralDataByPayerName(payerName);
            
            console.log(`📊 Результат для ${payerName}:`, {
                кадастрових_номерів: result.cadastralNumbers?.length || 0,
                загальний_податок: result.totalLandTax || 0,
                податкова_адреса: result.taxAddress ? 'є' : 'немає'
            });
            
            return result;
        } catch (error) {
            console.error('❌ Error in getAllCadastralDataByPayerName:', error);
            return {
                cadastralNumbers: [],
                totalLandTax: 0,
                taxAddress: null,
                plotArea: 0
            };
        }
    }

    // Метод для масового завантаження
    async bulkUpload(request) {
        try {
            // Логіка обробки Excel файлу буде тут
            console.log('🔄 Початок масового завантаження кадастрових записів');
            
            if (!request.file) {
                throw new Error('Файл не знайдено');
            }

            // Обробка Excel файлу
            const workbook = xlsx.read(request.file.buffer, { type: 'buffer' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = xlsx.utils.sheet_to_json(worksheet);

            console.log(`📄 Знайдено ${jsonData.length} записів у файлі`);

            // Конвертуємо дані у формат для бази
            const cadasterArray = jsonData.map(row => ({
                payer_name: row['ПІБ Платника'] || row['payer_name'],
                payer_address: row['Адреса платника'] || row['payer_address'],
                iban: row['IBAN'] || row['iban'],
                plot_area: parseFloat(row['Площа діляки']) || parseFloat(row['plot_area']) || 0,
                land_tax: parseFloat(row['Земельний податок']) || parseFloat(row['land_tax']) || 0,
                tax_address: row['Податкова адреса'] || row['tax_address'],
                cadastral_number: row['Кадастровий номер'] || row['cadastral_number'],
                uid: request?.user?.id
            }));

            const result = await cadasterRepository.bulkCreateCadaster(cadasterArray);

            await logRepository.createLog({
                row_pk_id: null,
                uid: request?.user?.id,
                action: 'BULK_INSERT',
                client_addr: request?.ip,
                application_name: `Масове завантаження кадастрових записів (${result.imported}/${result.total})`,
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'cadaster_records',
                oid: '16504',
            });

            return result;
        } catch (error) {
            console.error('❌ Error in bulkUpload:', error);
            throw error;
        }
    }
}

module.exports = new CadasterService();