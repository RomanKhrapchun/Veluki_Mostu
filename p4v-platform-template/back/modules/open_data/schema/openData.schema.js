const openDataSchema = {
    schema: {
    body: {
        type: 'object',
        properties: {
            id: { type: 'number', minimum: 1 },
            familyName: { type: 'string', minLength: 1 },
            Name: { type: 'string', minLength: 1 },
            additionalName: { type: 'string', minLength: 1 },
            familyStructure: { type: 'number', minimum: 1 },
            recordDecisionDate: { type: 'string', format: 'date' },
            recordDecisionNumber: { type: 'string', nullable: true },
            decisionDate: { type: 'string', format: 'date' },
            priorityDecisionDate: { type: 'string', format: 'date' },
            priorityDecisionNumber: { type: 'string', nullable: true },
            provisionDecisionDate: { type: 'string', format: 'date' },
            provisionDecisionNumber: { type: 'string', nullable: true },
            exclusionDecisionDate: { type: 'string', format: 'date' },
            exclusionDecisionNumber: { type: 'string', nullable: true }
        },
        required: ['id', 'familyName', 'Name', 'additionalName', 'familyStructure', 'recordDecisionDate']
    },
    response: {
        200: {
            type: 'array',
            items: {
                type: 'object',
                properties: {
                    id: { type: 'number' },
                    familyName: { type: 'string' },
                    Name: { type: 'string' },
                    additionalName: { type: 'string' },
                    familyStructure: { type: 'number' },
                    recordDecisionDate: { type: 'string' },
                    recordDecisionNumber: { type: 'string' },
                    decisionDate: { type: 'string' },
                    priorityDecisionDate: { type: 'string' },
                    priorityDecisionNumber: { type: 'string' },
                    provisionDecisionDate: { type: 'string' },
                    provisionDecisionNumber: { type: 'string' },
                    exclusionDecisionDate: { type: 'string' },
                    exclusionDecisionNumber: { type: 'string' }
                }
            }
        }
    }
    }
};

module.exports = openDataSchema;
