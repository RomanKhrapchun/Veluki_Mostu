const { allowedModuleTableFilterFields, displayModuleFields, allowInsertOrUpdateModuleFields, allowedRegistryTableFilterFields, displayRegistryFields, allowInsertOrUpdateRegistryFields } = require("../../../utils/constants")
const { fieldsListMissingError, NotFoundErrorMessage, updateDataError, deleteError } = require("../../../utils/messages")
const { filterRequestBody, filterData, paginate, paginationData } = require("../../../utils/function")
const moduleRepository = require("../repository/module-repository")
const logRepository = require('../../log/repository/log-repository')


class ModuleService {

    async allModules(request) {
        const { page = 1, limit = 16, title, ...whereConditions } = request.body
        const { offset } = paginate(page, limit)
        const allowedFields = allowedModuleTableFilterFields.filter(el => whereConditions.hasOwnProperty(el)).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {})
        const moduleData = await moduleRepository.allModules(limit, offset, title, allowedFields, displayModuleFields)
        return paginationData(moduleData[0], page, limit)
    }

    async moduleById(request) {
        if (!Object.keys([displayModuleFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        const result = await moduleRepository.moduleById(request?.params?.moduleId, displayModuleFields)
        if (!result.length) {
            throw new Error(NotFoundErrorMessage)
        }
        return result
    }

    async addModule(request) {
        const moduleData = filterRequestBody(request.body)
        const data = filterData(moduleData, allowInsertOrUpdateModuleFields)
        await moduleRepository.addModule(Object.assign(data, { 'uid': request?.user?.id }))
    }

    async updateModuleById(request) {
        const moduleData = filterRequestBody(request.body)
        const data = filterData(moduleData, allowInsertOrUpdateModuleFields)
        const result = await moduleRepository.updateModuleById(request.params.moduleId, Object.assign(data, { 'editor_id': request?.user?.id }))
        if (!result.length) {
            throw new Error(updateDataError)
        }
    }

    async deleteModuleById(request) {
        const result = await moduleRepository.deleteModuleById(request.params.moduleId)
        if (!result.length) {
            throw new Error(deleteError)
        }
        await logRepository.updateDeleteRecord(request?.user?.id, result[0].module_id)
    }

    async getAllModules() {
        return await moduleRepository.getAllModules()
    }

    async allRegistry(request) {
        const { page = 1, limit = 16, title, ...whereConditions } = request.body
        const { offset } = paginate(page, limit)
        const allowedFields = allowedRegistryTableFilterFields.filter(el => whereConditions.hasOwnProperty(el)).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {})
        const moduleData = await moduleRepository.allRegistry(limit, offset, title, allowedFields, displayRegistryFields)
        return paginationData(moduleData[0], page, limit)
    }

    async addRegistry(request) {
        const moduleData = filterRequestBody(request.body)
        const data = filterData(moduleData, allowInsertOrUpdateRegistryFields)
        await moduleRepository.addRegistry(Object.assign(data, { 'uid': request?.user?.id }))
    }

    async updateRegistryById(request) {
        const moduleData = filterRequestBody(request.body)
        const data = filterData(moduleData, allowInsertOrUpdateRegistryFields)
        const result = await moduleRepository.updateRegistryById(request.params.registryId, Object.assign(data, { 'editor_id': request?.user?.id }))
        if (!result.length) {
            throw new Error(updateDataError)
        }
    }

    async deleteRegistryById(request) {
        const result = await moduleRepository.deleteRegistryById(request.params.registryId)
        if (!result.length) {
            throw new Error(deleteError)
        }
        await logRepository.updateDeleteRecord(request?.user?.id, result[0].doct_id)
    }

    async registryById(request) {
        if (!Object.keys([displayRegistryFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        const result = await moduleRepository.registryById(request?.params?.registryId, displayRegistryFields)
        if (!result.length) {
            throw new Error(NotFoundErrorMessage)
        }
        return result
    }

}

module.exports = new ModuleService()