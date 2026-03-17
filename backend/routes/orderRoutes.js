const express = require('express');
const router = express.Router();
const { createOrder, getOrderById, getCustomerOrders } = require('../controllers/orderController');

router.post('/', createOrder);
router.get('/:id', getOrderById);
router.get('/customer/history', getCustomerOrders);

module.exports = router;
