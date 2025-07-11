// файл: back/modules/sportcomplex/schema/sportscomplex-schema.js

// Схема для отримання інформації за ID
const requisiteInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    }
}

// Схема для фільтрації реквізитів
const filterRequisitesSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        limit: {
            type: 'number',
            optional: true,
        },
        kved: {
            type: 'string',
            optional: true,
        },
        iban: {
            type: 'string',
            optional: true,
        },
        edrpou: {
            type: 'string',
            optional: true,
        }
    }
}

// Схема для фільтрації послуг басейну
const filterPoolServicesSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        limit: {
            type: 'number',
            optional: true,
        },
        name: {
            type: 'string',
            optional: true,
        },
        unit: {
            type: 'string',
            optional: true,
        }
    }
}

// Схема для створення послуги
const createServiceSchema = {
    body: {
        name: {
            type: 'string',
            min: 1,
        },
        unit: {
            type: 'string',
            min: 1,
        },
        price: {
            type: 'number',
            min: 0,
        },
        service_group_id: {
            type: 'number',
            numeric: true,
        }
    }
}

// Схема для створення реквізитів
const createRequisiteSchema = {
    body: {
        kved: {
            type: 'string',
            min: 1,
        },
        iban: {
            type: 'string',
            min: 1,
        },
        edrpou: {
            type: 'string',
            min: 1,
        },
        service_group_id: {
            type: 'number',
            numeric: true,
        }
    }
}

// Схема для фільтрації рахунків
const filterBillsSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        limit: {
            type: 'number',
            optional: true,
        },
        account_number: {
            type: 'string',
            optional: true,
        },
        payer: {
            type: 'string',
            optional: true,
        },
        status: {
            type: 'string',
            optional: true,
        }
    }
}

// Схема для створення рахунку
const createBillSchema = {
    body: {
        account_number: {
            type: 'string',
            min: 1,
        },
        payer: {
            type: 'string',
            min: 1,
        },
        service_id: {
            type: 'number',
            numeric: true,
        },
        quantity: {
            type: 'number',
            min: 1,
        },
        status: {
            type: 'string',
            min: 1,
        }
    }
    
}

// Схема для створення групи послуг
const createServiceGroupSchema = {
    body: {
        name: {
            type: 'string',
            minLength: 1,
        }
    }
}

// Схема для отримання групи послуг за ID
const getServiceGroupSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    }
}

// Схема для оновлення реквізитів
const updateRequisiteSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    },
    body: {
        kved: {
            type: 'string',
            min: 1,
        },
        iban: {
            type: 'string',
            min: 1,
        },
        edrpou: {
            type: 'string',
            min: 1,
        },
        service_group_id: {
            type: 'number',
            numeric: true,
        }
    }
}

const updateServiceSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        }
    },
    body: {
        name: {
            type: 'string',
            min: 1,
        },
        unit: {
            type: 'string',
            min: 1,
        },
        price: {
            type: 'number',
            minimum: 0,
        },
        service_group_id: {
            type: 'number',
            numeric: true,
        }
    }
}

module.exports = {
    filterRequisitesSchema,
    filterPoolServicesSchema,
    requisiteInfoSchema,
    createServiceSchema,
    createRequisiteSchema,
    filterBillsSchema,
    createBillSchema,
    createServiceGroupSchema,
    getServiceGroupSchema,
    updateRequisiteSchema,
    updateServiceSchema 
}