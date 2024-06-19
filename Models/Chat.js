const mongoose = require('mongoose')

const chatSchema = new mongoose.Schema({
    sessionId: {
        type: String,
        required: true
    },
    messageId: {
        type: String,
        required: true,
        unique: true
    },
    userMessage: {
        type: String,
        required: true
    },
    aiResponse: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Chat = mongoose.model('Chat', 'chatSchema')
module.exports = Chat;