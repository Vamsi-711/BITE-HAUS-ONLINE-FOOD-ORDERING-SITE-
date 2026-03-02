const Order = require('../models/Order');
const User = require('../models/User');
const MenuItem = require('../models/MenuItem');

// ── GET /api/admin/dashboard ──────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const [totalOrders, totalUsers, totalMenuItems, recentOrders] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      MenuItem.countDocuments(),
      Order.find().sort({ createdAt: -1 }).limit(5).populate('user', 'name email')
    ]);

    // Revenue from paid orders
    const revenueResult = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } }
    ]);
    const totalRevenue = revenueResult[0]?.total || 0;

    // Order status breakdown
    const statusBreakdown = await Order.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);

    // Orders per day (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const ordersPerDay = await Order.aggregate([
      { $match: { createdAt: { $gte: sevenDaysAgo } } },
      { $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          count:   { $sum: 1 },
          revenue: { $sum: '$totalAmount' }
      }},
      { $sort: { _id: 1 } }
    ]);

    res.status(200).json({
      success: true,
      stats: { totalOrders, totalUsers, totalMenuItems, totalRevenue },
      statusBreakdown,
      ordersPerDay,
      recentOrders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/orders ─────────────────────────────────────
exports.getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const [orders, total] = await Promise.all([
      Order.find(filter)
        .populate('user', 'name email phone')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Order.countDocuments(filter)
    ]);

    res.status(200).json({
      success: true,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      orders
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/admin/orders/:id/status ─────────────────────────
exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status.' });
    }

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    ).populate('user', 'name email');

    if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
    res.status(200).json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/admin/users ──────────────────────────────────────
exports.getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find({ role: 'user' }).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)),
      User.countDocuments({ role: 'user' })
    ]);

    res.status(200).json({ success: true, total, page: Number(page), users });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── PUT /api/admin/users/:id/toggle ──────────────────────────
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    user.isActive = !user.isActive;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.isActive ? 'activated' : 'deactivated'}.`,
      user
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
