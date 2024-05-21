const mongoose = require('mongoose');
// const healthcareProvider = require('./HealthProvider');

const interactionHistorySchema = new mongoose.Schema({
    patient : {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    healthcareProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'healthcareProvider'
    },
    diagnosis: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Diagnosis'
    },
    medication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication'
    }
})

const interactionHistory = mongoose.model('interactionHistory', interactionHistorySchema);

module.exports = interactionHistory;