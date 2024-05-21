const mongoose = require('mongoose');

const userProfileSchema = new mongoose.Schema({
user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', // Reference to the User model
    required: true,
    unique: true // Ensures each user has only one profile
},
fullName: {
    type: String,
    required: true
},
dateOfBirth: {
    type: Date
},
gender: {
    type: String,
    enum: ['Male', 'Female', 'Other']
},
contactInformation: {
    email: {
    type: String,
    required: true
    },
    phoneNumber: {
    type: String
    },
    address: {
    type: String
    }
},
// Add more fields as needed
});

const UserProfile = mongoose.model('UserProfile', userProfileSchema);

module.exports = UserProfile;