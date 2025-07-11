const crypto = require('crypto')
const axios = require('axios')
const fs = require('fs').promises
const path = require('path')
const CryptManager = require('../../../utils/CryptManager') // шлях може відрізнятися


const publicKeyXPay = require('../../../utils/constants').publicKeyXPay;
const privateKey = require('../../../utils/constants').privateKey;


const cnapRepository = require('../repository/cnap.repository')
const Logger = require('../../../utils/logger')
const { addRequisiteToAdminServiceDebt} = require("../../../utils/function")
const logRepository = require("../../log/repository/log-repository");

const formatDate = (date) => {
    return `${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}:${date.getSeconds().toString().padStart(2, '0')}`;
}
function transliterateAndClean(text) {
    if (!text) return 'unknown'
    
    // Таблиця транслітерації українських символів
    const translitMap = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'h', 'ґ': 'g', 'д': 'd', 'е': 'e', 'є': 'ye',
        'ж': 'zh', 'з': 'z', 'и': 'y', 'і': 'i', 'ї': 'yi', 'й': 'y', 'к': 'k', 'л': 'l',
        'м': 'm', 'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
        'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ь': '', 'ю': 'yu', 'я': 'ya',
        'А': 'A', 'Б': 'B', 'В': 'V', 'Г': 'H', 'Ґ': 'G', 'Д': 'D', 'Е': 'E', 'Є': 'Ye',
        'Ж': 'Zh', 'З': 'Z', 'И': 'Y', 'І': 'I', 'Ї': 'Yi', 'Й': 'Y', 'К': 'K', 'Л': 'L',
        'М': 'M', 'Н': 'N', 'О': 'O', 'П': 'P', 'Р': 'R', 'С': 'S', 'Т': 'T', 'У': 'U',
        'Ф': 'F', 'Х': 'Kh', 'Ц': 'Ts', 'Ч': 'Ch', 'Ш': 'Sh', 'Щ': 'Shch', 'Ь': '', 'Ю': 'Yu', 'Я': 'Ya'
    }
    
    // Транслітерація
    let result = text.split('').map(char => translitMap[char] || char).join('')
    
    // Очищення від спецсимволів, залишаємо тільки букви та цифри
    result = result.replace(/[^a-zA-Z0-9]/g, '')
    
    return result || 'unknown'
}
class CnapService {
    async getAccountsWithStatus(filter) {
        try {
            return await cnapRepository.getAccountsWithStatus(filter)
        } catch (error) {
            Logger.error('Error in getAccountsWithStatus:', error)
            throw error
        }
    }
    async checkCanDownloadReceipt(cnapId) {
        try {
            const operationData = await cnapRepository.getOperationDataForReceipt(cnapId)
            
            // Якщо запис є в cnap_operation_view - значить можна завантажувати квитанцію
            if (!operationData) {
                return { 
                    canDownload: false, 
                    message: 'Операція не знайдена або не оплачена' 
                }
            }
    
            return {
                canDownload: true,
                operationId: operationData.operation_id,
                transactionId: operationData.transaction_id,
                accountNumber: operationData.account_number
            }
        } catch (error) {
            Logger.error('Error in checkCanDownloadReceipt:', error)
            throw error
        }
    }
    async generateReceipt(cnapId) {
        try {
            // Перевіряємо чи можна генерувати квитанцію
            const checkResult = await this.checkCanDownloadReceipt(cnapId)
            if (!checkResult.canDownload) {
                const error = new Error(checkResult.message)
                error.statusCode = 400
                throw error
            }
            
            const operationId = checkResult.operationId
    
            Logger.info("Generating receipt for operation_id:", operationId)
    
            
            const userInfo = {
                "OperationID": parseInt(operationId),
                "Transaction": {
                    "TransactionID": crypto.randomUUID(),
                    "TerminalID": "1",
                    "DateTime": formatDate(new Date()),
                }
            }
    
            Logger.info("Request userInfo:", JSON.stringify(userInfo, null, 2))
    
            // Генеруємо PDF через криптосервіс (як у робочому коді)
            const cryptManager = new CryptManager()
            const encryptedData = cryptManager.encrypt(JSON.stringify(userInfo))
            const encryptedAESKey = cryptManager.getEncryptedAESKey(publicKeyXPay)
            const signedKey = cryptManager.getSignedKey(privateKey)
            
            const requestData = {
                "Partner": {
                    "PartnerToken": `${process.env.PARTNER_TOKEN_CNAP}`,
                    "OperationType": 20004,
                },
                "Data": encryptedData,
                "KeyAES": encryptedAESKey,
                "Sign": signedKey
            }
    
            Logger.info("Sending request to crypto service:", process.env.URL_CRYPTO)
            
            // Відправляємо запит на криптосервіс
            const result = await axios.post(`${process.env.URL_CRYPTO}`, requestData)
    
            Logger.info("Crypto service response status:", result.status)
            Logger.info("Crypto service response data:", JSON.stringify(result.data, null, 2))
    
            // Перевіряємо відповідь (згідно документації)
            if (!result.data || result.data.Code !== 200) {
                Logger.error("Crypto service returned error code:", result.data?.Code)
                Logger.error("Error message:", result.data?.Message)
                const error = new Error(`Помилка криптосервісу: ${result.data?.Message || 'Unknown error'}`)
                error.statusCode = 400
                throw error
            }
    
            // Перевіряємо наявність DataPDF (згідно документації та робочого коду)
            const base64Data = result?.data?.Data?.DataPDF?.[0]?.Base64Data
            
            if (!base64Data) {
                Logger.error("PDF data not found in DataPDF[0].Base64Data")
                Logger.error("Response structure:", JSON.stringify(result.data, null, 2))
                
                const error = new Error('PDF дані не знайдені в відповіді криптосервісу')
                error.statusCode = 500
                throw error
            }
    
            Logger.info("Base64 data found, length:", base64Data.length)
    
            // Конвертуємо Base64 в PDF буфер (як у робочому коді)
            const pdfBuffer = Buffer.from(base64Data, 'base64')
            
            // Отримуємо додаткові дані для назви файлу
            const account = await cnapRepository.getAccountById(cnapId)

            // Формуємо детальну назву файлу
            const dateFormatted = new Date().toISOString().slice(0, 10)
            const cleanAccountNumber = account?.account_number?.replace(/[^a-zA-Z0-9]/g, '') || 'unknown'
            const cleanPayerName = transliterateAndClean(account?.payer) || 'unknown'
            const amount = account?.amount ? parseFloat(account.amount).toFixed(0) : '0'

            const filename = `Receipt_${cleanAccountNumber}_${cleanPayerName}_${amount}UAH_${dateFormatted}`
            // Створюємо директорію якщо не існує
            const fileDir = path.join(__dirname, '../../../uploads/receipts')
            await fs.mkdir(fileDir, { recursive: true })
            
            const filePath = path.join(fileDir, `${filename}.pdf`)
            await fs.writeFile(filePath, pdfBuffer)
    
            Logger.info("PDF file saved successfully:", filePath)
    
            return {
                success: true,
                filename: `${filename}.pdf`,
                filePath: filePath,
                buffer: pdfBuffer,
                operationId: operationId
            }
    
        } catch (error) {
            Logger.error('Error in generateReceipt:', error)
            throw error
        }
    }
    async getServices(filter) {
        try {
            return await cnapRepository.getServices(filter)
        } catch (error) {
            Logger.error('Error in getServices:', error)
            throw error
        }
    }

    async getServiceById(id) {
        try {
            const service = await cnapRepository.getServiceById(id)
            if (!service) {
                const error = new Error('Service not found')
                error.statusCode = 404
                throw error
            }
            return service
        } catch (error) {
            Logger.error('Error in getServiceById:', error)
            throw error
        }
    }
    async getServicesWithExecutors() {
        try {
            Logger.info('Getting services with executors')
            return await cnapRepository.getServicesWithExecutors()
        } catch (error) {
            Logger.error('Error in getServicesWithExecutors:', error)
            throw error
        }
    }

    async getExecutors() {
        try {
            Logger.info('Getting executors list')
            return await cnapRepository.getExecutors()
        } catch (error) {
            Logger.error('Error in getExecutors:', error)
            throw error
        }
    }

    async createExecutor(executorData) {
        try {
            // Валідація даних
            if (!executorData.name || executorData.name.trim().length === 0) {
                const error = new Error('Назва виконавця є обов\'язковою')
                error.statusCode = 400
                throw error
            }

            // Перевірка унікальності назви
            const existingExecutor = await cnapRepository.getExecutorByName(executorData.name.trim())
            if (existingExecutor) {
                const error = new Error('Виконавець з такою назвою вже існує')
                error.statusCode = 400
                throw error
            }

            Logger.info('Creating executor:', executorData.name)
            const result = await cnapRepository.createExecutor(executorData)
            Logger.info('Executor created successfully:', result)
            
            return result
        } catch (error) {
            Logger.error('Error in createExecutor:', error)
            throw error
        }
    }

    async updateExecutor(id, executorData) {
        try {
            // Перевірка існування виконавця
            const executor = await cnapRepository.getExecutorById(id)
            if (!executor) {
                const error = new Error('Виконавця не знайдено')
                error.statusCode = 404
                throw error
            }

            // Валідація даних
            if (!executorData.name || executorData.name.trim().length === 0) {
                const error = new Error('Назва виконавця є обов\'язковою')
                error.statusCode = 400
                throw error
            }

            // Перевірка унікальності назви (якщо змінюється)
            if (executorData.name.trim() !== executor.name) {
                const existingExecutor = await cnapRepository.getExecutorByName(executorData.name.trim())
                if (existingExecutor) {
                    const error = new Error('Виконавець з такою назвою вже існує')
                    error.statusCode = 400
                    throw error
                }
            }

            Logger.info('Updating executor:', id, executorData.name)
            const result = await cnapRepository.updateExecutor(id, executorData)
            Logger.info('Executor updated successfully:', result)
            
            return result
        } catch (error) {
            Logger.error('Error in updateExecutor:', error)
            throw error
        }
    }

    async deleteExecutor(id) {
        try {
            // Перевірка існування виконавця
            const executor = await cnapRepository.getExecutorById(id)
            if (!executor) {
                const error = new Error('Виконавця не знайдено')
                error.statusCode = 404
                throw error
            }

            // Перевірка чи є послуги, прив'язані до цього виконавця
            const servicesCount = await cnapRepository.getServicesCountByExecutor(id)
            if (servicesCount > 0) {
                const error = new Error(`Неможливо видалити виконавця. До нього прив'язано ${servicesCount} послуг`)
                error.statusCode = 400
                throw error
            }

            Logger.info('Deleting executor:', id)
            await cnapRepository.deleteExecutor(id)
            Logger.info('Executor deleted successfully')
            
            return { message: 'Виконавця успішно видалено' }
        } catch (error) {
            Logger.error('Error in deleteExecutor:', error)
            throw error
        }
    }

    async updateServiceExecutor(serviceId, executorId) {
        try {
            // Перевірка існування послуги
            const service = await cnapRepository.getServiceById(serviceId)
            if (!service) {
                const error = new Error('Послугу не знайдено')
                error.statusCode = 404
                throw error
            }

            // Перевірка існування виконавця (якщо передано)
            if (executorId !== null) {
                const executor = await cnapRepository.getExecutorById(executorId)
                if (!executor) {
                    const error = new Error('Виконавця не знайдено')
                    error.statusCode = 404
                    throw error
                }
            }

            Logger.info('Updating service executor:', { serviceId, executorId })
            const result = await cnapRepository.updateServiceExecutor(serviceId, executorId)
            Logger.info('Service executor updated successfully')
            
            return result
        } catch (error) {
            Logger.error('Error in updateServiceExecutor:', error)
            throw error
        }
    }

    async getExecutorServices(executorId) {
        try {
            // Перевірка існування виконавця
            const executor = await cnapRepository.getExecutorById(executorId)
            if (!executor) {
                const error = new Error('Виконавця не знайдено')
                error.statusCode = 404
                throw error
            }

            Logger.info('Getting services for executor:', executorId)
            return await cnapRepository.getServicesByExecutor(executorId)
        } catch (error) {
            Logger.error('Error in getExecutorServices:', error)
            throw error
        }
    }


    async createService(serviceData) {
        try {
            // Валідація обов'язкових полів
            if (!serviceData.identifier || !serviceData.name || !serviceData.price || !serviceData.edrpou || !serviceData.iban) {
                const error = new Error('Всі поля є обов\'язковими')
                error.statusCode = 400
                throw error
            }
    
            // Валідація ЄДРПОУ (має бути 8 цифр)
            if (!/^\d{8}$/.test(serviceData.edrpou)) {
                const error = new Error('ЄДРПОУ має містити 8 цифр')
                error.statusCode = 400
                throw error
            }
    
            // Валідація IBAN (має бути 29 символів)
            if (!/^[A-Z]{2}[0-9]{27}$/.test(serviceData.iban)) {
                const error = new Error('IBAN має бути у форматі UA + 27 цифр')
                error.statusCode = 400
                throw error
            }
    
            // Валідація ціни (має бути додатнім числом)
            if (serviceData.price <= 0) {
                const error = new Error('Ціна має бути більше 0')
                error.statusCode = 400
                throw error
            }
    
            // Підготовка полів та значень для запиту
            const fields = ['identifier', 'name', 'price', 'edrpou', 'iban'];
            const values = [serviceData.identifier, serviceData.name, serviceData.price, serviceData.edrpou, serviceData.iban];
            
            // Додаємо executor_id тільки якщо він передано і не є null
            if (serviceData.executor_id !== null && serviceData.executor_id !== undefined && serviceData.executor_id !== '') {
                const executorId = Number(serviceData.executor_id);
                if (isNaN(executorId) || executorId <= 0) {
                    const error = new Error('ID виконавця має бути додатнім числом')
                    error.statusCode = 400
                    throw error
                }
                
                // Перевірка чи існує виконавець (опціонально)
                try {
                    const executorExists = await this.checkExecutorExists(executorId);
                    if (!executorExists) {
                        const error = new Error('Виконавець з таким ID не існує')
                        error.statusCode = 400
                        throw error
                    }
                } catch (checkError) {
                    Logger.warn('Could not verify executor existence:', checkError.message);
                }
                
                fields.push('executor_id');
                values.push(executorId);
            }
            // Якщо executor_id = null - це нормально, просто не додаємо це поле до запиту
    
            // Динамічне створення запиту
            const placeholders = fields.map((_, index) => `$${index + 1}`).join(', ');
            const returningFields = fields.includes('executor_id') 
                ? 'id, identifier, name, price, edrpou, iban, executor_id'
                : 'id, identifier, name, price, edrpou, iban';
                
            const query = `
                INSERT INTO admin.cnap_services (${fields.join(', ')})
                VALUES (${placeholders})
                RETURNING ${returningFields}
            `;
    
            Logger.info('createService - received executor_id:', serviceData.executor_id);
            Logger.info('createService query:', query);
            Logger.info('createService values:', values);
            
            const result = await cnapRepository.createService({ query, values });
            Logger.info('createService result:', result);
                         
            return {
                message: 'Послугу успішно створено',
                id: result.id,
                identifier: result.identifier,
                name: result.name,
                executor_id: result.executor_id || null
            }
        } catch (error) {
            Logger.error('Error in createService:', error)
            throw error
        }
    }

    async updateService(id, serviceData) {
        try {
            const service = await cnapRepository.getServiceById(id)
            if (!service) {
                const error = new Error('Service not found')
                error.statusCode = 404
                throw error
            }
            return await cnapRepository.updateService(id, serviceData)
        } catch (error) {
            Logger.error('Error in updateService:', error)
            throw error
        }
    }

    async getAccounts(filter) {
        try {
            return await cnapRepository.getAccounts(filter)
        } catch (error) {
            Logger.error('Error in getAccounts:', error)
            throw error
        }
    }

    async getAccountById(id) {
        try {
            const account = await cnapRepository.getAccountById(id)
            if (!account) {
                const error = new Error('Account not found')
                error.statusCode = 404
                throw error
            }
            return account
        } catch (error) {
            Logger.error('Error in getAccountById:', error)
            throw error
        }
    }

    async deleteService(id) {
        try {
            const service = await cnapRepository.getServiceById(id)
            if (!service) {
                const error = new Error('Service not found')
                error.statusCode = 404
                throw error
            }
            
            await cnapRepository.deleteService(id)
            return { message: 'Послугу успішно видалено' }
        } catch (error) {
            Logger.error('Error in deleteService:', error)
            throw error
        }
    }

    async createAccount(accountData) {
        try {
            // Перевірка чи існує послуга
            const service = await cnapRepository.getServiceByIdentifier(accountData.service_code)
            if (!service) {
                const error = new Error('Service not found')
                error.statusCode = 404
                throw error
            }

            // Перевірка чи номер рахунку унікальний
            const existingAccount = await cnapRepository.getAccountByNumber(accountData.account_number)
            if (existingAccount) {
                const error = new Error('Account number already exists')
                error.statusCode = 400
                throw error
            }

            return await cnapRepository.createAccount(accountData)
        } catch (error) {
            Logger.error('Error in createAccount:', error)
            throw error
        }
    }
async printDebtId(request, reply) {
    // Перевіряємо наявність ID рахунку
    if (!request?.params?.id) {
        throw new Error("Немає ID рахунку для отримання даних");
    }

    // Отримуємо дані по рахунку за його ID
    const fetchAccount = await cnapRepository.getAccountById(request?.params?.id);
    if (!fetchAccount) {
        throw new Error(NotFoundErrorMessage); // Якщо рахунок не знайдений
    }

    // Отримуємо реквізити для адміністративної послуги
    const fetchRequisite = await cnapRepository.getServiceByIdentifier(fetchAccount.service_code);
    if (!fetchRequisite) {
        throw new Error(NotFoundErrorMessage); // Якщо реквізити не знайдені
    }

    // Якщо є борг по рахунку
    if (fetchAccount.amount > 0) {
        const result = await addRequisiteToAdminServiceDebt(fetchAccount, fetchRequisite);
        
        // Логування дії
        await logRepository.createLog({
            row_pk_id: fetchAccount.id,
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
            name: fetchAccount.payer, // Повертатимемо ім'я платника
            date: fetchAccount.date,
            accountNumber: fetchAccount.account_number, // Рахунок
            debt: result // Реквізити для адміністративної послуги
        });
    }

    throw new Error("Немає даних для формування документу.");
}

}

module.exports = new CnapService()
