
const utilitiesInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    }
}

const utilitiesFilterSchema = {
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
        identification: {
            type: 'string',
            optional: true,
            min: 1,
        },
    }
}

module.exports = {
    utilitiesFilterSchema,
    utilitiesInfoSchema,
}