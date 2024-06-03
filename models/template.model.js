const mongoose = require("mongoose");

const templateSchema = new mongoose.Schema({
    templateId: {
        type: String,
        required: true,
        unique: true,
    },
    templateTitle: {
        type: String,
        required: true,
    },
    templateDescription: {
        type: String,
        required: true,
    },
    templatePdfLink: {
        type: String,
        required: true,
    },
    templateCategory: {
        type: Array,
        required: true,
    },
    templateWordLink: {
        type: String,
        required: true,
    },
    isRecommended: {
        type: Boolean,
        required: true,
    },
    industry: {
        type: String,
        required: true,
    },
    experienceLevel: {
        type: String,
        required: true,

    }



});


const Template = mongoose.model("Template", templateSchema);
module.exports = { Template };
