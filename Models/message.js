const  mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: {
        type: String,
        required: true
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ['User', 'healthcareProvider'],
        required: true
    },
    receiver: {
        type: mongoose.Schema.Types.ObjectId,
        ref: ['User', 'healthcareProvider'],
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    room: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'personalRoom'
    }
})

const Message = mongoose.model('Message', messageSchema);

module.exports = Message;