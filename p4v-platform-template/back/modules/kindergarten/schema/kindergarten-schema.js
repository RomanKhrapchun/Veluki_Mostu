
const kindergartenInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    }
}

const kindergartenFilterSchema = {
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
        child_name: {
            type: 'string',
            optional: true,
            min: 1,
        },
    }
}

module.exports = {
    kindergartenFilterSchema,
    kindergartenInfoSchema,
}