
const { updateDataMissingError } = require("./messages");
const fs = require('fs')
const fsPromise = require('fs/promises')

const paginate = (page, limit) => {
    const offset = (page - 1) * limit;
    return { offset };
};

const paginationData = (result, page, limit) => {
    const { count, data } = result;
    const totalPages = Math.ceil(count / limit);
    return { totalItems: count, items: data, totalPages, currentPage: page };
};

const filterRequestBody = (requestBody) => {
    if (!Object.keys(requestBody).length) {
        throw new Error(updateDataMissingError);
    }
    return Object.keys(requestBody)
        .reduce((acc, key) => {
            let value = requestBody[key];
            if (typeof value === 'string' && value.trim() !== '') {
                value = value.replace(/\s\s+/g, ' ');
            }
            return { ...acc, [key]: value || typeof value === 'boolean' ? value : null };
        }, {});
}

const filterData = (object, array) => {
    const filteredObject = {};

    for (const key of array) {
        if (object.hasOwnProperty(key)) {
            filteredObject[key] = object[key];
        }
    }

    return filteredObject;
};

function isValidDate(dateString) {
    const regex_date = /^\d{4}\-\d{1,2}\-\d{1,2}$/;

    if (!regex_date.test(dateString)) {
        return false;
    }

    const parts = dateString.split("-");
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[0], 10);

    if (year < 1000 || year > 3000 || month == 0 || month > 12) {
        return false;
    }

    const monthLength = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

    if (year % 400 == 0 || (year % 100 != 0 && year % 4 == 0)) {
        monthLength[1] = 29;
    }

    return day > 0 && day <= monthLength[month - 1];
}

const debtCols = [
    'non_residential_debt',
    'residential_debt',
    'land_debt',
    'orenda_debt',
    'mpz',
];

const buildWhereCondition = (whereConditions) => {
    const values = []
    
    // Фільтруємо умови, щоб уникнути null значень
    const filteredConditions = Object.keys(whereConditions).filter(key => {
        return whereConditions[key] !== null && whereConditions[key] !== undefined;
    });

    // Якщо після фільтрації не залишилось умов, повертаємо порожню умову
    if (filteredConditions.length === 0) {
        return {
            text: '',
            value: [],
        };
    }

    const conditions = filteredConditions.map(key => {
        /* 🔹 ПОШУК ЗА ДІАПАЗОНОМ СУМ */
        if (key === 'debt_amount_min') {
            // Додаткова перевірка на null/undefined
            if (whereConditions[key] === null || whereConditions[key] === undefined) {
                return null; // Цей елемент буде відфільтрований пізніше
            }
            
            // Будуємо умову "сума всіх боргів >= мінімальне значення"
            // Вираз суми всіх боргів
            const sumExpression = `(COALESCE(non_residential_debt, 0) + COALESCE(residential_debt, 0) + COALESCE(land_debt, 0) + COALESCE(orenda_debt, 0) + COALESCE(mpz, 0))`;
            values.push(parseFloat(whereConditions[key]));
            return `${sumExpression} >= ?`;
        }
        
        if (key === 'debt_amount_max') {
            // Додаткова перевірка на null/undefined
            if (whereConditions[key] === null || whereConditions[key] === undefined) {
                return null; // Цей елемент буде відфільтрований пізніше
            }
            
            // Будуємо умову "сума всіх боргів <= максимальне значення"
            // Вираз суми всіх боргів
            const sumExpression = `(COALESCE(non_residential_debt, 0) + COALESCE(residential_debt, 0) + COALESCE(land_debt, 0) + COALESCE(orenda_debt, 0) + COALESCE(mpz, 0))`;
            values.push(parseFloat(whereConditions[key]));
            return `${sumExpression} <= ?`;
        }
        
        /* 🔹 НОВИЙ: Фільтрація за типом податку */
        if (key === 'tax_type') {
            // Перевіряємо чи значення валідне
            const validTaxTypes = ['mpz', 'residential_debt', 'non_residential_debt', 'land_debt', 'orenda_debt'];
            if (!validTaxTypes.includes(whereConditions[key])) {
                return null; // Якщо тип податку невалідний, ігноруємо
            }
            
            // Будуємо умову: показувати тільки записи з боргом по вибраному типу податку
            return `COALESCE(${whereConditions[key]}, 0) > 0`;
        }
        
        /* 🔹 НОВИЙ: Фільтрація тільки боржників */
        if (key === 'only_debtors') {
            // Якщо прапорець встановлений у true, показуємо тільки з боргами
            if (whereConditions[key] === true || whereConditions[key] === 'true') {
                const sumExpression = `(COALESCE(non_residential_debt, 0) + COALESCE(residential_debt, 0) + COALESCE(land_debt, 0) + COALESCE(orenda_debt, 0) + COALESCE(mpz, 0))`;
                return `${sumExpression} > 0`;
            }
            // Якщо false або не встановлений, не додаємо жодної умови
            return null;
        }
        
        /* 🔹 Стара реалізація для точної суми, залишаю для сумісності */
        if (key === 'debt_amount') {
            // Додаткова перевірка на null/undefined
            if (whereConditions[key] === null || whereConditions[key] === undefined) {
                return null; // Цей елемент буде відфільтрований пізніше
            }
            
            const search = `%${whereConditions[key]}%`;   // ➜ '%639%'
            // будуємо   col::text ILIKE ?  OR …
            const likeBlock = debtCols
                .map(col => `${col}::text ILIKE ?`)
                .join(' OR ');
            // треба стільки ж параметрів, скільки колонок
            values.push(...Array(debtCols.length).fill(search));
            return `(${likeBlock})`;
        }
        
        if (typeof whereConditions[key] === 'string' && whereConditions[key].includes(',')) {
            const splitData = whereConditions[key].split(',')
            values.push(splitData)
            return `${key} = any (array[?::text[]])`
        }
        else if (typeof whereConditions[key] === 'string' && whereConditions[key].includes('_')) {
            const [date1, date2] = whereConditions[key].split('_')
            values.push(date1, date2)
            return `${key} BETWEEN ? AND ?`
        }
        else {
            values.push(whereConditions[key])
            return `${key} = ?`
        }
    }).filter(condition => condition !== null); // Фільтруємо null умови
    
    // Перевіряємо, чи залишились умови після обробки
    if (conditions.length === 0) {
        return {
            text: '',
            value: [],
        };
    }
    
    return {
        text: ' and ' + conditions.join(' and '),
        value: values,
    }
}


const isOpenFile = (path) => {
    return new Promise((resolve, reject) => {
        fs.stat(path, (err, stat) => {
            if (err) {
                resolve(false)
            }
            resolve(true)
        })
    })
}

const removeFolder = async (path) => {
    try {
        await fsPromise.access(path)
        await fsPromise.rm(path, { recursive: true, force: true })
        return true
    }
    catch (e) {
        return false
    }
}

const formatDate = (date) => {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
}


const removeAfterLastSlash = (str) => {
    const lastSlashIndex = str?.lastIndexOf('/');
    return lastSlashIndex > -1 ? 
        str?.substring(0, lastSlashIndex) : str;
}

const addRequisiteToLandDebt = (body, requisite) => {
    const land_debt = [];

    // Перевіряємо вхідні дані
    if (!body || !requisite) {
        console.error("❌ addRequisiteToLandDebt: відсутні вхідні дані", { body, requisite });
        return [];
    }

    const addDebtInfo = (debtText, requisiteText, recipientName, edrpou, account, code, amount) => {
        // Створюємо новий формат для відображення реквізитів в одному рядку - ТІЛЬКИ для податків
        const cleanRecipientName = removeAfterLastSlash(recipientName || 'Невідомий отримувач');
        const recipientInfo = `${cleanRecipientName}, ${edrpou || 'невідомо'}, ${account || 'невідомо'}`;
        
        const debtItem = {
            debtText: debtText || 'Невідома заборгованість',
            requisiteText: requisiteText || 'Реквізити для оплати',
            amount: amount || 0,
            budgetCode: code || 'невідомо', // Додаємо код класифікації
            recipientInfo, // Новий формат - все в одному рядку для податків
            table: [
                {
                    label: "Отримувач",
                    value: cleanRecipientName,
                },
                {
                    label: "Код отримувача (ЄДРПОУ)",
                    value: edrpou || 'невідомо',
                },
                {
                    label: "Банк отримувача",
                    value: 'Казначейство України',
                },
                {
                    label: "Номер рахунку (IBAN)",
                    value: account || 'невідомо',
                },
                {
                    label: "Код класифікації доходів бюджету",
                    value: code || 'невідомо',
                }
            ]
        };

        land_debt.push([debtItem]);
        console.log("📌 Додано debt item:", debtItem);
    };

    try {
        if (body?.non_residential_debt > 0) {
            addDebtInfo(
                `Заборгованість зі сплати податку на нерухоме майно, відмінне від земельної ділянки, сплаченого фізичними особами, які є власниками об'єктів нежитлової нерухомості в сумі ${body.non_residential_debt} грн.`,
                "Реквізити для оплати :",
                requisite.non_residential_debt_recipientname,
                requisite.non_residential_debt_edrpou,
                requisite.non_residential_debt_account,
                '18010300',
                body.non_residential_debt);
        }

        if (body?.residential_debt > 0) {
            addDebtInfo(
                `Заборгованість зі сплати податку на нерухоме майно, відмінне від земельної ділянки, сплачений фізичними особами, які є власниками об'єктів житлової нерухомості в сумі ${body.residential_debt} грн.`,
                "Реквізити для оплати :",
                requisite.residential_debt_recipientname,
                requisite.residential_debt_edrpou,
                requisite.residential_debt_account,
                '18010200',
                body.residential_debt);
        }

        if (body?.land_debt > 0) {
            // Формуємо текст заборгованості БЕЗ податкової адреси (адреса буде додана окремо)
            let debtText = `Заборгованість зі сплати земельному податку з фізичних осіб в сумі ${body.land_debt} грн`;
            
            // Додаємо податкову адресу до окремого рядка якщо вона є
            if (body.tax_address && body.tax_address.trim() !== '') {
                debtText += `. Податкова адреса платника: ${body.tax_address}`;
            } else {
                debtText += '.';
            }
            
            addDebtInfo(
                debtText,
                "Реквізити для оплати :",
                requisite.land_debt_recipientname,
                requisite.land_debt_edrpou,
                requisite.land_debt_account,
                '18010700',
                body.land_debt);
        }

        if (body?.orenda_debt > 0) {
            addDebtInfo(
                `Заборгованість зі сплати оренді землі з фізичних осіб в сумі ${body.orenda_debt} грн.`,
                "Реквізити для оплати :",
                requisite.orenda_debt_recipientname,
                requisite.orenda_debt_edrpou,
                requisite.orenda_debt_account,
                '18010900',
                body.orenda_debt);
        }

        if (body?.mpz > 0) {
            addDebtInfo(
                `Заборгованість зі сплати мінімальньому податковому забов'язанню з фізичних осіб в сумі ${body.mpz} грн.`,
                "Реквізити для оплати :",
                requisite.mpz_recipientname,
                requisite.mpz_edrpou,
                requisite.mpz_account,
                '11011300',
                body.mpz);
        }

        console.log("📌 addRequisiteToLandDebt result:", land_debt);
        return land_debt;
    } catch (error) {
        console.error("❌ Помилка в addRequisiteToLandDebt:", error);
        return [];
    }
};

// Залишаю інші функції БЕЗ ЗМІН - вони не стосуються debtor податків
const addRequisiteToWaterDebt = (body, requisite) => {
    const water_debt = [];

    console.log("📌 Вхідні дані у addRequisiteToWaterDebt:", body);

    // Перевіряємо, чи є борг взагалі
    if (!body?.charge || isNaN(body.charge) || parseFloat(body.charge) <= 0) {
        console.warn("⚠️ Немає боргу або сума некоректна:", body?.charge);
        return []; // Повертаємо порожній масив, щоб уникнути помилок
    }

    const addDebtInfo = (debtText, requisiteText, recipientName, edrpou, account, purpose) => {
        water_debt.push({
            debtText,
            requisiteText,
            table: [
                { label: "Отримувач", value: recipientName },
                { label: "Код отримувача (ЄДРПОУ)", value: edrpou },
                { label: "Банк отримувача", value: requisite.file || "Казначейство України" },
                { label: "Номер рахунку (IBAN)", value: account },
                { label: "Призначення платежу", value: purpose },
            ],
        });
    };
    
    console.log("🛠 Перевірка типу послуги:", body?.service);

    if (body?.service === "ТПВ") {
        // Формування призначення платежу для ТПВ
        purposeText = `За поводження з ТПВ. ${body.payerident}, ${body.adress}, ${body.fio}`;
        addDebtInfo(
            `Заборгованість зі оплати комунальних послуг (ТПВ) в сумі ${body.charge} грн.`,
            "Реквізити для оплати:",
            requisite.water_recipientname,
            requisite.water_edrpou,
            requisite.water_account,
            purposeText
        );
    } else if (body?.service === "Квартирна плата") {
        // Розбираємо адресу на складові
        const [city, street, house, apartment] = body.adress.split(',').map(item => item.trim());

        // Формування призначення платежу для квартирної плати
        purposeText = `Оплата комунальних послуг ${body.fio}, ${house}, ${apartment} (квартплата - ${body.charge} грн)`;

        addDebtInfo(
            `Заборгованість зі оплати комунальних послуг (Квартирна плата) в сумі ${body.charge} грн.`,
            "Реквізити для оплати:",
            requisite.water_recipientname,
            requisite.water_edrpou,
            requisite.water_account,
            purposeText
        );
    } else {
        // Для інших послуг (якщо з'являться)
        purposeText = `Оплата послуг ${body.service}. ${body.fio}, ${body.adress} (сума - ${body.charge} грн)`;

        addDebtInfo(
            `Заборгованість зі оплати комунальних послуг (${body.service}) в сумі ${body.charge} грн.`,
            "Реквізити для оплати:",
            requisite.water_recipientname,
            requisite.water_edrpou,
            requisite.water_account,
            purposeText
        );
    }

    console.log("📌 Повний вміст water_debt:", JSON.stringify(water_debt, null, 2));
    console.log("📌 Чи є result масивом?", Array.isArray(water_debt));
    return water_debt;
};

const addRequisiteToAdminServiceDebt = (account, service) => {
    const admin_service_debt = [];

    const addDebtInfo = (debtText, requisiteText, serviceName, edrpou, iban, code, account_number) => {
        admin_service_debt.push([
            {
                debtText,
                requisiteText,
                table: [
                    { label: "Номер рахунку", value: account_number },
                    { label: "Послуга", value: serviceName },
                    { label: "Код отримувача (ЄДРПОУ)", value: edrpou },
                    { label: "Номер рахунку (IBAN)", value: iban },
                    { label: "Код класифікації доходів бюджету", value: code }
                ]
            }
        ]);
    };

    if (account.amount > 0) {
        addDebtInfo(
            `Заборгованість по адміністративній послузі "${service.name}" в сумі ${account.amount} грн.`,
            "Реквізити для оплати:",
            service.name,
            service.edrpou,
            service.iban,
            service.identifier,
            account.account_number
        );
    }

    return admin_service_debt;
};

const validateSortParams = (sortBy, sortDirection) => {
    const { allowedSortFields, validateSortDirection } = require('./constants');
    
    const validSortBy = allowedSortFields.includes(sortBy) ? sortBy : 'id';
    const validSortDirection = validateSortDirection.includes(sortDirection) ? sortDirection : 'asc';
    
    return { validSortBy, validSortDirection };
};

const buildOrderByClause = (sortBy, sortDirection) => {
    const { getSafeSortField, validateSortDirection } = require('./constants');
    
    const safeSortField = getSafeSortField(sortBy);
    const safeSortDirection = validateSortDirection(sortDirection);
    
    let orderClause = '';
    
    if (sortBy === 'total_debt') {
        // Сортування по обчисленому полю
        orderClause = `ORDER BY (COALESCE(non_residential_debt, 0) + COALESCE(residential_debt, 0) + COALESCE(land_debt, 0) + COALESCE(orenda_debt, 0) + COALESCE(mpz, 0)) ${safeSortDirection.toUpperCase()}`;
    } else if (sortBy === 'name') {
        // Сортування по імені без урахування регістру
        orderClause = `ORDER BY LOWER(name) ${safeSortDirection.toUpperCase()}`;
    } else {
        // Стандартне сортування
        orderClause = `ORDER BY ${safeSortField} ${safeSortDirection.toUpperCase()}`;
    }
    
    // Додаємо вторинне сортування для стабільності
    if (sortBy !== 'id') {
        orderClause += `, id ${safeSortDirection.toUpperCase()}`;
    }
    
    return orderClause;
};
const logSortingParams = (sortBy, sortDirection) => {
    console.log(`🔄 Sorting params: field="${sortBy}", direction="${sortDirection}"`);
};

module.exports = {
    paginate,
    paginationData,
    filterRequestBody,
    filterData,
    isValidDate,
    buildWhereCondition,
    debtCols,
    validateSortParams,
    buildOrderByClause,
    logSortingParams,
    isOpenFile,
    removeFolder,
    formatDate,
    removeAfterLastSlash,
    addRequisiteToLandDebt,
    addRequisiteToWaterDebt,
    addRequisiteToAdminServiceDebt
}

