import mongoose from 'mongoose';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import Joi from 'joi';
import {
    isInMemoryMode,
    initInMemoryStore,
    findUserById,
    findProductById,
    updateUserInStore,
    createOrderInStore,
    listOrdersForUser,
    listProducts
} from '../store/inMemoryStore.js';

const checkoutSchema = Joi.object({
    items: Joi.array().items(
        Joi.object({
            product: Joi.string().required(), // Product ID
            quantity: Joi.number().min(1).required()
        })
    ).min(1).required(),
    pointsToRedeem: Joi.number().min(0).default(0)
});

// @desc    Checkout and Process Apex Prestige Loyalty Points
// @route   POST /api/orders/checkout
// @access  Private
export const processCheckout = async (req, res, next) => {
    if (isInMemoryMode()) {
        try {
            await initInMemoryStore();

            const { error, value } = checkoutSchema.validate(req.body);
            if (error) {
                res.status(400);
                throw new Error(error.details[0].message);
            }

            const { items, pointsToRedeem } = value;
            const user = findUserById(req.user._id);

            if (!user) {
                res.status(404);
                throw new Error('User not found');
            }

            if (pointsToRedeem > user.loyaltyPoints) {
                res.status(400);
                throw new Error('Insufficient loyalty points to redeem');
            }

            let subtotal = 0;
            const orderItems = [];

            for (const item of items) {
                const product = findProductById(item.product);
                if (!product) {
                    res.status(404);
                    throw new Error(`Product with ID ${item.product} not found`);
                }

                if (product.stock < item.quantity) {
                    res.status(400);
                    throw new Error(`Insufficient stock for product: ${product.title}`);
                }

                subtotal += product.price * item.quantity;
                orderItems.push({
                    product: product._id,
                    quantity: item.quantity,
                    priceAtPurchase: product.price
                });

                product.stock -= item.quantity;
                product.updatedAt = new Date();
            }

            const discountApplied = Math.min(pointsToRedeem, subtotal);
            const finalTotal = subtotal - discountApplied;
            const pointsEarned = Math.floor(finalTotal / 100);
            const newBalance = user.loyaltyPoints - discountApplied + pointsEarned;

            const order = createOrderInStore({
                user: user._id,
                items: orderItems,
                subtotal,
                pointsRedeemed: discountApplied,
                discountApplied,
                finalTotal,
                pointsEarned,
                status: 'pending'
            });

            await updateUserInStore(user._id, { loyaltyPoints: newBalance });

            return res.status(201).json({
                success: true,
                data: order,
                message: 'Checkout successful',
                loyaltySummary: {
                    pointsRedeemed: discountApplied,
                    pointsEarned,
                    newBalance
                }
            });
        } catch (err) {
            return next(err);
        }
    }

    let session;

    try {
        // Start a MongoDB session for transaction
        session = await mongoose.startSession();
        session.startTransaction();

        // 1. Validate inputs using Joi
        const { error, value } = checkoutSchema.validate(req.body);
        if (error) {
            res.status(400);
            throw new Error(error.details[0].message);
        }

        const { items, pointsToRedeem } = value;
        const userId = req.user._id;

        // 2. Fetch User and validate loyalty points
        const user = await User.findById(userId).session(session);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (pointsToRedeem > user.loyaltyPoints) {
            res.status(400);
            throw new Error('Insufficient loyalty points to redeem');
        }

        let subtotal = 0;
        const orderItems = [];

        // 3. Loop through items, verify product exists, and check stock
        for (const item of items) {
            const product = await Product.findById(item.product).session(session);
            
            if (!product) {
                res.status(404);
                throw new Error(`Product with ID ${item.product} not found`);
            }

            if (product.stock < item.quantity) {
                res.status(400);
                throw new Error(`Insufficient stock for product: ${product.title}`);
            }

            const priceAtPurchase = product.price;
            subtotal += priceAtPurchase * item.quantity;

            orderItems.push({
                product: product._id,
                quantity: item.quantity,
                priceAtPurchase
            });

            // 8. Update Product stock (decrement) - queuing it up in session
            product.stock -= item.quantity;
            await product.save({ session });
        }

        // 4. Calculate discountApplied (1 Apex Prestige point = 1 unit of currency)
        // Cap the discount so it doesn't exceed the subtotal
        const discountApplied = Math.min(pointsToRedeem, subtotal);
        const actualPointsRedeemed = discountApplied; 

        // 5. Calculate finalTotal
        const finalTotal = subtotal - discountApplied;

        // 6. Calculate pointsEarned
        const pointsEarned = Math.floor(finalTotal / 100);

        // 7. Create Order document
        const order = new Order({
            user: userId,
            items: orderItems,
            subtotal,
            pointsRedeemed: actualPointsRedeemed,
            discountApplied,
            finalTotal,
            pointsEarned,
            status: 'pending' // default
        });

        await order.save({ session });

        // 9. Update User loyaltyPoints
        user.loyaltyPoints = user.loyaltyPoints - actualPointsRedeemed + pointsEarned;
        await user.save({ session });

        // 10. Commit the transaction
        await session.commitTransaction();
        session.endSession();

        res.status(201).json({
            success: true,
            data: order,
            message: 'Checkout successful',
            loyaltySummary: {
                pointsRedeemed: actualPointsRedeemed,
                pointsEarned,
                newBalance: user.loyaltyPoints
            }
        });

    } catch (err) {
        // Rollback on ANY failure
        if (session) {
            await session.abortTransaction();
            session.endSession();
        }
        next(err);
    }
};

// @desc    Get logged-in user order history
// @route   GET /api/orders/my
// @access  Private
export const getMyOrders = async (req, res, next) => {
    try {
        if (isInMemoryMode()) {
            await initInMemoryStore();
            const productMap = new Map(listProducts({}).map((p) => [p._id, p]));
            const orders = listOrdersForUser(req.user._id).map((order) => ({
                ...order,
                items: order.items.map((item) => ({
                    ...item,
                    product: {
                        _id: item.product,
                        title: productMap.get(item.product)?.title || 'Product',
                        imageUrl: productMap.get(item.product)?.imageUrl || ''
                    }
                }))
            }));

            return res.json({
                success: true,
                count: orders.length,
                data: orders
            });
        }

        const orders = await Order.find({ user: req.user._id })
            .populate('items.product', 'title imageUrl')
            .sort({ createdAt: -1 });

        res.json({
            success: true,
            count: orders.length,
            data: orders
        });
    } catch (err) {
        next(err);
    }
};
