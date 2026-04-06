import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { connectDB } from './src/config/db.js';
import { errorHandler } from './src/middleware/errorHandler.js';
import { loginLimiter } from './src/middleware/loginLimiter.js';
import authRoutes from './src/routes/authRoutes.js';
import productRoutes from './src/routes/productRoutes.js';
import orderRoutes from './src/routes/orderRoutes.js';

dotenv.config();

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

// Security and Middleware
app.use(helmet());
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        if (!isProduction) {
            return callback(null, true);
        }
        return callback(new Error('CORS policy does not allow this origin'));
    }
}));
app.use(express.json());

// Connect to MongoDB
if (!process.env.JEST_WORKER_ID) {
    connectDB();
}

app.get('/', (req, res) => {
    res.send('Apex Prestige API is running...');
});

// API Routes
app.use('/api/auth/login', loginLimiter); // Apply rate limiting to login route specifically
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Route not found'
    });
});

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
const isServerless = process.env.VERCEL === '1' || !!process.env.VERCEL;

if (process.env.NODE_ENV !== 'test' && !isServerless) {
    app.listen(PORT, () => {
        console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
    });
}

export default app;
