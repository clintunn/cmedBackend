const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    age: { 
        type: Number, 
        required: true 
    },
    gender: { 
        type: String, 
        required: true 
    },
    clinicId: {
        type: Number,
        required: true
    },
    medicalHistory: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicalHistory'
}],
    medications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Medication'
}],
    consultations: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Consultation' 
    }],
    followUpConsultations: [{ 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'FollowUpConsultation' 
    }],
    user: { type: mongoose.Schema.Types.ObjectId, 
        ref: 'user', 
        required: true 
    }
});

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;