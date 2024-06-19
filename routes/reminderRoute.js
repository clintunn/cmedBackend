const router = require('express').Router;
const Reminder = require('../Models/Reminder');
const Patient = require('../Models/Patient');

// creating reminder
router.post('/', async (req, res) => {
    try {
        const { patientId, medicationId, reminderTime, frequency, notes } = req.body;

        const patient = await Patient.findById(patientId);
        if (!patient) {
            return res.status(404).json({ error: 'Patient not found' });
        }

        const newReminder = new Reminder({
            patient: patientId,
            medication: medicationId,
            reminderTime,
            frequency,
            notes
        });

        const savedReminder = await newReminder.save();
        res.status(201).json(savedReminder)
    } catch (e) {
        res.status(400).json({ error: e.message })
    }
});

//Getting the reminder of patients
router.get('/', async(req, res) => {
    try {
        const reminders = await Reminder.find({ patient: req.user.patientId });
        res.json(reminders);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Updating the reminders
router.put('/:reminderId', async (req, res) => {
    try {
        const { reminderId } = req.params;
        const updates = req.body;

        const updatedReminder = await Reminder.findByIdAndUpdate(reminderId, updates, {
            new: true, runValidators: true
        });

        if (!updatedReminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.json(updatedReminder);
    } catch (e) {
        res.status(400).json({ error: e.message })
    }
})

// Delete Reminder
router.delete('/:reminderId', async (req, res) => {
    try {
        const { reminderId } = req.params;

        const deletedReminder = await Reminder.findByIdAndDelete(reminderId);

        if (!deletedReminder) {
            return res.status(404).json({ error: 'Reminder not found' });
        }

        res.json({ message: 'Reminder deleted successfully' });
    } catch (e) {
        res.status(400).json({ error: e.message })
    }
})