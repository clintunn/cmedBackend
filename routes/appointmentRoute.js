const router = require('express');
const Appointment = require('../Models/Appointment');

//Creating Appointment
router.post('/', async(req, res)=> {
    try {
        const { dateTime, duration, reason, status} = req.body;
        const appointment = await Appointment.create(req.body);
        res.status(201).json(appointment);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// Get Appointment by ID
router.get('./appointmentId', async(req, res)=> {
    try {
        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found'});
        }
        res.json(appointment);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// Update Appointment
router.put('./appointmentId', async(req, res)=> {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['dateTime', 'duration', 'reason', 'status'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid Update'});
        }

        const appointment = await Appointment.findById(req.params.appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found'});
        }

        updates.forEach((update) => (appointment[update] = req.body[update]));
        await appointment.save();

        res.json(appointment);
        } catch (e) {
            res.status(400).json({ message: e.message });
    }
});

// Delete Appointment
router.delete('/:appointmentId', async(req, res) => {
    try {
        const appointment = await Appointment.findByIdAndDelete(req.params.appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found'});
        }
        res.json({ message: 'Appointment deleted successfully'});
    }   catch (e) {
        res.status(400).json({ message: e.message })
    }
});