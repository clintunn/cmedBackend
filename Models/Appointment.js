const mongoose = require('mongoose');

const AppointmentSchema = new mongoose.Schema ({
    dateTime: {
        type: Date,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    reason: {
        type: String,
    },
    status: {
        type: String,
        enum: ['scheduled', 'canceled'],
        default: 'scheduled'
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
});

const Appointment = mongoose.model('Appointment', AppointmentSchema)

module.exports = Appointment;

//I want to add confirmation to the appointment where the user applies for an appointment and the staff confirms the appointment
 