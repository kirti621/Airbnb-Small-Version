const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose').default;


// .default hata kar normal require karein


const UserSchema = new Schema({
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        match: [/.+@.+\..+/, 'Please fill a valid email address']
    }
    // username yahan define nahi karna, plugin khud handle karega
});

// usernameField hata dein, by default yeh username se hi login karega
UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);