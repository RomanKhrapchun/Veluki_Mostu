
const debtChargesInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    }
}

const debtChargesFilterSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        title: {
            type: 'string',
            optional: true,
            min: 1,
        },
        tax_number: {
            type: 'string',
            optional: true,
            min: 1,
        },
        status: {
            type: 'string',
            optional: true,
        },
        tax_classifier: {
            type: 'string',
            optional: true,
        },
        amount_from: {
            type: 'number',
            optional: true,
        },
        amount_to: {
            type: 'number',
            optional: true,
        },
        date_from: {
            type: 'string',
            optional: true,
            format: 'date',
        },
        date_to: {
            type: 'string',
            optional: true,
            format: 'date',
        },
        sort_by: {
            type: 'string',
            optional: true,
        },
        sort_direction: {
            type: 'string',
            optional: true,
            enum: ['asc', 'desc'],
        },
    }
}

module.exports = {
    debtChargesFilterSchema,
    debtChargesInfoSchema,
};