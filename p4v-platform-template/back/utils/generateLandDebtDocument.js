const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, AlignmentType, BorderStyle, ImageRun } = require('docx');
const fs = require('fs').promises;

/**
 * Генерує Word документ для земельного податку за зразком
 * @param {Object} debtorData - Дані боржника
 * @param {Object} requisiteData - Реквізити організації
 * @param {Array} tableRows - Рядки для основної таблиці
 * @param {Number} landTaxAmount - Сума земельного податку
 * @param {Number} totalAmount - Загальна сума
 * @returns {Buffer} - Буфер згенерованого документа
 */
async function generateLandDebtDocument(debtorData, requisiteData, tableRows, landTaxAmount, totalAmount) {
    try {
        console.log('🔄 Generating land tax document for:', debtorData.name);

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
            'ХХХХХХХ' + debtorData.identification.slice(-3) : 'XXXXXXX575';

        // ✅ ВИПРАВЛЕНО: Очищуємо AUTO_ номери, але залишаємо рядки
        const filteredTableRows = tableRows.map(row => ({
            ...row,
            cadastralNumber: (row.cadastralNumber && row.cadastralNumber.startsWith('AUTO_')) ? '' : row.cadastralNumber
        }));

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
                    // ✅ 1. ПІБ та ІПН справа
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: debtorData.name?.toUpperCase() || 'НЕ ВКАЗАНО',
                                bold: true,
                                size: 24,
                                font: "Times New Roman",
                            }),
                        ],
                        alignment: AlignmentType.RIGHT, // ✅ Змінено на RIGHT
                        spacing: { after: 200 },
                    }),

                    // ✅ Ідентифікаційний код справа
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `і.к. ${maskedId}`,
                                bold: true,
                                size: 24,
                                font: "Times New Roman",
                            }),
                        ],
                        alignment: AlignmentType.RIGHT, // ✅ Змінено на RIGHT
                        spacing: { after: 400 },
                    }),

                    // Назва документа (залишається по центру)
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'Інформаційне повідомлення',
                                bold: true,
                                size: 24,
                                font: "Times New Roman",
                            }),
                        ],
                        alignment: AlignmentType.CENTER,
                        spacing: { after: 400 },
                    }),

                    // Вступний текст
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `     Великомостівська міська рада повідомляє, що відповідно до даних ГУ ДПС у Львівській області, станом ${currentDate} у Вас наявна заборгованість до бюджету Великомостівської міської територіальної громади, а саме:`,
                                size: 22,
                                font: "Times New Roman",
                            }),
                        ],
                        spacing: { after: 400 },
                        alignment: AlignmentType.JUSTIFIED,
                    }),

                    // ✅ Основна таблиця з виправленими шрифтами
                    ...generateMainTable(filteredTableRows),

                    // ✅ Підсумкова секція (компактніша)
                    ...generateSummarySection(landTaxAmount, totalAmount),

                    // ✅ 4. Текст після таблички (компактніший)
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'В разі виникнення питань по даній заборгованості, звертайтесь у ГУ ДПС у Львівській області за номером телефона (03234) 4-18-80.',
                                size: 22,
                                font: "Times New Roman",
                            }),
                        ],
                        spacing: { before: 300, after: 200 }, // ✅ Зменшено відступи
                        alignment: AlignmentType.JUSTIFIED,
                    }),

                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'Просимо терміново погасити утворену Вами заборгованість до бюджету Великомостівської міської територіальної громади. Несвоєчасна сплата суми заборгованості призведе до нарахувань штрафних санкцій та пені.',
                                size: 22,
                                font: "Times New Roman",
                            }),
                        ],
                        spacing: { after: 200 }, // ✅ Зменшено відступ
                        alignment: AlignmentType.JUSTIFIED,
                    }),

                    new Paragraph({
                        children: [
                            new TextRun({
                                text: 'Перевірити заборгованість можна у застосунках «Портал місцевих податків Великомостівської громади» ',
                                size: 22,
                                font: "Times New Roman",
                            }),
                            new TextRun({
                                text: 'https://velykimosty.skydatagroup.com/',
                                size: 22,
                                font: "Times New Roman",
                                underline: {},
                                color: "0000FF",
                            }),
                            new TextRun({
                                text: ' або через чат-бот в Telegram «Місцеві податки Великомостівської ТГ» ',
                                size: 22,
                                font: "Times New Roman",
                            }),
                            new TextRun({
                                text: 'https://t.me/Velykimosty_taxes_bot',
                                size: 22,
                                font: "Times New Roman",
                                underline: {},
                                color: "0000FF",
                            }),
                            new TextRun({
                                text: '. Вони дозволяють отримати актуальну інформацію щодо стану вашої заборгованості та оплатити її онлайн за допомогою QR-коду, що розміщений нижче.',
                                size: 22,
                                font: "Times New Roman",
                            }),
                        ],
                        spacing: { after: 300 }, // ✅ Зменшено відступ
                        alignment: AlignmentType.JUSTIFIED,
                    }),

                    // ✅ 5. QR-код справа
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: qrCodeBuffer,
                                transformation: {
                                    width: 100,
                                    height: 100,
                                },
                            }),
                        ],
                        alignment: AlignmentType.RIGHT, // ✅ Змінено на RIGHT
                        spacing: { before: 200 },
                    }),
                ],
            }],
        });

        // Генеруємо буфер документа
        const buffer = await Packer.toBuffer(doc);
        console.log('✅ Land tax document generated successfully');
        return buffer;

    } catch (error) {
        console.error('❌ Error generating land tax document:', error);
        throw error;
    }
}

/**
 * ✅ 2. Генерує основну таблицю з правильними шрифтами
 */
function generateMainTable(tableRows) {
    if (!tableRows || !Array.isArray(tableRows) || tableRows.length === 0) {
        console.log('⚠️ No table rows provided');
        return [];
    }

    return [
        new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
                // ✅ Заголовок таблиці з шрифтом 12
                new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: 'Податкова адреса платника',
                                            bold: true,
                                            size: 24, // ✅ 12pt = 24 half-points
                                            font: "Times New Roman",
                                        }),
                                    ],
                                    alignment: AlignmentType.CENTER,
                                }),
                            ],
                            width: { size: 60, type: WidthType.PERCENTAGE },
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
                                            size: 24, // ✅ 12pt = 24 half-points
                                            font: "Times New Roman",
                                        }),
                                    ],
                                    alignment: AlignmentType.CENTER,
                                }),
                            ],
                            width: { size: 25, type: WidthType.PERCENTAGE },
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
                                            size: 24, // ✅ 12pt = 24 half-points
                                            font: "Times New Roman",
                                        }),
                                    ],
                                    alignment: AlignmentType.CENTER,
                                }),
                            ],
                            width: { size: 15, type: WidthType.PERCENTAGE },
                            borders: {
                                top: { style: BorderStyle.SINGLE, size: 1 },
                                bottom: { style: BorderStyle.SINGLE, size: 1 },
                                left: { style: BorderStyle.SINGLE, size: 1 },
                                right: { style: BorderStyle.SINGLE, size: 1 },
                            },
                        }),
                    ],
                }),
                // ✅ Рядки з даними з шрифтом 11
                ...tableRows.map(row => new TableRow({
                    children: [
                        new TableCell({
                            children: [
                                new Paragraph({
                                    children: [
                                        new TextRun({
                                            text: row.taxAddress || 'Не вказано',
                                            size: 22, // ✅ 11pt = 22 half-points
                                            font: "Times New Roman",
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
                                            text: row.cadastralNumber || '',
                                            size: 22, // ✅ 11pt = 22 half-points
                                            font: "Times New Roman",
                                        }),
                                    ],
                                    alignment: AlignmentType.CENTER,
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
                                            text: row.amount || '0.00',
                                            size: 22, // ✅ 11pt = 22 half-points
                                            font: "Times New Roman",
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
                }))
            ],
        }),
    ];
}

/**
 * ✅ Генерує компактнішу підсумкову секцію
 */
function generateSummarySection(landTaxAmount, totalAmount) {
    return [
        new Paragraph({
            children: [
                new TextRun({
                    text: `Заборгованість з земельного податку з фіз. осіб на суму `,
                    size: 22,
                    font: "Times New Roman",
                }),
                new TextRun({
                    text: `${landTaxAmount} грн.`,
                    bold: true,
                    size: 22,
                    font: "Times New Roman",
                }),
            ],
            spacing: { before: 300, after: 100 }, // ✅ Зменшено відступи
            alignment: AlignmentType.LEFT,
        }),
        new Paragraph({
            children: [
                new TextRun({
                    text: `Загальна сума: `,
                    size: 22,
                    font: "Times New Roman",
                }),
                new TextRun({
                    text: `${totalAmount} грн`,
                    bold: true,
                    size: 22,
                    font: "Times New Roman",
                }),
            ],
            spacing: { after: 200 }, // ✅ Зменшено відступ
            alignment: AlignmentType.LEFT,
        })
    ];
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
        // Повертаємо заглушку якщо файл не знайдено
        const fallbackBuffer = Buffer.from('PNG_PLACEHOLDER');
        return fallbackBuffer;
    }
}

module.exports = {
    generateLandDebtDocument
};