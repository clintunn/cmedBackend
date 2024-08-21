const mongoose = require('mongoose');

const medicationPrescriptionSchema = new mongoose.Schema({
    consultation: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Consultation', 
        required: true },
        medication: { type: String, required: true },
    });

const MedicationPrescription = mongoose.model('MedicationPrescription', medicationPrescriptionSchema);
module.exports = MedicationPrescription;