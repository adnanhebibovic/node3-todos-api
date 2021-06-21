const express = require('express')

const { firestore } = require('../services/firebase')

const checkIfAuthenticated = require('../middleware/auth');

const todosSchema = require('../schemas/todos')
const querySchema = require('../schemas/query')

const router = new express.Router()

router.get('/todos', checkIfAuthenticated, async (req, res) => {
    const user = firestore.collection('users').doc(req.uid)

    const { error, value } = querySchema.validate(req.query);

    if (error) {
        return res.status(400).json({ error });
    }

    let query = user.collection('todos'); 

    if (value.completed) {
        query = query.where("completed", "==", value.completed === 'true')
    }
    if (value.sort) {
        let order = 'asc'
        if (value.order) {
            order = value.order
        }
        query = query.orderBy(value.sort, order)
        if (value.skip) {
            query = query.startAfter(parseInt(value.skip));
        }
    }
    if (value.limit) {
        query = query.limit(parseInt(value.limit))    
    }

    query.get()
        .then((snapshot) => {
            const todos = []
            snapshot.forEach((doc) => {
                todos.push({
                    id: doc.id, 
                    ...doc.data()
                })
            })
            return todos;
        }).then((result) => {
            return res.status(200).json(result)
        }).catch((error) => {
            return res.status(500).json({ error });
        })
})

router.get('/todos/:id', checkIfAuthenticated, async (req, res) => {
    const user = firestore.collection('users').doc(req.uid)
    
    user.collection('todos').doc(req.params.id).get()
        .then((doc) => {
            const todo = {
                id: doc.id, 
                ...doc.data()
            }
            return todo;
        }).then((result) => {
            return res.status(200).json(result);
        }).catch((error) => {
            return res.status(404).json({ error });
        })
})

router.post('/todos', checkIfAuthenticated, async (req, res) => {
    const user = firestore.collection('users').doc(req.uid)

    const { error, value } = todosSchema.tailor('post').validate(req.body);

    if (error) {
        return res.status(400).json({ error });
    }

    user.collection('todos').add(value)
    .then((doc) => {
        return res.status(201).json({
            id: doc.id,
            ...value
        })
    }).catch((error) => {
        return res.status(500).json({ error });
    })
});

router.delete('/todos/:id', checkIfAuthenticated, async(req, res) => {
    const user = firestore.collection('users').doc(req.uid)

    user.collection('todos').doc(req.params.id).delete()
    .then(() => {
        return res.status(200).json({ id: req.params.id });
    }).catch((error) => {
        return res.status(404).json({ error });
    })
});

router.patch('/todos/:id', checkIfAuthenticated, async (req, res) => {
    const user = firestore.collection('users').doc(req.uid)

    const { error, value } = todosSchema.tailor('patch').validate(req.body);

    if (error) {
        return res.status(400).json({ error });
    }

    user.collection('todos').doc(req.params.id).update(value)
    .then(() => {
        user.collection('todos').doc(req.params.id).get()
        .then((doc) => {
            const todo = {
                id: doc.id, 
                ...doc.data()
            }
            return todo;
        })
        .then((result) => {
            return res.status(200).json(result);
        })
    }).catch((error) => {
        return res.status(404).json({ error })
    })
});

module.exports = router