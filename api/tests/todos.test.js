const { expect, test } = require('@jest/globals');
const request = require('supertest')

const app = require('../app')
const { firebase } = require('../services/firebase');

const todos = require('../fixtures/todos')

let token;

beforeAll(async () => {
    await firebase.auth().signInWithEmailAndPassword('adnan.hebibovic@test.com', 'ThisIsMyTestPassword123').then((credentials) => {
        credentials.user.getIdToken().then((result) => {
            token = result;
        })
    })
})

jest.setTimeout(10000)

test('Should create todos for a user', async () => {
    const response = await request(app)
        .post('/todos')
        .set('Authorization', 'Bearer ' + token)
        .send(todos[0])
        .expect(201)

    expect(response.body).toEqual({
        id: expect.any(String),
        title: todos[0].title,
        date: new Date('01/01/2020').getTime(),
        completed: todos[0].completed
    });
})

test('Should read todos for a user', async () => {
    let response = await request(app)
        .post('/todos')
        .set('Authorization', 'Bearer ' + token)
        .send(todos[1])
        .expect(201)

    const id = response.body.id

    response = await request(app)
        .get('/todos/' + id)
        .set('Authorization', 'Bearer ' + token)
        .send()
        .expect(200)

    expect(response.body).toEqual({
        id: id,
        title: todos[1].title,
        date: todos[1].date,
        completed: todos[1].completed
    });
})

test('Should update todos for a user', async () => {
    let response = await request(app)
        .post('/todos')
        .set('Authorization', 'Bearer ' + token)
        .send(todos[1])
        .expect(201)

    const id = response.body.id

    response = await request(app)
        .patch('/todos/' + id)
        .set('Authorization', 'Bearer ' + token)
        .send({title: todos[2].title})
        .expect(200)

    expect(response.body).toEqual({
        id: id,
        title: todos[2].title,
        date: todos[1].date,
        completed: todos[1].completed
    })
})

test('Should delete todos for a user', async () => {
    let response = await request(app)
        .post('/todos')
        .set('Authorization', 'Bearer ' + token)
        .send(todos[1])
        .expect(201)

    const id = response.body.id

    response = await request(app)
        .delete('/todos/' + id)
        .set('Authorization', 'Bearer ' + token)
        .send()
        .expect(200)
})
