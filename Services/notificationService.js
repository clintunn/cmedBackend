// services/notificationService.js
const Notification = require('../Models/Notification');
const Reminder = require('../Models/Reminder');
const router = require('../routes/authRoute');

exports.createMedicationReminder = async (reminder) => {
    const notification = new Notification({
        recipient: reminder.patient,
        recipientModel: 'Patient',
        type: 'medication',
        relatedId: reminder._id,
        relatedModel: 'Reminder',
        message: `Time to take your medication: ${reminder.medication.name}`
    });

    await notification.save();
};

// In your reminder creation route or service
// const notificationService = require('../services/notificationService');

// After creating a new reminder
// await notificationService.createMedicationReminder(newReminder);

// services/notificationService.js
router.post('/:')
exports.createAppointmentReminder = async (appointment) => {
    // Notification for patient
    const patientNotification = new Notification({
        recipient: appointment.patient,
        recipientModel: 'Patient',
        type: 'appointment',
        relatedId: appointment._id,
        relatedModel: 'Appointment',
        message: `Reminder: You have an appointment on ${appointment.date} at ${appointment.time}`
    });

    // Notification for healthcare provider
    const providerNotification = new Notification({
        recipient: appointment.healthcareProvider,
        recipientModel: 'HealthcareProvider',
        type: 'appointment',
        relatedId: appointment._id,
        relatedModel: 'Appointment',
        message: `Reminder: You have an appointment with ${appointment.patient.name} on ${appointment.date} at ${appointment.time}`
    });

    await Promise.all([patientNotification.save(), providerNotification.save()]);
};

// In your appointment creation route or service
// const notificationService = require('../services/notificationService');

// After creating a new appointment
// await notificationService.createAppointmentReminder(newAppointment);