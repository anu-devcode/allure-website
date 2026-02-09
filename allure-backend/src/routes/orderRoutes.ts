import { Router } from 'express';
import {
    createOrder,
    getOrders,
    getOrderById,
    updateOrderStatus
} from '../controllers/orderController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', createOrder); // Public endpoint
router.get('/', authenticate, authorizeAdmin, getOrders);
router.get('/:id', authenticate, authorizeAdmin, getOrderById);
router.patch('/:id/status', authenticate, authorizeAdmin, updateOrderStatus);

export default router;
