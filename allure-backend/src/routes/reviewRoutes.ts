import { Router } from 'express';
import {
    createReview,
    deleteReview,
    getAdminReviews,
    getCustomerReviewEligibility,
    getProductReviews,
    getPublicReviews,
    updateReview,
} from '../controllers/reviewController.js';
import { authenticate, authorizeAdmin, authorizeCustomer, authorizeDomain } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', getPublicReviews);
router.get('/product/:productId', getProductReviews);
router.get('/customer/product/:productId/eligibility', authenticate, authorizeDomain('customer'), authorizeCustomer, getCustomerReviewEligibility);
router.post('/customer', authenticate, authorizeDomain('customer'), authorizeCustomer, createReview);

router.get('/admin', authenticate, authorizeDomain('admin'), authorizeAdmin, getAdminReviews);
router.put('/admin/:id', authenticate, authorizeDomain('admin'), authorizeAdmin, updateReview);
router.delete('/admin/:id', authenticate, authorizeDomain('admin'), authorizeAdmin, deleteReview);

export default router;
