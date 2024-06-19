const router = require('express').Router;
const HealthcareProvider = require('../Models/HealthProvider');

// creating HealthcareProvier

router.post('/', async(req, res) =>{
    try{
        const{ name, specialization, credentials, user } = req.body;
        console.log(req.body);
        const newHealthCareProvider = new HealthcareProvider.create({ name, specialization, credentials, user });
        const savedHealthCareProvider = await newHealthCareProvider
        res.status(201).json(savedHealthCareProvider);
    } catch (e) {
        let msg;
        if(e.code == 11000){
            msg = "Staff already exists"
        } else {
            msg = e.message;
        }
        console.log(e);
        res.status(400).json(msg)
    }
})

// // login Healthcare Provider 
// router.post('/login', async(req, res) =>{
//     try{
//         const {email, password} = req.body;
//         const healthcareProvider = await HealthcareProvider.findByCredentials(email, password);
//         healthcareProvider.status = 'online';
//         await healthcareProvider.save();
//         res.status(200).json(healthcareProvider);
//     } catch (e) {
//         res.status(400).json(e.message);
//     }
// });

// Get Healthcare Provider by ID
// Get all healthcare providers
router.get('/', async (req, res) => {
    try {
        const providers = await HealthcareProvider.find();
        res.json(providers);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get a specific healthcare provider
router.get('/:providerId', async (req, res) => {
    try {
        const provider = await HealthcareProvider.findById(req.params.providerId)
            .populate('consultations')
            .populate('followUpConsultations');

        if (!provider) {
            return res.status(404).json({ error: 'Healthcare provider not found' });
        }

        res.json(provider);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get the healthcare provider for the currently authenticated user
router.get('/me', async (req, res) => {
    try {
        const provider = await HealthcareProvider.findOne({ user: req.user.userId })
            .populate('consultations')
            .populate('followUpConsultations');

        if (!provider) {
            return res.status(404).json({ error: 'Healthcare provider not found' });
        }

        res.json(provider);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// update Healthcare provider
router.put('/:providerId', async (req, res) => {
    try {
        const updates = req.body
        const allowedUpdates = [ 'name', 'specialization', 'credentials' ];

        // Ensure only allowed fields are updated
        const validUpdates = Object.keys(updates).reduce((acc, key) => {
            if (allowedUpdates.includes(key)) {
                acc[key] = updates[key];
            }
            return acc;
        }, {});

        // performing the update
        const updatedProvider = await HealthcareProvider.findByIdAndUpdate(
            providerId,
            { $set: validUpdates },
            { new: true, runValidators: true }
        );

        if (!updatedProvider) {
            return res.status(404).json({ error: 'Healthcare provider not found' });
        }

        res.json(updatedProvider);
    } catch (e) {
        res.status(400).json({ error: e.message });
    }
});

//Delete Healthcare Provider
router.delete('./healthcareProviderId', async(req,res)=> {
    try {
        const healthcareProvider = await HealthcareProvider.findByIdAndDelete(req.params.healthcareProviderId);
        if (!healthcareProvider) {
            return res.status(404).json({ message: 'Staff not found'});
        } else {
        res.json({ message: 'Staff deleted successfully' });
        }
    } catch (e) {
        res.status(500).json({ message: e.message });
    }
})

module.exports = router;