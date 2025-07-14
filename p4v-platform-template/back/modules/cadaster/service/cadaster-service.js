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
        
        const { 
            page = 1, 
            limit = 16, 
            search,
            sort_by = null,
            sort_direction = 'desc',
            ...whereConditions 
        } = request.body;
        
        const { offset } = paginate(page, limit);
        const { allowedCadasterSortFields } = require("../../../utils/constants");
        
        // Валідація сортування
        const isValidSortField = sort_by && allowedCadasterSortFields.includes(sort_by);
        const isValidSortDirection = ['asc', 'desc'].includes(sort_direction?.toLowerCase());

        const validSortBy = isValidSortField ? sort_by : 'id';
        const validSortDirection = isValidSortDirection ? sort_direction.toLowerCase() : 'desc';

        console.log('🔄 Cadaster sorting params received:', { sort_by, sort_direction });
        console.log('🔄 Validated cadaster sorting params:', { validSortBy, validSortDirection });
        
        const allowedFields = allowedCadasterTableFilterFields
            .filter(el => whereConditions.hasOwnProperty(el))
            .reduce((acc, key) => ({ ...acc, [key]: whereConditions[key] }), {});

        console.log('🔍 Allowed filter fields:', allowedFields);

        const cadasterData = await cadasterRepository.findCadasterByFilter(
            limit, 
            offset, 
            search, 
            allowedFields, 
            displayCadasterFields,
            validSortBy,        // Додано параметр сортування
            validSortDirection  // Додано напрямок сортування
        );
        
        // Логування пошуку
        if (search || Object.keys(allowedFields).length) {
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
                'PAYER_NAME',
                'TO_ADDRESS', 
                'ST',
                'SQUARE',
                'ZN',
                'Податкова адреса платника',
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
                success: true,
                message: `Успішно завантажено ${uploadResult.imported} записів з ${uploadResult.total}`,
                imported: uploadResult.imported,
                total: uploadResult.total
            };

        } catch (error) {
            console.error('❌ Помилка обробки Excel файлу:', error);
            throw error;
        }
    }

    validateAndTransformExcelData(jsonData, userId) {
        const validatedData = [];
        const errors = [];

        jsonData.forEach((row, index) => {
            const rowNumber = index + 2; // +2 тому що рядок 1 це заголовки, і індекс починається з 0
            
            try {
                const record = {};

                // Валідація ПІБ платника
                if (!row['PAYER_NAME'] || !row['PAYER_NAME'].trim()) {
                    errors.push(`Рядок ${rowNumber}: Відсутнє ПІБ платника`);
                    return;
                } else {
                    record.payer_name = row['PAYER_NAME'].trim();
                }

                // Валідація адреси платника
                if (!row['TO_ADDRESS'] || !row['TO_ADDRESS'].trim()) {
                    errors.push(`Рядок ${rowNumber}: Відсутня адреса платника`);
                    return;
                } else {
                    record.payer_address = row['TO_ADDRESS'].trim();
                }

                // Валідація IBAN (роблю опціональним)
                if (row['ST'] && row['ST'].trim()) {
                    const iban = row['ST'].trim().replace(/\s/g, ''); // Прибираємо пробіли
                    if (!/^UA\d{27}$/.test(iban)) {
                        errors.push(`Рядок ${rowNumber}: Некоректний формат IBAN: "${iban}"`);
                    } else {
                        record.iban = iban;
                    }
                } else {
                    record.iban = null; // Дозволяємо порожній IBAN
                }

                // Валідація площі ділянки
                if (!row['SQUARE']) {
                    record.plot_area = 0.0;
                } else {
                    const plotArea = parseFloat(row['SQUARE']);
                    if (isNaN(plotArea) || plotArea < 0) {
                        errors.push(`Рядок ${rowNumber}: Некоректна площа ділянки: "${row['SQUARE']}"`);
                        record.plot_area = 0.0;
                    } else {
                        record.plot_area = plotArea;
                    }
                }

                // Валідація земельного податку
                if (!row['ZN']) {
                    // Якщо немає податку, ставимо 100
                    record.land_tax = 100.0;
                } else {
                    const landTax = parseFloat(row['ZN']);
                    if (isNaN(landTax) || landTax < 0) {
                        errors.push(`Рядок ${rowNumber}: Некоректний земельний податок: "${row['ZN']}"`);
                        // Якщо немає податку, ставимо 100
                        record.land_tax = 100.0;
                    } else {
                        record.land_tax = landTax;
                    }
                }

                // Валідація Податкова адреса - роблю опціональною
                if (row['Податкова адреса платника'] && row['Податкова адреса платника'].trim()) {
                    record.tax_address = row['Податкова адреса платника'].trim();
                } else {
                    // Якщо немає податкової адреси, використовуємо основну адресу
                    record.tax_address = record.payer_address || 'Не вказано';
                }

                // Валідація Кадастровий номер
                if (!row['Кадастровий номер'] || !row['Кадастровий номер'].trim()) {
                    // Генеруємо унікальний кадастровий номер
                    record.cadastral_number = `AUTO_${Date.now()}_${index}`;
                } else {
                    record.cadastral_number = row['Кадастровий номер'].trim();
                }

                // Додаємо службові поля
                record.uid = userId;

                // Якщо є основні дані, додаємо в масив
                if (record.payer_name && record.payer_address) {
                    validatedData.push(record);
                }

            } catch (error) {
                errors.push(`Рядок ${rowNumber}: Помилка обробки - ${error.message}`);
            }
        });

        // Показуємо тільки перші 20 помилок для тестування
        if (errors.length > 0) {
            console.log(`Знайдено ${errors.length} помилок. Перші 20:`);
            console.log(errors.slice(0, 20).join('\n'));
            
            // Якщо є хоча б якісь валідні дані, продовжуємо
            if (validatedData.length > 0) {
                console.log(`Валідних записів: ${validatedData.length}`);
                return validatedData;
            } else {
                throw new Error(`Помилки валідації:\n${errors.slice(0, 10).join('\n')}${errors.length > 10 ? `\n... та ще ${errors.length - 10} помилок` : ''}`);
            }
        }

        return validatedData;
    }

}

module.exports = new CadasterService();