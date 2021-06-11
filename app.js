const express = require('express')

const app = express()

app.use(express.json())

app.use(require('./routers/todos'))
app.use(require('./routers/todos'))

module.exports = app;