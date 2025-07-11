const { itemsPerPage, allowedLogTableFilterFields, displayFieldsLogs, allowedSecureLogTableFilterFields, allowedBlackListTableFilterFields, displayBlackListFields, allowBlackListUpdate, allowedDetailedLogFields } = require("../../../utils/constants")
const { NotFoundErrorMessage, deleteError } = require("../../../utils/messages")
const { paginate, paginationData, filterData, filterRequestBody } = require("../../../utils/function")
const logRepository = require('../repository/log-repository')

class LogService {

    async getAllLogs(request) {
        const { cursor, sort = 'DESC', limit, ...whereConditions } = request.body
        const limitResult = limit && itemsPerPage.find(el => el === limit)
        const itemsLength = limitResult ?? itemsPerPage[0]
        const cursorId = cursor
        const sortOrder = sort ?? 'DESC'
        const allowedFields = allowedLogTableFilterFields.filter(el => whereConditions[el]).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {})
        const logData = await logRepository.allLogs(itemsLength, cursorId, sortOrder, allowedFields)
        let nextCursor = null;
        let prevCursor = null;

        if (logData.length > itemsLength) {
            if (sort === 'ASC') {
                nextCursor = logData[0].id
                prevCursor = logData[logData.length - 2].id
                logData.pop()
                logData.reverse()
            }
            else {
                nextCursor = logData[logData.length - 2].id
                prevCursor = cursorId ? logData[0].id : null
                logData.pop();
            }

            return {
                data: logData,
                next: nextCursor,
                prev: prevCursor,
            }
        }

        else {
            if (sort === 'ASC') {
                logData.reverse()
                nextCursor = logData[logData.length - 1]?.id
                prevCursor = null
            }
            else {
                nextCursor = null
                prevCursor = cursorId ? logData[0]?.id : null
            }

            return {
                data: logData,
                next: nextCursor,
                prev: prevCursor,
            }
        }
    }

    async findLogById(request) {
        const logData = await logRepository.findLogById(request.params?.id, displayFieldsLogs)
        if (logData.length === 0) {
            throw new Error(NotFoundErrorMessage)
        }
        return logData
    }

    async allSecureLog(request) {
        const { cursor, sort = 'DESC', limit, ...whereConditions } = request.body
        const limitResult = limit && itemsPerPage.find(el => el === limit)
        const itemsLength = limitResult ?? itemsPerPage[0]
        const cursorId = cursor
        const sortOrder = sort ?? 'DESC'
        const allowedFields = allowedSecureLogTableFilterFields.filter(el => whereConditions[el]).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {})
        const logData = await logRepository.allSecureLog(itemsLength, cursorId, sortOrder, allowedFields)
        let nextCursor = null;
        let prevCursor = null;

        if (logData.length > itemsLength) {
            if (sort === 'ASC') {
                nextCursor = logData[0].id
                prevCursor = logData[logData.length - 2].id
                logData.pop()
                logData.reverse()
            }
            else {
                nextCursor = logData[logData.length - 2].id
                prevCursor = cursorId ? logData[0].id : null
                logData.pop();
            }

            return {
                data: logData,
                next: nextCursor,
                prev: prevCursor,
            }
        }

        else {
            if (sort === 'ASC') {
                logData.reverse()
                nextCursor = logData[logData.length - 1]?.id
                prevCursor = null
            }
            else {
                nextCursor = null
                prevCursor = cursorId ? logData[0]?.id : null
            }

            return {
                data: logData,
                next: nextCursor,
                prev: prevCursor,
            }
        }
    }

    async allBlackListIp(request) {
        const { page = 1, limit = 16, ...whereConditions } = request.body
        const { offset } = paginate(page, limit)
        const allowedFields = allowedBlackListTableFilterFields.filter(el => whereConditions.hasOwnProperty(el)).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {})
        const userData = await logRepository.allBlackListIp(limit, offset, allowedFields, displayBlackListFields)
        return paginationData(userData[0], page, limit)
    }

    async addToBlacklistIP(request) {
        const filteredData = filterRequestBody(request.body)
        const data = filterData(filteredData, allowBlackListUpdate)
        await logRepository.addToBlacklistIP(Object.assign(data, { 'uid': request?.user?.id }))
    }

    async removeFromBlacklistIP(request) {
        const result = await logRepository.removeFromBlacklistIP(request.params.id)
        if (!result.length) {
            throw new Error(deleteError)
        }
        await logRepository.updateDeleteRecord(request?.user?.id, result[0].id)
    }

    async detailedLog(request) {
        const { page = 1, limit = 16, ...whereConditions } = request.body
        const { offset } = paginate(page, limit)
        const allowedFields = allowedDetailedLogFields.filter(el => whereConditions.hasOwnProperty(el)).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {})
        const logData = await logRepository.detailedLog(limit, offset, allowedFields)
        return paginationData(logData[0], page, limit)
    }

}

module.exports = new LogService()