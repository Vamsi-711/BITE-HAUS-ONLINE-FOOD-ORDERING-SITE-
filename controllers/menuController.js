const MenuItem = require('../models/MenuItem');

// ── GET /api/menu ─────────────────────────────────────────────
// Query params: ?category=burger&available=true&featured=true
exports.getAllItems = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category)  filter.category    = req.query.category;
    if (req.query.available) filter.isAvailable = req.query.available === 'true';
    if (req.query.featured)  filter.isFeatured  = req.query.featured  === 'true';

    const items = await MenuItem.find(filter).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: items.length, items });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── GET /api/menu/:id ─────────────────────────────────────────
exports.getItem = async (req, res) => {
  try {
    const item = await MenuItem.findById(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.status(200).json({ success: true, item });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ── POST /api/menu  [Admin only] ──────────────────────────────
exports.createItem = async (req, res) => {
  try {
    const item = await MenuItem.create(req.body);
    res.status(201).json({ success: true, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── PUT /api/menu/:id  [Admin only] ───────────────────────────
exports.updateItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true
    });
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.status(200).json({ success: true, item });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ── DELETE /api/menu/:id  [Admin only] ────────────────────────
exports.deleteItem = async (req, res) => {
  try {
    const item = await MenuItem.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: 'Item not found.' });
    res.status(200).json({ success: true, message: 'Item deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
