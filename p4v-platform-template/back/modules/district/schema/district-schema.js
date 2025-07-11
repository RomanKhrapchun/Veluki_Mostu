
const districtInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    }
}

const districtFilterSchema = {
    body: {
        id: {
            type: 'string',
            numeric: true,
        },
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
    districtFilterSchema,
    districtInfoSchema,
}