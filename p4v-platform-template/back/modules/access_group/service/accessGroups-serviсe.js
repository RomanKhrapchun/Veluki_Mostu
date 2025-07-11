const { displayAccessGroupFields, allowRoleUpdateFields } = require('../../../utils/constants')
const { updateDataError, deleteError } = require("../../../utils/messages")
const { paginate, paginationData, filterRequestBody, filterData } = require('../../../utils/function')
const logRepository = require('../../log/repository/log-repository')
const accessRepository = require('../repository/accessGroups-repository')
class AccessGroupsService {

    async findRoleByFilter(request) {
        const { page = 1, limit = 16, title } = request.body
        const { offset } = paginate(page, limit)
        const accessGroupData = await accessRepository.findRoleByFilter(limit, offset, title, displayAccessGroupFields)
        return paginationData(accessGroupData[0], page, limit)
    }

    async getRoleById(request) {
        return await accessRepository.getRoleById(request?.params?.roleId, displayAccessGroupFields)
    }

    async createRole(request) {
        const roleData = filterRequestBody(request.body)
        await accessRepository.createRole(Object.assign(roleData, { 'uid': request?.user?.id }))
    }

    async updateRole(request) {
        const roleData = filterRequestBody(request.body)
        const data = filterData(roleData, allowRoleUpdateFields)
        const result = await accessRepository.updateRole(request.params.roleId, Object.assign(data, { 'editor_id': request?.user?.id }))
        if (!result.length) {
            throw new Error(updateDataError)
        }
    }

    async deleteRole(request) {
        const result = await accessRepository.deleteRole(request.params.roleId)
        if (!result.length) {
            throw new Error(deleteError)
        }
        await logRepository.updateDeleteRecord(request?.user?.id, result[0].id)
    }

    async getAllAccessGroups() {
        return await accessRepository.getAllAccessGroups()
    }

    async getAllAccessGroupByTitle(request) {
        const { title } = request.body
        return await accessRepository.getAllAccessGroupByTitle(title, 25)
    }

}

module.exports = new AccessGroupsService()