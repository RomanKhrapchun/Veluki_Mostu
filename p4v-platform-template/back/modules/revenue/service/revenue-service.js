const { fieldsListMissingError, NotFoundErrorMessage, updateDataError, deleteError } = require("../../../utils/messages")
const { filterRequestBody, filterData, paginate, paginationData } = require("../../../utils/function")
const revenueRepository = require("../repository/revenue-repository")

class RevenueService {
    // Account Plan methods
    async getAccountPlans(request) {
        const { page = 1, limit = 10, search } = request.body
        const { offset } = paginate(page, limit)
        const accountPlansData = await revenueRepository.getAccountPlans(limit, offset, search)
        return paginationData(accountPlansData[0], page, limit)
    }

    async getAccountPlanById(request) {
        const result = await revenueRepository.getAccountPlanById(request.params.id)
        if (!result.length) {
            throw new Error(NotFoundErrorMessage)
        }
        return result[0]
    }
    async getAccountPlanByIban(request) {
        const result = await revenueRepository.getAccountPlanByIban(request.params.iban)
        if (!result.length) {
            throw new Error(NotFoundErrorMessage)
        }
        return result[0]
    }

    async createAccountPlan(request) {
        const accountPlanData = filterRequestBody(request.body)
        const result = await revenueRepository.createAccountPlan(accountPlanData)
        if (!result.length) {
            throw new Error("Failed to create account plan")
        }
        return { id: result[0].id }
    }

    async updateAccountPlan(request) {
        const accountPlanData = filterRequestBody(request.body)
        const result = await revenueRepository.updateAccountPlan(request.params.id, accountPlanData)
        if (!result.length) {
            throw new Error(updateDataError)
        }
        return { id: result[0].id }
    }

    async deleteAccountPlan(request) {
        const result = await revenueRepository.deleteAccountPlan(request.params.id)
        if (!result.length) {
            throw new Error(deleteError)
        }
        return { id: result[0].id }
    }

    // Settlements methods
    async getSettlements(request) {
        const { page = 1, limit = 10, search } = request.body
        const { offset } = paginate(page, limit)
        const settlementsData = await revenueRepository.getSettlements(limit, offset, search)
        return paginationData(settlementsData[0], page, limit)
    }

    async getSettlementById(request) {
        const result = await revenueRepository.getSettlementById(request.params.id)
        if (!result.length) {
            throw new Error(NotFoundErrorMessage)
        }
        return result[0]
    }
    async getSettlementsByDistrictId(request) {
        const result = await revenueRepository.getSettlementsByDistrictId(request.params.id)
        if (!result.length) {
            throw new Error(NotFoundErrorMessage)
        }
        return result[0]
    }

    async createSettlement(request) {
        const settlementData = filterRequestBody(request.body)
        const result = await revenueRepository.createSettlement(settlementData)
        if (!result.length) {
            throw new Error("Failed to create settlement")
        }
        return { id: result[0].id }
    }

    async updateSettlement(request) {
        const settlementData = filterRequestBody(request.body)
        const result = await revenueRepository.updateSettlement(request.params.id, settlementData)
        if (!result.length) {
            throw new Error(updateDataError)
        }
        return { id: result[0].id }
    }

    async deleteSettlement(request) {
        const result = await revenueRepository.deleteSettlement(request.params.id)
        if (!result.length) {
            throw new Error(deleteError)
        }
        return { id: result[0].id }
    }

    // Payer Types methods
    async getPayerTypes(request) {
        const { page = 1, limit = 10, search } = request.body
        const { offset } = paginate(page, limit)
        const payerTypesData = await revenueRepository.getPayerTypes(limit, offset, search)
        return paginationData(payerTypesData[0], page, limit)
    }

    async getPayerTypeById(request) {
        const result = await revenueRepository.getPayerTypeById(request.params.id)
        if (!result.length) {
            throw new Error(NotFoundErrorMessage)
        }
        return result[0]
    }

    async createPayerType(request) {
        const payerTypeData = filterRequestBody(request.body)
        const result = await revenueRepository.createPayerType(payerTypeData)
        if (!result.length) {
            throw new Error("Failed to create payer type")
        }
        return { id: result[0].id }
    }

    async updatePayerType(request) {
        const payerTypeData = filterRequestBody(request.body)
        const result = await revenueRepository.updatePayerType(request.params.id, payerTypeData)
        if (!result.length) {
            throw new Error(updateDataError)
        }
        return { id: result[0].id }
    }

    async deletePayerType(request) {
        const result = await revenueRepository.deletePayerType(request.params.id)
        if (!result.length) {
            throw new Error(deleteError)
        }
        return { id: result[0].id }
    }

    // Payer Database methods
    async getPayerDatabase(request) {
        const { page = 1, limit = 10, search } = request.body
        const { offset } = paginate(page, limit)
        const payerDatabaseData = await revenueRepository.getPayerDatabase(limit, offset, search)
        return paginationData(payerDatabaseData[0], page, limit)
    }

    async getPayerDatabaseById(request) {
        const result = await revenueRepository.getPayerDatabaseById(request.params.id)
        if (!result.length) {
            throw new Error(NotFoundErrorMessage)
        }
        return result[0]
    }

    async createPayerDatabase(request) {
        const payerDatabaseData = filterRequestBody(request.body)
        const result = await revenueRepository.createPayerDatabase(payerDatabaseData)
        if (!result.length) {
            throw new Error("Failed to create payer entry")
        }
        return { id: result[0].id }
    }

    async updatePayerDatabase(request) {
        const payerDatabaseData = filterRequestBody(request.body)
        const result = await revenueRepository.updatePayerDatabase(request.params.id, payerDatabaseData)
        if (!result.length) {
            throw new Error(updateDataError)
        }
        return { id: result[0].id }
    }

    async deletePayerDatabase(request) {
        const result = await revenueRepository.deletePayerDatabase(request.params.id)
        if (!result.length) {
            throw new Error(deleteError)
        }
        return { id: result[0].id }
    }

    // Data Invoices methods
    async getDataInvoices(request) {
        const { page = 1, limit = 10, search } = request.body
        const { offset } = paginate(page, limit)
        const dataInvoicesData = await revenueRepository.getDataInvoices(limit, offset, search)
        return paginationData(dataInvoicesData[0], page, limit)
    }

    async getDataInvoiceById(request) {
        const result = await revenueRepository.getDataInvoiceById(request.params.id)
        if (!result.length) {
            throw new Error(NotFoundErrorMessage)
        }
        return result[0]
    }

    async createDataInvoice(request) {
        const dataInvoiceData = filterRequestBody(request.body)
        const result = await revenueRepository.createDataInvoice(dataInvoiceData)
        if (!result.length) {
            throw new Error("Failed to create invoice")
        }
        return { id: result[0].id }
    }

    async updateDataInvoice(request) {
        const dataInvoiceData = filterRequestBody(request.body)
        const result = await revenueRepository.updateDataInvoice(request.params.id, dataInvoiceData)
        if (!result.length) {
            throw new Error(updateDataError)
        }
        return { id: result[0].id }
    }

    async deleteDataInvoice(request) {
        const result = await revenueRepository.deleteDataInvoice(request.params.id)
        if (!result.length) {
            throw new Error(deleteError)
        }
        return { id: result[0].id }
    }

    // Additional helper methods
    async getDistricts() {
        return await revenueRepository.getDistricts()
    }

    // Invoice Details methods
    async getInvoiceDetails(request) {
        const { page = 1, limit = 10, search } = request.body
        const { offset } = paginate(page, limit)
        const invoiceDetailsData = await revenueRepository.getInvoiceDetails(limit, offset, search)
        return paginationData(invoiceDetailsData[0], page, limit)
    }

    async getInvoiceDetailById(request) {
        const result = await revenueRepository.getInvoiceDetailById(request.params.id)
        if (!result.length) {
            throw new Error(NotFoundErrorMessage)
        }
        return result[0]
    }
}

module.exports = new RevenueService();