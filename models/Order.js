const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  menuItem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MenuItem',
    required: true
  },
  name:     { type: String, required: true },
  price:    { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 }
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],

  deliveryAddress: {
    street:  { type: String, required: true },
    city:    { type: String, required: true },
    state:   { type: String, required: true },
    pincode: { type: String, required: true }
  },

  subtotal:      { type: Number, required: true },
  deliveryFee:   { type: Number, default: 0 },
  discount:      { type: Number, default: 0 },
  totalAmount:   { type: Number, required: true },

  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['razorpay', 'cod'],
    default: 'cod'
  },
  razorpayOrderId:   { type: String },
  razorpayPaymentId: { type: String },

  promoCode:       { type: String },
  estimatedTime:   { type: Number, default: 30 },  // minutes
  notes:           { type: String }

}, { timestamps: true });

// Virtual: item count
orderSchema.virtual('itemCount').get(function () {
  return this.items.reduce((sum, i) => sum + i.quantity, 0);
});

module.exports = mongoose.model('Order', orderSchema);
