const mongoose = require('mongoose');
const {isEmail} = require('validator');
const bcrypt = require('bcrypt');

const UserSchema = new mongoose.Schema({
name: {
    type: String,
    required: [true, "Can't be blank"]
},
email: {
    type: String,
    lowercase: true,
    unique: true,
    required: [true, "Can't be blank"],
    index: true,
    validate: [isEmail, "invalid email"]
},
password: {
    type: String,
    required: [true, "Can't be blank"]
},
// studentID: {
//     type: String,
//     required: [true, "Can't be blank"]
// },
newMessages: {
    type: Object,
    default: {}
},
status: {
    type: String,
    default: 'online'
},
appointments: [{
type: mongoose.Schema.Types.ObjectId,
ref: 'Appointment'
}],
messages: [{
type: mongoose.Schema.Types.ObjectId,
ref: 'Message'
}],
medications: [{
type: mongoose.Schema.Types.ObjectId,
ref: 'Medication'
}]
},{minimize: false});

UserSchema.pre('save', function(next){ //This function provides a way of hashing passwords before it is stored in the database
const user = this;
if(!user.isModified('password')) return next();// This prevents us from constantly rehashing the pass word if not modified

bcrypt.genSalt(10, function(err, salt){
    if(err) return next(err);

    bcrypt.hash(user.password, salt, function(err, hash){
    if(err) return next(err);

    user.password = hash
    next();
    })

})

})


UserSchema.methods.toJSON = function(){
const user = this;
const userObject = user.toObject();
delete userObject.password;
return userObject;
}
// The statics
UserSchema.statics.findByCredentials = async function(email, password) { // This is an authentication async function
const user = await User.findOne({email});
if(!user) throw new Error('invalid email or password');


const isMatch = await bcrypt.compare(password, user.password);
if(!isMatch) throw new Error('invalid email or password')
return user
}


const User = mongoose.model('user', UserSchema);

module.exports = User