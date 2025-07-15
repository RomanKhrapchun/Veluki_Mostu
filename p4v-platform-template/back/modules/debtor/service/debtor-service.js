const debtorRepository = require("../repository/debtor-repository");
const { fieldsListMissingError, NotFoundErrorMessage } = require("../../../utils/messages")
const { paginate, paginationData, addRequisiteToLandDebt } = require("../../../utils/function");
const { displayDebtorFields, allowedDebtorTableFilterFields, allowedSortFields } = require("../../../utils/constants");
const { createRequisiteWord } = require("../../../utils/generateDocx");
const logRepository = require("../../log/repository/log-repository");

class DebtorService {

    async getDebtByDebtorId(request) {
        if (!Object.keys([displayDebtorFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        
        try {
            const result = await debtorRepository.getDebtByDebtorId(request?.params?.id, displayDebtorFields);
            
            // Логуємо успішне отримання даних про боржника
            if (result.length > 0) {
                console.log('✅ Debtor data retrieved with cadastral number:', {
                    id: result[0].id,
                    name: result[0].name,
                    cadastral_number: result[0].cadastral_number
                });
            }
            
            return result;
        } catch (error) {
            console.error('❌ Error in getDebtByDebtorId:', error);
            throw error;
        }
    }

    async findDebtByFilter(request) {
        const { 
            page = 1, 
            limit = 16, 
            title, 
            sort_by = null, 
            sort_direction = 'asc',
            ...whereConditions 
        } = request.body;
        
        const { offset } = paginate(page, limit)
        const isValidSortField = sort_by && allowedSortFields.includes(sort_by);
        const isValidSortDirection = ['asc', 'desc'].includes(sort_direction?.toLowerCase());
    
        const validSortBy = isValidSortField ? sort_by : 'name';
        const validSortDirection = isValidSortDirection ? sort_direction.toLowerCase() : 'asc';
    
        console.log('🔄 Sorting params received:', { sort_by, sort_direction });
        console.log('🔄 Validated sorting params:', { validSortBy, validSortDirection });

        const allowedFields = allowedDebtorTableFilterFields.filter(el => whereConditions.hasOwnProperty(el)).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {});
        
        try {
            const userData = await debtorRepository.findDebtByFilter(
                limit, 
                offset, 
                title,  
                allowedFields, 
                displayDebtorFields,
                validSortBy,        // Додано параметр сортування
                validSortDirection  // Додано напрямок сортування
            );
            
            // Логування пошуку
            if (title || whereConditions?.identification) {
                await logRepository.createLog({
                    row_pk_id: null,
                    uid: request?.user?.id,
                    action: 'SEARCH',
                    client_addr: request?.ip,
                    application_name: 'Пошук боржника',
                    action_stamp_tx: new Date(),
                    action_stamp_stm: new Date(),
                    action_stamp_clk: new Date(),
                    schema_name: 'ower',
                    table_name: 'ower',
                    oid: '16504',
                });
            }
            
            const paginatedData = paginationData(userData[0], page, limit);
            
            // Логуємо кількість знайдених записів з кадастровими номерами
            if (userData[0]?.data) {
                const recordsWithCadastral = userData[0].data.filter(record => record.cadastral_number).length;
                console.log(`📊 Found ${userData[0].data.length} records, ${recordsWithCadastral} with cadastral numbers`);
            }
        
            return {
                ...paginatedData,
                sort_by: validSortBy,
                sort_direction: validSortDirection
            };
        } catch (error) {
            console.error('❌ Error in findDebtByFilter:', error);
            throw error;
        }
    }

    async generateWordByDebtId(request, reply) {
        if (!Object.keys([displayDebtorFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        
        try {
            const fetchData = await debtorRepository.getDebtByDebtorId(request?.params?.id, displayDebtorFields);
            if (!fetchData.length) {
                throw new Error(NotFoundErrorMessage)
            }
            
            const fetchRequisite = await debtorRepository.getRequisite();
            if (!fetchRequisite.length) {
                throw new Error(NotFoundErrorMessage)
            }

            if (fetchData[0].non_residential_debt || fetchData[0].residential_debt || fetchData[0].land_debt > 0 || fetchData[0].orenda_debt || fetchData[0].mpz) {
                const result = await createRequisiteWord(fetchData[0], fetchRequisite[0]);
                
                await logRepository.createLog({
                    row_pk_id: fetchData[0].id,
                    uid: request?.user?.id,
                    action: 'GENERATE_DOC',
                    client_addr: request?.ip,
                    application_name: 'Генерування документа для боржника',
                    action_stamp_tx: new Date(),
                    action_stamp_stm: new Date(),
                    action_stamp_clk: new Date(),
                    schema_name: 'ower',
                    table_name: 'ower',
                    oid: '16504',
                });
                
                reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                reply.header('Content-Disposition', 'attachment; filename=generated.docx');
                return reply.send(result);
            }

            throw new Error("Немає даних для формування документу.")
        } catch (error) {
            console.error('❌ Error in generateWordByDebtId:', error);
            throw error;
        }
    }

    async printDebtId(request, reply) {
        if (!Object.keys([displayDebtorFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        
        try {
            const fetchData = await debtorRepository.getDebtByDebtorId(request?.params?.id, displayDebtorFields);
            if (!fetchData.length) {
                throw new Error(NotFoundErrorMessage)
            }
            
            const fetchRequisite = await debtorRepository.getRequisite();
            if (!fetchRequisite.length) {
                throw new Error(NotFoundErrorMessage)
            }

            if (fetchData[0].non_residential_debt || fetchData[0].residential_debt || fetchData[0].land_debt > 0 || fetchData[0].orenda_debt || fetchData[0].mpz) {
                const result = addRequisiteToLandDebt(fetchData[0], fetchRequisite[0]);
                
                await logRepository.createLog({
                    row_pk_id: fetchData[0].id,
                    uid: request?.user?.id,
                    action: 'PRINT',
                    client_addr: request?.ip,
                    application_name: 'Друк документа',
                    action_stamp_tx: new Date(),
                    action_stamp_stm: new Date(),
                    action_stamp_clk: new Date(),
                    schema_name: 'ower',
                    table_name: 'ower',
                    oid: '16504',
                });
                
                return reply.send({
                    name: fetchData[0].name,
                    date: fetchData[0].date,
                    identification: fetchData[0].identification,
                    cadastral_number: fetchData[0].cadastral_number,
                    tax_address: fetchData[0].tax_address,
                    debt: result
                });
            }

            throw new Error("Немає даних для формування документу.")
        } catch (error) {
            console.error('❌ Error in printDebtId:', error);
            throw error;
        }
    }
}

module.exports = new DebtorService();