const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/auth');
const {
  getAllItems,
  getItem,
  createItem,
  updateItem,
  deleteItem
} = require('../controllers/menuController');

router.get('/',     getAllItems);           // Public
router.get('/:id',  getItem);              // Public

router.post('/',        protect, restrictTo('admin'), createItem);
router.put('/:id',      protect, restrictTo('admin'), updateItem);
router.delete('/:id',   protect, restrictTo('admin'), deleteItem);

module.exports = router;
