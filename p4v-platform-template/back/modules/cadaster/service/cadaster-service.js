const cadasterRepository = require("../repository/cadaster-repository");
const { fieldsListMissingError, NotFoundErrorMessage } = require("../../../utils/messages");
const { paginate, paginationData } = require("../../../utils/function");
const { displayCadasterFields, allowedCadasterTableFilterFields } = require("../../../utils/constants");
const logRepository = require("../../log/repository/log-repository");

class CadasterService {

    async findCadasterByFilter(request) {
        if (!Object.keys([displayCadasterFields]).length) {
            throw new Error(fieldsListMissingError);
        }
        
        const { page = 1, limit = 16, search, ...whereConditions } = request.body;
        const { offset } = paginate(page, limit);
        const allowedFields = allowedCadasterTableFilterFields
            .filter(el => whereConditions.hasOwnProperty(el))
            .reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {});

        const cadasterData = await cadasterRepository.findCadasterByFilter(
            limit, 
            offset, 
            search, 
            allowedFields, 
            displayCadasterFields
        );
        
        // Логування пошуку
        if (search || whereConditions?.payer_name) {
            await logRepository.createLog({
                row_pk_id: null,
                uid: request?.user?.id,
                action: 'SEARCH',
                client_addr: request?.ip,
                application_name: 'Пошук кадастрових записів',
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'cadaster_records',
                oid: '16504',
            });
        }
        
        return paginationData(cadasterData[0], page, limit);
    }

    async getCadasterById(request) {
        if (!Object.keys([displayCadasterFields]).length) {
            throw new Error(fieldsListMissingError);
        }
        
        const cadasterData = await cadasterRepository.getCadasterById(
            request?.params?.id, 
            displayCadasterFields
        );
        
        if (!cadasterData.length) {
            throw new Error(NotFoundErrorMessage);
        }
        
        return cadasterData[0];
    }

    async createCadaster(request) {
        const cadasterData = {
            payer_name: request.body.payer_name,
            payer_address: request.body.payer_address,
            iban: request.body.iban,
            plot_area: request.body.plot_area,
            land_tax: request.body.land_tax,
            tax_address: request.body.tax_address,
            cadastral_number: request.body.cadastral_number,
            uid: request?.user?.id,
            created_at: new Date(),
            updated_at: new Date()
        };

        return await cadasterRepository.createCadaster(cadasterData);
    }

    async updateCadasterById(request) {
        const cadasterData = {
            payer_name: request.body.payer_name,
            payer_address: request.body.payer_address,
            iban: request.body.iban,
            plot_area: request.body.plot_area,
            land_tax: request.body.land_tax,
            tax_address: request.body.tax_address,
            cadastral_number: request.body.cadastral_number,
            editor_id: request?.user?.id,
            updated_at: new Date()
        };

        const result = await cadasterRepository.updateCadasterById(
            request?.params?.id, 
            cadasterData
        );
        
        if (!result.length) {
            throw new Error(NotFoundErrorMessage);
        }
        
        return result[0];
    }

    async deleteCadasterById(request) {
        const result = await cadasterRepository.deleteCadasterById(request?.params?.id);
        
        if (!result.length) {
            throw new Error(NotFoundErrorMessage);
        }
        
        return result[0];
    }

    // Метод для завантаження Excel файлу з кадастровими даними
    async processExcelUpload(request) {
        const xlsx = require('xlsx');

        try {
            if (!request.file) {
                throw new Error("Файл не завантажено!");
            }

            // Отримуємо назву файлу
            let fileName = request.file.originalname || request.file.filename || 'unknown';
            
            // Перевіряємо розширення файлу
            const fileExtension = fileName.toLowerCase().split('.').pop();
            const isValidFormat = fileExtension === 'xls' || fileExtension === 'xlsx';
            
            if (!isValidFormat) {
                throw new Error(`Файл має бути у форматі Excel (.xls або .xlsx)!`);
            }

            // Перевіряємо buffer
            if (!request.file.buffer) {
                throw new Error("Не вдалося отримати дані файлу!");
            }

            // Читаємо Excel файл
            const workbook = xlsx.read(request.file.buffer, { 
                type: "buffer", 
                cellDates: true,
                bookType: fileExtension === 'xls' ? 'xls' : 'xlsx'
            });
            
            if (!workbook.SheetNames.length) {
                throw new Error("Excel файл не містить аркушів!");
            }

            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            
            // Читаємо дані з аркуша
            const jsonData = xlsx.utils.sheet_to_json(worksheet, {
                defval: null,
                blankrows: false,
                raw: false
            });

            if (!jsonData.length) {
                throw new Error("Файл не містить даних!");
            }

            // Валідація структури файлу
            const requiredColumns = [
                'ПІБ Платника',
                'Адреса платника',
                'IBAN',
                'Площа діляки',
                'Земельний податок',
                'Податкова адреса',
                'Кадастровий номер'
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
            const validatedData = this.validateAndTransformExcelData(jsonData, request?.user?.id);
            
            // Масове створення записів
            const uploadResult = await cadasterRepository.bulkCreateCadaster(validatedData);
            
            // Логування
            const safeFileName = fileName.replace(/[^\w\s.-]/g, '_');
            await logRepository.createLog({
                row_pk_id: null,
                uid: request?.user?.id,
                action: 'INSERT',
                client_addr: request?.ip,
                application_name: `Завантаження файлу кадастрових записів (${safeFileName})`,
                action_stamp_tx: new Date(),
                action_stamp_stm: new Date(),
                action_stamp_clk: new Date(),
                schema_name: 'ower',
                table_name: 'cadaster_records',
                oid: '16504',
            });

            return {
                imported: uploadResult.imported,
                total: uploadResult.total,
                skipped: uploadResult.total - uploadResult.imported,
                fileName: fileName
            };

        } catch (error) {
            console.error('❌ Помилка завантаження Excel:', error);
            throw new Error(`Помилка обробки файлу: ${error.message}`);
        }
    }

    // Валідація та перетворення даних з Excel
    validateAndTransformExcelData(jsonData, userId) {
        const validatedData = [];
        const errors = [];

        jsonData.forEach((row, index) => {
            const rowNumber = index + 2; // +2 тому що індекс з 0 + заголовок
            const record = {};

            try {
                // Валідація ПІБ Платника
                if (!row['ПІБ Платника'] || typeof row['ПІБ Платника'] !== 'string' || !row['ПІБ Платника'].trim()) {
                    errors.push(`Рядок ${rowNumber}: ПІБ Платника є обов'язковим`);
                } else {
                    record.payer_name = row['ПІБ Платника'].trim();
                }

                // Валідація Адреса платника
                if (!row['Адреса платника'] || !row['Адреса платника'].trim()) {
                    errors.push(`Рядок ${rowNumber}: Адреса платника є обов'язковою`);
                } else {
                    record.payer_address = row['Адреса платника'].trim();
                }

                // Валідація IBAN
                if (!row['IBAN'] || !row['IBAN'].trim()) {
                    errors.push(`Рядок ${rowNumber}: IBAN є обов'язковим`);
                } else {
                    const iban = row['IBAN'].toString().trim().replace(/\s/g, '');
                    if (!/^UA\d{27}$/.test(iban)) {
                        errors.push(`Рядок ${rowNumber}: IBAN має бути у форматі UA + 27 цифр`);
                    } else {
                        record.iban = iban;
                    }
                }

                // Валідація Площа діляки
                const plotArea = parseFloat(row['Площа діляки']);
                if (!plotArea || isNaN(plotArea) || plotArea <= 0) {
                    errors.push(`Рядок ${rowNumber}: Площа діляки повинна бути числом більше 0`);
                } else {
                    record.plot_area = plotArea;
                }

                // Валідація Земельний податок
                const landTax = parseFloat(row['Земельний податок']);
                if (!landTax || isNaN(landTax) || landTax <= 0) {
                    errors.push(`Рядок ${rowNumber}: Земельний податок повинен бути числом більше 0`);
                } else {
                    record.land_tax = landTax;
                }

                // Валідація Податкова адреса
                if (!row['Податкова адреса'] || !row['Податкова адреса'].trim()) {
                    errors.push(`Рядок ${rowNumber}: Податкова адреса є обов'язковою`);
                } else {
                    record.tax_address = row['Податкова адреса'].trim();
                }

                // Валідація Кадастровий номер
                if (!row['Кадастровий номер'] || !row['Кадастровий номер'].trim()) {
                    errors.push(`Рядок ${rowNumber}: Кадастровий номер є обов'язковим`);
                } else {
                    record.cadastral_number = row['Кадастровий номер'].trim();
                }

                // Додаємо службові поля
                record.uid = userId;

                // Якщо немає помилок для цього запису, додаємо в масив
                if (Object.keys(record).length === 7) { // 6 основних полів + uid
                    validatedData.push(record);
                }

            } catch (error) {
                errors.push(`Рядок ${rowNumber}: Помилка обробки - ${error.message}`);
            }
        });

        if (errors.length > 0) {
            throw new Error(`Помилки валідації:\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? `\n... та ще ${errors.length - 10} помилок` : ''}`);
        }

        return validatedData;
    }

}

module.exports = new CadasterService();