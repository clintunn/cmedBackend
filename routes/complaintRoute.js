const express = require('express');
const router = express.Router();
const Complaint = require('../Models/Complaint');
const Patient = require('../Models/Patient')
const User = require('../Models/user')
const authMiddleware = require('../authMiddleware')

// routes/complaints.js
router.post('/', authMiddleware, async (req, res) => {
    const { majorComplaints, historyOfPresentIllness, physicalExamination } = req.body;

    try {
        const patient = await Patient.findOne({ user: req.user._id });
        console.log('Patient found:', patient);  // Keep this for debugging

        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' });
        }

        const complaint = new Complaint({
            patientId: patient._id,  // Use patient._id instead of req.user._id
            patientName: patient.name,
            majorComplaints,
            historyOfPresentIllness,
            physicalExamination,
        });

        const savedComplaint = await complaint.save();
        console.log('Saved complaint:', savedComplaint);  // Keep this for debugging
        res.status(201).json(savedComplaint);
    } catch (error) {
        console.error('Error creating complaint:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/', authMiddleware, async (req, res) => {
    try {
        const complaints = await Complaint.find();
        console.log('Fetched complaints:', complaints);  // Add this for debugging
        res.json(complaints);
    } catch (error) {
        console.error('Error fetching complaints:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id).populate('patientId');
        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }
        res.json(complaint);
    } catch (error) {
        console.error('Error fetching complaint:', error);
        res.status(500).json({ message: 'Server error', error: error.message });
    }
});

router.put('/:id/treat', authMiddleware, async (req, res) => {
    try {
        const complaint = await Complaint.findById(req.params.id);

        if (!complaint) {
            return res.status(404).json({ message: 'Complaint not found' });
        }

        complaint.status = 'Treated';
        complaint.treatedBy = req.user._id;

        const updatedComplaint = await complaint.save();
        res.json(updatedComplaint);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
});


module.exports = router;