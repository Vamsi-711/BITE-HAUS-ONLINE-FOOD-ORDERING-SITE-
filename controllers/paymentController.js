const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const getRazorpay = () => new Razorpay({
  key_id:     process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// ── POST /api/payment/create-order ────────────────────────────
// Creates a Razorpay order for a given BITEHAUS order
exports.createPaymentOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const razorpay = getRazorpay();
    const razorpayOrder = await razorpay.orders.create({
      amount:   order.totalAmount * 100,  // Razorpay uses paise
      currency: 'INR',
      receipt:  `receipt_${order._id}`,
      notes:    { orderId: order._id.toString() }
    });

    order.razorpayOrderId = razorpayOrder.id;
    order.paymentMethod   = 'razorpay';
    await order.save();

    res.status(200).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount:          razorpayOrder.amount,
      currency:        razorpayOrder.currency,
      keyId:           process.env.RAZORPAY_KEY_ID
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/payment/verify ──────────────────────────────────
// Verifies Razorpay signature after payment
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = req.body;

    // Signature verification
    const body      = razorpay_order_id + '|' + razorpay_payment_id;
    const expected  = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex');

    if (expected !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed. Invalid signature.' });
    }

    // Update order as paid
    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    order.paymentStatus    = 'paid';
    order.status           = 'confirmed';
    order.razorpayPaymentId = razorpay_payment_id;
    await order.save();

    res.status(200).json({ success: true, message: 'Payment verified. Order confirmed!', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/payment/status/:orderId ─────────────────────────
exports.getPaymentStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId).select('paymentStatus status totalAmount');
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    res.status(200).json({ success: true, paymentStatus: order.paymentStatus, orderStatus: order.status });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
