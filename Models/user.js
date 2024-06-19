const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: { 
    type: String, 
    required: true, 
    unique: true 
},
    password: { type: String, 
    required: true 
},
    role: { type: String,
    required: true, 
    enum: ['patient', 'provider'] 
    },
    patient: { type: mongoose.Schema.Types.ObjectId, 
    ref: 'Patient' 
},
    provider: { type: mongoose.Schema.Types.ObjectId,
    ref: 'HealthcareProvider' }
},{minimze: false});

userSchema.pre('save', function(next) {
    const user = this;
    if(!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt) {
        if(err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err) return next(err);

            user.password = hash
            next();
        })
    })
})

userSchema.methods.toJSON = function(){
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
}

userSchema.statics.findByCredentials = async function(email, password) {
    const existingUser = await user.findOne({email});
    if(!existingUser) throw new Error('invalid email or password');

    const isMatch = await bcrypt.compare(password, existingUser.password);
    if(!isMatch) throw new Error('invalid email or password')
    return existingUser 
}

const user = mongoose.model('User', userSchema);
module.exports = user;