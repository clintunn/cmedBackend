// services/schedulerService.js
const cron = require('node-cron');
const Reminder = require('../Models/Reminder');
const Appointment = require('../Models/Appointment');
const notificationService = require('./notificationService');

// exports.startScheduler = () => {
//     // Check for reminders every minute
//     cron.schedule('* * * * *', async () => {
//         const now = new Date();
//         const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60000);

//         // Check for medication reminders
//         const upcomingReminders = await Reminder.find({
//             reminderTime: { $gte: now, $lt: fiveMinutesFromNow },
//             status: 'active'
//         }).populate('medication');

//         for (const reminder of upcomingReminders) {
//             await notificationService.createMedicationReminder(reminder);
//         }

//         // Check for appointment reminders
//         const upcomingAppointments = await Appointment.find({
//             date: { $gte: now, $lt: fiveMinutesFromNow },
//             status: 'confirmed'
//         }).populate('patient healthcareProvider');

//         for (const appointment of upcomingAppointments) {
//             await notificationService.createAppointmentReminder(appointment);
//         }
//     });
// };

// In schedulerService.js


exports.startScheduler = () => {
cron.schedule('0 8 * * *', async () => { // Run every day at 8 AM
const now = new Date();
const oneDayFromNow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

const upcomingAppointments = await Appointment.find({
    date: { $gte: now, $lt: oneDayFromNow },
    status: 'confirmed'
});

for (const appointment of upcomingAppointments) {
    await notificationService.createAppointmentReminder(appointment);

    
}
});
};