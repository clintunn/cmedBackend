const mongoose = require('mongoose');

const healthcareProviderSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    specialization: { 
        type: String, 
        // required: true 
    },
    credentials: { 
        type: String, 
        // required: true 
    },
    consultations: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Consultation' 
    }],
    followUpConsultations: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FollowUpConsultation' 
    }],
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true }
});

const HealthcareProvider = mongoose.model('HealthcareProvider', healthcareProviderSchema);