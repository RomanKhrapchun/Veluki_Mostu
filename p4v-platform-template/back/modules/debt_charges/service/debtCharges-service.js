const debtChargesRepository = require("../repository/debtCharges-repository");
const { fieldsListMissingError } = require("../../../utils/messages");
const { paginate, paginationData } = require("../../../utils/function");
const { displayDebtChargesFields, allowedDebtChargesTableFilterFields, allowedDebtChargesSortFields } = require("../../../utils/constants");
const logRepository = require("../../log/repository/log-repository");
const xlsx = require('xlsx');
const debtorRepository = require("../../debtor/repository/debtor-repository");

class DebtChargesService {

    async getDebtChargeById(request) {
        if (!Object.keys([displayDebtChargesFields]).length) {
            throw new Error(fieldsListMissingError)
        }
        return await debtChargesRepository.getDebtChargeById(request?.params?.id, displayDebtChargesFields)
    }

    async findDebtChargesByFilter(request) {
        const { 
            page = 1, 
            limit = 16, 
            title, 
            sort_by = null, 
            sort_direction = 'desc',
            ...whereConditions 
        } = request.body;
        const { offset } = paginate(page, limit)
        const isValidSortField = sort_by && allowedDebtChargesSortFields.includes(sort_by);
        const isValidSortDirection = ['asc', 'desc'].includes(sort_direction?.toLowerCase());
    
        const validSortBy = isValidSortField ? sort_by : 'document_date';
        const validSortDirection = isValidSortDirection ? sort_direction.toLowerCase() : 'desc';
    
        const allowedFields = allowedDebtChargesTableFilterFields.filter(el => whereConditions.hasOwnProperty(el)).reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {})
        const userData = await debtChargesRepository.findDebtChargesByFilter(
            limit, 
            offset, 
            title,  
            allowedFields, 
            displayDebtChargesFields,
            validSortBy,
            validSortDirection
        );
        
        if (title || whereConditions?.tax_number) {
            await logRepository.createLog({
                row_pk_id: null,
                uid: request?.user?.id,
                action: 'SEARCH',
                client_addr: request?.ip,
                application_name: 'Пошук нарахувань',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'debt_charges',
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

    // Виправлений метод processExcelUpload в debt-charges-service.js

    async processExcelUpload(request) {
        try {
            
            
            if (!request.file) {
                throw new Error("Файл не завантажено!");
            }
    
            // Отримуємо назву файлу та декодуємо її правильно
            let fileName = request.file.originalname || request.file.filename || 'unknown';
            
            
    
            // Спробуємо декодувати кирилічні символи
            try {
                // Якщо назва файлу закодована неправильно
                if (fileName && typeof fileName === 'string') {
                    // Спробуємо різні способи декодування
                    fileName = decodeURIComponent(fileName);
                }
            } catch (decodeError) {
                console.log('⚠️ Decode error:', decodeError.message);
            }
    
            
    
            // Перевіряємо розширення файлу більш надійно
            const fileExtension = fileName.toLowerCase().split('.').pop();
            
    
            const isValidFormat = fileExtension === 'xls' || fileExtension === 'xlsx';
            
            // Додаткова перевірка по MIME типу
            const mimetype = request.file.mimetype || '';
            const isValidMimeType = mimetype && (
                mimetype.includes('spreadsheet') ||
                mimetype.includes('excel') ||
                mimetype.includes('vnd.ms-excel') ||
                mimetype.includes('vnd.openxmlformats-officedocument.spreadsheetml.sheet') ||
                mimetype === 'application/vnd.ms-excel' ||
                mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            );
    
            
            
    
            // Якщо розширення невалідне, але MIME тип правильний - дозволяємо
            if (!isValidFormat && !isValidMimeType) {
                throw new Error(`Файл має бути у форматі Excel (.xls або .xlsx)! 
                    Отриманий файл: "${fileName}" (розширення: .${fileExtension})
                    MIME тип: ${mimetype}`);
            }
    
            
    
            // Перевіряємо buffer
            if (!request.file.buffer) {
                throw new Error("Не вдалося отримати дані файлу!");
            }
    
            
    
            // Читання Excel файлу з розширеними опціями
            const workbook = xlsx.read(request.file.buffer, { 
                type: "buffer", 
                cellDates: true,
                cellNF: false,
                cellStyles: false,
                // Автоматичне визначення типу файлу по розширенню
                bookType: fileExtension === 'xls' ? 'xls' : 'xlsx',
                // Додаткові опції для .xls файлів
                ...(fileExtension === 'xls' && {
                    codepage: 1251, // Кирилічна кодування для старих .xls файлів
                    cellText: false,
                    cellDates: true
                })
            });
            
            
            
            if (!workbook.SheetNames.length) {
                throw new Error("Excel файл не містить аркушів!");
            }
    
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Більш надійне читання даних
            const result = xlsx.utils.sheet_to_json(worksheet, {
                header: 1, // Спочатку читаємо як масив масивів
                defval: null,
                blankrows: false,
                raw: false
            });
    
            
            
            if (!result.length || !result[0].length) {
                throw new Error("Файл не містить даних!");
            }
    
            // Перетворюємо в об'єкти з заголовками з першого рядка
            const headers = result[0];
            const dataRows = result.slice(1);
            
                
    
            const jsonData = dataRows.map(row => {
                const obj = {};
                headers.forEach((header, index) => {
                    if (header && header.trim()) {
                        obj[header.trim()] = row[index] || null;
                    }
                });
                return obj;
            }).filter(row => Object.keys(row).length > 0); // Видаляємо порожні рядки
    
            
    
            if (!jsonData.length) {
                throw new Error("Файл не містить валідних даних!");
            }
    
            // Валідація структури файлу
            const requiredColumns = [
                'Податковий номер ПП',
                'Назва платника',
                'Сума'
            ];

            
    
            const errors = [];
            const firstRow = jsonData[0];
            const availableColumns = Object.keys(firstRow);
            
            
            
            requiredColumns.forEach(column => {
                if (!availableColumns.includes(column)) {
                    errors.push(`Відсутня обов'язкова колонка: "${column}"`);
                }
            });
    
            if (errors.length > 0) {
                throw new Error(`Помилки в структурі файлу: ${errors.join('\n')}
                Доступні колонки: ${availableColumns.map(col => `"${col}"`).join(', ')}`);
            }
    
            // Валідація та перетворення даних
            const validatedData = this.validateAndTransformExcelData(jsonData);
            
            await debtChargesRepository.truncateDebtCharges();
            // Масове створення нарахувань
            const uploadResult = await debtChargesRepository.bulkCreateDebtCharges(validatedData);
            
    
            // Логування з безпечною назвою файлу
            const safeFileName = fileName.replace(/[^\w\s.-]/g, '_'); // Замінюємо небезпечні символи
            await logRepository.createLog({
                row_pk_id: null,
                uid: request?.user?.id,
                action: 'INSERT',
                client_addr: request?.ip,
                application_name: `Завантаження файлу нарахувань (${safeFileName})`,
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'debt_charges',
                oid: '16504',
            });
    
            return {
                imported: uploadResult.imported,
                total: uploadResult.total,
                skipped: uploadResult.total - uploadResult.imported,
                fileName: fileName
            };
    
        } catch (error) {
            console.error('❌ Excel upload error:', error);
            throw new Error(`Помилка обробки файлу: ${error.message}`);
        }
    }

// Також можна додати метод для перевірки структури файлу без завантаження:
async validateFileStructure(request) {
    try {
        if (!request.file) {
            throw new Error("Файл не завантажено!");
        }

        const fileName = request.file.originalname?.toLowerCase() || '';
        const isValidFormat = fileName.endsWith('.xlsx') || fileName.endsWith('.xls');
        
        if (!isValidFormat) {
            throw new Error("Файл має бути у форматі Excel (.xls або .xlsx)!");
        }

        const workbook = xlsx.read(request.file.buffer, { 
            type: "buffer", 
            cellDates: true,
            bookType: fileName.endsWith('.xls') ? 'xls' : 'xlsx'
        });
        
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Читаємо тільки перший рядок для перевірки структури
        const result = xlsx.utils.sheet_to_json(worksheet, { 
            range: 0, // Тільки перший рядок
            defval: null,
            raw: false 
        });

        if (!result.length) {
            throw new Error("Файл не містить заголовків!");
        }

        const availableColumns = Object.keys(result[0]);
        const requiredColumns = [
            'Податковий номер ПП',
            'Назва платника',
            'Сума',
            'Статус'
        ];

        const missingColumns = requiredColumns.filter(col => !availableColumns.includes(col));
        
        return {
            isValid: missingColumns.length === 0,
            availableColumns,
            requiredColumns,
            missingColumns,
            fileName
        };

    } catch (error) {
        throw new Error(`Помилка перевірки файлу: ${error.message}`);
    }
}

// Додати цей метод до існуючого DebtChargesService

async generateTaxNotificationById(request, reply) {
    try {
        console.log('🔍 Generating tax notification for charge ID:', request.params.id);
        
        if (!Object.keys([displayDebtChargesFields]).length) {
            throw new Error(fieldsListMissingError);
        }
        
        // Отримуємо дані нарахування
        const chargeData = await debtChargesRepository.getDebtChargeById(request?.params?.id, displayDebtChargesFields);
        
        if (!chargeData.length) {
            throw new Error("Нарахування не знайдено");
        }
        
        // Отримуємо реквізити з settings (використовуємо існуючий метод)
        //const debtorRepository = require("../../debtor/repository/debtor-repository");
        const fetchRequisite = await debtorRepository.getRequisite();
        if (!fetchRequisite.length) {
            throw new Error("Реквізити не знайдені");
        }
        
        const charge = chargeData[0];
        const settings = fetchRequisite[0];
        
        // НОВИЙ ЗАПИТ: Отримуємо інформацію про заборгованості з ower.ower через пошук по імені
        let debtorInfo = null;
        if (charge.payer_name) {
            try {
                console.log('🔍 Searching debtor by name:', charge.payer_name);
                
                // Використовуємо пошук по імені через title параметр (ILIKE пошук)
                const debtorData = await debtorRepository.findDebtByFilter(
                    5, // limit - беремо 5 записів на випадок декількох збігів
                    0, // offset 
                    charge.payer_name, // title - пошук по імені через ILIKE
                    {}, // whereConditions - без додаткових фільтрів
                    ['id', 'name', 'date', 'non_residential_debt', 'residential_debt', 'land_debt', 'orenda_debt', 'identification', 'mpz'] // displayFields
                );
                
                if (debtorData[0]?.data && debtorData[0].data.length > 0) {
                    // Якщо знайдено декілька записів, беремо перший (найновіший по даті)
                    debtorInfo = debtorData[0].data[0];
                    
                    console.log('📊 Found debtor info by name:', {
                        name: debtorInfo.name,
                        identification: debtorInfo.identification,
                        non_residential_debt: debtorInfo.non_residential_debt,
                        residential_debt: debtorInfo.residential_debt,
                        land_debt: debtorInfo.land_debt,
                        orenda_debt: debtorInfo.orenda_debt,
                        mpz: debtorInfo.mpz
                    });
                    
                    // Якщо знайдено більше одного запису, логуємо це
                    if (debtorData[0].data.length > 1) {
                        console.log(`⚠️ Found ${debtorData[0].data.length} records for name "${charge.payer_name}", using the first one`);
                    }
                } else {
                    console.log('⚠️ No debtor info found by name, using default values (0.00)');
                }
            } catch (error) {
                console.log('⚠️ Error getting debtor info by name:', error.message);
            }
        } else {
            console.log('⚠️ No payer name available for search');
        }
        
        console.log('📋 Charge data:', {
            id: charge.id,
            tax_number: charge.tax_number,
            payer_name: charge.payer_name,
            amount: charge.amount,
            status: charge.status
        });
        
        // Генеруємо документ податкового повідомлення з інформацією про заборгованості
        const result = await this.createTaxNotificationDocument(charge, settings, debtorInfo);
        
        if (!result) {
            throw new Error("Не вдалося згенерувати документ податкового повідомлення");
        }
        
        // Логування операції
        await logRepository.createLog({
            row_pk_id: charge.id,
            uid: request?.user?.id,
            action: 'GENERATE_DOC',
            client_addr: request?.ip,
            application_name: 'Генерування податкового повідомлення',
            action_stamp_tx: new Date(),
            action_stamp_stm: new Date(),
            action_stamp_clk: new Date(),
            schema_name: 'ower',
            table_name: 'debt_charges',
            oid: '16504',
        });
        
        // Встановлюємо заголовки для завантаження PDF
        reply.header('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        reply.header('Content-Disposition', `attachment; filename=tax-notification-${charge.tax_number}-${charge.id}.docx`);
        
        return reply.send(result);
        
    } catch (error) {
        console.error('❌ Tax notification service error:', error);
        throw new Error(`Помилка генерації податкового повідомлення: ${error.message}`);
    }
}

async createTaxNotificationDocument(charge, settings, debtorInfo) {
    try {
        console.log('📄 Creating tax notification document for:', charge.payer_name);
        
        // Використовуємо нову функцію для створення податкового повідомлення
        const { createTaxNotificationWord } = require("../../../utils/generateDocx");
        
        const documentResult = await createTaxNotificationWord(charge, settings, debtorInfo);
        
        if (!documentResult) {
            throw new Error("Не вдалося створити документ");
        }
        
        console.log('✅ Tax notification document created successfully');
        return documentResult;
        
    } catch (error) {
        console.error('❌ Document creation error:', error);
        throw error;
    }
}

validateAndTransformExcelData(excelData) {
    const errors = [];
    const transformedData = [];

    console.log('🔍 Processing', excelData.length, 'rows');
    console.log('🔍 Sample raw row:', JSON.stringify(excelData[0], null, 2));

    excelData.forEach((row, index) => {
        const rowNumber = index + 1;
        const transformedRow = {};

        try {
            // ПРЯМИЙ МАПІНГ БЕЗ ЗМІН:
            
            // 1. tax_number = "Податковий номер ПП" (111111111)
            const taxNumber = row['Податковий номер ПП'];
            if (!taxNumber || String(taxNumber).trim() === '') {
                errors.push(`Рядок ${rowNumber}: Відсутній податковий номер ПП`);
                return;
            }
            transformedRow.tax_number = String(taxNumber).trim();

            // 2. payer_name = "Назва платника" (САМПАРА ЄВГЕНІЯ ВАСИЛІВНА)
            const payerName = row['Назва платника'];
            if (!payerName || String(payerName).trim() === '') {
                errors.push(`Рядок ${rowNumber}: Відсутня назва платника`);
                return;
            }
            transformedRow.payer_name = String(payerName).trim();

            // 3. payment_info = "Платіж" (50)
            const paymentInfo = row['Платіж'];
            transformedRow.payment_info = paymentInfo ? String(paymentInfo).trim() : null;

            // 4. tax_classifier = "Номер" (18010700)
            const taxClassifier = row['Номер'];
            transformedRow.tax_classifier = taxClassifier ? String(taxClassifier).trim() : null;

            // 5. account_number = "Дата" (UA61040110000010646)
            const accountNumber = row['Дата'];
            transformedRow.account_number = accountNumber ? String(accountNumber).trim() : null;

            // 6. full_document_id = "Дата вручення платнику податків" (3737995-2407-1918-UA61040110000010646)
            const fullDocId = row['Дата вручення платнику податків'];
            if (fullDocId && String(fullDocId).trim() !== '') {
                transformedRow.full_document_id = String(fullDocId).trim();
            } else {
                transformedRow.full_document_id = `GENERATED-${Date.now()}-${transformedRow.tax_number}`;
            }

            // 7. document_date = парсимо дату з відповідної колонки якщо є
            // Пошукаємо колонку з датою документа
            let documentDate = null;
            if (row['Дата документа']) {
                documentDate = this.parseDate(row['Дата документа']);
            } else if (row['23.05.2025']) { // Можливо дата в окремій колонці
                documentDate = this.parseDate(row['23.05.2025']);
            }
            transformedRow.document_date = documentDate;

            // 8. delivery_date = поки що null
            transformedRow.delivery_date = null;

            // 9. amount = "Сума" (2060,91)
            let amount = row['Сума'];
            if (amount === undefined || amount === null || amount === '') {
                errors.push(`Рядок ${rowNumber}: Відсутня сума`);
                return;
            }
            
            if (typeof amount === 'string') {
                amount = amount.replace(',', '.').replace(/\s/g, '');
            }
            const numAmount = Number(amount);
            if (isNaN(numAmount) || numAmount <= 0) {
                errors.push(`Рядок ${rowNumber}: Некоректна сума: ${amount}`);
                return;
            }
            transformedRow.amount = numAmount;

            // 10. status = "Статус" (Не вручено)
            const status = row['Статус'];
            if (status && String(status).trim() !== '') {
                transformedRow.status = String(status).trim();
            } else {
                transformedRow.status = 'Не вручено'; // За замовчуванням
            }

            // Валідація податкового номера
            if (!/^\d{8,12}$/.test(transformedRow.tax_number)) {
                errors.push(`Рядок ${rowNumber}: Некоректний формат податкового номера "${transformedRow.tax_number}"`);
                return;
            }

            transformedData.push(transformedRow);
            
            // Логування для перших 5 записів
            if (rowNumber <= 5) {
                console.log(`✅ Row ${rowNumber} direct mapping:`, {
                    tax_number: transformedRow.tax_number,                    // 111111111
                    payer_name: transformedRow.payer_name?.substring(0, 25),  // САМПАРА ЄВГЕНІЯ...
                    payment_info: transformedRow.payment_info,                // 50
                    tax_classifier: transformedRow.tax_classifier,            // 18010700
                    account_number: transformedRow.account_number,            // UA61040110000010646
                    full_document_id: transformedRow.full_document_id?.substring(0, 30) + '...', // 3737995-2407-1918...
                    amount: transformedRow.amount,                            // 2060.91
                    status: transformedRow.status                             // Не вручено
                });
            }

        } catch (error) {
            console.error(`❌ Error processing row ${rowNumber}:`, error);
            errors.push(`Рядок ${rowNumber}: Помилка обробки - ${error.message}`);
        }
    });

    console.log(`📊 Mapping summary: ${transformedData.length} valid rows out of ${excelData.length} total`);
    
    if (errors.length > 0) {
        console.log('⚠️ Errors found:', errors.length);
        if (transformedData.length === 0) {
            throw new Error(`Критичні помилки у файлі:\n${errors.slice(0, 10).join('\n')}`);
        }
    }

    return transformedData;
}

parseDate(dateValue) {
    if (!dateValue) return null;
    
    console.log('🗓️ Parsing date:', dateValue, typeof dateValue);
    
    try {
        // Якщо це вже Date об'єкт
        if (dateValue instanceof Date) {
            const isoDate = dateValue.toISOString().split('T')[0];
            console.log('📅 Date object converted:', isoDate);
            return isoDate;
        }
        
        // Якщо це рядок
        if (typeof dateValue === 'string') {
            // Спробуємо різні формати
            let date;
            
            // Формат дд.мм.рррр
            if (dateValue.includes('.')) {
                const parts = dateValue.split('.');
                if (parts.length === 3) {
                    date = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
                }
            }
            // Формат дд/мм/рррр
            else if (dateValue.includes('/')) {
                const parts = dateValue.split('/');
                if (parts.length === 3) {
                    date = new Date(`${parts[2]}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`);
                }
            }
            // Інші формати
            else {
                date = new Date(dateValue);
            }
            
            if (date && !isNaN(date.getTime())) {
                const isoDate = date.toISOString().split('T')[0];
                console.log('📅 String date converted:', dateValue, '→', isoDate);
                return isoDate;
            }
        }
        
        // Якщо це число (Excel timestamp)
        if (typeof dateValue === 'number') {
            // Excel дати починаються з 1900-01-01 = 1
            const excelEpoch = new Date('1900-01-01');
            const date = new Date(excelEpoch.getTime() + (dateValue - 1) * 24 * 60 * 60 * 1000);
            
            if (!isNaN(date.getTime())) {
                const isoDate = date.toISOString().split('T')[0];
                console.log('📅 Excel number converted:', dateValue, '→', isoDate);
                return isoDate;
            }
        }
        
        console.log('❌ Could not parse date:', dateValue);
        return null;
        
    } catch (error) {
        console.log('❌ Date parsing error:', error.message, 'for value:', dateValue);
        return null;
    }
}

    extractAccountFromRow(row) {
        // Спробуємо знайти IBAN в різних полях
        const possibleFields = ['Рахунок', 'account_number', 'Повний ідентифікатор'];
        
        for (const field of possibleFields) {
            if (row[field]) {
                const ibanMatch = String(row[field]).match(/UA\d{23}/);
                if (ibanMatch) {
                    return ibanMatch[0];
                }
            }
        }
        
        return null;
    }

    generateFullDocumentId(row, transformedRow) {
        // Якщо є готовий ідентифікатор в файлі
        if (row['Повний ідентифікатор']) {
            return String(row['Повний ідентифікатор']).trim();
        }
        
        // Генеруємо новий
        const timestamp = new Date().getTime();
        const taxNumber = transformedRow.tax_number || 'unknown';
        const classifier = transformedRow.tax_classifier || 'unknown';
        
        return `${classifier}-${timestamp}-${taxNumber}`;
    }

    async getStatistics(request) {
        try {
            const stats = await debtChargesRepository.getDebtChargesStatistics();
            return stats[0] || {};
        } catch (error) {
            throw new Error(`Помилка отримання статистики: ${error.message}`);
        }
    }

    async getReferenceData(request) {
        try {
            const [statuses, classifiers] = await Promise.all([
                debtChargesRepository.getUniqueStatuses(),
                debtChargesRepository.getUniqueClassifiers()
            ]);

            return {
                statuses,
                classifiers
            };
        } catch (error) {
            throw new Error(`Помилка отримання довідникових даних: ${error.message}`);
        }
    }
}

module.exports = new DebtChargesService();