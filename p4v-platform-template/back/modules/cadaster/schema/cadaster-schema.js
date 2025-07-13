const cadasterFilterSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        limit: {
            type: 'number',
            optional: true,
        },
        search: {
            type: 'string',
            optional: true,
            min: 1,
        },
    }
}

const cadasterInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    }
}

const createCadasterSchema = {
    body: {
        payer_name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        payer_address: {
            type: 'string',
            min: 1,
            trim: true,
        },
        iban: {
            type: 'string',
            min: 1,
            trim: true,
            pattern: /^UA\d{27}$/,
        },
        plot_area: {
            type: 'number',
            positive: true,
        },
        land_tax: {
            type: 'number',
            positive: true,
        },
        tax_address: {
            type: 'string',
            min: 1,
            trim: true,
        },
        cadastral_number: {
            type: 'string',
            min: 1,
            trim: true,
        },
    }
}

const updateCadasterSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    },
    body: {
        payer_name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        payer_address: {
            type: 'string',
            min: 1,
            trim: true,
        },
        iban: {
            type: 'string',
            min: 1,
            trim: true,
            pattern: /^UA\d{27}$/,
        },
        plot_area: {
            type: 'number',
            positive: true,
        },
        land_tax: {
            type: 'number',
            positive: true,
        },
        tax_address: {
            type: 'string',
            min: 1,
            trim: true,
        },
        cadastral_number: {
            type: 'string',
            min: 1,
            trim: true,
        },
    }
}

module.exports = {
    cadasterFilterSchema,
    cadasterInfoSchema,
    createCadasterSchema,
    updateCadasterSchema,
};