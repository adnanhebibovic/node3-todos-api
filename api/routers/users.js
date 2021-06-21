const express = require('express')

const { firebase, admin } = require('../services/firebase')
const userSchema = require('../schemas/users')

const checkIfAuthenticated = require('../middleware/auth');

const router = new express.Router()

router.post('/users/signup', async (req, res) => {
    const { error, value } = userSchema.validate(req.body);

    if (error) {
        console.log(error)
        return res.status(400).json({ error });
    }

    const {
        email,
        phoneNumber,
        password,
        firstName,
        lastName,
        photoUrl
    } = value;
    
    admin.auth().createUser({
        email,
        phoneNumber,
        password,
        displayName: `${firstName} ${lastName}`,
        photoURL: photoUrl
    }).then((user) => {
        admin.auth().createCustomToken(user.uid).then((token) => {
            return res.status(201).json({ token })
        })
    }).catch((error) => {
        return res.status(500).json({ error })
    })
});

router.post('/users/login', async (req, res) => {
    const { error, value } = userSchema.validate(req.body);

    if (error) {
        return res.status(400).json({ error });
    }

    const user = {
        email: value.email,
        password: value.password
    }

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
        data.user.getIdToken().then((token) => {
          return res.status(200).json({ token });
      })
    })
    .catch((error) => {
        return res.status(404).json({ error });
    })
})

router.get('/users/me', checkIfAuthenticated, async (req, res) => {
    admin.auth().getUser(req.uid).then((user) => {
        return res.status(200).json({ user })
    }).catch((error) => {
        return res.status(500).json({ error })
    })
})

module.exports = router;