const router = require('express').Router;
const Appointment = require('../Models/Appointment');
const Patient = require('../Models/Patient');
const HealthcareProvider = require('../Models/HealthcareProvider');

//Creating Appointment
router.post('/', async(req, res)=> {
    try {
        const { providerId, date, time, reason } = req.body;
    const patientId = req.user.patientId; // Assuming the patient ID is available in the request object

    // Find the patient and provider
    const patient = await Patient.findById(patientId);
    const provider = await HealthcareProvider.findById(providerId);

    if (!patient || !provider) {
        return res.status(404).json({ error: 'Patient or provider not found' });
        }

        // Create a new appointment
        const newAppointment = new Appointment({
        patient: patientId,
        provider: providerId,
        date,
        time,
        reason,
        status: 'pending',
        });

        const savedAppointment = await newAppointment.save();

        res.status(201).json(savedAppointment);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

// Get Appointment by ID
// Get all appointment requests for a healthcare provider
router.get('./appointmentId', async(req, res)=> {
    try {
        const providerId = req.user.providerId; // Assuming the provider ID is available in the request object
    
        const appointmentRequests = await Appointment.find({ provider: providerId, status: 'pending' });
    
        res.json(appointmentRequests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update Appointment
router.put('./appointmentId', async(req, res)=> {
    try {
        const { status } = req.body;
        const appointmentId = req.params.id;
    
        const updatedAppointment = await Appointment.findByIdAndUpdate(
            appointmentId,
            { status },
            { new: true }
        );
    
        if (!updatedAppointment) {
            return res.status(404).json({ error: 'Appointment not found' });
        }
    
        res.json(updatedAppointment);
    } catch (err) {
        res.status(400).json({ error: err.message });
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