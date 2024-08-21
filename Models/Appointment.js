const mongoose = require('mongoose');

const appointmentSchema = new mongoose.Schema({
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Patient', 
        required: true 
    },
    provider: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'HealthcareProvider', 
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    time: { 
        type: String, 
        required: true 
    },
    reason: { 
        type: String, 
        required: true 
    },
    status: {
        type: String,
        enum: ['pending', 'confirmed', 'canceled'],
        default:    'pending'
    },
    reminder: {
        type: Date,
        required: true
    }
});

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;