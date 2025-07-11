
const utilitiesRepository = require("../repository/utilities-repository");
const { fieldsListMissingError, NotFoundErrorMessage } = require("../../../utils/messages")
const { paginate, paginationData, addRequisiteToWaterDebt } = require("../../../utils/function");
const { displayUtilitiesFields, allowedUtilitiesTableFilterFields } = require("../../../utils/constants");
const { createUtilitiesRequisiteWord } = require("../../../utils/generateDocx");
const logRepository = require("../../log/repository/log-repository");

class utilitiesService {

    async getDebtByUtilitiesId(request) {
        if (!Object.keys([displayUtilitiesFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        return await utilitiesRepository.getDebtByUtilitiesId(request?.params?.id, displayUtilitiesFields)
    }

    async findDebtByFilter(request) {
        const { page = 1, limit = 16, title, ...whereConditions } = request.body
        const { offset } = paginate(page, limit)
        const allowedFields = allowedUtilitiesTableFilterFields.filter(el => whereConditions.hasOwnProperty(el)).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {})
        const userData = await utilitiesRepository.findDebtByFilter(limit, offset, title, allowedFields, displayUtilitiesFields)
        if (title || whereConditions?.payerident) {
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
        return paginationData(userData[0], page, limit)
    }

    async generateWordByDebtId(request, reply) {
        if (!Object.keys([displayUtilitiesFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        const fetchData = await utilitiesRepository.getDebtByUtilitiesId(request?.params?.id, displayUtilitiesFields)
        if (!fetchData.length) {
            throw new Error(NotFoundErrorMessage)
        }
        const fetchRequisite = await utilitiesRepository.getRequisite()
        if (!fetchRequisite.length) {
            throw new Error(NotFoundErrorMessage)
        }

        if (fetchData[0].charge) {
            const result = await createUtilitiesRequisiteWord(fetchData, fetchRequisite[0])
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
        if (!Object.keys([displayUtilitiesFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        const fetchData = await utilitiesRepository.getDebtByUtilitiesId(request?.params?.id, displayUtilitiesFields)
        if (!fetchData.length) {
            throw new Error(NotFoundErrorMessage)
        }
        const fetchRequisite = await utilitiesRepository.getRequisite()
        if (!fetchRequisite.length) {
            throw new Error(NotFoundErrorMessage)
        }

        if (fetchData[0].charge) {
            const result = addRequisiteToWaterDebt(fetchData[0], fetchRequisite[0]);
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
                name: fetchData[0].fio,
                identification: fetchData[0].payerident,
                debt: result,
                data: fetchRequisite[0].data
            });
        }

        throw new Error("Немає даних для формування документу.")
    }


}


module.exports = new utilitiesService();