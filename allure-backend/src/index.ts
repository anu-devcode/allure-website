import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import authRoutes from './routes/authRoutes.js';
import productRoutes from './routes/productRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import cmsRoutes from './routes/cmsRoutes.js';
import customRequestRoutes from './routes/customRequestRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/cms', cmsRoutes);
app.use('/api/custom-requests', customRequestRoutes);

// Health Check
app.get('/health', (req, res) => {
    res.json({ message: "Welcome to Allure Online Shopping API", status: "Healthy" });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
