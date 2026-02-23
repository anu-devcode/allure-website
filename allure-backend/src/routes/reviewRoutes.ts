import { Router } from 'express';
import {
    createReview,
    deleteReview,
    getAdminReviews,
    getPublicReviews,
    updateReview,
} from '../controllers/reviewController.js';
import { authenticate, authorizeAdmin, authorizeDomain } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getPublicReviews);
router.post('/', createReview);

router.get('/admin', authenticate, authorizeDomain('admin'), authorizeAdmin, getAdminReviews);
router.put('/admin/:id', authenticate, authorizeDomain('admin'), authorizeAdmin, updateReview);
router.delete('/admin/:id', authenticate, authorizeDomain('admin'), authorizeAdmin, deleteReview);

export default router;
