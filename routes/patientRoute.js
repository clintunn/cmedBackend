const router = require('express').Router;
const Patient = require ('../Models/Patient');


// creating patient
router.post('/', async (req, res) => {
    try {
        const { name, age, gender, user } = req.body
        console.log(req.body);
        const newPatient = new Patient.create({ name, age, gender, user });
        const savedPatient = await newPatient
        res.status(201).json(savedPatient);
    } catch (e) {
        let msg;
        if (e.code == 11000) {
            msg = 'Patient already exists'
        } else {
            msg = e.message;
        }
        console.log(e);
        res.status(400).json(msg)
    }
})

// This implements the search patient feature

// This finds all patient.
router.get('/',async (req, res) => {
    try {
        const patients = await Patient.find();
        res.json(patients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
    });

// Route for patient interface
router.get('/:patientId', async (req, res) => {
    try{
        const patient = await Patient.findOne({ user: req.user.userId })
        .populate('medicalHistory')
        .populate('medications')
        .populate({
            path: 'consultations',
            populate: {
                path: 'medicationPrescriptions.medication',
                model: 'Medication'
            }
        })
        .populate('followUpConsultations');

        if (!patient) {
            res.status(404).json({ error: 'Patient not found' });
        }
        res.json(patient);
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
})

// Route for healthcare provider interface to search for patients
router.get('/patients/:patientId', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId)
            .populate('medicalHistory')
            .populate('medications')
            .populate({
                path: 'consultations',
                populate: {
                    path: 'medicationPrescriptions.medication',
                    model: 'Medication'
                }
            })
            .populate('followUpConsultations');

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        res.json(patient);
    } catch (e) {
        res.status(500).json({ error: e.message });
    }
});

// update Patient
router.put('/:patientId', async (req, res) => {
    try{
        const updates = req.body
        const allowedUpdates = [ 'name', 'age', 'gender'];

        // Ensuring that only allowed fields are updated
        const validUpdates = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key)) {
                acc[key] = updates[key];
            }
            return acc;
        }, {});

        // perfoming the update
        const updatedPatient = await Patient.finByIdAndUpdate(
            patientId,
            { $set: validUpdates },
            { new: true, runValidators: true}
        );

        if (!updatedPatient) {
            return res.status(404).json({ error: 'Patient not found'})
        }

        res.json(updatedPatient);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Delete Patient
router.delete('./patientId', async (req, res) => {
    try {
        const patient = await Patient.findByIdAndDelete(req.params.patientId);
        if (!patient) {
            return res.status(404).json({ message: 'Patient not found' })
        } else {
            res.json({ message: 'Staff deleted successfully' });
        }
    } catch (e) {
        res.status(500).json({ message: e.message })
    }
})

// creating a new medical history entry for a patient
router.post('/:patientId/medicalHistory', async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.patientId)
            .populate('medicalHistory')
            .populate('medications')
            .populate({
                path: 'consultations',
                populate: {
                    path: 'medicationPrescriptions.medication',
                    model: 'Medication'
                }
            })
            .populate('followUpConsultations');

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const { condition, diagnosisDate, treatment }= req.body;
        patient.medicalHistory.push({ condition, diagnosisDate, treatment });
        const updatedPatient = await patient.save();
        res.json(updatedPatient.medicalHistory);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
})

// updating a medical history entry for a patient
router.put('/:patientId/medicalHistory/:entryId', async (req, res) => {
    try{
        const patient = await Patient.findById(req.params.patientId)
            .populate('medicalHistory')
            .populate('medications')
            .populate({
                path: 'consultations',
                populate: {
                    path: 'medicationPrescriptions.medication',
                    model: 'Medication'
                }
            })
            .populate('followUpConsultations');

        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const entryIndex = patient.medicalHistory.findIndex(entry => entry._id.toString() === req.params.entryId);
        if (entryIndex === -1) {
            return res.status(404).json({ error: 'Medical history entry not found'});
        }

        const { condition, diagnosisDate, treatment } = req.body;
        patient.medicalHistory[entryIndex] = {condition, diagnosisDate, treatment};
        const updatedPatient = await patient.save();
        res.json(updatedPatient.medicalHistory[entryIndex]);
    } catch(e) {
        res.status(400).json({ error: e.message });
    }
})

module.exports = router;