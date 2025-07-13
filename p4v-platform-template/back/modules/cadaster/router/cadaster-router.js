const cadasterController = require('../controller/cadaster-controller');
const { cadasterFilterSchema, cadasterInfoSchema, createCadasterSchema, updateCadasterSchema } = require('../schema/cadaster-schema');

const cadasterRouter = async (fastify) => {
    // ===== CADASTER RECORDS =====
    
    // Отримання списку кадастрових записів з фільтрацією
    fastify.post("/filter", { 
        schema: cadasterFilterSchema,
        handler: cadasterController.findCadasterByFilter
    });
    
    // Отримання одного кадастрового запису
    fastify.get("/:id", { 
        schema: cadasterInfoSchema,
        handler: cadasterController.getCadasterById
    });
    
    // Створення кадастрового запису
    fastify.post("/", { 
        schema: createCadasterSchema,
        handler: cadasterController.createCadaster
    });
    
    // Оновлення кадастрового запису
    fastify.put("/:id", { 
        schema: updateCadasterSchema,
        handler: cadasterController.updateCadasterById
    });
    
    // Видалення кадастрового запису
    fastify.delete("/:id", { 
        schema: cadasterInfoSchema,
        handler: cadasterController.deleteCadasterById
    });

    // Завантаження Excel файлу з кадастровими записами
    fastify.post("/upload", { 
        handler: async (request, reply) => {
            try {
                console.log('🔍 Виклик роуту завантаження кадастру');
                
                let fileData = null;
                let buffer = null;
                
                // Файл знаходиться в request.body.file
                if (request.body && request.body.file) {
                    console.log('✅ Знайдено файл в request.body.file');
                    fileData = request.body.file;
                    
                    // Отримуємо buffer даних файлу
                    if (fileData._buf) {
                        buffer = fileData._buf;
                    } else if (fileData.buffer) {
                        buffer = fileData.buffer;
                    } else {
                        throw new Error('Не вдалося отримати дані файлу');
                    }
                    
                    console.log('📁 Інформація про файл:', {
                        filename: fileData.filename,
                        mimetype: fileData.mimetype,
                        encoding: fileData.encoding,
                        fieldname: fileData.fieldname,
                        hasBuffer: !!buffer,
                        bufferSize: buffer?.length
                    });
                } else {
                    throw new Error('Файл не знайдено в запиті');
                }
                
                // Створюємо стандартний об'єкт файлу
                request.file = {
                    originalname: fileData.filename || 'unknown',
                    filename: fileData.filename || 'unknown',
                    mimetype: fileData.mimetype || '',
                    size: buffer.length,
                    buffer: buffer,
                    fieldname: fileData.fieldname || 'file',
                    encoding: fileData.encoding || '7bit'
                };
                
                console.log('✅ Створено об\'єкт файлу:', {
                    originalname: request.file.originalname,
                    size: request.file.size,
                    mimetype: request.file.mimetype
                });
                
                // Викликаємо контролер
                return await cadasterController.uploadExcelFile(request, reply);
                
            } catch (error) {
                console.error('❌ Помилка роуту завантаження:', error);
                reply.status(400).send({ 
                    success: false,
                    message: error.message,
                    stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
                });
            }
        }
    });
};

module.exports = cadasterRouter;