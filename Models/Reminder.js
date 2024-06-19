const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    medication: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication',
        required: true
    },
    reminderTime: {
        type: Date,
        required: true
    },
    frequency: {
        type: String,
        required: true
    }, // daily
    notes: {
        type: String
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        default: 'active',
        enum: ['active', 'inactive']
    }
});

reminderSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

const Reminder = mongoose.model('Reminder', reminderSchema);
module.exports = Reminder;