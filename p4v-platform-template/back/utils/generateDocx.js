const { Paragraph, TextRun, patchDocument, TableRow, TableCell, Table, VerticalAlign, HeadingLevel, PatchType, AlignmentType, WidthType, ExternalHyperlink, ImageRun } = require('docx')
const { addRequisiteToLandDebt,addRequisiteToWaterDebt } = require('./function');
const { territory_title, territory_title_instrumental, phone_number_GU_DPS, GU_DPS_region, website_name, website_url, telegram_name, telegram_url } = require('./constants');
const fs = require('fs').promises

const oneCellWidth = {
    size: 750,
    type: WidthType.PERCENTAGE
}

const addRow = (body) => {
    return body.map((el) => {
        return new TableRow({
            children: [
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({ text: el?.label, font: "Times New Roman", size: 26, bold: true })
                            ],
                            alignment: AlignmentType.CENTER,
                        })
                    ],
                    width: oneCellWidth,
                    verticalAlign: 'center',
                }),
                new TableCell({
                    children: [
                        new Paragraph({
                            children: [
                                new TextRun({ text: el?.value, font: "Times New Roman", size: 26, })
                            ],
                            alignment: AlignmentType.CENTER,
                        })
                    ],
                    width: oneCellWidth,
                    verticalAlign: 'center',
                }),
            ],
        })
    })

};





const createRequisiteWord = async (body, requisite) => {
    try {
        console.log("body", body);

        // Використовуємо .flat() для обробки можливих вкладених масивів
        const debts = addRequisiteToLandDebt(body, requisite).flat();

        console.log("📌 debts після .flat():", debts);

        if (!Array.isArray(debts) || debts.length === 0) {
            throw new Error("❌ ПОМИЛКА: debts порожній або не є масивом!");
        }

        const docBuffer = await fs.readFile("./files/doc1.docx");

        let totalAmount = 0; // Загальна сума всіх боргів

        const children = debts.map((debt, index) => {
            totalAmount += parseFloat(debt.amount || 0); // Додаємо до загальної суми

            return [
		new Paragraph({ children: [new TextRun({ text: " " })] }),
                new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                        new TextRun({ 
                            text: `          ${index + 1}. ${debt.debtText}`, // Додаємо нумерацію
                            font: "Times New Roman",
                            size: 26
                        }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    children: [
                        new TextRun({ text: `{{requisiteText${index}}}`, font: "Times New Roman", size: 26 }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                        new TextRun({ text: `{{table${index}}}`, font: "Times New Roman", size: 26 }),
                    ],
                }),
                /*new Paragraph({
                    alignment: AlignmentType.RIGHT,
                    children: [
                        new TextRun({
                            text: `Загальна сума боргу по цій таблиці: ${debt.amount} грн`,
                            font: "Times New Roman",
                            size: 26,
                            bold: true
                        }),
                    ],
                }),*/
                //new Paragraph({ children: [new TextRun({ text: " " })] }),
            ];
        }).flat();

        const patches = {
            next: { type: PatchType.DOCUMENT, children },
            name: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: body.name, font: "Times New Roman", size: 26, bold: true })
                        ],
                        alignment: AlignmentType.RIGHT
                    })
                ],
            },
            ident: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: `і.к. ХХХХХХХ${body.identification}`, font: "Times New Roman", size: 24, bold: true, italics: true })
                        ],
                        alignment: AlignmentType.RIGHT
                    })
                ],
            },
            debt_info: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `          ${territory_title} повідомляє, що відповідно до даних ГУ ДПС у ${GU_DPS_region}, станом ${new Intl.DateTimeFormat('uk-UA', {
                                    day: '2-digit',
                                    month: 'long',
                                    year: 'numeric',
                                }).format(new Date(body.date))} у Вас наявна заборгованість до бюджету ${territory_title_instrumental},  а саме:`,
                                font: "Times New Roman",
                                size: 26
                            })
                        ],
                    })
                ],
            },
            gu_dps: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `          В разі виникнення питань по даній заборгованості, звертайтесь у ГУ ДПС у ${GU_DPS_region} за номером телефона ${phone_number_GU_DPS}.`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        alignment: AlignmentType.LEFT
                    })
                ],
            },
            sanction_info: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `          Просимо терміново погасити утворену Вами заборгованість до бюджету ${territory_title_instrumental}. Несвоєчасна сплата суми заборгованості призведе до нарахувань штрафних санкцій та пені.`,
                                font: "Times New Roman",
                                size: 24
                            })
                        ],
                        alignment: AlignmentType.LEFT
                    })
                ],
            },
            footer_info: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: `          Перевірити заборгованість можна у застосунках «${website_name}» `, font: "Times New Roman", size: 24 }),
                            new ExternalHyperlink({
                                children: [
                                    new TextRun({
                                        text: website_url,
                                        font: "Times New Roman",
                                        size: 24,
                                        color: "0000FF",
                                        underline: {}
                                    }),
                                ],
                                link: website_url,
                            }),
                            new TextRun({ text: ` або через чат-бот в Telegram «${telegram_name}» `, font: "Times New Roman", size: 24 }),
                            new ExternalHyperlink({
                                children: [
                                    new TextRun({
                                        text: telegram_url,
                                        font: "Times New Roman",
                                        size: 24,
                                        color: "0000FF",
                                        underline: {}
                                    }),
                                ],
                                link: telegram_url,
                            }),
                            new TextRun({ text: `. Вони дозволяють отримати актуальну інформацію щодо стану вашої заборгованості та оплатити її онлайн за допомогою QR-коду, що розміщений нижче.`, font: "Times New Roman", size: 24 }),
                        ],
                        alignment: AlignmentType.LEFT
                    })
                ],
            },
            image: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: await fs.readFile("./files/qr-code.png"),
                                transformation: {
                                    width: 128,
                                    height: 128,
                                },
                            }),
                        ],
                        alignment: AlignmentType.RIGHT
                    })
                ],
            },
        };

        // Додаємо патчі для кожного об'єкта debt
        debts.forEach((debt, index) => {
            patches[`debtText${index}`] = {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: debt.debtText || "❌ ПОМИЛКА: Текст боргу відсутній",
                        font: "Times New Roman",
                        size: 26
                    })
                ],
            };

            patches[`requisiteText${index}`] = {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: debt.requisiteText || "❌ ПОМИЛКА: Реквізити відсутні",
                        font: "Times New Roman",
                        bold: true,
                        size: 26
                    })
                ],
            };

             patches[`table${index}`] = {
                type: PatchType.DOCUMENT,
                children: [
                    new Table({
                        rows: [
                            ...addRow(debt.table || []),
                            new TableRow({
                                children: [
                                    new TableCell({
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [
                                                    new TextRun({ 
                                                        text: "Сума", 
                                                        font: "Times New Roman", 
                                                        bold: true, 
                                                        size: 24 
                                                    })
                                                ]
                                            })
                                        ],
                                    }),
                                    new TableCell({
                                        width: { size: 50, type: WidthType.PERCENTAGE },
                                        children: [
                                            new Paragraph({
                                                alignment: AlignmentType.CENTER,
                                                children: [
                                                    new TextRun({ 
                                                        text: `${debt.amount} грн`, 
                                                        font: "Times New Roman",  
                                                        size: 24
                                                    })
                                                ]
                                            })
                                        ],
                                    }),
                                ],
                            }),
                        ]
                    })
                ],
            };
        });

        // Додаємо загальну суму після циклу
        patches[`totalAmount`] = {
            type: PatchType.DOCUMENT,
            children: [
                new Paragraph({
                    alignment: AlignmentType.LEFT,
                    children: [
                        new TextRun({
                            text: `Загальна сума боргу по всіх платежах: ${totalAmount.toFixed(2)} грн`,
                            font: "Times New Roman",
                            size: 22, // Менший шрифт
                            bold: true
                        }),
                    ],
                }),
            ],
        };

        const patchedDoc = await patchDocument(docBuffer, { patches });
        return patchedDoc;
    } catch (error) {
        console.error('❌ Помилка під час створення документа:', error.message);
        return false;
    }
};




const createUtilitiesRequisiteWord = async (body, requisite) => {
    try {
        if (!Array.isArray(body)) {
            throw new Error("body має бути масивом");
        }

        const debts = body.map(item => {
            const result = addRequisiteToWaterDebt(item, requisite);
            if (!result) {
                console.warn("⚠️ Попередження: addRequisiteToWaterDebt повернула undefined або некоректний об'єкт для", item);
            }
            return result;
        }).flat().filter(Boolean); // Видаляємо undefined

        console.log("debts",debts);

        const docBuffer = await fs.readFile("./files/docWater.docx");

        const children = debts.map((_, index) => [
            new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                    new TextRun({ text: `{{debtText${index}}}`, font: "Times New Roman", size: 26 }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                    new TextRun({ text: `{{requisiteText${index}}}`, font: "Times New Roman", size: 26 }),
                ],
            }),
            new Paragraph({
                alignment: AlignmentType.LEFT,
                children: [
                    new TextRun({ text: `{{table${index}}}`, font: "Times New Roman", size: 26 }),
                ],
            }),
        ]).flat();

        // Перевіряємо, чи дата коректна
        let formattedDate;
        try {
            formattedDate = new Intl.DateTimeFormat('uk-UA', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }).format(new Date(body[0].date));
        } catch (error) {
            console.warn("❗ Помилка форматування дати. Використовується поточна дата.");
            formattedDate = new Intl.DateTimeFormat('uk-UA', {
                day: '2-digit',
                month: 'long',
                year: 'numeric',
            }).format(new Date());
        }

        const patches = {
            next: {
                type: PatchType.DOCUMENT,
                children,
            },
            name: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: body[0].fio, font: "Times New Roman", size: 26, bold: true })
                        ],
                        alignment: AlignmentType.CENTER
                    })
                ],
            },
            ident: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: `і.к. ${body[0].payerident}`, font: "Times New Roman", size: 24, bold: true, italics: true })
                        ],
                        alignment: AlignmentType.CENTER
                    })
                ],
            },
            debt_info: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `          ${territory_title} повідомляє, що відповідно до наявних даних, станом на ${formattedDate} у Вас існує заборгованість з оплати комунальних послуг перед ${territory_title_instrumental}.`,
                                font: "Times New Roman", size: 26
                            })
                        ],
                    })
                ],
            },
            support_info: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `          Якщо у вас виникли питання щодо цієї заборгованості, будь ласка, звертайтеся за телефоном служби підтримки: ${phone_number_GU_DPS}.`,
                                font: "Times New Roman", size: 24
                            })
                        ],
                        alignment: AlignmentType.LEFT
                    })
                ],
            },
            sanction_info: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({
                                text: `          Просимо вас своєчасно оплатити заборгованість, щоб уникнути можливих штрафних санкцій та припинення надання комунальних послуг.`,
                                font: "Times New Roman", size: 24
                            })
                        ],
                        alignment: AlignmentType.LEFT
                    })
                ],
            },
            footer_info: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new TextRun({ text: `          Ви можете перевірити заборгованість та здійснити оплату через застосунок «${website_name}» `, font: "Times New Roman", size: 24 }),
                            new ExternalHyperlink({
                                children: [
                                    new TextRun({
                                        text: website_url,
                                        font: "Times New Roman",
                                        size: 24,
                                        color: "0000FF",
                                        underline: {}
                                    }),
                                ],
                                link: website_url,
                            }),
                            new TextRun({ text: ` або через чат-бот в Telegram «${telegram_name}» `, font: "Times New Roman", size: 24 }),
                            new ExternalHyperlink({
                                children: [
                                    new TextRun({
                                        text: telegram_url,
                                        font: "Times New Roman",
                                        size: 24,
                                        color: "0000FF",
                                        underline: {}
                                    }),
                                ],
                                link: telegram_url,
                            }),
                            new TextRun({ text: `. Вони дозволяють отримати актуальну інформацію щодо стану вашої заборгованості та оплатити її онлайн за допомогою QR-коду, що розміщений нижче.`, font: "Times New Roman", size: 24 }),
                        ],
                        alignment: AlignmentType.LEFT
                    })
                ],
            },
            image: {
                type: PatchType.DOCUMENT,
                children: [
                    new Paragraph({
                        children: [
                            new ImageRun({
                                data: await fs.readFile("./files/qr-code.png"),
                                transformation: {
                                    width: 128,
                                    height: 128,
                                },
                            }),
                        ],
                        alignment: AlignmentType.RIGHT
                    })
                ],
            },
        };

        // Додаємо патчі для кожного об'єкта debt
        debts.forEach((debt, index) => {
            patches[`debtText${index}`] = {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: `${debt.debtText}`,
                        font: "Times New Roman",
                        size: 26
                    })
                ],
            };

            patches[`requisiteText${index}`] = {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: `${debt.requisiteText}`,
                        font: "Times New Roman",
                        bold: true,
                        size: 26
                    })
                ],
            };

            patches[`table${index}`] = {
                type: PatchType.DOCUMENT,
                children: [
                    new Table({
                        rows: addRow(debt.table)
                    })
                ],
            };
        });

        const patchedDoc = await patchDocument(docBuffer, { patches });
        return patchedDoc;
    } catch (error) {
        console.error('❌ Помилка під час створення документа:', error.message);
        return false;
    }
};

// Додати цю функцію до файлу generateDocx.js

const createTaxNotificationWord = async (charge, settings, debtorInfo = null) => {
    try {
        console.log('📄 Creating tax notification for:', charge.payer_name);
        
        // Читаємо шаблон податкового повідомлення
        const docBuffer = await fs.readFile("./files/docMessage.docx");
        
        // Форматуємо дату документа
        let formattedDocumentDate;
        try {
            formattedDocumentDate = new Intl.DateTimeFormat('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).format(new Date(charge.document_date || new Date()));
        } catch (error) {
            console.warn("❗ Помилка форматування дати документа. Використовується поточна дата.");
            formattedDocumentDate = new Intl.DateTimeFormat('uk-UA', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
            }).format(new Date());
        }
        
        // Форматуємо суму прописом
        const amountInWords = convertNumberToWords(charge.amount);
        
        // Форматуємо суму з копійками
        const amountFormatted = Number(charge.amount).toFixed(2);
        
        // Визначаємо рік податкового періоду
        const taxYear = new Date(charge.document_date || new Date()).getFullYear();
        
        // Функція для форматування сум заборгованостей
        const formatDebtAmount = (amount) => {
            const numAmount = Number(amount) || 0;
            return numAmount.toFixed(2) + ' грн.';
        };
        
        // Отримуємо суми заборгованостей з debtorInfo або використовуємо 0.00
        const debtAmounts = {
            non_residential: formatDebtAmount(debtorInfo?.non_residential_debt || 0),
            residential: formatDebtAmount(debtorInfo?.residential_debt || 0),
            land: formatDebtAmount(debtorInfo?.land_debt || 0),
            rent: formatDebtAmount(debtorInfo?.orenda_debt || 0),
            mpz: formatDebtAmount(debtorInfo?.mpz || 0)
        };
        
        console.log('💰 Debt amounts from ower.ower:', debtAmounts);
        
        // Створюємо патчі для заміни плейсхолдерів
        const patches = {
            // ОСНОВНА ЧАСТИНА ДОКУМЕНТУ
            
            // Ім'я платника (КУХАРСЬКА ГАЛИНА ДМИТРІВНА)
            payer_name: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.payer_name?.toUpperCase() || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 22,
                        bold: true
                    })
                ],
            },
            
            // ІПН платника (2066017602)  
            tax_number: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.tax_number || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 22,
                        bold: true
                    })
                ],
            },
            
            // ТАБЛИЦЯ ПОДАТКОВОГО ЗОБОВ'ЯЗАННЯ
            
            // Податковий період (2025)
            tax_year: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: taxYear.toString(),
                        font: "Times New Roman",
                        size: 22
                    })
                ],
            },
            
            // Номер ділянки (5481-2407-1918-UA61040110000010646)
            plot_number: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.full_document_id || charge.account_number || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 22
                    })
                ],
            },
            
            // Сума податкового зобов'язання (8,27)
            tax_amount: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: amountFormatted,
                        font: "Times New Roman",
                        size: 22
                    })
                ],
            },
            
            // Сума прописом (вісім грн. 27 коп.)
            amount_in_words: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: amountInWords,
                        font: "Times New Roman",
                        size: 22
                    })
                ],
            },
            
            // ТАБЛИЦЯ РЕКВІЗИТІВ ДЛЯ ОПЛАТИ
            
            // Сума платежу в таблиці реквізитів (8,27)
            payment_amount_table: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: amountFormatted,
                        font: "Times New Roman",
                        size: 20
                    })
                ],
            },
            
            // ІПН в призначенні платежу (2066017602)
            tax_number_payment: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.tax_number || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // Ім'я в призначенні платежу (КУХАРСЬКА ГАЛИНА ДМИТРІВНА)
            payer_name_payment: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.payer_name?.toUpperCase() || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // ДОВІДКОВА ІНФОРМАЦІЯ - дата станом на (01.06.2025р.)
            reference_date: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: formattedDocumentDate + "р.",
                        font: "Times New Roman",
                        size: 20,
                        bold: true
                    })
                ],
            },
            
            // ЗАБОРГОВАНОСТІ З РЕАЛЬНИМИ СУМАМИ
            
            // 1. Податок на нерухомість (не житлова): РЕАЛЬНА СУМА
            non_residential_debt_amount: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: debtAmounts.non_residential,
                        font: "Times New Roman",
                        size: 20
                    })
                ],
            },
            
            // Реквізити для нерухомості (не житлова) - РЕАЛЬНА СУМА
            non_residential_debt_amount_requisites: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: debtAmounts.non_residential,
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // ІПН в реквізитах нерухомості
            non_residential_tax_number: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.tax_number || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // Ім'я в реквізитах нерухомості
            non_residential_payer_name: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.payer_name?.toUpperCase() || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // 2. Податок на нерухомість (житлова): РЕАЛЬНА СУМА
            residential_debt_amount: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: debtAmounts.residential,
                        font: "Times New Roman",
                        size: 20
                    })
                ],
            },
            
            // Реквізити для нерухомості (житлова) - РЕАЛЬНА СУМА
            residential_debt_amount_requisites: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: debtAmounts.residential,
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // ІПН в реквізитах житлової нерухомості
            residential_tax_number: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.tax_number || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // Ім'я в реквізитах житлової нерухомості
            residential_payer_name: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.payer_name?.toUpperCase() || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // 3. Податок на землю: РЕАЛЬНА СУМА
            land_debt_amount: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: debtAmounts.land,
                        font: "Times New Roman",
                        size: 20
                    })
                ],
            },
            
            // Реквізити для земельного податку - РЕАЛЬНА СУМА
            land_debt_amount_requisites: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: debtAmounts.land,
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // ІПН в реквізитах земельного податку
            land_tax_number: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.tax_number || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // Ім'я в реквізитах земельного податку
            land_payer_name: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.payer_name?.toUpperCase() || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // 4. Оренда землі: РЕАЛЬНА СУМА
            rent_debt_amount: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: debtAmounts.rent,
                        font: "Times New Roman",
                        size: 20
                    })
                ],
            },
            
            // Реквізити для оренди землі - РЕАЛЬНА СУМА
            rent_debt_amount_requisites: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: debtAmounts.rent,
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // ІПН в реквізитах оренди
            rent_tax_number: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.tax_number || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // Ім'я в реквізитах оренди
            rent_payer_name: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.payer_name?.toUpperCase() || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // 5. МПЗ: РЕАЛЬНА СУМА
            mpz_debt_amount: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: debtAmounts.mpz,
                        font: "Times New Roman",
                        size: 20
                    })
                ],
            },
            
            // Реквізити для МПЗ - РЕАЛЬНА СУМА
            mpz_debt_amount_requisites: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: debtAmounts.mpz,
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // ІПН в реквізитах МПЗ
            mpz_tax_number: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.tax_number || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // Ім'я в реквізитах МПЗ
            mpz_payer_name: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: charge.payer_name?.toUpperCase() || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // Призначення платежу для основної таблиці (земельний податок)
            payment_purpose_main: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: formatPaymentPurpose(charge, settings, 'land'),
                        font: "Times New Roman",
                        size: 18
                    })
                ],
            },
            
            // Призначення платежу для нерухомості (не житлова)
            payment_purpose_non_residential: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: formatPaymentPurpose(charge, settings, 'non_residential'),
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            // Призначення платежу для нерухомості (житлова)
            payment_purpose_residential: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: formatPaymentPurpose(charge, settings, 'residential'),
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            // Призначення платежу для земельного податку
            payment_purpose_land: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: formatPaymentPurpose(charge, settings, 'land'),
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            // Призначення платежу для оренди землі
            payment_purpose_rent: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: formatPaymentPurpose(charge, settings, 'rent'),
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            // Призначення платежу для МПЗ
            payment_purpose_mpz: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: formatPaymentPurpose(charge, settings, 'mpz'),
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            // РЕКВІЗИТИ З SETTINGS
            
            // Реквізити для нерухомості (не житлова)
            non_residential_recipient_name: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'non_residential')?.recipientname || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            non_residential_account: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'non_residential')?.account || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            non_residential_edrpou: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'non_residential')?.edrpou || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            // Реквізити для нерухомості (житлова)
            residential_recipient_name: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'residential')?.recipientname || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            residential_account: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'residential')?.account || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            residential_edrpou: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'residential')?.edrpou || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            // Реквізити для земельного податку
            land_recipient_name: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'land')?.recipientname || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            land_account: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'land')?.account || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            land_edrpou: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'land')?.edrpou || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            // Реквізити для оренди землі
            rent_recipient_name: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'rent')?.recipientname || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            rent_account: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'rent')?.account || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            rent_edrpou: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'rent')?.edrpou || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            // Реквізити для МПЗ
            mpz_recipient_name: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'mpz')?.recipientname || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            mpz_account: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'mpz')?.account || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
            
            mpz_edrpou: {
                type: PatchType.PARAGRAPH,
                children: [
                    new TextRun({
                        text: getRequisitesForTaxType(settings, 'mpz')?.edrpou || "НЕ ВКАЗАНО",
                        font: "Times New Roman",
                        size: 16
                    })
                ],
            },
        };
        
        console.log('🔄 Applying patches to tax notification document...');
        const patchedDoc = await patchDocument(docBuffer, { patches });
        
        console.log('✅ Tax notification document created successfully');
        return patchedDoc;
        
    } catch (error) {
        console.error('❌ Помилка під час створення податкового повідомлення:', error.message);
        throw error;
    }
};

// Функція для формування призначення платежу
const formatPaymentPurpose = (charge, settings, taxType) => {
    const taxNumber = charge.tax_number || "НЕ ВКАЗАНО";
    const payerName = charge.payer_name?.toUpperCase() || "НЕ ВКАЗАНО";
    
    // Отримуємо коди з settings на основі типу податку
    const taxCodes = {
        'non_residential': '18010300', // Податок на нерухомість (не житлова)
        'residential': '18010200',     // Податок на нерухомість (житлова)  
        'land': '18010700',           // Земельний податок
        'rent': '18010900',           // Оренда землі
        'mpz': '11011300'             // МПЗ
    };
    
    // Назви податків
    const taxNames = {
        'non_residential': 'Податок на нерухомість (не житлова)',
        'residential': 'Податок на нерухомість (житлова)',
        'land': 'земельний податок з фізичних осіб',
        'rent': 'Оренда землі з фізичних осіб',
        'mpz': 'МПЗ'
    };
    
    const taxCode = taxCodes[taxType] || taxCodes['land'];
    const taxName = taxNames[taxType] || taxNames['land'];
    
    // Формуємо призначення у форматі: *;101; КОД; ІПН; ІМ'Я; НАЗВА_ПОДАТКУ;
    return `*;101; ${taxCode}; ${taxNumber}; ${payerName}; ${taxName};`;
};

// Функція для отримання реквізитів з settings
const getRequisitesForTaxType = (settings, taxType) => {
    if (!settings) return null;
    
    const requisiteFields = {
        'non_residential': {
            purpose: settings.non_residential_debt_purpose,
            account: settings.non_residential_debt_account,
            edrpou: settings.non_residential_debt_edrpou,
            recipientname: settings.non_residential_debt_recipientname
        },
        'residential': {
            purpose: settings.residential_debt_purpose,
            account: settings.residential_debt_account,
            edrpou: settings.residential_debt_edrpou,
            recipientname: settings.residential_debt_recipientname
        },
        'land': {
            purpose: settings.land_debt_purpose,
            account: settings.land_debt_account,
            edrpou: settings.land_debt_edrpou,
            recipientname: settings.land_debt_recipientname
        },
        'rent': {
            purpose: settings.orenda_debt_purpose,
            account: settings.orenda_debt_account,
            edrpou: settings.orenda_debt_edrpou,
            recipientname: settings.orenda_debt_recipientname
        },
        'mpz': {
            purpose: settings.mpz_purpose,
            account: settings.mpz_account,
            edrpou: settings.mpz_edrpou,
            recipientname: settings.mpz_recipientname
        }
    };
    
    return requisiteFields[taxType] || requisiteFields['land'];
};

// Допоміжна функція для конвертації числа в слова (повна українська версія)
const convertNumberToWords = (amount) => {
    const numAmount = Number(amount);
    if (isNaN(numAmount)) return 'нуль грн. 00 коп.';
    
    const grn = Math.floor(numAmount);
    const kop = Math.round((numAmount - grn) * 100);
    
    // Масиви для українських числівників (чоловічий рід)
    const onesMale = ['', 'один', 'два', 'три', 'чотири', 'п\'ять', 'шість', 'сім', 'вісім', 'дев\'ять'];
    // Масиви для українських числівників (жіночий рід для гривень)
    const onesFemale = ['', 'одна', 'дві', 'три', 'чотири', 'п\'ять', 'шість', 'сім', 'вісім', 'дев\'ять'];
    
    const teens = ['десять', 'одинадцять', 'дванадцять', 'тринадцять', 'чотирнадцять', 'п\'ятнадцять', 'шістнадцять', 'сімнадцять', 'вісімнадцять', 'дев\'ятнадцять'];
    const tens = ['', '', 'двадцять', 'тридцять', 'сорок', 'п\'ятдесят', 'шістдесят', 'сімдесят', 'вісімдесят', 'дев\'яносто'];
    const hundreds = ['', 'сто', 'двісті', 'триста', 'чотириста', 'п\'ятсот', 'шістсот', 'сімсот', 'вісімсот', 'дев\'ятсот'];
    
    // Тисячі (жіночий рід)
    const thousands = ['', 'одна тисяча', 'дві тисячі', 'три тисячі', 'чотири тисячі'];
    const thousandsPlural = 'тисяч';
    
    // Десятки тисяч
    const tenThousands = ['', 'десять', 'двадцять', 'тридцять', 'сорок', 'п\'ятдесят', 'шістдесят', 'сімдесят', 'вісімдесят', 'дев\'яносто'];
    
    const convertNumber = (num, isFeminine = false) => {
        if (num === 0) return 'нуль';
        
        let result = '';
        
        // Десятки тисяч (10000-99999)
        if (num >= 10000) {
            const tenThousandsDigit = Math.floor(num / 10000);
            const thousandsDigit = Math.floor((num % 10000) / 1000);
            
            if (tenThousandsDigit >= 1) {
                if (tenThousandsDigit === 1 && thousandsDigit >= 1) {
                    // 11000-19999
                    const teensThousands = Math.floor(num / 1000);
                    if (teensThousands >= 10 && teensThousands <= 19) {
                        result += teens[teensThousands - 10] + ' тисяч ';
                        num %= 1000;
                    } else {
                        result += tenThousands[tenThousandsDigit] + ' ';
                        num %= 10000;
                    }
                } else {
                    result += tenThousands[tenThousandsDigit] + ' ';
                    num %= 10000;
                }
            }
        }
        
        // Тисячі (1000-9999)
        if (num >= 1000) {
            const thousandsDigit = Math.floor(num / 1000);
            
            if (thousandsDigit === 1) {
                result += 'одна тисяча ';
            } else if (thousandsDigit === 2) {
                result += 'дві тисячі ';
            } else if (thousandsDigit === 3) {
                result += 'три тисячі ';
            } else if (thousandsDigit === 4) {
                result += 'чотири тисячі ';
            } else if (thousandsDigit >= 5 && thousandsDigit <= 9) {
                result += onesMale[thousandsDigit] + ' тисяч ';
            } else {
                // Для складніших випадків
                result += convertHundreds(thousandsDigit, false) + ' тисяч ';
            }
            
            num %= 1000;
        }
        
        // Сотні, десятки, одиниці
        result += convertHundreds(num, isFeminine);
        
        return result.trim();
    };
    
    const convertHundreds = (num, isFeminine = false) => {
        let result = '';
        const ones = isFeminine ? onesFemale : onesMale;
        
        // Сотні
        if (num >= 100) {
            result += hundreds[Math.floor(num / 100)] + ' ';
            num %= 100;
        }
        
        // Десятки та одиниці
        if (num >= 20) {
            result += tens[Math.floor(num / 10)] + ' ';
            num %= 10;
        } else if (num >= 10) {
            result += teens[num - 10] + ' ';
            num = 0;
        }
        
        // Одиниці
        if (num > 0) {
            result += ones[num] + ' ';
        }
        
        return result.trim();
    };
    
    // Використовуємо жіночий рід для гривень
    let grnText = convertNumber(grn, true);
    
    // Якщо результат порожній, встановлюємо 'нуль'
    if (!grnText || grnText === '') {
        grnText = 'нуль';
    }
    
    const kopText = kop.toString().padStart(2, '0');
    
    return `${grnText} грн. ${kopText} коп.`;
};


// Експортуємо нову функцію разом з існуючими
module.exports = {
    createRequisiteWord,
    createUtilitiesRequisiteWord,
    createTaxNotificationWord  // НОВА ФУНКЦІЯ
}







