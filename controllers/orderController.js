const Order = require('../models/Order');
const MenuItem = require('../models/MenuItem');

// ── POST /api/orders ──────────────────────────────────────────
exports.createOrder = async (req, res) => {
  try {
    const { items, deliveryAddress, paymentMethod, promoCode, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Order must have at least one item.' });
    }

    // Validate items and calculate subtotal
    let subtotal = 0;
    const enrichedItems = [];

    for (const orderItem of items) {
      const menuItem = await MenuItem.findById(orderItem.menuItem);
      if (!menuItem) {
        return res.status(404).json({ success: false, message: `Menu item ${orderItem.menuItem} not found.` });
      }
      if (!menuItem.isAvailable) {
        return res.status(400).json({ success: false, message: `${menuItem.name} is currently unavailable.` });
      }
      subtotal += menuItem.price * orderItem.quantity;
      enrichedItems.push({
        menuItem: menuItem._id,
        name:     menuItem.name,
        price:    menuItem.price,
        quantity: orderItem.quantity
      });
    }

    // Delivery fee logic: free above ₹499
    const deliveryFee = subtotal >= 499 ? 0 : 49;

    // Promo code discount (simple demo: FIRST50 = 50% off, SAVE20 = ₹20 off)
    let discount = 0;
    if (promoCode === 'FIRST50') discount = Math.round(subtotal * 0.5);
    if (promoCode === 'SAVE20')  discount = 20;

    const totalAmount = Math.max(0, subtotal + deliveryFee - discount);

    const order = await Order.create({
      user: req.user._id,
      items: enrichedItems,
      deliveryAddress,
      subtotal,
      deliveryFee,
      discount,
      totalAmount,
      paymentMethod: paymentMethod || 'cod',
      promoCode,
      notes,
      estimatedTime: 25 + Math.floor(Math.random() * 15)
    });

    res.status(201).json({ success: true, order });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders  (user's own orders) ─────────────────────
exports.getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.menuItem', 'name image category')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/orders/:id ───────────────────────────────────────
exports.getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('user', 'name email phone')
      .populate('items.menuItem', 'name image category');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    // Users can only see their own orders; admins see all
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to view this order.' });
    }

    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/orders/:id/cancel ────────────────────────────────
exports.cancelOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, message: `Cannot cancel an order that is already ${order.status}.` });
    }

    order.status = 'cancelled';
    await order.save();
    res.status(200).json({ success: true, message: 'Order cancelled.', order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
