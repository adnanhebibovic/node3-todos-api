const express = require('express')
var cors = require('cors')

const app = express()

app.use(cors({
    "origin": "*",
    "methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
    "preflightContinue": false,
    "optionsSuccessStatus": 204
}))

app.use(express.json())

app.use(require('./routers/todos'))
app.use(require('./routers/users'))

module.exports = app;