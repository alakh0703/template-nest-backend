const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    securityQuestion: {
        type: String,
        default: ""
    },
    securityAnswer: {
        type: String,
        default: ""
    },
    authToken: {
        type: String,
        default: ""
    },
    tokenExpireAt: {
        type: Date

    },
    isPremiumUser: {
        type: Boolean,
        default: false
    },

});


const User = mongoose.model("User", userSchema);
module.exports = { User };
