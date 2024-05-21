const mongoose = require('mongoose');
const healthcareProvider = require('./HealthProvider');

const diagnosisSchema = new mongoose.Schema({
    patient:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    healthcareProvider: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'healthcareProvider',
        required: true
    },
    name: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true,
        default: Date.now
    },
    description: {
        type: String,
        required: true
    }
}); 

const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);

module.exports = Diagnosis;