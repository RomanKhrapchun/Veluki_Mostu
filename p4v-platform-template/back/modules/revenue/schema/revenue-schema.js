
const filterSchema = {
    body: {
        page: {
            type: 'number',
            optional: true,
        },
        limit: {
            type: 'number',
            optional: true,
        },
        search: {
            type: 'string',
            optional: true,
        }
    }
}

const accountPlanSchema = {
    body: {
        iban: {
            type: 'string',
            length: 34,
        },
        classification_code: {
            type: 'string',
            max: 8,
        },
        classification_name: {
            type: 'string',
            max: 255,
        },
        coefficient: {
            type: 'number',
            positive: true,
        },
        tax_type: {
            type: 'string',
            max: 50,
        }
    }
}
const accountPlanSearchSchema = {
    params: {
        account: {
            type: 'string',
            length: 34,
        }
    }
}

const accountPlanIdSchema = {
    params: {
        id: {
            type: 'number',
            convert: true,
        }
    }
}

const settlementsSchema = {
    body: {
        settlement_name: {
            type: 'string',
            max: 100,
        },
        district_id: {
            type: 'number',
            positive: true,
        }
    }
}

const settlementsIdSchema = {
    params: {
        id: {
            type: 'number',
            convert: true,
        }
    }
}

const payerTypesSchema = {
    body: {
        type_name: {
            type: 'string',
            max: 100,
        }
    }
}

const payerTypesIdSchema = {
    params: {
        id: {
            type: 'number',
            convert: true,
        }
    }
}

const payerDatabaseSchema = {
    body: {
        edrpou: {
            type: 'string',
            max: 10,
        },
        district_id: {
            type: 'number',
            positive: true,
        },
        settlement_id: {
            type: 'number',
            positive: true,
        },
        payer_type_id: {
            type: 'number',
            positive: true,
        },
        payer_name: {
            type: 'string',
            max: 255,
        }
    }
}

const payerDatabaseIdSchema = {
    params: {
        id: {
            type: 'number',
            convert: true,
        }
    }
}

const dataInvoicesSchema = {
    body: {
        program_edrpou: {
            type: 'string',
            max: 10,
        },
        invoice_date: {
            type: 'date',
        },
        edrpou: {
            type: 'string',
            max: 10,
            optional: true,
        },
        payer_name: {
            type: 'string',
            max: 255,
            optional: true,
        },
        debit: {
            type: 'number',
        },
        payment_purpose: {
            type: 'string',
        },
        account: {
            type: 'string',
            max: 34,
        },
        year: {
            type: 'number',
            positive: true,
        },
        month: {
            type: 'number',
            min: 1,
            max: 12,
        },
        district_id: {
            type: 'number',
            positive: true,
            optional: true,
        },
        settlement_id: {
            type: 'number',
            positive: true,
            optional: true,
        },
        tax_code: {
            type: 'string',
            max: 8,
            optional: true,
        },
        tax_name: {
            type: 'string',
            max: 255,
            optional: true,
        },
        tax_type: {
            type: 'string',
            max: 50,
            optional: true,
        },
        payer_type: {
            type: 'string',
            max: 100,
            optional: true,
        }
    }
}

const dataInvoicesIdSchema = {
    params: {
        id: {
            type: 'number',
            convert: true,
        }
    }
}

module.exports = {
    filterSchema,
    accountPlanSchema,
    accountPlanIdSchema,
    accountPlanSearchSchema,
    settlementsSchema,
    settlementsIdSchema,
    payerTypesSchema,
    payerTypesIdSchema,
    payerDatabaseSchema,
    payerDatabaseIdSchema,
    dataInvoicesSchema,
    dataInvoicesIdSchema,

}
