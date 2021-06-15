const { expect, test } = require('@jest/globals');
const request = require('supertest')

const users = require('../fixtures/users')

const app = require('../app')

jest.setTimeout(10000)

test('Should signup a user', async () => {
    const response = await request(app)
        .post('/users/signup')
        .send(users[0])
        .expect(201)

    const token = response.body.token

    expect(token).not.toBeNull()
})