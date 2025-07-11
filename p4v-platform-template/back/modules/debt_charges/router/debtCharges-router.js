const { RouterGuard } = require('../../../helpers/Guard');
const { accessLevel } = require('../../../utils/constants');
const { viewLimit } = require('../../../utils/ratelimit');
const debtChargesController = require('../controller/debtCharges-controller');
const { debtChargesFilterSchema, debtChargesInfoSchema } = require('../schema/debtCharges-schema');

const routes = async (fastify) => {
    // Отримання списку нарахувань з фільтрацією
    fastify.post("/filter", { 
        schema: debtChargesFilterSchema, 
        preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) 
    }, debtChargesController.findDebtChargesByFilter);
    
    // Отримання одного нарахування
    fastify.get("/info/:id", { 
        schema: debtChargesInfoSchema, 
        preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }), 
        config: viewLimit 
    }, debtChargesController.getDebtChargeById);
    
    // НОВИЙ ЕНДПОІНТ: Завантаження податкового повідомлення
    fastify.get("/generate/:id", { 
        schema: debtChargesInfoSchema, 
        preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) 
    }, debtChargesController.generateTaxNotification);
    
    // Завантаження Excel файлу з правильною обробкою multipart
    fastify.post("/upload", { 
        preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.EDIT }) 
    }, async (request, reply) => {
        try {
            console.log('🔍 Upload route called');
            
            let fileData = null;
            let buffer = null;
            
            // Файл знаходиться в request.body.file
            if (request.body && request.body.file) {
                console.log('✅ Found file in request.body.file');
                fileData = request.body.file;
                
                console.log('📁 File info:', {
                    filename: fileData.filename,
                    mimetype: fileData.mimetype,
                    encoding: fileData.encoding,
                    fieldname: fileData.fieldname,
                    hasBuf: !!fileData._buf,
                    hasToBuffer: typeof fileData.toBuffer === 'function',
                    bufSize: fileData._buf?.length
                });
                
                // Отримуємо buffer
                if (fileData._buf) {
                    console.log('🔄 Using _buf directly...');
                    buffer = fileData._buf;
                    console.log('📊 Buffer from _buf, size:', buffer.length);
                } else if (typeof fileData.toBuffer === 'function') {
                    console.log('🔄 Using toBuffer() method...');
                    buffer = await fileData.toBuffer();
                    console.log('📊 Buffer from toBuffer(), size:', buffer.length);
                } else if (fileData.file && typeof fileData.file.read === 'function') {
                    console.log('🔄 Reading from file stream...');
                    const chunks = [];
                    
                    fileData.file.on('data', (chunk) => {
                        chunks.push(chunk);
                    });
                    
                    await new Promise((resolve) => {
                        fileData.file.on('end', () => {
                            buffer = Buffer.concat(chunks);
                            console.log('📊 Buffer from stream, size:', buffer.length);
                            resolve();
                        });
                    });
                }
            }
            
            // Перевіряємо результат
            if (!fileData || !buffer) {
                console.log('❌ No file data or buffer found');
                return reply.status(400).send({ 
                    message: 'Не вдалося отримати файл або його дані',
                    debug: {
                        hasFileData: !!fileData,
                        hasBuffer: !!buffer,
                        filename: fileData?.filename
                    }
                });
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
            
            console.log('✅ File object created:', {
                originalname: request.file.originalname,
                size: request.file.size,
                mimetype: request.file.mimetype
            });
            
            // Викликаємо контролер
            return await debtChargesController.uploadExcelFile(request, reply);
            
        } catch (error) {
            console.error('❌ Route upload error:', error);
            reply.status(400).send({ 
                message: error.message,
                stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
            });
        }
    });
    
    // Статистика
    fastify.get("/statistics", { 
        preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) 
    }, debtChargesController.getStatistics);
    
    // Довідникові дані
    fastify.get("/reference-data", { 
        preParsing: RouterGuard({ permissionLevel: "debtor", permissions: accessLevel.VIEW }) 
    }, debtChargesController.getReferenceData);
}

module.exports = routes;