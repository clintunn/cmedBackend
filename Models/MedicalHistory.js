const mongoose = require('mongoose');

const medicalHistorySchema = new mongoose.Schema({
    patient: { 
        type: mongoose.Schema.Types.ObjectId, ref: 'Patient', 
        required: true 
    },
    condition: { 
        type: String, 
        required: true 
    },
    diagnosisDate: { 
        type: Date, 
        required: true 
    },
    treatment: { 
        type: String, 
        required: true 
    }
});

const MedicalHistory = mongoose.model('MedicalHistory', medicalHistorySchema);