const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun } = require('docx');
const fs = require('fs').promises;
const { addRequisiteToLandDebt } = require('./function');

/**
 * Генерує детальний Word документ для земельного боргу з розбивкою по кадастрових номерах
 * @param {Object} debtorData - Дані боржника
 * @param {Object} requisiteData - Реквізити організації
 * @returns {Buffer} - Буфер згенерованого документа
 */
async function generateDetailedLandDebtDocument(debtorData, requisiteData) {
    try {
        console.log('🔄 Generating detailed land debt document for:', debtorData.name);

        // Отримуємо детальні кадастрові дані
        const cadasterRepository = require('../modules/cadaster/repository/cadaster-repository');
        const detailedCadastralData = await cadasterRepository.getAllCadastralDataByPayerName(debtorData.name);
        
        console.log('🏠 Detailed cadastral data:', JSON.stringify(detailedCadastralData, null, 2));

        // Генеруємо QR-код
        const qrCodeBuffer = await getExistingQRCode();
        
        // Форматуємо дату
        const currentDate = new Date().toLocaleDateString('uk-UA', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        // Маскуємо ідентифікаційний код
        const maskedId = debtorData.identification ? 
            'ХХХХХХХ' + debtorData.identification.slice(-3) : 'XXXXXXXXXX';

        // Отримуємо окремі записи кадастру для детальної таблиці
        const individualCadastralRecords = await cadasterRepository.getIndividualCadastralRecords(debtorData.name);
        
        console.log('📊 Individual cadastral records:', JSON.stringify(individualCadastralRecords, null, 2));

        // Створюємо документ
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: {
                            top: 1440,    // 1 inch
                            right: 1440,  // 1 inch
                            bottom: 1440, // 1 inch
                            left: 1440,   // 1 inch
                        },
                    },
                },
                children: [
                    // Заголовок - ПІБ боржника
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: debtorData.name?.toUpperCase() || 'НЕ ВКАЗАНО',
                                bold: true,
                                size: 24,
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 200 },
                    }),

                    // Ідентифікаційний код (справа)
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `і.к. ${maskedId}`,
                                bold: true,
                                size: 24,
                            }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { after: 200 },
                    }),

                    // Назва документа
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'Інформаційне повідомлення',
                                bold: true,
                                size: 24,
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),

                    // Основний текст
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Великомостівська міська рада повідомляє, що відповідно до даних ГУ ДПС у Львівській області, станом ${currentDate} у Вас наявна заборгованість до бюджету Великомостівської міської територіальної громади, а саме:`,
                                size: 22,
                            }),
                        ],
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED,
                    }),

                    // ДЕТАЛЬНА ТАБЛИЦЯ з окремими рядками для кожного кадастрового номера
                    new Table({
                        width: {
                            size: 100,
                            type: WidthType.PERCENTAGE,
                        },
                        rows: [
                            // Заголовок таблиці
                            new TableRow({
                                children: [
                                    new TableCell({
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: 'Податкова адреса платника',
                                                        bold: true,
                                                        size: 20,
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                            }),
                                        ],
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        borders: {
                                            top: { style: BorderStyle.SINGLE, size: 1 },
                                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                                            left: { style: BorderStyle.SINGLE, size: 1 },
                                            right: { style: BorderStyle.SINGLE, size: 1 },
                                        },
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: 'Кадастровий номер',
                                                        bold: true,
                                                        size: 20,
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                            }),
                                        ],
                                        width: { size: 30, type: WidthType.PERCENTAGE },
                                        borders: {
                                            top: { style: BorderStyle.SINGLE, size: 1 },
                                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                                            left: { style: BorderStyle.SINGLE, size: 1 },
                                            right: { style: BorderStyle.SINGLE, size: 1 },
                                        },
                                    }),
                                    new TableCell({
                                        children: [
                                            new Paragraph({
                                                children: [
                                                    new TextRun({
                                                        text: 'Нарахування',
                                                        bold: true,
                                                        size: 20,
                                                    }),
                                                ],
                                                alignment: AlignmentType.CENTER,
                                            }),
                                        ],
                                        width: { size: 20, type: WidthType.PERCENTAGE },
                                        borders: {
                                            top: { style: BorderStyle.SINGLE, size: 1 },
                                            bottom: { style: BorderStyle.SINGLE, size: 1 },
                                            left: { style: BorderStyle.SINGLE, size: 1 },
                                            right: { style: BorderStyle.SINGLE, size: 1 },
                                        },
                                    }),
                                ],
                            }),
                            // Генеруємо окремий рядок для кожного кадастрового номера
                            ...generateDetailedTableRows(individualCadastralRecords)
                        ],
                    }),

                    // Підсумок після таблиці
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `Заборгованість з земельного податку з фіз. осіб на суму `,
                                size: 22,
                            }),
                            new TextRun({
                                text: `${debtorData.land_debt || '0.00'} грн.\nЗагальна сума: ${detailedCadastralData.totalLandTax || debtorData.land_debt || '0.00'} грн`,
                                bold: true,
                                size: 22,
                            }),
                        ],
                        spacing: { before: 300, after: 400 },
                        alignment: AlignmentType.LEFT,
                        border: {
                            left: { style: BorderStyle.SINGLE, size: 2 },
                        },
                    }),

                    // Контактна інформація
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'В разі виникнення питань по даній заборгованості, звертайтесь у ГУ ДПС у Львівській області за номером телефона (03234) 4-18-80.',
                                size: 22,
                            }),
                        ],
                        spacing: { after: 300 },
                        alignment: AlignmentType.JUSTIFIED,
                    }),

                    // Нагадування про сплату
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'Просимо терміново погасити утворену Вами заборгованість до бюджету Великомостівської міської територіальної громади. Несвоєчасна сплата суми заборгованості призведе до нарахувань штрафних санкцій та пені.',
                                size: 22,
                            }),
                        ],
                        spacing: { after: 300 },
                        alignment: AlignmentType.JUSTIFIED,
                    }),

                    // Інформація про онлайн сервіси
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'Перевірити заборгованість можна у застосунках «Портал місцевих податків Великомостівської громади» ',
                                size: 22,
                            }),
                            new TextRun({
                                text: 'https://velykimosty.skydatagroup.com/',
                                size: 22,
                                underline: true,
                                color: '0000FF',
                            }),
                            new TextRun({
                                text: ' або через чат-бот в Telegram «Місцеві податки Великомостівської ТГ» ',
                                size: 22,
                            }),
                            new TextRun({
                                text: 'https://t.me/Velykimosty_taxes_bot',
                                size: 22,
                                underline: true,
                                color: '0000FF',
                            }),
                            new TextRun({
                                text: '. Вони дозволяють отримати актуальну інформацію щодо стану вашої заборгованості та оплатити її онлайн за допомогою QR-коду, що розміщений нижче.',
                                size: 22,
                            }),
                        ],
                        spacing: { after: 300 },
                        alignment: AlignmentType.JUSTIFIED,
                    }),

                    // QR-код (справа)
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: qrCodeBuffer,
                                transformation: {
                                    width: 96,
                                    height: 96,
                                },
                            }),
                        ],
                        alignment: AlignmentType.RIGHT,
                        spacing: { before: 200 },
                    }),
                ],
            }],
        });

        // Генеруємо буфер документа
        const buffer = await Packer.toBuffer(doc);
        console.log('✅ Detailed land debt document generated successfully');
        return buffer;

    } catch (error) {
        console.error('❌ Error generating detailed land debt document:', error);
        throw error;
    }
}

/**
 * Генерує рядки таблиці для кожного окремого кадастрового номера
 */
function generateDetailedTableRows(cadastralRecords) {
    if (!cadastralRecords || !Array.isArray(cadastralRecords)) {
        console.log('⚠️ No individual cadastral records, using fallback');
        return [
            new TableRow({
                children: [
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: 'НЕ ВКАЗАНО', size: 18 })] })],
                        borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: '', size: 18 })] })],
                        borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
                    }),
                    new TableCell({
                        children: [new Paragraph({ children: [new TextRun({ text: '0.00', size: 18 })] })],
                        borders: { top: { style: BorderStyle.SINGLE, size: 1 }, bottom: { style: BorderStyle.SINGLE, size: 1 }, left: { style: BorderStyle.SINGLE, size: 1 }, right: { style: BorderStyle.SINGLE, size: 1 } },
                    }),
                ],
            })
        ];
    }

    return cadastralRecords.map(record => 
        new TableRow({
            children: [
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: record.tax_address || 'НЕ ВКАЗАНО',
                                    size: 18,
                                }),
                            ],
                            alignment: AlignmentType.LEFT,
                        }),
                    ],
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                }),
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: record.cadastral_number || '',
                                    size: 18,
                                }),
                            ],
                            alignment: AlignmentType.LEFT,
                        }),
                    ],
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                }),
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({
                                    text: `${record.land_tax || '0.00'}`,
                                    size: 18,
                                }),
                            ],
                            alignment: AlignmentType.RIGHT,
                        }),
                    ],
                    borders: {
                        top: { style: BorderStyle.SINGLE, size: 1 },
                        bottom: { style: BorderStyle.SINGLE, size: 1 },
                        left: { style: BorderStyle.SINGLE, size: 1 },
                        right: { style: BorderStyle.SINGLE, size: 1 },
                    },
                }),
            ],
        })
    );
}

/**
 * Отримує існуючий QR-код з файлу
 */
async function getExistingQRCode() {
    try {
        const qrBuffer = await fs.readFile('./files/qr-code.png');
        console.log('✅ Existing QR code loaded successfully');
        return qrBuffer;
    } catch (error) {
        console.error('❌ Error reading existing QR code:', error);
        throw new Error('Не вдалося завантажити QR-код');
    }
}

module.exports = {
    generateDetailedLandDebtDocument
};