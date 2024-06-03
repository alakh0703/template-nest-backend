const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        min: 1,
        max: 50
    },
    email: {
        type: String,
        required: true,
        trim: true,
        min: 3,
        max: 50
    },
    subject: {
        type: String,
        required: true,
        trim: true,
        min: 1,
        max: 50
    },
    message: {
        type: String,
        required: true,
        trim: true,
        min: 1,
        max: 500
    },
    date: {
        type: Date,
        default: Date.now
    },
    resolved: {
        type: Boolean,
        default: false
    }
})


const Contact = mongoose.model("Contact", contactSchema);
module.exports = { Contact };
