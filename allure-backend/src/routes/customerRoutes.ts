import { Router } from 'express';
import {
    createCustomerByAdmin,
    deleteCustomerByAdmin,
    getCustomers,
    updateCustomerByAdmin,
} from '../controllers/customerController.js';
import { authenticate, authorizeAdmin, authorizeDomain } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, authorizeDomain('admin'), authorizeAdmin, getCustomers);
router.post('/', authenticate, authorizeDomain('admin'), authorizeAdmin, createCustomerByAdmin);
router.put('/:id', authenticate, authorizeDomain('admin'), authorizeAdmin, updateCustomerByAdmin);
router.delete('/:id', authenticate, authorizeDomain('admin'), authorizeAdmin, deleteCustomerByAdmin);

export default router;
