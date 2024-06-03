require('dotenv').config();
const express = require('express');
const userController = require('../controllers/user.controller');

const router = express.Router();

router.post(process.env.SUB_USER_SIGNUP, userController.register);


router.post(process.env.SUB_USER_LOGIN, userController.login);
router.post(process.env.SUB_USER_UPDATE_NAME, userController.updateName)
router.post(process.env.SUB_USER_UPDATE_PASSWORD, userController.updatePassword)
router.post(process.env.SUB_USER_DELETE_ACCOUNT, userController.deleteAccount)
router.post(process.env.SUB_USER_GET_SEC_QUESTION, userController.getSecurityQuestion)
router.post(process.env.SUB_USER_RESET_PASSWORD, userController.forgotPassword)
router.post(process.env.SUB_USER_GET_USER_DETAIL, userController.getUserDetail)
router.post(process.env.SUB_USER_GET_CONTACT, userController.getContactFormDetail)
module.exports = router;