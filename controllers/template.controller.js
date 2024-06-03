const { Template } = require('../models/template.model');
const { User } = require('../models/user.model');
const { jwt, bcrypt, verifyToken } = require("../auth/auth");


const getTemplates = async (req, res) => {
    try {
        const pageNumber = req.params.pageNumber || 1;
        const pageSize = 10;
        const skip = (pageNumber - 1) * pageSize;
        // only send template id,title, category, industry, experience level,isRecommended, and pdf link
        const totalTemplates = await Template.countDocuments();
        const templates = await Template.find().skip(skip).limit(pageSize).select('templateId templateTitle templateCategory industry experienceLevel isRecommended templatePdfLink');
        // const templates = await Template.find().skip(skip).limit(pageSize);
        res.status(200).json({ templates, totalTemplates });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
}

const getDownloadLink = async (req, res) => {
    console.log("-----------------getDownloadLink-----------------")
    const { token, templateId } = req.body;

    if (!token) {
        return res.status(400).json({ message: 'Token is required' });
    }

    if (!templateId) {
        return res.status(400).json({ message: 'Template ID is required' });
    }

    const decoded = verifyToken(token);
    console.log(decoded)


    if (decoded) {
        const userId = decoded._id;
        const user = await User.findOne({ userId: userId });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (user?.isPremiumUser === true) {
            const template = await Template.findOne({ templateId: templateId });
            if (!template) {
                return res.status(404).json({ message: 'Template not found' });
            }

            return res.status(200).json({ downloadLink: template.templateWordLink, isPremiumUser: true });
        }
        else {
            return res.status(200).json({ isPremiumUser: false, downloadLink: "" });
        }
    } else {
        return res.status(401).send({ message: "Invalid Token!" });

    }

}


const getTemplatesByFilter = async (req, res) => {
    try {
        const { filters } = req.body;
        const { isRecommended, industry, experienceLevel } = filters;

        console.log("industry", industry);
        console.log("experienceLevel", experienceLevel);
        console.log("isRecommended", isRecommended);

        const pageNumber = req.params.pageNumber || 1;
        const pageSize = 10;
        const skip = (pageNumber - 1) * pageSize;

        let query = {};

        // Apply filters based on conditions

        if (industry !== 'ALL') {
            if (industry !== undefined && industry !== null && industry !== "") {
                query.industry = industry;
            }
        }
        if (experienceLevel) {
            query.experienceLevel = experienceLevel;
        }
        if (isRecommended === true) {
            query.isRecommended = isRecommended;
        }

        if (Object.keys(query).length === 0) {
            return res.status(200).json({ message: 'Please provide at least one filter' });
        }


        // get total templates count based on filters
        const totalTemplates = await Template.countDocuments(query);

        const templates = await Template.find(query)
            .skip(skip)
            .limit(pageSize)
            .select('templateId templateTitle templateCategory industry experienceLevel isRecommended templatePdfLink');

        res.status(200).json({ templates, totalTemplates });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { getTemplates, getDownloadLink, getTemplatesByFilter }