const revenueService = require("../service/revenue-service")

class RevenueController {
    // Account Plan methods
    async getAccountPlans(request, reply) {
        try {
            const result = await revenueService.getAccountPlans(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async getAccountPlanById(request, reply) {
        try {
            const result = await revenueService.getAccountPlanById(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }
    async getAccountPlanByIban(request, reply) {
        try {
            console.log(request.params)
            const result = await revenueService.getAccountPlanByIban(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async createAccountPlan(request, reply) {
        try {
            const result = await revenueService.createAccountPlan(request)
            reply.code(201).send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async updateAccountPlan(request, reply) {
        try {
            const result = await revenueService.updateAccountPlan(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async deleteAccountPlan(request, reply) {
        try {
            const result = await revenueService.deleteAccountPlan(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    // Settlements methods
    async getSettlements(request, reply) {
        try {
            const result = await revenueService.getSettlements(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async getSettlementById(request, reply) {
        try {
            const result = await revenueService.getSettlementById(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }
    async getSettlementsByDistrictId(request, reply) {
        try {
            const result = await revenueService.getSettlementByDistrictId(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async createSettlement(request, reply) {
        try {
            const result = await revenueService.createSettlement(request)
            reply.code(201).send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async updateSettlement(request, reply) {
        try {
            const result = await revenueService.updateSettlement(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async deleteSettlement(request, reply) {
        try {
            const result = await revenueService.deleteSettlement(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    // Payer Types methods
    async getPayerTypes(request, reply) {
        try {
            const result = await revenueService.getPayerTypes(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async getPayerTypeById(request, reply) {
        try {
            const result = await revenueService.getPayerTypeById(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async createPayerType(request, reply) {
        try {
            const result = await revenueService.createPayerType(request)
            reply.code(201).send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async updatePayerType(request, reply) {
        try {
            const result = await revenueService.updatePayerType(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async deletePayerType(request, reply) {
        try {
            const result = await revenueService.deletePayerType(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    // Payer Database methods
    async getPayerDatabase(request, reply) {
        try {
            const result = await revenueService.getPayerDatabase(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async getPayerDatabaseById(request, reply) {
        try {
            const result = await revenueService.getPayerDatabaseById(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async createPayerDatabase(request, reply) {
        try {
            const result = await revenueService.createPayerDatabase(request)
            reply.code(201).send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async updatePayerDatabase(request, reply) {
        try {
            const result = await revenueService.updatePayerDatabase(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async deletePayerDatabase(request, reply) {
        try {
            const result = await revenueService.deletePayerDatabase(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    // Data Invoices methods
    async getDataInvoices(request, reply) {
        try {
            const result = await revenueService.getDataInvoices(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async getDataInvoiceById(request, reply) {
        try {
            const result = await revenueService.getDataInvoiceById(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async createDataInvoice(request, reply) {
        try {
            const result = await revenueService.createDataInvoice(request)
            reply.code(201).send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async updateDataInvoice(request, reply) {
        try {
            const result = await revenueService.updateDataInvoice(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    async deleteDataInvoice(request, reply) {
        try {
            const result = await revenueService.deleteDataInvoice(request)
            reply.send(result)
        } catch (error) {
            reply.code(400).send({ error: true, message: error.message })
        }
    }

    // Helper endpoints
    async getDistricts(request, reply) {
        try {
            const districts = await revenueService.getDistricts()
            return reply.code(200).send(districts)
        } catch (error) {
            return reply.code(500).send({ error: error.message })
        }
    }

    // Invoice Details methods
    async getInvoiceDetails(request, reply) {
        try {
            const invoiceDetails = await revenueService.getInvoiceDetails(request)
            return reply.code(200).send(invoiceDetails)
        } catch (error) {
            return reply.code(500).send({ error: error.message })
        }
    }

    async getInvoiceDetailById(request, reply) {
        try {
            const invoiceDetail = await revenueService.getInvoiceDetailById(request)
            return reply.code(200).send(invoiceDetail)
        } catch (error) {
            return reply.code(500).send({ error: error.message })
        }
    }
}

module.exports = new RevenueController();