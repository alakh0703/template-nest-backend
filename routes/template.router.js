const express = require('express');
const templateController = require('../controllers/template.controller');

const router = express.Router();


// a route to get templates with paeg number from params 
router.get(process.env.SUB_TEMPLATE_GET, templateController.getTemplates);
router.post(process.env.SUB_TEMPLATE_GET_DL, templateController.getDownloadLink)
router.post(process.env.SUB_TEMPLATE_BF, templateController.getTemplatesByFilter)


module.exports = router;