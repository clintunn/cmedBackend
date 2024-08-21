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
exports.createNewAppointmentNotification = async (providerId, appointment) => {
    const notification = new Notification({
        recipient: providerId,
        recipientModel: 'HealthcareProvider',
        type: 'new_appointment_request',
        relatedId: appointment._id,
        relatedModel: 'Appointment',
        message: `New appointment request for ${appointment.date.toLocaleDateString()} at ${appointment.time}`
        });
    
        await notification.save();
    };
    
    exports.createAppointmentReminder = async (appointment) => {
        const patientNotification = new Notification({
        recipient: appointment.patient,
        recipientModel: 'Patient',
        type: 'appointment_reminder',
        relatedId: appointment._id,
        relatedModel: 'Appointment',
        message: `Reminder: You have an appointment tomorrow at ${appointment.time}`
        });
    
        const providerNotification = new Notification({
        recipient: appointment.provider,
        recipientModel: 'HealthcareProvider',
        type: 'appointment_reminder',
        relatedId: appointment._id,
        relatedModel: 'Appointment',
        message: `Reminder: You have an appointment with a patient tomorrow at ${appointment.time}`
        });
    
        await Promise.all([patientNotification.save(), providerNotification.save()]);
    };


// In your appointment creation route or service
// const notificationService = require('../services/notificationService');

// After creating a new appointment
// await notificationService.createAppointmentReminder(newAppointment);