const { phoneReg, passwordReg } = require("../../../utils/constants")

const profileSchema = {
    body: {
        email: {
            type: 'email',
        },
        first_name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        last_name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        middle_name: {
            type: 'string',
            trim: true,
            optional: true,
        },
        password: {
            type: 'custom',
            optional: true,
            check(value, errors, schema) {
                if (value !== '' && !passwordReg.test(value)) errors.push({ type: "password" })
                return value
            }
        },
        is_active: {
            type: 'boolean',
            optional: true,
        },
        phone: {
            type: 'custom',
            optional: true,
            check(value, errors, schema) {
                if (value !== '' && !phoneReg.test(value)) errors.push({ type: "phone" })
                return value
            }
        }
    }
}

const userInfoSchema = {
    params: {
        id: {
            type: 'string',
            numeric: true,
        },
    }
}

const userFilterSchema = {
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
        is_active: {
            type: 'boolean',
            optional: true,
        },
        is_blocked: {
            type: 'boolean',
            optional: true,
        },
    }
}

const createUserSchema = {
    body: {
        username: {
            type: 'string',
            min: 6,
            max: 30,
            trim: true,
        },
        password: {
            type: 'string',
            pattern: passwordReg,
        },
        email: {
            type: 'email',
        },
        access_group: {
            type: 'string',
            numeric: true,
        },
        first_name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        last_name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        middle_name: {
            type: 'string',
            trim: true,
            optional: true,
        },
        is_active: {
            type: 'boolean',
            optional: true,
        },
        phone: {
            type: 'custom',
            optional: true,
            check(value, errors, schema) {
                if (value !== '' && !phoneReg.test(value)) errors.push({ type: "phone" })
                return value
            }
        }
    }
}

const updateUserSchema = {
    params: {
        userId: {
            type: 'string',
            numeric: true,
        },
    },
    body: {
        username: {
            type: 'string',
            min: 6,
            max: 30,
            trim: true,
        },
        password: {
            type: 'custom',
            optional: true,
            check(value, errors, schema) {
                if (value !== '' && !passwordReg.test(value)) errors.push({ type: "password" })
                return value
            }
        },
        email: {
            type: 'email',
        },
        access_group: {
            type: 'string',
            numeric: true,
        },
        first_name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        last_name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        middle_name: {
            type: 'string',
            trim: true,
            optional: true,
        },
        is_active: {
            type: 'boolean',
            optional: true,
        },
        is_blocked: {
            type: 'boolean',
            optional: true,
        },
        phone: {
            type: 'custom',
            optional: true,
            check(value, errors, schema) {
                if (value !== '' && !phoneReg.test(value)) errors.push({ type: "phone" })
                return value
            }
        }
    }
}

module.exports = {
    profileSchema,
    userInfoSchema,
    userFilterSchema,
    createUserSchema,
    updateUserSchema,
}