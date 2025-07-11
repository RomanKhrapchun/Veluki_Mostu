
const updateLimit = {
    rateLimit: {
        max: 10,
        timeWindow: '1 minute'
    }
}

const insertLimit = {
    rateLimit: {
        max: 10,
        timeWindow: '1 minute'
    }
}

const viewLimit = {
    rateLimit: {
        max: 15,
        timeWindow: '1 minute'
    }
}

const deleteLimit = {
    rateLimit: {
        max: 10,
        timeWindow: '1 minute'
    }
}

const fileLimit = {
    rateLimit: {
        max: 10,
        timeWindow: '1 minute'
    }
}

const loginLimit = {
    rateLimit: {
        max: 7,
        timeWindow: '1 minute'
    }
}

module.exports = {
    insertLimit,
    updateLimit,
    viewLimit,
    deleteLimit,
    fileLimit,
    loginLimit,
}