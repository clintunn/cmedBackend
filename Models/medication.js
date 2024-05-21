const mongoose = require('mongoose')
const User = require('./user')

const medicationSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    dosage: {
        type: String,
        required: true
    },
    frequency: {
        type: String,
        required: true
    },
    startDate: {
        type: Date,
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    healthcareProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'healthcareProvider',
        required: true
    }
})

const Medication = mongoose.model('Medication', medicationSchema);

module.exports = Medication;