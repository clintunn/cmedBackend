const mongoose = require('mongoose');

const personalRoomSchema = new mongoose.Schema({
    particapants: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: ['User', 'healthcareProvider']
    }]
})

const personalRoom = mongoose.model('personalRoom', personalRoomSchema);

module.exports = personalRoom;
