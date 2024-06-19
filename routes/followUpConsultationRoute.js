const express = require('express');
const router = express.Router();
const followUpConsultation = require('../Models/FollowUpConsultation');
const Patient = require('../Models/Patient');
const MedicationPrescription = require('../Models/MedicationPrescription');

// Create follow up Consultation
router.post('/:followUpConsultationId', async (req, res) => {
    try {
        const {
            patientId,
            newSymptoms,
            diagnosis,
            treatment,
            medicationPrescriptions
        } = req.body;

        // Find the patient
        const patient = await Patient.findById(patientId);

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const providerId = req.user.userId;

        // Create a new consultation
        const newFollowUpConsultation = new followUpConsultation({
            patient: patientId,
            provider: providerId,
            date: new Date(), // Sets the current date
            newSymptoms,
            diagnosis,
            treatment,
        });

        const savedFollowUpConsultation = await newFollowUpConsultation.save();

        // Create new medication prescription documents
        const newMedicationPrescriptions = medicationPrescriptions.map(prescription => ({
            followUpConsultation: savedFollowUpConsultation._id,
            medication: prescription.medication,
        }));

        const prescriptionDocuments = await MedicationPrescription.insertMany(newMedicationPrescriptions);
        savedFollowUpConsultation.medicationPrescriptions = prescriptionDocuments.map(doc => doc._id);
        await savedFollowUpConsultation.save();

        // Update the patient with the new consultation
        patient.followUpConsultations.push(savedFollowUpConsultation._id);
        await patient.save();

        res.status(201).json(savedFollowUpConsultation);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// Get Consultation
router.get('/:followUpConsultationId', async (req, res) => {
    try {
        const followUpConsultation = await followUpConsultation.findById(req.params.followUpConsultationId)
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

// Update Consultation
router.put('/:followUpConsultationId', async (req, res) => {
    try {
        const { followUpConsultationId } = req.params;
        const updatedFollowUpConsultation = await followUpConsultation.findByIdAndUpdate(
            followUpConsultationId,
            req.body,
            { new: true, runValidators: true } // Ensures that validators are run on update
        );

        if (!updatedFollowUpConsultation) {
            return res.status(404).json({ error: 'Consultation not found' });
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
