const router = require('express').Router;
const bcrypt = require('bcrypt');
const User = require('../Models/user');
// const user = require('../Models/user');

// Register a new user
router.post('/', async (req, res) => {
    try {
        const { email, password, role } = req.body;
        console.log(req.body);
        // create a new user
        const newUser = await User.create({
            email,
            password,
            role
        })
        res.status(201).json(newUser);
    } catch (e) {
        let msg;
        if (e.code == 11000) {
            msg = 'User already exists'
        }else {
            msg = e.message;
        }
        console.log(e);
        res.status(400).json(msg);
    }
})

// login user
router.post('/login', async(req, res) => {
    try {
        const {email, password} = req.body;
        const existingUser = await User.findByCredentials(email,password);
        await existingUser.save();
        res.status(200).json(existingUser);
    } catch (e) {
        res.status(400).json(e.message)
    }
})

module.exports = router

