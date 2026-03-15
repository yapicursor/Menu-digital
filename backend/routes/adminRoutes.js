const express = require('express');
const router = express.Router();
const { getAdminOrders, acceptOrder, cancelOrder, updateOrderStatus, deleteOrder, getStats } = require('../controllers/orderController');
const { sendTestEmail } = require('../controllers/emailController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All admin routes protected

router.get('/stats', getStats);
router.post('/test-email', sendTestEmail);
router.get('/orders', getAdminOrders);
router.put('/orders/:id/accept', acceptOrder);
router.put('/orders/:id/cancel', cancelOrder);
router.put('/orders/:id/status', updateOrderStatus);
router.delete('/orders/:id', deleteOrder);

module.exports = router;
