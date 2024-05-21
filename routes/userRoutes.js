const router = require('express').Router();
const User = require('../Models/user'); 

//creating User
router.post('/', async(req, res)=> {// This is for creating a new user using post
try {
    const {name, email, password} = req.body;
    console.log(req.body);
    const user = await User.create({name, email, password});
    res.status(201).json(user);
} catch (e) {
    let msg;
    if(e.code == 11000){
    msg = "User already exists"
    } else {
    msg = e.message;
    }
    console.log(e);
    res.status(400).json(msg)
}
})

//login user
router.post('/login', async(req, res)=> {
try {
    const {email, password} = req.body;
    const user = await User.findByCredentials(email, password);
    user.status = 'online';
    await user.save();
    res.status(200).json(user);
} catch (e) {
    res.status(400).json(e.message)
}
});

// Get user by ID
router.get('/:userId', async(req,res)=> {
    try {
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found'});
        } else {
            res.json(user);
        }
        //I put the if statement inside the catch block instead of the try block
        } catch (e) {
            res.status(400).json({ message: e.message });
        }
    }
);

// Update User
router.put('/:userId', async(req,res)=> {
    try {
        const updates = Object.keys(req.body);
        const allowedUpdates = ['name', 'email', 'password', 'status'];
        const isValidOperation = updates.every((update) => allowedUpdates.includes(update));
        //(in this block) if statement to check if the update operation is a valid one
        if (!isValidOperation) {
            return res.status(400).json({ message: 'Invalid updates!' });
        } 
        // This block checks if the user that the update operation is to be carried upon exists
        const user = await User.findById(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found'});
        }
        // This is to save the update operations made, an await function for when the user object saves
        updates.forEach((update) => (user[update] = req.body[update]));
        await user.save();

        res.json(user);
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
});

// Delete User
router.delete('/:userId', async(req,res)=> {
    try {
        const user = await User.findByIdAndDelete(req.params.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found'});
        }
        res.json({ message: 'User delete succesfully' });
    } catch (e) {
        res.status(400).json({ message: e.message });
    }
}
);

