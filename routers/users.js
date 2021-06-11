const express = require('express')

const { firebase, admin } = require('../services/firebase')

const router = new express.Router()

router.post('/users/signup', async (req, res) => {
    const {
        email,
        phoneNumber,
        password,
        firstName,
        lastName,
        photoUrl
    } = req.body;
    
    admin.auth().createUser({
        email,
        phoneNumber,
        password,
        displayName: `${firstName} ${lastName}`,
        photoURL: photoUrl
    }).getIdToken().then((token) => {
        return res.status(200).json({ token });
    }).catch((error) => {
        return res.status(500).json({ error })
    })
});

router.post('/users/login', async (req, res) => {
    const user = {
        email: req.body.email,
        password: req.body.password
    }

    firebase.auth().signInWithEmailAndPassword(user.email, user.password)
    .then((data) => {
        return data.user.getIdToken();
    })
    .then((token) => {
        return res.status(200).json({ token });
    })
    .catch((error) => {
        return res.status(404).json({ error });
    })
})

export default router;