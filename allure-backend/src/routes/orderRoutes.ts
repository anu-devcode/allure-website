import { Router } from 'express';
import {
    createOrder,
    getCustomerOrders,
    getOrders,
    getOrderById,
    trackOrder,
    updateOrderStatus
} from '../controllers/orderController.js';
import { authenticate, authenticateOptional, authorizeAdmin, authorizeCustomer, authorizeDomain } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', authenticateOptional, createOrder); // Guest + authenticated customer
router.post('/track', trackOrder);
router.get('/my', authenticate, authorizeDomain('customer'), authorizeCustomer, getCustomerOrders);
router.get('/', authenticate, authorizeAdmin, getOrders);
router.get('/:id', authenticate, authorizeAdmin, getOrderById);
router.patch('/:id/status', authenticate, authorizeAdmin, updateOrderStatus);

export default router;
