const { Pool } = require('pg')
const Logger = require('../utils/logger')
const { databaseErrorMessage, groupDeleteError, moduleDeleteError } = require('../utils/messages')
const pool = new Pool({
    min: 0,
    max: 30,
    application_name: "Backend Servise",
    host: process.env.DB_HOST,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    idleTimeoutMillis: 5000,
})

pool.on("error", (err, client) => {
    Logger.error(err.message)
})

sqlRequest = async (sqlText = '', params) => {
    try {
        const start = new Date()
        let placeholders = 0;
        let replacedText = sqlText.replace(/\?/g, () => {
            placeholders++;
            return '$' + placeholders;
        });
        //console.log("formattedSql= ", replacedText)
        //console.log("params: ", params)
        const result = await pool.query(replacedText, params)
        //console.log(`Query time: ${new Date() - start} ms`)
        if (result) return result.rows
    } catch (e) {

        if (e.code === "23503" && e.schema === 'admin' && e.table === 'users' && e.constraint === 'fk_group') {
            throw new Error(groupDeleteError)
        }

        if (e.code === "23503" && e.schema === 'admin' && e.table === 'doc_template' && e.constraint === 'fk_module') {
            throw new Error(moduleDeleteError)
        }

        if (e.code === "23505") {
            const match = e.detail.match(/\((.*?)\)=\((.*?)\)/);
            throw new Error(`"${match[2]}" вже існує.`)
        }

        Logger.error(e.message, {})
        throw new Error(databaseErrorMessage);
    }
}

const tx = async (callback) => {
    const client = await pool.connect();

    try {
        await client.query('BEGIN');
        try {
            await callback(client);
            await client.query('COMMIT');
            return true;
        } catch (e) {
            Logger.error(e.message, {})
            await client.query('ROLLBACK');
            throw new Error(databaseErrorMessage);
        }
    } finally {
        client.release();
    }
};

module.exports = {
    sqlRequest,
    tx,
    pool,
}
