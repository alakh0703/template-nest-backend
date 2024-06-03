require('dotenv').config();
const express = require('express');

const router = express.Router();

const paymentController = require('../controllers/payment.controller');


router.post(process.env.SUB_PAYMENT_INTENT, paymentController.createPaymentIntent);
router.post(process.env.SUB_PAYMENT_SUCCESS, paymentController.paymentSuccess);
router.post(process.env.SUB_PAYMENT_PROMO, paymentController.promoCode);
module.exports = router;
