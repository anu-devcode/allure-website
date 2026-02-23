import { Router } from 'express';
import {
	adminLogin,
	customerLogin,
	customerRegister,
	forgotPassword,
	getAdminMe,
	getCustomerMe,
	logout,
	refreshAdminToken,
	refreshCustomerToken,
	resetPassword,
	updateAdminPassword,
	updateCustomerProfile,
} from '../controllers/authController.js';
import { authLoginRateLimiter, passwordResetRateLimiter } from '../middleware/rateLimitMiddleware.js';
import { authenticate, authorizeAdmin, authorizeCustomer, authorizeDomain } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/customer/register', customerRegister);
router.post('/customer/login', authLoginRateLimiter, customerLogin);
router.post('/customer/refresh', refreshCustomerToken);
router.get('/customer/me', authenticate, authorizeDomain('customer'), authorizeCustomer, getCustomerMe);
router.patch('/customer/profile', authenticate, authorizeDomain('customer'), authorizeCustomer, updateCustomerProfile);

router.post('/admin/login', authLoginRateLimiter, adminLogin);
router.post('/admin/refresh', refreshAdminToken);
router.get('/admin/me', authenticate, authorizeDomain('admin'), authorizeAdmin, getAdminMe);
router.patch('/admin/password', authenticate, authorizeDomain('admin'), authorizeAdmin, updateAdminPassword);

router.post('/logout', logout);
router.post('/password/forgot', passwordResetRateLimiter, forgotPassword);
router.post('/password/reset', passwordResetRateLimiter, resetPassword);

router.post('/register', customerRegister);
router.post('/login', authLoginRateLimiter, customerLogin);

export default router;
