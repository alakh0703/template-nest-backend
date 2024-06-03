const express = require('express');
const infoController = require('../controllers/info.controller');

const router = express.Router();


router.get('/get-info', infoController.getInfo);

module.exports = router;