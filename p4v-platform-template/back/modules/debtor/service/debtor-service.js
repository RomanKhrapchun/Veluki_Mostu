
const debtorRepository = require("../repository/debtor-repository");
const { fieldsListMissingError, NotFoundErrorMessage } = require("../../../utils/messages")
const { paginate, paginationData, addRequisiteToLandDebt } = require("../../../utils/function");
const { displayDebtorFields, allowedDebtorTableFilterFields,allowedSortFields,  } = require("../../../utils/constants");
const { createRequisiteWord } = require("../../../utils/generateDocx");
const logRepository = require("../../log/repository/log-repository");

class DebtorService {

    async getDebtByDebtorId(request) {
        if (!Object.keys([displayDebtorFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        return await debtorRepository.getDebtByDebtorId(request?.params?.id, displayDebtorFields)
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

        const allowedFields = allowedDebtorTableFilterFields.filter(el => whereConditions.hasOwnProperty(el)).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {})
        const userData = await debtorRepository.findDebtByFilter(
            limit, 
            offset, 
            title,  
            allowedFields, 
            displayDebtorFields,
            validSortBy,        // Додано параметр сортування
            validSortDirection  // Додано напрямок сортування
        );
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
            })
        }
        const paginatedData = paginationData(userData[0], page, limit);
    
        return {
            ...paginatedData,
            sort_by: validSortBy,
            sort_direction: validSortDirection
        };
    }

    async generateWordByDebtId(request, reply) {
        if (!Object.keys([displayDebtorFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        const fetchData = await debtorRepository.getDebtByDebtorId(request?.params?.id, displayDebtorFields)
        if (!fetchData.length) {
            throw new Error(NotFoundErrorMessage)
        }
        const fetchRequisite = await debtorRepository.getRequisite()
        if (!fetchRequisite.length) {
            throw new Error(NotFoundErrorMessage)
        }

        if (fetchData[0].non_residential_debt || fetchData[0].residential_debt || fetchData[0].land_debt > 0 || fetchData[0].orenda_debt || fetchData[0].mpz) {
            const result = await createRequisiteWord(fetchData[0], fetchRequisite[0])
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
            })
            reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
            reply.header('Content-Disposition', 'attachment; filename=generated.docx');
            return reply.send(result);
        }

        throw new Error("Немає даних для формування документу.")

    }

    async printDebtId(request, reply) {
        if (!Object.keys([displayDebtorFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        const fetchData = await debtorRepository.getDebtByDebtorId(request?.params?.id, displayDebtorFields)
        if (!fetchData.length) {
            throw new Error(NotFoundErrorMessage)
        }
        const fetchRequisite = await debtorRepository.getRequisite()
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
            })
            return reply.send({
                name: fetchData[0].name,
                date: fetchData[0].date,
                identification: fetchData[0].identification,
                debt: result
            });
        }

        throw new Error("Немає даних для формування документу.")
    }


}


module.exports = new DebtorService();