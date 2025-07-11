
const { sqlRequest } = require("../../../helpers/database")

class RevenueRepository {
    // Account Plan methods
    async getAccountPlans(limit, offset, search) {
        const values = [];
        let sql = `SELECT json_agg(rw) as data, 
                  max(cnt) as count 
                  FROM (
                      SELECT json_build_object(
                          'id', id, 
                          'iban', iban, 
                          'classification_code', classification_code, 
                          'classification_name', classification_name, 
                          'coefficient', coefficient, 
                          'tax_type', tax_type,
                          'created_at', created_at,
                          'updated_at', updated_at
                      ) as rw,
                      count(*) over () as cnt
                      FROM revenue_analysis.plan_accounts
                      WHERE 1=1`;

        if (search) {
            sql += ` AND (iban ILIKE ? OR classification_code ILIKE ? OR classification_name ILIKE ?)`;
            values.push(`%${search}%`, `%${search}%`, `%${search}%`);
        }

        values.push(limit);
        values.push(offset);
        sql += ` ORDER BY id ASC LIMIT ? OFFSET ? ) q`;

        return await sqlRequest(sql, [...values]);
    }

    async getAccountPlanById(id) {
        const sql = `SELECT id, iban, classification_code, classification_name, coefficient, tax_type, 
                    created_at, updated_at 
                    FROM revenue_analysis.plan_accounts 
                    WHERE id = ?`;
        return await sqlRequest(sql, [id]);
    }
    async searchAccountPlansByIban(query) {
        // Видаляємо префікс UA, якщо є
        const normalizedQuery = query?.toLowerCase()?.replace(/^ua/, '');
    
        const sql = `
            SELECT id, iban, classification_code, classification_name, coefficient, tax_type, 
                   created_at, updated_at
            FROM revenue_analysis.plan_accounts
            WHERE LOWER(REPLACE(iban, 'UA', '')) LIKE ?
            ORDER BY iban ASC
            LIMIT 10
        `;
    
        return await sqlRequest(sql, [`%${normalizedQuery}%`]);
    }
    

    async createAccountPlan(data) {
        const sql = `INSERT INTO revenue_analysis.plan_accounts (iban, classification_code, classification_name, coefficient, tax_type) 
                    VALUES (?, ?, ?, ?, ?) 
                    RETURNING id`;
        return await sqlRequest(sql, [
            data.iban, 
            data.classification_code, 
            data.classification_name, 
            data.coefficient, 
            data.tax_type
        ]);
    }

    async updateAccountPlan(id, data) {
        const sql = `UPDATE revenue_analysis.plan_accounts 
                    SET iban = ?, classification_code = ?, classification_name = ?, 
                        coefficient = ?, tax_type = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ? 
                    RETURNING id`;
        return await sqlRequest(sql, [
            data.iban, 
            data.classification_code, 
            data.classification_name, 
            data.coefficient, 
            data.tax_type, 
            id
        ]);
    }

    async deleteAccountPlan(id) {
        const sql = `DELETE FROM revenue_analysis.plan_accounts WHERE id = ? RETURNING id`;
        return await sqlRequest(sql, [id]);
    }

    // Settlements methods
    async getSettlements(limit, offset, search) {
        const values = [];
        let sql = `SELECT json_agg(rw) as data, 
                  max(cnt) as count 
                  FROM (
                      SELECT json_build_object(
                          'id', s.id, 
                          'settlement_name', s.settlement_name, 
                          'district_id', s.district_id,
                          'district_name', d.district_name,
                          'created_at', s.created_at,
                          'updated_at', s.updated_at
                      ) as rw,
                      count(*) over () as cnt
                      FROM revenue_analysis.settlements s
                      JOIN revenue_analysis.districts d ON s.district_id = d.id
                      WHERE 1=1`;

        if (search) {
            sql += ` AND (s.settlement_name ILIKE ? OR d.district_name ILIKE ?)`;
            values.push(`%${search}%`, `%${search}%`);
        }

        values.push(limit);
        values.push(offset);
        sql += ` ORDER BY s.id ASC LIMIT ? OFFSET ? ) q`;

        return await sqlRequest(sql, [...values]);
    }

    async getSettlementById(id) {
        const sql = `SELECT s.id, s.settlement_name, s.district_id, d.district_name, 
                    s.created_at, s.updated_at 
                    FROM revenue_analysis.settlements s
                    JOIN revenue_analysis.districts d ON s.district_id = d.id
                    WHERE s.id = ?`;
        return await sqlRequest(sql, [id]);
    }
    async getSettlementsByDistrictId(id) {
        const sql = `SELECT s.id, s.settlement_name, s.district_id, d.district_name, 
                    s.created_at, s.updated_at 
                    FROM revenue_analysis.settlements s
                    JOIN revenue_analysis.districts d ON s.district_id = d.id
                    WHERE d.id = ?`;
        return await sqlRequest(sql, [id]);
    }

    async createSettlement(data) {
        const sql = `INSERT INTO revenue_analysis.settlements (settlement_name, district_id) 
                    VALUES (?, ?) 
                    RETURNING id`;
        return await sqlRequest(sql, [
            data.settlement_name, 
            data.district_id
        ]);
    }

    async updateSettlement(id, data) {
        const sql = `UPDATE revenue_analysis.settlements 
                    SET settlement_name = ?, district_id = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ? 
                    RETURNING id`;
        return await sqlRequest(sql, [
            data.settlement_name, 
            data.district_id, 
            id
        ]);
    }

    async deleteSettlement(id) {
        const sql = `DELETE FROM revenue_analysis.settlements WHERE id = ? RETURNING id`;
        return await sqlRequest(sql, [id]);
    }

    // Payer Types methods
    async getPayerTypes(limit, offset, search) {
        const values = [];
        let sql = `SELECT json_agg(rw) as data, 
                  max(cnt) as count 
                  FROM (
                      SELECT json_build_object(
                          'id', id, 
                          'type_name', type_name, 
                          'created_at', created_at,
                          'updated_at', updated_at
                      ) as rw,
                      count(*) over () as cnt
                      FROM revenue_analysis.payer_types
                      WHERE 1=1`;

        if (search) {
            sql += ` AND type_name ILIKE ?`;
            values.push(`%${search}%`);
        }

        values.push(limit);
        values.push(offset);
        sql += ` ORDER BY id ASC LIMIT ? OFFSET ? ) q`;

        return await sqlRequest(sql, [...values]);
    }

    async getPayerTypeById(id) {
        const sql = `SELECT id, type_name, created_at, updated_at 
                    FROM revenue_analysis.payer_types 
                    WHERE id = ?`;
        return await sqlRequest(sql, [id]);
    }

    async createPayerType(data) {
        const sql = `INSERT INTO revenue_analysis.payer_types (type_name) 
                    VALUES (?) 
                    RETURNING id`;
        return await sqlRequest(sql, [data.type_name]);
    }

    async updatePayerType(id, data) {
        const sql = `UPDATE revenue_analysis.payer_types 
                    SET type_name = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ? 
                    RETURNING id`;
        return await sqlRequest(sql, [data.type_name, id]);
    }

    async deletePayerType(id) {
        const sql = `DELETE FROM revenue_analysis.payer_types WHERE id = ? RETURNING id`;
        return await sqlRequest(sql, [id]);
    }

    // Payer Database methods
    async getPayerDatabase(limit, offset, search) {
        const values = [];
        let sql = `SELECT json_agg(rw) as data, 
                  max(cnt) as count 
                  FROM (
                      SELECT json_build_object(
                          'id', pb.id, 
                          'edrpou', pb.edrpou, 
                          'district_id', pb.district_id,
                          'district_name', d.district_name,
                          'settlement_id', pb.settlement_id,
                          'settlement_name', s.settlement_name,
                          'payer_type_id', pb.payer_type_id,
                          'payer_type', pt.type_name,
                          'payer_name', pb.payer_name,
                          'created_at', pb.created_at,
                          'updated_at', pb.updated_at
                      ) as rw,
                      count(*) over () as cnt
                      FROM revenue_analysis.payers_base pb
                      JOIN revenue_analysis.districts d ON pb.district_id = d.id
                      JOIN revenue_analysis.settlements s ON pb.settlement_id = s.id
                      JOIN revenue_analysis.payer_types pt ON pb.payer_type_id = pt.id
                      WHERE 1=1`;

        if (search) {
            sql += ` AND (pb.edrpou ILIKE ? OR pb.payer_name ILIKE ? OR d.district_name ILIKE ? OR s.settlement_name ILIKE ?)`;
            values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        values.push(limit);
        values.push(offset);
        sql += ` ORDER BY pb.id ASC LIMIT ? OFFSET ? ) q`;

        return await sqlRequest(sql, [...values]);
    }

    async getPayerDatabaseById(id) {
        const sql = `SELECT pb.id, pb.edrpou, pb.district_id, d.district_name, 
                    pb.settlement_id, s.settlement_name, pb.payer_type_id, pt.type_name,
                    pb.payer_name, pb.created_at, pb.updated_at 
                    FROM revenue_analysis.payers_base pb
                    JOIN revenue_analysis.districts d ON pb.district_id = d.id
                    JOIN revenue_analysis.settlements s ON pb.settlement_id = s.id
                    JOIN revenue_analysis.payer_types pt ON pb.payer_type_id = pt.id
                    WHERE pb.id = ?`;
        return await sqlRequest(sql, [id]);
    }

    async createPayerDatabase(data) {
        const sql = `INSERT INTO revenue_analysis.payers_base (edrpou, district_id, settlement_id, payer_type_id, payer_name) 
                    VALUES (?, ?, ?, ?, ?) 
                    RETURNING id`;
        return await sqlRequest(sql, [
            data.edrpou,
            data.district_id,
            data.settlement_id,
            data.payer_type_id,
            data.payer_name
        ]);
    }

    async updatePayerDatabase(id, data) {
        const sql = `UPDATE revenue_analysis.payers_base 
                    SET edrpou = ?, district_id = ?, settlement_id = ?, 
                        payer_type_id = ?, payer_name = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ? 
                    RETURNING id`;
        return await sqlRequest(sql, [
            data.edrpou,
            data.district_id,
            data.settlement_id,
            data.payer_type_id,
            data.payer_name,
            id
        ]);
    }

    async deletePayerDatabase(id) {
        const sql = `DELETE FROM revenue_analysis.payers_base WHERE id = ? RETURNING id`;
        return await sqlRequest(sql, [id]);
    }

    // Data Invoices methods
    async getDataInvoices(limit, offset, search) {
        const values = [];
        let sql = `SELECT json_agg(rw) as data, 
                  max(cnt) as count 
                  FROM (
                      SELECT json_build_object(
                          'id', di.id, 
                          'program_edrpou', di.program_edrpou,
                          'invoice_date', di.invoice_date,
                          'edrpou', di.edrpou,
                          'payer_name', di.payer_name,
                          'debit', di.debit,
                          'payment_purpose', di.payment_purpose,
                          'account', di.account,
                          'year', di.year,
                          'month', di.month,
                          'district_id', di.district_id,
                          'district_name', d.district_name,
                          'settlement_id', di.settlement_id,
                          'settlement_name', s.settlement_name,
                          'debit_check', di.debit_check,
                          'debit_with_coefficient', di.debit_with_coefficient,
                          'tax_code', di.tax_code,
                          'tax_name', di.tax_name,
                          'tax_type', di.tax_type,
                          'payer_type', di.payer_type,
                          'calculated_payer_name', di.calculated_payer_name,
                          'created_at', di.created_at,
                          'updated_at', di.updated_at
                      ) as rw,
                      count(*) over () as cnt
                      FROM revenue_analysis.data_invoices di
                      LEFT JOIN revenue_analysis.districts d ON di.district_id = d.id
                      LEFT JOIN revenue_analysis.settlements s ON di.settlement_id = s.id
                      WHERE 1=1`;

        if (search) {
            sql += ` AND (di.program_edrpou ILIKE ? OR di.calculated_payer_name ILIKE ?)`;
            values.push(`%${search}%`, `%${search}%`);
        }

        values.push(limit);
        values.push(offset);
        sql += ` ORDER BY di.id ASC LIMIT ? OFFSET ? ) q`;

        return await sqlRequest(sql, [...values]);
    }

    async getDataInvoiceById(id) {
        const sql = `SELECT di.*, d.district_name, s.settlement_name
                    FROM revenue_analysis.data_invoices di
                    LEFT JOIN revenue_analysis.districts d ON di.district_id = d.id
                    LEFT JOIN revenue_analysis.settlements s ON di.settlement_id = s.id
                    WHERE di.id = ?`;
        return await sqlRequest(sql, [id]);
    }

    async createDataInvoice(data) {
        // First, calculate the debit_with_coefficient using the coefficient from plan_accounts
        let debitWithCoefficient = null;
        if (data.account) {
            const accountResult = await sqlRequest(
                `SELECT coefficient FROM revenue_analysis.plan_accounts WHERE iban = ?`, 
                [data.account]
            );
            
            if (accountResult && accountResult.length > 0) {
                debitWithCoefficient = data.debit * accountResult[0].coefficient;
            }
        }

        const sql = `INSERT INTO revenue_analysis.data_invoices (
                        program_edrpou, invoice_date, edrpou, payer_name, debit, 
                        payment_purpose, account, year, month, district_id, settlement_id,
                        debit_with_coefficient, tax_code, tax_name, tax_type, payer_type, calculated_payer_name
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
                    RETURNING id`;

        // Determine the calculated_payer_name from payers_base if available
        let calculatedPayerName = data.payer_name || null;
        if (data.program_edrpou) {
            const payerResult = await sqlRequest(
                `SELECT payer_name FROM revenue_analysis.payers_base WHERE edrpou = ?`, 
                [data.program_edrpou]
            );
            
            if (payerResult && payerResult.length > 0) {
                calculatedPayerName = payerResult[0].payer_name;
            }
        }

        return await sqlRequest(sql, [
            data.program_edrpou,
            data.invoice_date,
            data.edrpou,
            data.payer_name,
            data.debit,
            data.payment_purpose,
            data.account,
            data.year,
            data.month,
            data.district_id,
            data.settlement_id,
            debitWithCoefficient,
            data.tax_code,
            data.tax_name,
            data.tax_type,
            data.payer_type,
            calculatedPayerName
        ]);
    }

    async updateDataInvoice(id, data) {
        // First, calculate the debit_with_coefficient using the coefficient from plan_accounts
        let debitWithCoefficient = null;
        if (data.account) {
            const accountResult = await sqlRequest(
                `SELECT coefficient FROM revenue_analysis.plan_accounts WHERE iban = ?`, 
                [data.account]
            );
            
            if (accountResult && accountResult.length > 0) {
                debitWithCoefficient = data.debit * accountResult[0].coefficient;
            }
        }

        // Determine the calculated_payer_name from payers_base if available
        let calculatedPayerName = data.payer_name || null;
        if (data.program_edrpou) {
            const payerResult = await sqlRequest(
                `SELECT payer_name FROM revenue_analysis.payers_base WHERE edrpou = ?`, 
                [data.program_edrpou]
            );
            
            if (payerResult && payerResult.length > 0) {
                calculatedPayerName = payerResult[0].payer_name;
            }
        }

        const sql = `UPDATE revenue_analysis.data_invoices 
                    SET program_edrpou = ?, invoice_date = ?, edrpou = ?, payer_name = ?, 
                        debit = ?, payment_purpose = ?, account = ?, year = ?, month = ?,
                        district_id = ?, settlement_id = ?, debit_with_coefficient = ?,
                        tax_code = ?, tax_name = ?, tax_type = ?, payer_type = ?,
                        calculated_payer_name = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE id = ? 
                    RETURNING id`;
        
        return await sqlRequest(sql, [
            data.program_edrpou,
            data.invoice_date,
            data.edrpou,
            data.payer_name,
            data.debit,
            data.payment_purpose,
            data.account,
            data.year,
            data.month,
            data.district_id,
            data.settlement_id,
            debitWithCoefficient,
            data.tax_code,
            data.tax_name,
            data.tax_type,
            data.payer_type,
            calculatedPayerName,
            id
        ]);
    }

    async deleteDataInvoice(id) {
        const sql = `DELETE FROM revenue_analysis.data_invoices WHERE id = ? RETURNING id`;
        return await sqlRequest(sql, [id]);
    }

    // Additional helper methods to get district data for dropdowns
    async getDistricts() {
        const sql = `SELECT id, district_name FROM revenue_analysis.districts ORDER BY district_name ASC`;
        return await sqlRequest(sql, []);
    }

    // Invoice Details methods
    async getInvoiceDetails(limit, offset, search) {
        const values = [];
        let sql = `SELECT json_agg(rw) as data, 
                  max(cnt) as count 
                  FROM (
                      SELECT json_build_object(
                          'id', id,
                          'program_edrpou', program_edrpou,
                          'invoice_date', invoice_date,
                          'edrpou', edrpou,
                          'payer_name', payer_name,
                          'debit', debit,
                          'payment_purpose', payment_purpose,
                          'account', account,
                          'year', year,
                          'month', month,
                          'district_id', district_id,
                          'settlement_id', settlement_id,
                          'debit_check', debit_check,
                          'debit_with_coefficient', debit_with_coefficient,
                          'tax_code', tax_code,
                          'tax_name', tax_name,
                          'tax_type', tax_type,
                          'payer_type', payer_type,
                          'calculated_payer_name', calculated_payer_name,
                          'district_name', district_name,
                          'settlement_name', settlement_name,
                          'classification_code', classification_code,
                          'classification_name', classification_name,
                          'coefficient', coefficient,
                          'account_tax_type', account_tax_type,
                          'registered_payer_name', registered_payer_name,
                          'registered_payer_type', registered_payer_type,
                          'created_at', created_at,
                          'updated_at', updated_at
                      ) as rw,
                      count(*) over () as cnt
                      FROM revenue_analysis.invoice_details
                      WHERE 1=1`;

        if (search) {
            sql += ` AND (program_edrpou ILIKE ? OR payer_name ILIKE ? OR district_name ILIKE ? OR settlement_name ILIKE ?)`;
            values.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
        }

        values.push(limit);
        values.push(offset);
        sql += ` ORDER BY id ASC LIMIT ? OFFSET ? ) q`;

        return await sqlRequest(sql, [...values]);
    }

    async getInvoiceDetailById(id) {
        const sql = `SELECT * FROM revenue_analysis.invoice_details WHERE id = ?`;
        return await sqlRequest(sql, [id]);
    }
}

module.exports = new RevenueRepository();
