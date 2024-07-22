const mongoose = require('mongoose');
const { isEmail } = require('validator');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    email: { 
        type: String, 
        required: true, 
        unique: true,
        validate: [isEmail, 'Invalid email']
    },
    password: { 
        type: String, 
        required: true 
    },
    role: { 
        type: String,
        required: true, 
        enum: ['patient', 'provider'] 
    },
    patient: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Patient' 
    },
    provider: { 
        type: mongoose.Schema.Types.ObjectId,
        ref: 'HealthcareProvider' 
    }
}, { minimize: false });

userSchema.pre('save', function(next) {
    const user = this;
    if(!user.isModified('password')) return next();

    bcrypt.genSalt(10, function(err, salt) {
        if(err) return next(err);

        bcrypt.hash(user.password, salt, function(err, hash) {
            if(err) return next(err);

            user.password = hash;
            next();
        });
    });
});

userSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    return userObject;
};

userSchema.statics.findByCredentials = async function(email, password) {
    const user = await this.findOne({ email });
    if(!user) throw new Error('Invalid email or password');

    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) throw new Error('Invalid email or password');
    return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
