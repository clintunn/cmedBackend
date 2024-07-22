const express = require('express');
const router = express.Router();
const HealthcareProvider = require('../Models/HealthcareProvider');
const FollowUpConsultation = require('../Models/FollowUpConsultation');
const Patient = require('../Models/Patient');
const MedicationPrescription = require('../Models/MedicationPrescription');

// Authentication middleware
const authMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    next();
};

// Create follow up Consultation
router.post('/', authMiddleware, async (req, res) => {
    try {
        const {
            patientId,
            newSymptoms,
            diagnosis,
            treatment,
            medicationPrescriptions
        } = req.body;

        console.log('Received request data:', req.body);

        // Validate the input
        if (!patientId || !newSymptoms || !diagnosis || !treatment) {
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

        // Create a new follow-up consultation
        const newFollowUpConsultation = new FollowUpConsultation({
            patient: patientId,
            provider: provider._id,
            date: new Date(),
            newSymptoms,
            diagnosis,
            treatment,
        });

        console.log('New follow-up consultation object:', newFollowUpConsultation);

        const savedFollowUpConsultation = await newFollowUpConsultation.save();

        console.log('Follow-up consultation saved:', savedFollowUpConsultation);

        // Create new medication prescription documents if any
        if (medicationPrescriptions && medicationPrescriptions.length > 0) {
            const newMedicationPrescriptions = medicationPrescriptions.map(prescription => ({
                consultation: savedFollowUpConsultation._id,
                medication: prescription.medication,
            }));

            const prescriptionDocuments = await MedicationPrescription.insertMany(newMedicationPrescriptions);
            savedFollowUpConsultation.medicationPrescriptions = prescriptionDocuments.map(doc => doc._id);
            await savedFollowUpConsultation.save();
        }

        // Update the patient with the new follow-up consultation
        patient.followUpConsultations = patient.followUpConsultations || [];
        patient.followUpConsultations.push(savedFollowUpConsultation._id);
        await patient.save();

        // Update the provider with the new follow-up consultation
        provider.followUpConsultations = provider.followUpConsultations || [];
        provider.followUpConsultations.push(savedFollowUpConsultation._id);
        await provider.save();

        console.log('Patient and Provider updated with new follow-up consultation');

        res.status(201).json(savedFollowUpConsultation);
    } catch (err) {
        console.error('Error creating follow-up consultation:', err);
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Follow-up Consultation
router.get('/:followUpConsultationId', async (req, res) => {
    try {
        const followUpConsultation = await FollowUpConsultation.findById(req.params.followUpConsultationId)
            .populate('patient')
            .populate('provider')
            .populate({
                path: 'medicationPrescriptions',
                populate: {
                    path: 'medication',
                    model: 'Medication'
                }
            });

        if (!followUpConsultation) {
            return res.status(404).json({ error: 'Follow up Consultation not found' });
        }

        res.json(followUpConsultation);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// Update Follow-up Consultation
router.put('/:followUpConsultationId', authMiddleware, async (req, res) => {
    try {
        const { followUpConsultationId } = req.params;
        const updatedFollowUpConsultation = await FollowUpConsultation.findByIdAndUpdate(
            followUpConsultationId,
            req.body,
            { new: true, runValidators: true }
        );

        if (!updatedFollowUpConsultation) {
            return res.status(404).json({ error: 'Follow-up Consultation not found' });
        }

        res.json(updatedFollowUpConsultation);
    } catch (e) {
        if (e.name === 'ValidationError') {
            return res.status(400).json({ error: e.message });
        }
        res.status(500).json({ error: e.message });
    }
});

module.exports = router;