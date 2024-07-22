const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
    recipient: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'recipientModel'
    },
    recipientModel: {
        type: String,
        required: true,
        enum: ['Patient', 'HealthcareProvider']
    },
    type: {
        type: String,
        required: true,
        enum: ['medication', 'appointment']
    },
    relatedId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'relatedModel'
    },
    relatedModel: {
        type: String,
        required: true,
        enum: ['Reminder', 'Appointment']
    },
    message: {
        type: String,
        required: true
    },
    isRead: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
})

const Notification = mongoose.model('Notification', notificationSchema)
module.exports = Notification;