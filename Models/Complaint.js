// models/Complaint.js
const mongoose = require('mongoose');

const complaintSchema = new mongoose.Schema({
    patientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true
    },
    patientName: {
        type: String,
        required: true
    },
    majorComplaints: {
        type: String,
        required: true,
    },
    historyOfPresentIllness: {
        type: String,
        required: true,
    },
    physicalExamination: {
        type: String,
        // required: true,
    },
    status: {
        type: String,
        enum: ['Pending', 'Treated'],
        default: 'Pending',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    treatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Reference to the provider who handled the complaint
    },
});

const Complaint = mongoose.model('Complaint', complaintSchema);

module.exports = Complaint;