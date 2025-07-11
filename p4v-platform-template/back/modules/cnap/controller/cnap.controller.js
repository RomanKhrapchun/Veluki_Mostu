const cnapService = require('../service/cnap.service')
const Logger = require('../../../utils/logger')
const logRepository = require("../../log/repository/log-repository");

class CnapController {
    async getAccountsWithStatus(request, reply) {
        try {
            const filter = request.body
            const result = await cnapService.getAccountsWithStatus(filter)
            return reply.send(result)
        } catch (error) {
            Logger.error('Error in getAccountsWithStatus:', error)
            return reply.status(500).send({ message: error.message })
        }
    }
    
    async checkReceiptAvailability(request, reply) {
        try {
            const { id } = request.params
            const result = await cnapService.checkCanDownloadReceipt(id)
            return reply.send(result)
        } catch (error) {
            Logger.error('Error in checkReceiptAvailability:', error)
            return reply.status(500).send({ message: error.message })
        }
    }
    
    async downloadReceipt(request, reply) {
        try {
            const { id } = request.params
            
            // Генеруємо квитанцію
            const receiptResult = await cnapService.generateReceipt(id)
            
            if (!receiptResult.success) {
                return reply.status(400).send({ message: 'Не вдалося згенерувати квитанцію' })
            }
            // ДОДАТИ ДІАГНОСТИКУ:
            Logger.info("=== CONTROLLER FILENAME DEBUG ===")
            Logger.info("receiptResult.filename:", receiptResult.filename)
            // Логуємо дію завантаження квитанції
            await logRepository.createLog({
                row_pk_id: id,
                uid: request?.user?.id,
                action: 'GENERATE_DOC',
                client_addr: request?.ip,
                application_name: 'Завантаження квитанції адмін послуги',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'cnap',
                table_name: 'cnap_accounts',
                oid: '16504',
            })
    
            const originalFilename = receiptResult.filename
            Logger.info("originalFilename",originalFilename)
            const encodedFilename = encodeURIComponent(originalFilename)
            const safeFilename = originalFilename.replace(/[^\x00-\x7F]/g, "_")
            Logger.info("safeFilename",safeFilename)
            // Встановлюємо заголовки для завантаження PDF файлу
            reply
                .type('application/pdf')
                .header('Content-Disposition', `attachment; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`)
                .header('Content-Length', receiptResult.buffer.length)
                .send(receiptResult.buffer)
    
        } catch (error) {
            Logger.error('Error in downloadReceipt:', error)
            if (error.statusCode) {
                return reply.status(error.statusCode).send({ message: error.message })
            }
            return reply.status(500).send({ message: error.message })
        }
    }
    
    async previewReceipt(request, reply) {
        try {
            const { id } = request.params
            
            // Генеруємо квитанцію
            const receiptResult = await cnapService.generateReceipt(id)
            
            if (!receiptResult.success) {
                return reply.status(400).send({ message: 'Не вдалося згенерувати квитанцію' })
            }
            // Логуємо дію завантаження квитанції
            await logRepository.createLog({
                row_pk_id: id,
                uid: request?.user?.id,
                action: 'SEARCH',
                client_addr: request?.ip,
                application_name: 'Перегляд квитанції',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'cnap',
                table_name: 'cnap_accounts',
                oid: '16504',
            })
            // Встановлюємо заголовки для перегляду PDF в браузері
            const originalFilename = receiptResult.filename
            const encodedFilename = encodeURIComponent(originalFilename)
            const safeFilename = originalFilename.replace(/[^\x00-\x7F]/g, "_")
            reply
                .type('application/pdf')
                .header('Content-Disposition', `inline; filename="${safeFilename}"; filename*=UTF-8''${encodedFilename}`)
                .send(receiptResult.buffer)
    
        } catch (error) {
            Logger.error('Error in previewReceipt:', error)
            if (error.statusCode) {
                return reply.status(error.statusCode).send({ message: error.message })
            }
            return reply.status(500).send({ message: error.message })
        }
    }
    async getServices(request, reply) {
        try {
            const filter = request.body
            const result = await cnapService.getServices(filter)
            return reply.send(result)
        } catch (error) {
            Logger.error('Error in getServices:', error)
            return reply.status(500).send({ message: error.message })
        }
    }
    

    async getServiceById(request, reply) {
        try {
            const { id } = request.params
            const result = await cnapService.getServiceById(id)
            return reply.send(result)
        } catch (error) {
            Logger.error('Error in getServiceById:', error)
            return reply.status(500).send({ message: error.message })
        }
    }

    async createService(request, reply) {
        try {
            const serviceData = request.body
            const result = await cnapService.createService(serviceData)
            return reply.send(result)
        } catch (error) {
            Logger.error('Error in createService:', error)
            return reply.status(500).send({ message: error.message })
        }
    }

    async updateService(request, reply) {
        try {
            const { id } = request.params
            const serviceData = request.body

            const updatedService = await cnapService.updateService(id, serviceData)
            return reply.send(updatedService)
        } catch (error) {
            Logger.error('Error in updateService:', error)
            if (error.statusCode) {
                return reply.status(error.statusCode).send({ message: error.message })
            }
            return reply.status(500).send({ message: error.message })
        }
    }

    async getAccounts(request, reply) {
        try {
            const filter = request.body
            const result = await cnapService.getAccounts(filter)
            return reply.send(result)
        } catch (error) {
            Logger.error('Error in getAccounts:', error)
            return reply.status(500).send({ message: error.message })
        }
    }

    async getAccountById(request, reply) {
        try {
            const { id } = request.params
            const result = await cnapService.getAccountById(id)
            return reply.send(result)
        } catch (error) {
            Logger.error('Error in getAccountById:', error)
            return reply.status(500).send({ message: error.message })
        }
    }

    async createAccount(request, reply) {
        try {
            const accountData = request.body
            const result = await cnapService.createAccount(accountData)
            return reply.send(result)
        } catch (error) {
            Logger.error('Error in createAccount:', error)
            return reply.status(500).send({ message: error.message })
        }
    }

    async deleteService(request, reply) {
        try {
            const { id } = request.params
            const result = await cnapService.deleteService(id)
            return reply.send(result)
        } catch (error) {
            Logger.error('Error in deleteService:', error)
            if (error.statusCode) {
                return reply.status(error.statusCode).send({ message: error.message })
            }
            return reply.status(500).send({ message: error.message })
        }
    }
    async printDebtId(request, reply) {
        try {
            const result = await cnapService.printDebtId(request, reply)
            return reply.send(result)
        } catch (error) {
            Logger.error(error.message, { stack: error.stack })
            reply.status(400).send(error)
        }
    }
    async getServicesWithExecutors(request, reply) {
        try {
            const result = await cnapService.getServicesWithExecutors()
            return reply.send({
                success: true,
                data: result.items
            })
        } catch (error) {
            Logger.error('Error in getServicesWithExecutors:', error)
            return reply.status(500).send({
                success: false,
                message: 'Помилка при отриманні послуг з виконавцями',
                error: error.message
            })
        }
    }

    // Методи для роботи з виконавцями
    async getExecutors(request, reply) {
        try {
            const result = await cnapService.getExecutors()
            return reply.send({
                success: true,
                data: result.items
            })
        } catch (error) {
            Logger.error('Error in getExecutors:', error)
            return reply.status(500).send({
                success: false,
                message: 'Помилка при отриманні списку виконавців',
                error: error.message
            })
        }
    }
    async updateExecutor(request, reply) {
        try {
            const { id } = request.params
            Logger.info('Updating executor:', id, request.body)
            
            const result = await cnapService.updateExecutor(id, request.body)
            
            return reply.send({
                success: true,
                data: result,
                message: 'Виконавця успішно оновлено'
            })
        } catch (error) {
            Logger.error('Error in updateExecutor controller:', error)
            
            const statusCode = error.statusCode || 500
            let message = 'Помилка при оновленні виконавця'
            
            if (error.message.includes('не знайдено')) {
                message = error.message
            } else if (error.message.includes('вже існує')) {
                message = error.message
            }
            
            return reply.status(statusCode).send({
                success: false,
                message: message,
                error: error.message
            })
        }
    }
    
    async deleteExecutor(request, reply) {
        try {
            const { id } = request.params
            Logger.info('Deleting executor:', id)
            
            const result = await cnapService.deleteExecutor(id)
            
            return reply.send({
                success: true,
                message: result.message
            })
        } catch (error) {
            Logger.error('Error in deleteExecutor controller:', error)
            
            const statusCode = error.statusCode || 500
            let message = 'Помилка при видаленні виконавця'
            
            if (error.message.includes('не знайдено')) {
                message = error.message
            } else if (error.message.includes('прив\'язано')) {
                message = error.message
            }
            
            return reply.status(statusCode).send({
                success: false,
                message: message,
                error: error.message
            })
        }
    }
    
    async updateServiceExecutor(request, reply) {
        try {
            const { serviceId } = request.params
            const { executorId } = request.body
            
            Logger.info('Updating service executor:', { serviceId, executorId })
            
            const result = await cnapService.updateServiceExecutor(serviceId, executorId)
            
            return reply.send({
                success: true,
                data: result,
                message: 'Виконавця послуги успішно оновлено'
            })
        } catch (error) {
            Logger.error('Error in updateServiceExecutor controller:', error)
            
            const statusCode = error.statusCode || 500
            let message = 'Помилка при оновленні виконавця послуги'
            
            if (error.message.includes('не знайдено')) {
                message = error.message
            }
            
            return reply.status(statusCode).send({
                success: false,
                message: message,
                error: error.message
            })
        }
    }
    async createExecutor(request, reply) {
        try {
            const { name } = request.body
            
            if (!name || name.trim().length === 0) {
                return reply.status(400).send({
                    success: false,
                    message: 'Назва виконавця є обов\'язковою'
                })
            }

            const result = await  cnapService.createExecutor({ name: name.trim() })
            return reply.status(201).send({
                success: true,
                data: result,
                message: 'Виконавця успішно створено'
            })
        } catch (error) {
            Logger.error('Error in createExecutor:', error)
            
            if (error.message.includes('duplicate') || error.message.includes('unique')) {
                return reply.status(400).send({
                    success: false,
                    message: 'Виконавець з такою назвою вже існує'
                })
            }
            
            return reply.status(500).send({
                success: false,
                message: 'Помилка при створенні виконавця',
                error: error.message
            })
        }
    }

    async updateExecutor(request, reply) {
        try {
            const { id } = request.params
            const { name } = request.body
            
            if (!name || name.trim().length === 0) {
                return reply.status(400).send({
                    success: false,
                    message: 'Назва виконавця є обов\'язковою'
                })
            }

            const result = await  cnapService.updateExecutor(id, { name: name.trim() })
            
            if (!result) {
                return reply.status(404).send({
                    success: false,
                    message: 'Виконавця не знайдено'
                })
            }

            return reply.send({
                success: true,
                data: result,
                message: 'Виконавця успішно оновлено'
            })
        } catch (error) {
            Logger.error('Error in updateExecutor:', error)
            
            if (error.message.includes('duplicate') || error.message.includes('unique')) {
                return reply.status(400).send({
                    success: false,
                    message: 'Виконавець з такою назвою вже існує'
                })
            }
            
            return reply.status(500).send({
                success: false,
                message: 'Помилка при оновленні виконавця',
                error: error.message
            })
        }
    }

    async deleteExecutor(request, reply) {
        try {
            const { id } = request.params
            
            const result = await  cnapService.deleteExecutor(id)
            
            if (!result) {
                return reply.status(404).send({
                    success: false,
                    message: 'Виконавця не знайдено'
                })
            }

            return reply.send({
                success: true,
                message: 'Виконавця успішно видалено'
            })
        } catch (error) {
            Logger.error('Error in deleteExecutor:', error)
            
            if (error.message.includes('Cannot delete executor')) {
                return reply.status(400).send({
                    success: false,
                    message: error.message.replace('Cannot delete executor. There are', 'Неможливо видалити виконавця. До нього прив\'язано').replace('services linked to this executor.', 'послуг.')
                })
            }
            
            return reply.status(500).send({
                success: false,
                message: 'Помилка при видаленні виконавця',
                error: error.message
            })
        }
    }

    // Метод для оновлення виконавця послуги
    async updateServiceExecutor(request, reply) {
        try {
            const { serviceId } = request.params
            const { executorId } = request.body
            
            const result = await  cnapService.updateServiceExecutor(serviceId, executorId)
            
            if (!result) {
                return reply.status(404).send({
                    success: false,
                    message: 'Послугу не знайдено'
                })
            }

            return reply.send({
                success: true,
                data: result,
                message: 'Виконавця послуги успішно оновлено'
            })
        } catch (error) {
            Logger.error('Error in updateServiceExecutor:', error)
            return reply.status(500).send({
                success: false,
                message: 'Помилка при оновленні виконавця послуги',
                error: error.message
            })
        }
    }
}

module.exports = new CnapController()
