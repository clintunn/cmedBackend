const router = require('express').Router;
const HealthcareProvider = require('../Models/HealthProvider');

// creating HealthcareProvier

router.post('/', async(req, res) =>{
    try{
        const{name, email, password} = req.body;
        console.log(req.body);
        const healthcareProvider = await HealthcareProvider.create({name, email, password});
        res.status(201).json(healthcareProvider);
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

// login Healthcare Provider 
router.post('/login', async(req, res) =>{
    try{
        const {email, password} = req.body;
        const healthcareProvider = await HealthcareProvider.findByCredentials(email, password);
        healthcareProvider.status = 'online';
        await healthcareProvider.save();
        res.status(200).json(healthcareProvider);
    } catch (e) {
        res.status(400).json(e.message);
    }
});

// Get Healthcare Provider by ID
router.get('/:healthcareProviderId', async(req,res)=> {
    try {
        const healthcareProvider = await HealthcareProvider.findById(req.params.healthcareProviderId);
        if (!healthcareProvider) {
            return res.status(404).json({ message: 'Staff not found'});
        } else {
            res.json(healthcareProvider);
        }
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
}
);

// update Healthcare provider
router.get('/:healthcareProvider', async(req,res)=> {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'password', 'status'];
        const isValidOperation = updates.every((update)=> allowedUpdates.includes(update));

        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates!'});
        }

        const healthcareProvider = await HealthcareProvider.findById(req.params.healthcareProviderId);
        if (!healthcareProvider) {
            return res.status(404).json({ message: 'Staff not found'});
        }

        updates.forEach((update) => (healthcareProvider[update] = req.body[update]));
        await healthcareProvider.save();

        res.json(healthcareProvider);
    } catch (e) {
        res.status(400).json({ message: e.message });
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
        res.status(400).json({ message: e.message });
    }
})