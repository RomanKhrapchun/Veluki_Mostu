// Доповнення до існуючого файлу cadaster-schema.js
// ПЕРЕВІРИТИ чи ваша схема cadasterFilterSchema включає всі поля для фільтрування

const cadasterFilterSchema = {
    schema: {
        body: {
            type: 'object',
            properties: {
                page: {
                    type: 'number',
                    minimum: 1
                },
                limit: {
                    type: 'number',
                    minimum: 1
                },
                search: {
                    type: 'string',
                    minLength: 1
                },
                // ВАЖЛИВО: переконайтеся що всі ці поля є у вашій схемі:
                payer_name: {
                    type: 'string'
                },
                payer_address: {
                    type: 'string'
                },
                tax_address: {            // НОВЕ ПОЛЕ - додати якщо немає
                    type: 'string'
                },
                cadastral_number: {
                    type: 'string'
                },
                iban: {
                    type: 'string'
                },
                // Додаткові поля для сортування:
                sort_by: {
                    type: 'string'
                },
                sort_direction: {
                    type: 'string',
                    enum: ['asc', 'desc']
                }
            }
        }
    }
}

// Якщо у вас немає цих схем, додайте їх:
const cadasterInfoSchema = {
    schema: {
        params: {
            type: 'object',
            required: ['id'],
            properties: {
                id: {
                    type: 'string',
                    pattern: '^[0-9]+$'
                }
            }
        }
    }
}

const createCadasterSchema = {
    schema: {
        body: {
            type: 'object',
            required: ['payer_name', 'payer_address', 'iban', 'plot_area', 'land_tax', 'tax_address', 'cadastral_number'],
            properties: {
                payer_name: {
                    type: 'string',
                    minLength: 1
                },
                payer_address: {
                    type: 'string',
                    minLength: 1
                },
                iban: {
                    type: 'string',
                    pattern: '^UA\\d{27}$'
                },
                plot_area: {
                    type: 'number',
                    minimum: 0.01
                },
                land_tax: {
                    type: 'number',
                    minimum: 0.01
                },
                tax_address: {
                    type: 'string',
                    minLength: 1
                },
                cadastral_number: {
                    type: 'string',
                    minLength: 1
                }
            }
        }
    }
}

const updateCadasterSchema = {
    schema: {
        params: {
            type: 'object',
            required: ['id'],
            properties: {
                id: {
                    type: 'string',
                    pattern: '^[0-9]+$'
                }
            }
        },
        body: {
            type: 'object',
            required: ['payer_name', 'payer_address', 'iban', 'plot_area', 'land_tax', 'tax_address', 'cadastral_number'],
            properties: {
                payer_name: {
                    type: 'string',
                    minLength: 1
                },
                payer_address: {
                    type: 'string',
                    minLength: 1
                },
                iban: {
                    type: 'string',
                    pattern: '^UA\\d{27}$'
                },
                plot_area: {
                    type: 'number',
                    minimum: 0.01
                },
                land_tax: {
                    type: 'number',
                    minimum: 0.01
                },
                tax_address: {
                    type: 'string',
                    minLength: 1
                },
                cadastral_number: {
                    type: 'string',
                    minLength: 1
                }
            }
        }
    }
}

module.exports = {
    cadasterFilterSchema,
    cadasterInfoSchema,
    createCadasterSchema,
    updateCadasterSchema,
};