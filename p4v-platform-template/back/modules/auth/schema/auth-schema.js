const loginSchema = {
    body: {
        username: {
            type: 'string',
            trim: true,
            min: 1,
        },
        password: {
            type: 'string',
            min: 1,
        },
    }
}

module.exports = loginSchema;