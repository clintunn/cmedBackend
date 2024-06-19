const mongoose = require('mongoose');

const medicationSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    dosage: { 
        type: String, 
        required: true 
    },
    instructions: { 
        type: String, 
        required: true 
    }
});

const Medication = mongoose.model('Medication', medicationSchema);