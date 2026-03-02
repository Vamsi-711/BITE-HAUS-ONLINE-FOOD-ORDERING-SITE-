const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const {
  createPaymentOrder,
  verifyPayment,
  getPaymentStatus
} = require('../controllers/paymentController');

router.post('/create-order',          protect, createPaymentOrder);
router.post('/verify',                protect, verifyPayment);
router.get('/status/:orderId',        protect, getPaymentStatus);

module.exports = router;
