import { Router } from 'express';
import {
    createProduct,
    getProducts,
    getProductById,
    updateProduct,
    deleteProduct
} from '../controllers/productController.js';
import {
    createCategory,
    getCategories,
    updateCategory,
    deleteCategory
} from '../controllers/categoryController.js';
import { authenticate, authorizeAdmin } from '../middleware/authMiddleware.js';

const router = Router();

// Category Routes
router.get('/categories', getCategories);
router.post('/categories', authenticate, authorizeAdmin, createCategory);
router.put('/categories/:id', authenticate, authorizeAdmin, updateCategory);
router.delete('/categories/:id', authenticate, authorizeAdmin, deleteCategory);

// Product Routes
router.get('/', getProducts);
router.get('/:id', getProductById);
router.post('/', authenticate, authorizeAdmin, createProduct);
router.put('/:id', authenticate, authorizeAdmin, updateProduct);
router.delete('/:id', authenticate, authorizeAdmin, deleteProduct);

export default router;
