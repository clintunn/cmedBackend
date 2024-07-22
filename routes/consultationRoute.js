const express = require('express');
const router = express.Router();
const Consultation = require('../Models/Consultation');
const HealthcareProvider = require('../Models/HealthcareProvider')
const Patient = require('../Models/Patient');
const MedicationPrescription = require('../Models/MedicationPrescription');
const authMiddleware = require('../authMiddleware')
// Authentication middleware
// const authMiddleware = (req, res, next) => {
//     if (!req.user) {
//         return res.status(401).json({ error: 'User not authenticated' });
//     }
//     next();
// };

// Create Consultation
router.post('/', authMiddleware, async (req, res) => {
    try {
        console.log('Session:', req.session);
        console.log('User:', req.user);

        const {
            patientId,
            majorComplaints,
            historyOfPresentIllness,
            physicalExamination,
            diagnosis,
            treatment,
            medicationPrescriptions
        } = req.body;

        console.log('Received request data:', req.body);

        // Validate the input
        if (!patientId || !majorComplaints || !historyOfPresentIllness || !diagnosis || !treatment) {
            console.log('Missing required fields');
            return res.status(400).json({ error: 'All fields are required' });
        }

        // Find the patient
        const patient = await Patient.findById(patientId);
        if (!patient) {
            console.log('Patient not found');
            return res.status(404).json({ error: 'Patient not found' });
        }

        // Find the provider
        const provider = await HealthcareProvider.findOne({ user: req.user._id });
        if (!provider) {
            console.log('Provider not found');
            return res.status(404).json({ error: 'Provider not found' });
        }

        // Create a new consultation
        const newConsultation = new Consultation({
            patient: patientId,
            provider: provider._id,  // Make sure this line is present
            date: new Date(),
            majorComplaints,
            historyOfPresentIllness,
            physicalExamination,
            diagnosis,
            treatment,
        });

        console.log('New consultation object:', newConsultation);  // Add this line for debugging

        const savedConsultation = await newConsultation.save();

        console.log('Consultation saved:', savedConsultation);

        // Create new medication prescription documents if any
        if (medicationPrescriptions && medicationPrescriptions.length > 0) {
            const newMedicationPrescriptions = medicationPrescriptions.map(prescription => ({
                consultation: savedConsultation._id,
                medication: prescription.medication,
            }));

            const prescriptionDocuments = await MedicationPrescription.insertMany(newMedicationPrescriptions);
            savedConsultation.medicationPrescriptions = prescriptionDocuments.map(doc => doc._id);
            await savedConsultation.save();
        }

        // Update the patient with the new consultation
        patient.consultations.push(savedConsultation._id);
        await patient.save();

        // Update the provider with the new consultation
        provider.consultations = provider.consultations || [];  // Ensure the array exists
        provider.consultations.push(savedConsultation._id);
        await provider.save();

        console.log('Patient and Provider updated with new consultation');

        res.status(201).json(savedConsultation);
    } catch (err) {
        console.error('Error creating consultation:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

router.get('/last', authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        const provider = await HealthcareProvider.findOne({ user: req.user._id });
        if (!provider) {
            return res.status(404).json({ error: 'Provider not found' });
        }
        
        const lastConsultation = await Consultation.findOne({ provider: provider._id })
            .sort({ date: -1 })
            .populate('patient', 'name');
        
        if (!lastConsultation) {
            return res.status(404).json({ error: 'No consultations found' });
        }
        
        res.json(lastConsultation);
    } catch (err) {
        console.error('Error fetching last consultation:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get consultation history for the authenticated provider
router.get('/history', authMiddleware, async (req, res) => {
try {
    if (!req.user) {
    return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const provider = await HealthcareProvider.findOne({ user: req.user._id });
    if (!provider) {
    return res.status(404).json({ error: 'Provider not found' });
    }
    
    const consultations = await Consultation.find({ provider: provider._id })
    .sort({ date: -1 })
    .populate('patient', 'name')
    .lean();
    
    const historyData = consultations.map(consultation => ({
    date: consultation.date,
    patientName: consultation.patient.name,
    diagnosis: consultation.diagnosis,
    treatment: consultation.treatment
    }));
    
    res.json(historyData);
} catch (err) {
    console.error('Error fetching consultation history:', err);
    res.status(500).json({ error: 'Internal server error' });
}
});

// Get Consultation
router.get('/:consultationId', async (req, res) => {
    try {
        const consultation = await Consultation.findById(req.params.consultationId)
            .populate('patient')
            .populate('provider')
            .populate({
                path: 'medicationPrescriptions',
                populate: {
                    path: 'medication',
                    model: 'Medication'
                }
            });

        if (!consultation) {
            return res.status(404).json({ error: 'Consultation not found' });
        }

        res.json(consultation);
    } catch (e) {
        console.error('Error fetching consultation:', e);
        res.status(500).json({ error: e.message });
    }
});

// Update Consultation
router.put('/:consultationId', async (req, res) => {
    try {
        const { consultationId } = req.params;
        const updatedConsultation = await Consultation.findByIdAndUpdate(
            consultationId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedConsultation) {
            return res.status(404).json({ error: 'Consultation not found' });
        }

        res.json(updatedConsultation);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        console.error('Error updating consultation:', err);
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
