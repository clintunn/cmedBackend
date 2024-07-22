const express = require('express');
const router = express.Router();
const User = require('../Models/user');
const Patient = require('../Models/Patient');
const HealthcareProvider = require('../Models/HealthcareProvider');

// Register a new user
router.post('/', async (req, res) => {
    try {
        const { email, password, role } = req.body;

        // Create a new user
        const newUser = new User({
            email,
            password,
            role
        });

        const savedUser = await newUser.save();

        // Create patient or provider based on the role
        if (role === 'patient') {
            const newPatient = new Patient({ user: savedUser._id });
            const savedPatient = await newPatient.save();
            savedUser.patient = savedPatient._id;
        } else if (role === 'provider') {
            const newProvider = new HealthcareProvider({ user: savedUser._id });
            const savedProvider = await newProvider.save();
            savedUser.provider = savedProvider._id;
        }

        await savedUser.save();
        res.status(201).json(savedUser);
    } catch (e) {
        let msg;
        if (e.code === 11000) {
            msg = 'User already exists';
        } else {
            msg = e.message;
        }
        res.status(400).json(msg);
    }
});

// Login user
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const existingUser = await User.findByCredentials(email, password);
        // await existingUser.save();
        res.status(200).json(existingUser);
    } catch (e) {
        res.status(400).json(e.message);
    }
});

module.exports = router;
