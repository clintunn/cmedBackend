const mongoose = require('mongoose');

const consultationSchema = new mongoose.Schema({
    patient: { type: mongoose.Schema.Types.ObjectId, ref: 'Patient',
    required: true 
},
    provider: { type: mongoose.Schema.Types.ObjectId, ref: 'HealthcareProvider', 
    required: true 
},
    date: { type: Date, 
    required: true 
},
    majorComplaints: { type: String, 
    required: true 
},
    historyOfPresentIllness: {
        type: String,
        required: true
    },
    physicalExamination: {
        type: String,
    },
    diagnosis: { type: String, 
    required: true 
},
    treatment: { type: String, 
    required: true 
},
medicationPrescriptions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MedicationPrescription'
}],
    medications: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Medication' }]
});

const Consultation = mongoose.model('Consultation', consultationSchema);
module.exports = Consultation;