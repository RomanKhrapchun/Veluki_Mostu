const filesArraySchema = {
    body: {
        file: [
            {
                type: 'object',
                props: {
                    encoding: { type: 'string' },
                    filename: { type: 'string', min: 1 },
                    mimetype: { type: 'string' }
                }
            },
            {
                type: 'array',
                items: {
                    type: 'object',
                    props: {
                        encoding: { type: 'string' },
                        filename: { type: 'string' },
                        mimetype: { type: 'string' }
                    }
                }
            },
        ],
        location: {
            type: 'object',
            props: {
                value: { type: 'string', min: 1, trim: true }
            }
        },
    }
}

const filesDeleteSchema = {
    params: {
        location: {
            type: 'string',
            numeric: true,
        },
        id: {
            type: 'string',
            trim: true,
            min: 1,
        },
    }
}

module.exports = {
    filesDeleteSchema,
    filesArraySchema,
}