import express from 'express';
import { processCheckout, getMyOrders } from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/my', protect, getMyOrders);
router.post('/checkout', protect, processCheckout);

export default router;
