import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User',
    },
    items: [{
        product: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'Product',
        },
        quantity: {
            type: Number,
            required: true,
            min: 1,
        },
        priceAtPurchase: {
            type: Number,
            required: true,
        }
    }],
    subtotal: {
        type: Number,
        required: true,
    },
    pointsRedeemed: {
        type: Number,
        default: 0,
    },
    discountApplied: {
        type: Number,
        default: 0,
    },
    finalTotal: {
        type: Number,
        required: true,
    },
    pointsEarned: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'shipped', 'delivered'],
        default: 'pending',
    }
}, {
    timestamps: true
});

export default mongoose.model('Order', orderSchema);
