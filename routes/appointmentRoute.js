const express = require('express');
const router = express.Router();
const Appointment = require('../Models/Appointment');
const Patient = require('../Models/Patient');
const HealthcareProvider = require('../Models/HealthcareProvider');

const authMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ error: 'User not authenticated' });
    }
    next();
};

//Creating Appointment
// In appointmentRoute.js

router.post('/request', authMiddleware, async (req, res) => {
    try {
      const { date, time, reason } = req.body;
      const patient = await Patient.findOne({ user: req.user._id });
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
  
      const newAppointment = new Appointment({
        patient: patient._id,
        date,
        time,
        reason,
        status: 'pending'
      });
      
      await newAppointment.save();
  
      // Create a notification for all healthcare providers
      const providers = await HealthcareProvider.find();
      const notifications = providers.map(provider => ({
        recipient: provider._id,
        recipientModel: 'HealthcareProvider',
        type: 'new_appointment_request',
        relatedId: newAppointment._id,
        relatedModel: 'Appointment',
        message: `New appointment request from ${patient.name} on ${date} at ${time}`
      }));
  
      await Notification.insertMany(notifications);
  
      res.status(201).json(newAppointment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });

// Get available time slots for a specific date and provider
router.get('/available-slots', async (req, res) => {
    try {
      const { providerId, date } = req.query;
      // Implement logic to find available time slots
      // This would involve checking the provider's schedule and existing appointments
      const availableSlots = []; // Populate this array with available time slots
      res.json(availableSlots);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching available slots', error: error.message });
    }
  });
  
  // Schedule a new appointment
  router.post('/schedule', authMiddleware, async (req, res) => {
    try {
      const { providerId, date, time, reason } = req.body;
      const newAppointment = new Appointment({
        patient: req.user._id,
        provider: providerId,
        date,
        time,
        reason,
        status: 'pending'
      });
      await newAppointment.save();
      res.status(201).json(newAppointment);
    } catch (error) {
      res.status(400).json({ message: 'Error scheduling appointment', error: error.message });
    }
  });
  
  // Get appointments for the logged-in user (patient or provider)
  router.get('/my-appointments', authMiddleware, async (req, res) => {
    try {
      const query = req.user.role === 'patient' 
        ? { patient: req.user._id }
        : { provider: req.user._id };
      const appointments = await Appointment.find(query).populate('patient provider');
      res.json(appointments);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching appointments', error: error.message });
    }
  });
  
  // Update appointment status
  router.put('/:appointmentId', authMiddleware, async (req, res) => {
    try {
      const { status } = req.body;
      const updatedAppointment = await Appointment.findByIdAndUpdate(
        req.params.appointmentId,
        { status },
        { new: true }
      );
      res.json(updatedAppointment);
    } catch (error) {
      res.status(400).json({ message: 'Error updating appointment', error: error.message });
    }
  });


// In your appointment route file
router.get('/pending', authMiddleware, async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ error: 'Not authenticated' });
        }
        
        const provider = await HealthcareProvider.findOne({ user: req.user._id });
        if (!provider) {
            return res.status(404).json({ error: 'Provider not found' });
        }
        
        const pendingAppointments = await Appointment.find({ 
            provider: provider._id, 
            status: 'pending' 
        }).populate('patient', 'name');
        
        res.json(pendingAppointments);
    } catch (err) {
        console.error('Error fetching pending appointments:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// // Update Appointment
// // In your appointment route file
// router.put('/:appointmentId', authMiddleware, async (req, res) => {
//     try {
//         const { status } = req.body;
//         const appointmentId = req.params.appointmentId;
    
//         const updatedAppointment = await Appointment.findByIdAndUpdate(
//             appointmentId,
//             { status },
//             { new: true }
//         );
    
//         if (!updatedAppointment) {
//             return res.status(404).json({ error: 'Appointment not found' });
//         }
    
//         res.json(updatedAppointment);
//     } catch (err) {
//         res.status(400).json({ error: err.message });
//     }
// });

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

module.exports = router;