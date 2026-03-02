const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Item name is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['burger', 'pizza', 'pasta', 'salad', 'dessert', 'drink'],
    lowercase: true
  },
  image: {
    type: String,
    default: ''
  },
  badge: {
    type: String,
    default: null   // e.g. "Bestseller", "New", "Hot 🔥"
  },
  rating: {
    type: Number,
    default: 4.5,
    min: 0,
    max: 5
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, { timestamps: true });

module.exports = mongoose.model('MenuItem', menuItemSchema);
