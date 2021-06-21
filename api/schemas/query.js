const Joi = require('joi')

const schema = Joi.object({
    completed: Joi.string().valid('true', 'false').optional(),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').optional(),
    skip: Joi.string().regex(/^\d+$/).optional(),
    limit: Joi.string().regex(/^\d+$/).optional()
}).with('skip', 'sort')

module.exports = schema;