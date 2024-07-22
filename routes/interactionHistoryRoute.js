const express = require('express');
const router = express.Router();
const InteractionHistory = require('../Models/InteractionHistory')

// create Interaction History
router.post('./interactionHistoryId', async(req, res) => {
    try {
        const { patient, healthcareProvider, diagnosis, medication } = req.body;

        if ( !patient || !healthcareProvider || !diagnosis || !medication ) {
            res.status(404).json({ message: 'Compulsory field not filled'})
        }

        const interactionHistory = await InteractionHistory.create({ patient, healthcareProvider, diagnosis, medication });
        res.status(201).json(interactionHistory);
    } catch (e) {
        res.status(400).json({ e: e.message });
    }
});

// Get Interaction History by ID
router.get('./interactionHistoryId', async(req, res) => {
    try {
        const interactionHistory = await InteractionHistory.findById(req.params.interactionHistoryId).populate('user healthcarePovider diagnosis medication');
        if (!interactionHistory) {
            return res.status(404).json({ message: 'Interaction history not found'})
        }
        res.json(interactionHistory);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// update Operation
// router.put('./meicationId', async(req, res) => {
//     try {
//         const updates = Object.keys(req.body);
//         const allowedUpdates = ['user', 'healthcareProvider', ];
//         const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

//         if (!isValidOperation) {
//             return res.satus(404).json({ message: 'Invalid update'})
//         }

//         const medication = await Medication.findById(req.params.medicationId);
//         if (!medication) {
//             return res.status(404).json({ message: 'Medication not found'});
//         }

//         updates.forEach((update) => (medication[update] = req.body[update]));
//         await medication.save();

//         res.json(medication);
//     } catch (e) {
//         res.status(400).json({ messsage: e.message });
//     }
// });
// The above was commented because I dont think its needed, also not the it isn't complete/correct

// Delete OPeration
