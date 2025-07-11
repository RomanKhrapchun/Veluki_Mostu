const moduleFilterSchema = {
    body: {
        module_name: {
            type: 'string',
            min: 1,
            optional: true,
        },
    }
}

const moduleInfoSchema = {
    params: {
        moduleId: {
            type: 'string',
            numeric: true,
        },
    }
}

const createModuleSchema = {
    body: {
        module_name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        module: {
            type: 'string',
            min: 1,
            trim: true,
        },
        install_version: {
            type: 'string',
            min: 1,
            trim: true,
        },
        author: {
            type: 'string',
            trim: true,
            optional: true,
        },
        schema_name: {
            type: 'string',
            trim: true,
            optional: true,
        },
        info: {
            type: 'string',
            trim: true,
            optional: true,
        },
        enabled: {
            type: 'boolean',
        },
        module_status: {
            type: 'enum',
            values: ['stable', 'alpha', 'beta'],
            optional: true,
        },
        ord: [
            {
                type: 'string',
                numeric: true,
                min: 1,
                max: 100,
            },
            {
                type: 'number',
                min: 1,
                max: 100
            }
        ]
    }
}

const updateModuleSchema = {
    params: {
        moduleId: {
            type: 'string',
            numeric: true,
        },
    },
    body: {
        module_name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        module: {
            type: 'string',
            min: 1,
            trim: true,
        },
        install_version: {
            type: 'string',
            min: 1,
            trim: true,
        },
        author: {
            type: 'string',
            trim: true,
            optional: true,
        },
        schema_name: {
            type: 'string',
            trim: true,
            optional: true,
        },
        info: {
            type: 'string',
            trim: true,
            optional: true,
        },
        enabled: {
            type: 'boolean',
        },
        module_status: {
            type: 'enum',
            values: ['stable', 'alpha', 'beta'],
            optional: true,
        },
        ord: [
            {
                type: 'string',
                numeric: true,
                min: 1,
                max: 100,
            },
            {
                type: 'number',
                min: 1,
                max: 100
            }
        ]
    }
}

const registerFilterSchema = {
    body: {
        name: {
            type: 'string',
            min: 1,
            optional: true,
        },
    }
}

const registerInfoSchema = {
    params: {
        registryId: {
            type: 'string',
            numeric: true,
        },
    }
}

const createRegistrySchema = {
    body: {
        title: {
            type: 'string',
            min: 1,
            trim: true,
        },
        module: {
            type: 'string',
            min: 1,
            trim: true,
        },
        name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        info: {
            type: 'string',
            trim: true,
            optional: true,
        },
        enabled: {
            type: 'boolean',
        },
        ord: [
            {
                type: 'string',
                numeric: true,
                min: 1,
                max: 100,
            },
            {
                type: 'number',
                min: 1,
                max: 100
            }
        ]
    }
}

const updateRegistrySchema = {
    params: {
        registryId: {
            type: 'string',
            numeric: true,
        },
    },
    body: {
        title: {
            type: 'string',
            min: 1,
            trim: true,
        },
        module: {
            type: 'string',
            min: 1,
            trim: true,
        },
        name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        info: {
            type: 'string',
            trim: true,
            optional: true,
        },
        enabled: {
            type: 'boolean',
        },
        ord: [
            {
                type: 'string',
                numeric: true,
                min: 1,
                max: 100,
            },
            {
                type: 'number',
                min: 1,
                max: 100
            }
        ]
    }
}

module.exports = {
    moduleFilterSchema,
    registerFilterSchema,
    moduleInfoSchema,
    registerInfoSchema,
    createModuleSchema,
    createRegistrySchema,
    updateModuleSchema,
    updateRegistrySchema,
}