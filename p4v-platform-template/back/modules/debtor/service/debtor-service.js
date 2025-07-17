const debtorRepository = require("../repository/debtor-repository");
const { fieldsListMissingError, NotFoundErrorMessage } = require("../../../utils/messages")
const { paginate, paginationData, addRequisiteToLandDebt } = require("../../../utils/function");
const { displayDebtorFields, allowedDebtorTableFilterFields, allowedSortFields } = require("../../../utils/constants");
const { createRequisiteWord } = require("../../../utils/generateDocx");
const logRepository = require("../../log/repository/log-repository");
const { generateLandDebtDocument } = require("../../../utils/generateLandDebtDocument");

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

            const debtorData = fetchData[0];
            const requisiteData = fetchRequisite[0];
            
            if (debtorData.non_residential_debt || debtorData.residential_debt || debtorData.land_debt > 0 || debtorData.orenda_debt || debtorData.mpz) {
                
                // ✅ НОВИЙ: Якщо є земельний податок, використовуємо новий табличний генератор
                if (debtorData.land_debt > 0) {
                    console.log("🏠 Generating detailed land tax document with table structure");
                    
                    // Отримуємо детальні кадастрові дані
                    const cadasterRepository = require("../../cadaster/repository/cadaster-repository");
                    let detailedCadastralData = [];
                    
                    try {
                        detailedCadastralData = await cadasterRepository.getIndividualCadastralRecords(debtorData.name);
                        console.log('🏠 Individual cadastral records for Word generation:', JSON.stringify(detailedCadastralData, null, 2));
                    } catch (error) {
                        console.warn('⚠️ Не вдалося отримати детальні кадастрові дані:', error.message);
                    }

                    // Створюємо структуру для таблиці
                    const tableRows = [];
                    let totalAmount = 0;
                    let landTaxAmount = 0;

                    // ✅ ТІЛЬКИ ЗЕМЕЛЬНИЙ ПОДАТОК: Фільтруємо валідні кадастрові номери
                    if (detailedCadastralData && detailedCadastralData.length > 0) {
                        detailedCadastralData.forEach(item => {
                            const amount = parseFloat(item.land_tax) || 0;
                            const cadastralNumber = item.cadastral_number;
                            
                            // ✅ Фільтруємо тільки валідні кадастрові номери для земельного податку
                            if (amount > 0 && cadastralNumber && 
                                !cadastralNumber.startsWith('AUTO_') && 
                                cadastralNumber.trim() !== '' &&
                                cadastralNumber.length > 5) {
                                
                                totalAmount += amount;
                                landTaxAmount += amount;
                                
                                tableRows.push({
                                    taxAddress: item.tax_address || debtorData.tax_address || 'Не вказано',
                                    cadastralNumber: cadastralNumber,
                                    amount: amount.toFixed(2)
                                });
                            }
                        });

                        // ✅ ЗБЕРЕЖЕНО: Додаємо інші типи боргів окремими рядками
                        if (debtorData.non_residential_debt > 0) {
                            const amount = parseFloat(debtorData.non_residential_debt);
                            totalAmount += amount;
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: amount.toFixed(2)
                            });
                        }
                        
                        if (debtorData.residential_debt > 0) {
                            const amount = parseFloat(debtorData.residential_debt);
                            totalAmount += amount;
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: amount.toFixed(2)
                            });
                        }
                        
                        if (debtorData.orenda_debt > 0) {
                            const amount = parseFloat(debtorData.orenda_debt);
                            totalAmount += amount;
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: amount.toFixed(2)
                            });
                        }
                        
                        if (debtorData.mpz > 0) {
                            const amount = parseFloat(debtorData.mpz);
                            totalAmount += amount;
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: amount.toFixed(2)
                            });
                        }
                    } else {
                        // ✅ ЗБЕРЕЖЕНО: Fallback логіка з оригіналу
                        const cadastralNumbers = debtorData.cadastral_number ? 
                            debtorData.cadastral_number.split(',').map(num => num.trim()) : [''];
                        
                        const landAmount = parseFloat(debtorData.land_debt);
                        landTaxAmount = landAmount;
                        totalAmount = landAmount;
                        
                        // ✅ ВИПРАВЛЕНО: Фільтруємо AUTO_ номери
                        const validCadastralNumbers = cadastralNumbers.filter(num => 
                            num && !num.startsWith('AUTO_') && num.length > 5
                        );
                        
                        if (validCadastralNumbers.length > 0) {
                            const amountPerCadaster = validCadastralNumbers.length > 1 ? 
                                landAmount / validCadastralNumbers.length : landAmount;
                            
                            validCadastralNumbers.forEach(cadNum => {
                                tableRows.push({
                                    taxAddress: debtorData.tax_address || 'Не вказано',
                                    cadastralNumber: cadNum,
                                    amount: amountPerCadaster.toFixed(2)
                                });
                            });
                        }

                        // ✅ ЗБЕРЕЖЕНО: Додаємо інші типи боргів
                        if (debtorData.non_residential_debt > 0) {
                            totalAmount += parseFloat(debtorData.non_residential_debt);
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: parseFloat(debtorData.non_residential_debt).toFixed(2)
                            });
                        }
                        
                        if (debtorData.residential_debt > 0) {
                            totalAmount += parseFloat(debtorData.residential_debt);
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: parseFloat(debtorData.residential_debt).toFixed(2)
                            });
                        }
                        
                        if (debtorData.orenda_debt > 0) {
                            totalAmount += parseFloat(debtorData.orenda_debt);
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: parseFloat(debtorData.orenda_debt).toFixed(2)
                            });
                        }
                        
                        if (debtorData.mpz > 0) {
                            totalAmount += parseFloat(debtorData.mpz);
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: parseFloat(debtorData.mpz).toFixed(2)
                            });
                        }
                    }

                    // ✅ НОВИЙ: Використовуємо новий генератор для земельного податку  
                    const result = await generateLandDebtDocument(
                        debtorData, 
                        requisiteData,
                        tableRows, 
                        landTaxAmount.toFixed(2), 
                        totalAmount.toFixed(2)
                    );
                    
                    await logRepository.createLog({
                        row_pk_id: debtorData.id,
                        uid: request?.user?.id,
                        action: 'GENERATE_DOC',
                        client_addr: request?.ip,
                        application_name: 'Генерування документа земельного податку',
                        action_stamp_tx: new Date(),
                        action_stamp_stm: new Date(),
                        action_stamp_clk: new Date(),
                        schema_name: 'ower',
                        table_name: 'ower',
                        oid: '16504',
                    });
                    
                    reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
                    reply.header('Content-Disposition', `attachment; filename="land_tax_${new Date().toISOString().split('T')[0]}.docx"`);
                    return reply.send(result);
                }
                
                // ✅ ЗБЕРЕЖЕНО: Для всіх інших податків (без земельного) використовуємо старий генератор
                console.log("🏢 Generating standard debt document for non-land taxes");
                
                const result = await createRequisiteWord(debtorData, requisiteData);
                
                await logRepository.createLog({
                    row_pk_id: debtorData.id,
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
                reply.header('Content-Disposition', `attachment; filename="debt_${new Date().toISOString().split('T')[0]}.docx"`);
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

            const debtorData = fetchData[0];
            
            if (debtorData.non_residential_debt || debtorData.residential_debt || debtorData.land_debt > 0 || debtorData.orenda_debt || debtorData.mpz) {
                
                // ✅ НОВИЙ: Якщо є земельний податок, використовуємо табличний формат
                if (debtorData.land_debt > 0) {
                    // Отримуємо детальні дані по кадастрових номерах для таблиці
                    const cadasterRepository = require("../../cadaster/repository/cadaster-repository");
                    let detailedCadastralData = [];
                    
                    try {
                        detailedCadastralData = await cadasterRepository.getIndividualCadastralRecords(debtorData.name);
                        console.log('🏠 Individual cadastral records:', JSON.stringify(detailedCadastralData, null, 2));
                    } catch (error) {
                        console.warn('⚠️ Не вдалося отримати детальні кадастрові дані:', error.message);
                    }

                    // Створюємо структуру для таблиці як у зразку
                    const tableRows = [];
                    let totalAmount = 0;
                    let landTaxAmount = 0;

                    // ✅ ЗБЕРЕЖЕНО: Вся оригінальна логіка з фільтрацією AUTO_ номерів
                    if (detailedCadastralData && detailedCadastralData.length > 0) {
                        detailedCadastralData.forEach(item => {
                            const amount = parseFloat(item.land_tax) || 0;
                            const cadastralNumber = item.cadastral_number;
                            
                            // ✅ ВИПРАВЛЕНО: Фільтруємо AUTO_ номери тільки для земельного податку
                            if (amount > 0 && cadastralNumber && 
                                !cadastralNumber.startsWith('AUTO_') && 
                                cadastralNumber.trim() !== '' &&
                                cadastralNumber.length > 5) {
                                
                                totalAmount += amount;
                                landTaxAmount += amount;
                                
                                tableRows.push({
                                    taxAddress: item.tax_address || debtorData.tax_address || 'Не вказано',
                                    cadastralNumber: cadastralNumber,
                                    amount: amount.toFixed(2),
                                    debtType: 'land_debt',
                                    description: 'Земельний податок'
                                });
                            }
                        });

                        // ✅ ЗБЕРЕЖЕНО: Додаємо інші типи боргів окремими рядками
                        if (debtorData.non_residential_debt > 0) {
                            const amount = parseFloat(debtorData.non_residential_debt);
                            totalAmount += amount;
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: amount.toFixed(2),
                                debtType: 'non_residential_debt',
                                description: 'Податок на нерухоме майно (нежитлове)'
                            });
                        }
                        
                        if (debtorData.residential_debt > 0) {
                            const amount = parseFloat(debtorData.residential_debt);
                            totalAmount += amount;
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: amount.toFixed(2),
                                debtType: 'residential_debt',
                                description: 'Податок на нерухоме майно (житлове)'
                            });
                        }
                        
                        if (debtorData.orenda_debt > 0) {
                            const amount = parseFloat(debtorData.orenda_debt);
                            totalAmount += amount;
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: amount.toFixed(2),
                                debtType: 'orenda_debt',
                                description: 'Орендна плата за землю'
                            });
                        }
                        
                        if (debtorData.mpz > 0) {
                            const amount = parseFloat(debtorData.mpz);
                            totalAmount += amount;
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: amount.toFixed(2),
                                debtType: 'mpz',
                                description: 'Мінімальне податкове зобов\'язання'
                            });
                        }
                    } else {
                        // ✅ ЗБЕРЕЖЕНО: Fallback логіка з оригіналу з фільтрацією
                        const cadastralNumbers = debtorData.cadastral_number ? 
                            debtorData.cadastral_number.split(',').map(num => num.trim()) : [''];
                        
                        // Додаємо рядки для кожного типу боргу
                        if (debtorData.non_residential_debt > 0) {
                            const amount = parseFloat(debtorData.non_residential_debt);
                            totalAmount += amount;
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: cadastralNumbers[0] || '',
                                amount: amount.toFixed(2),
                                debtType: 'non_residential_debt',
                                description: 'Податок на нерухоме майно (нежитлове)'
                            });
                        }
                        
                        if (debtorData.residential_debt > 0) {
                            const amount = parseFloat(debtorData.residential_debt);
                            totalAmount += amount;
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: cadastralNumbers[0] || '',
                                amount: amount.toFixed(2),
                                debtType: 'residential_debt',
                                description: 'Податок на нерухоме майно (житлове)'
                            });
                        }
                        
                        if (debtorData.land_debt > 0) {
                            const amount = parseFloat(debtorData.land_debt);
                            totalAmount += amount;
                            landTaxAmount += amount;
                            
                            // ✅ ВИПРАВЛЕНО: Фільтруємо AUTO_ номери для земельного податку
                            const validCadastralNumbers = cadastralNumbers.filter(num => 
                                num && !num.startsWith('AUTO_') && num.length > 5
                            );
                            
                            if (validCadastralNumbers.length > 0) {
                                const amountPerCadaster = validCadastralNumbers.length > 1 ? 
                                    amount / validCadastralNumbers.length : amount;
                                
                                validCadastralNumbers.forEach(cadNum => {
                                    tableRows.push({
                                        taxAddress: debtorData.tax_address || 'Не вказано',
                                        cadastralNumber: cadNum,
                                        amount: amountPerCadaster.toFixed(2),
                                        debtType: 'land_debt',
                                        description: 'Земельний податок'
                                    });
                                });
                            } else {
                                // Якщо немає валідних кадастрових номерів, все одно додаємо земельний податок
                                tableRows.push({
                                    taxAddress: debtorData.tax_address || 'Не вказано',
                                    cadastralNumber: '',
                                    amount: amount.toFixed(2),
                                    debtType: 'land_debt',
                                    description: 'Земельний податок'
                                });
                            }
                        }
                        
                        if (debtorData.orenda_debt > 0) {
                            const amount = parseFloat(debtorData.orenda_debt);
                            totalAmount += amount;
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: cadastralNumbers[0] || '',
                                amount: amount.toFixed(2),
                                debtType: 'orenda_debt',
                                description: 'Орендна плата за землю'
                            });
                        }
                        
                        if (debtorData.mpz > 0) {
                            const amount = parseFloat(debtorData.mpz);
                            totalAmount += amount;
                            tableRows.push({
                                taxAddress: debtorData.tax_address || 'Не вказано',
                                cadastralNumber: '',
                                amount: amount.toFixed(2),
                                debtType: 'mpz',
                                description: 'Мінімальне податкове зобов\'язання'
                            });
                        }
                    }

                    await logRepository.createLog({
                        row_pk_id: debtorData.id,
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
                        name: debtorData.name,
                        date: debtorData.date,
                        identification: debtorData.identification,
                        cadastral_number: debtorData.cadastral_number,
                        tax_address: debtorData.tax_address,
                        // ✅ Нова структура для таблиці (для земельного податку)
                        tableRows: tableRows,
                        landTaxAmount: landTaxAmount.toFixed(2),
                        totalAmount: totalAmount.toFixed(2),
                        // ✅ ЗБЕРЕЖЕНО: Залишаємо стару структуру для сумісності
                        debt: addRequisiteToLandDebt(debtorData, fetchRequisite[0])
                    });
                }
                
                // ✅ ЗБЕРЕЖЕНО: Для всіх інших податків (без земельного) - повністю старий формат
                const result = addRequisiteToLandDebt(debtorData, fetchRequisite[0]);
                
                await logRepository.createLog({
                    row_pk_id: debtorData.id,
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
                    name: debtorData.name,
                    date: debtorData.date,
                    identification: debtorData.identification,
                    cadastral_number: debtorData.cadastral_number,
                    tax_address: debtorData.tax_address,
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