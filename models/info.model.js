const mongoose = require("mongoose");

const infoSchema = new mongoose.Schema({
    infoId: {
        type: String,
        required: true,
        unique: true,
        default: "info"
    },
    numberOfUsers: {
        type: Number,
        required: true,
        default: 0
    },
    numberOfTemplates: {
        type: Number,
        required: true,
        default: 0
    },
    numberOfPremiumUsers: {
        type: Number,
        required: true,
        default: 0
    },
    totalRevenue: {
        type: Number,
        required: true,
        default: 0
    },
    numberOfDownloads: {
        type: Number,
        required: true,
        default: 0
    },




});


const Info = mongoose.model("Info", infoSchema);
module.exports = { Info };
