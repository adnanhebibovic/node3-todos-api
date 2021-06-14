const express = require('express')

const { firestore } = require('../services/firebase')
const { checkIfAuthenticated } = require('../middleware/auth');

const router = new express.Router()

router.get('/todos', checkIfAuthenticated, async (req, res) => {
    const user = firestore.collection('users').doc(req.uid)

    let query = user.collection('todos'); 

    if (req.query.completed) {
        if (req.query.completed === 'true') {
            query = query.where("completed", "==", true)
        } else if (req.query.completed === 'false') {
            query = query.where("completed", "==", false)
        } else {
            return res.status(400).json({ error: 'Invalid value for completed query. Expecting value: "true" or "false"' })
        }
        
    }

    if (req.query.sort) {
        const sort = req.query.sort;
        let order = 'asc'

        if (req.query.order) {
            if (req.query.order === 'asc') {
                order = 'asc'
            } else if (req.query.order === 'desc') {
                order = 'desc'
            } else {
                return res.status(400).json({ error: 'Invalid value for order query. Expecting values: "asc" or "desc"' })
            }
        }

        query = query.orderBy(sort, order)

        if (req.query.skip) {
            if (!isNaN(req.query.skip)) {
                query = query.startAfter(req.query.skip);
            } else {
                return res.status(400).json({ error: 'Invalid value for skip query. Expecting type of number' })
            }
        }
    }

    if (req.query.limit) {
        if (!isNaN(req.query.limit)) {
            query = query.limit(parseInt(req.query.limit))
        } else {
            return res.status(400).json({ error: 'Invalid value for limit query. Expecting type of number' })
        }
    }

    return query.get()
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
    
    return user.collection('todos').doc(req.params.id).get()
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

    const {
        title,
        date,
        completed
    } = req.body;

    if (typeof title !== 'string') {
        return res.status(400).json({ error: 'Todo property "title" is required and must be type of string!' });
    }

    if (typeof date !== 'number') {
        return res.status(400).json({ error: 'Todo property "date" is required and must be type of number!' });
    }

    if (typeof completed !== 'boolean') {
        return res.status(400).json({ error: 'Todo property "completed" is required and must be type of boolean!' });
    }

    const todo = {
        title,
        date,
        completed
    }

    return user.collection('todos').add(todo)
    .then((doc) => {
        return res.status(201).json({
            id: doc.id,
            ...todo
        })
    }).catch((error) => {
        return res.status(500).json({ error });
    })
});

router.delete('/todos/:id', checkIfAuthenticated, async(req, res) => {
    const user = firestore.collection('users').doc(req.uid)

    return user.collection('todos').doc(req.params.id).delete()
    .then(() => {
        return res.status(200).json({ id: req.params.id });
    }).catch((error) => {
        return res.status(404).json({ error });
    })
});

router.patch('/todos/:id', checkIfAuthenticated, async (req, res) => {
    const user = firestore.collection('users').doc(req.uid)

    const {
        title,
        date,
        completed
    } = req.body;

    const todo = {}

    if (title) {
        if (typeof title !== 'string') {
            return res.status(400).json({ error: 'Todo property "title" is required and must be type of string!' });
        }
    
        todo['title'] = title;
    }
    if (date) {
        if (typeof date !== 'number') {
            return res.status(400).json({ error: 'Todo property "date" is required and must be type of number!' });
        }

        todo['date'] = date;
    }
    if (completed) {
        if (typeof completed !== 'boolean') {
            return res.status(400).json({ error: 'Todo property "completed" is required and must be type of boolean!' });
        }

        todo['completed'] = completed;
    }

    if (Object.keys(todo).length === 0) {
        return res.status(400).json({ error: 'Expecting following Todo properties: "title", "date", "completed"' });
    }

    return user.collection('todos').doc(req.params.id).update(todo)
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