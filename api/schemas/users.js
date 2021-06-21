const Joi = require('joi')

const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().pattern(new RegExp('^[a-zA-Z0-9]{3,30}$')).required(),
    repeat_password: Joi.ref('password'),
    phoneNumber: Joi.string(),
    firstName: Joi.string(),
    lastName: Joi.string(),
    photoUrl: Joi.string().uri()
})

module.exports = schema;