
function info(message, meta) {
    log('info', message, meta);
}

function error(message, meta) {
    log('error', message, meta);
}

function log(level, message, meta) {
    const loggingFunction = level === 'error' ? console.error : console.log;

    loggingFunction(`<${level}> [${new Date().toISOString()}] ${message}`, meta);
}

module.exports = {
    log,
    info,
    error
}