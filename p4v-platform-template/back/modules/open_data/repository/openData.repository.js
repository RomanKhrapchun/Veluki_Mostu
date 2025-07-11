const { sqlRequest } = require('../../../helpers/database');
const Logger = require('../../../utils/logger');

const tableMapping = {
    '1.1': 'nd_1_1_enterprise',
    '1.2':'nd_1_2_organizational_units',
    '1.3':'nd_1_3_executive_committee_staff',
     '3':'nd_3_normative_documents',
    '43': 'nd_43_1_kv_oblik',
     
    // Add more mappings as needed
};

function toCamel(str) {
    return str.replace(/_([a-z])/g, (match, letter) => letter.toUpperCase());
}

function keysToCamel(obj) {
    if (Array.isArray(obj)) {
        return obj.map(v => keysToCamel(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            acc[toCamel(key)] = keysToCamel(obj[key]);
            return acc;
        }, {});
    }
    return obj;
}

class OpenDataRepository {

    async fetchOpenData(filter) {
        const offset = (filter.page - 1) * filter.limit;
        
        const query = `
            SELECT *
            FROM open_data."43.1_kv_oblik"
            ORDER BY recordDecisionDate DESC
            LIMIT $1 OFFSET $2
        `;
        const countQuery = `
            SELECT COUNT(*) as total
            FROM open_data."43.1_kv_oblik"
        `;
        
        const [items, count] = await Promise.all([
            sqlRequest(query, [filter.limit, offset]),
            sqlRequest(countQuery)
        ]);
        
        return {
            items,
            totalItems: parseInt(count[0].total)
        };
    }

    async getOpenDataById(tableId,id) {
        const tableName = tableMapping[tableId];
        if (!tableName) {
            throw new Error('Table not found');
        }

        const query = `
            SELECT *
            FROM open_data."${tableName}"
            WHERE id = $1
        `;
        const result = await sqlRequest(query, [id]);
        return result[0];
    }
    async getOpenDatas() {
        const query = `
            SELECT *
            FROM open_data."43.1_kv_oblik"
        `;
        const result = await sqlRequest(query);
        return result;
    }

    async createOpenData(openData) {
        const query = `
            WITH inserted AS (
                INSERT INTO open_data."43.1_kv_oblik" 
                    (familyName, Name, additionalName, familyStructure, recordDecisionDate)
                VALUES 
                    ($1, $2, $3, $4, $5)
                RETURNING id, familyName, Name
            )
        `;
        const result = await sqlRequest(query, [openData.familyName, openData.Name, openData.additionalName, openData.familyStructure, openData.recordDecisionDate]);
        return result;
    }

    async fetchAllFromTable(tableId) {
        const tableName = tableMapping[tableId];
        if (!tableName) {
            throw new Error('Table not found');
        }

        const query = `
            SELECT *
            FROM open_data."${tableName}"
        `;
        const result = await sqlRequest(query);
	return keysToCamel(result);
    }

    async updateOpenData(tableId, id, openData) {
        const tableName = tableMapping[tableId];
        if (!tableName) {
            throw new Error('Table not found');
        }

        const query = `
        UPDATE open_data."${tableName}"
        SET 
            "familyName" = $1, 
            "Name" = $2, 
            "additionalName" = $3, 
            "familyStructure" = $4, 
            "recordDecisionDate" = $5,
            "recordDecisionNumber" = $6,
            "decisionDate" = $7,
            "priorityDecisionDate" = $8,
            "priorityDecisionNumber" = $9,
            "provisionDecisionDate" = $10,
            "provisionDecisionNumber" = $11,
            "exclusionDecisionDate" = $12,
            "exclusionDecisionNumber" = $13
        WHERE "id" = $14
        RETURNING *;
    `;

    // Тепер передаємо ВСІ 14 значень у тому ж порядку:
    const result = await sqlRequest(query, [
        openData.familyName,            // $1
        openData.Name,                  // $2
        openData.additionalName,        // $3
        openData.familyStructure,       // $4
        openData.recordDecisionDate,    // $5
        openData.recordDecisionNumber,  // $6
        openData.decisionDate,          // $7
        openData.priorityDecisionDate,  // $8
        openData.priorityDecisionNumber,// $9
        openData.provisionDecisionDate, // $10
        openData.provisionDecisionNumber,// $11
        openData.exclusionDecisionDate, // $12
        openData.exclusionDecisionNumber,// $13
        id                              // $14
    ]);

    return result[0];
}
}

module.exports = new OpenDataRepository();
