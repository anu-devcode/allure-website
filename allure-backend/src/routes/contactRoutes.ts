import { Router } from 'express';
import {
    createContactMessage,
    deleteContactMessage,
    getContactMessages,
    updateContactMessage,
} from '../controllers/contactController.js';
import { authenticate, authorizeAdmin, authorizeDomain } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', createContactMessage);
router.get('/', authenticate, authorizeDomain('admin'), authorizeAdmin, getContactMessages);
router.patch('/:id', authenticate, authorizeDomain('admin'), authorizeAdmin, updateContactMessage);
router.delete('/:id', authenticate, authorizeDomain('admin'), authorizeAdmin, deleteContactMessage);

export default router;
