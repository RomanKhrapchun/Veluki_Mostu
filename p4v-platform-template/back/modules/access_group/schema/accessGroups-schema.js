const accessGroupFilterSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        title: {
            type: 'string',
            optional: true,
            min: 1,
        }
    }
}

const accessGroupInfoSchema = {
    params: {
        roleId: {
            type: 'string',
            numeric: true,
        },
    }
}

const createAccessGroupSchema = {
    body: {
        access_group_name: {
            type: 'string',
            min: 1,
            trim: true,
        },
        enabled: {
            type: 'boolean'
        },
        info: {
            type: 'string',
            min: 1,
            trim: true
        }
    }
}

const updateAccessGroupSchema = {
    params: {
        roleId: {
            type: 'string',
            numeric: true,
        },
    },
    body: {
        access_group_name: {
            type: 'string',
            min: 1,
            trim: true,
            optional: true,
        },
        enabled: {
            type: 'boolean',
            optional: true
        },
        info: {
            type: 'string',
            min: 1,
            trim: true,
            optional: true
        },
        permission: {
            type: 'object',
            optional: true
        }
    }
}

module.exports = {
    accessGroupFilterSchema,
    accessGroupInfoSchema,
    createAccessGroupSchema,
    updateAccessGroupSchema,
}