const express = require('express');
const router = express.Router();
const Medication = require('../Models/medication');

// create medication
router.post( './medicationId', async(req, res)=>{
    try{
        const { user, healthcareProvider, name, dosage, startDate, endDate,} = req.body;
        console.log(req.body);

        if (!user || !healthcareProvider || !name || !dosage || !startDate || !endDate) {
            return res.status(400).json({ message: 'Some required fields are empty'})
        }

        const medication = await Medication.create({ user, healthcareProvider, name, dosage, startDate, endDate });
        res.status(201).json(medication);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// get medication by ID
router.get('./medicationId', async(req, res)=> {
    try{
        const medication = await Medication.findById(req.params.medicationId).populate('user healthcareProvider');
        if (!medication) {
        return res.status(400).json({ message: 'Medication not'}) 
        }
        res.json(medication);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// update Medication
router.put('./meicationId', async(req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['user', 'healthcareProvider', 'name', 'dosage', 'startDate', 'endDate'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.satus(404).json({ message: 'Invalid update'})
        }

        const medication = await Medication.findById(req.params.medicationId);
        if (!medication) {
            return res.status(404).json({ message: 'Medication not found'});
        }

        updates.forEach((update) => (medication[update] = req.body[update]));
        await medication.save();

        res.json(medication);
    } catch (e) {
        res.status(400).json({ messsage: e.message });
    }
});

//Delete Medication
router.delete('./medicationId', async(req, res) => {
    try {
        const medication = await Medication.findByIdAndDelete(req.params.medicationId);
        if (!medication) {
            return res.status(404).json({ message: 'Medication not found'});
        }
        res.json({ message: 'Medication deleted successfully' });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});


module.exports = router;
