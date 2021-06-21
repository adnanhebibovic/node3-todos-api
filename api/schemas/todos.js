const Joi = require('joi')

const schema = Joi.object({
    title: Joi.string().alter({
        post: (schema) => schema.required(),
        patch: (schema) => schema.optional()
    }),
    date: Joi.number().alter({
        post: (schema) => schema.required(),
        patch: (schema) => schema.optional()
    }),
    completed: Joi.boolean().alter({
        post: (schema) => schema.required(),
        patch: (schema) => schema.optional()
    })
}).min(1).max(3)

module.exports = schema;