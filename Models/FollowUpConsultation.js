const mongoose = require('mongoose');

const followUpConsultationSchema = new mongoose.Schema({
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Patient', required: true 
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
    newSymptoms: { type: String, 
        required: true 
    },
    diagnosis: { 
        type: String, 
        required: true 
    },
    treatment: { 
        type: String, 
        required: true 
    },
    medications: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Medication' 
    }]
});

const FollowUpConsultation = mongoose.model('FollowUpConsultation', followUpConsultationSchema);
module.exports = FollowUpConsultation;