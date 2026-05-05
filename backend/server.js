import './models/associations.js';
import express from 'express';
import sequelize from './config/db.js';
import 'dotenv/config';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import response from './middleware/response.js';
import runOrderScheduler from './utils/orderScheduler.js';

// Routes
import userRoutes from './routes/users.js';
import bookRoutes from './routes/books.js';
import cartRoutes from './routes/cart.js';
import orderRoutes from './routes/orders.js';
import reviewRoutes from './routes/reviews.js';
import promoRoutes from './routes/promos.js';
import statsRoutes from './routes/stats.js';
import wishlistRoutes from './routes/wishlist.js';
import genreRoutes from './routes/genres.js';
import authorRoutes from './routes/authors.js';
import publisherRoutes from './routes/publishers.js';
import paymentRoutes from './routes/payment.js';

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }));
app.use(response);

// Mount routes
app.use('/api/users', userRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/promos', promoRoutes);
app.use('/api/admin/stats', statsRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/authors', authorRoutes);
app.use('/api/publishers', publisherRoutes);
app.use('/api/genres', genreRoutes);
app.use('/api/payment', paymentRoutes);

// Sync DB and start server
async function start() {
    try {
        // await sequelize.sync({ alter: true });
        // === KÍCH HOẠT SCHEDULER ===
        runOrderScheduler(); // <--- Gọi hàm ở đây

        const port = process.env.PORT || 3000;
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (err) {
        console.error('Error: ' + err);
    }
}

start();