const express = require('express');
const router = express.Router();
const Consultation = require('../Models/Consultation');
const Patient = require('../Models/Patient');
const MedicationPrescription = require('../Models/MedicationPrescription');

// Create Consultation
router.post('/:consultationId', async (req, res) => {
    try {
        const {
            patientId,
            majorComplaints,
            historyOfPresentIllness,
            physicalExamination,
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
        const newConsultation = new Consultation({
            patient: patientId,
            provider: providerId,
            date: new Date(), // Sets the current date
            majorComplaints,
            historyOfPresentIllness,
            physicalExamination,
            diagnosis,
            treatment,
        });

        const savedConsultation = await newConsultation.save();

        // Create new medication prescription documents
        const newMedicationPrescriptions = medicationPrescriptions.map(prescription => ({
            consultation: savedConsultation._id,
            medication: prescription.medication,
        }));

        const prescriptionDocuments = await MedicationPrescription.insertMany(newMedicationPrescriptions);
        savedConsultation.medicationPrescriptions = prescriptionDocuments.map(doc => doc._id);
        await savedConsultation.save();

        // Update the patient with the new consultation
        patient.consultations.push(savedConsultation._id);
        await patient.save();

        res.status(201).json(savedConsultation);
    } catch (err) {
        console.error(err);
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
            { new: true, runValidators: true } // Ensures that validators are run on update
        );

        if (!updatedConsultation) {
            return res.status(404).json({ error: 'Consultation not found' });
        }

        res.json(updatedConsultation);
    } catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ error: err.message });
        }
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
