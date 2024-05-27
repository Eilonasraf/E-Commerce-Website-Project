const express = require('express');
const orderController = require('../controller/orderController');
const router = express.Router();

router.post('/create', orderController.createOrder);
router.get('/', orderController.getOrders);
router.get('/history', orderController.getUserOrders); // Move the history route above the :id route
router.get('/:id', orderController.getOrder); // Keep this route below the history route
router.put('/:id', orderController.updateOrder);
router.delete('/:id', orderController.deleteOrder);

router.post('/checkout', orderController.checkout);

router.get('/admin/history', orderController.getAllOrdersGroupedByUser);

module.exports = router;
