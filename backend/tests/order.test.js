import { jest } from '@jest/globals';
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../server.js';
import User from '../src/models/User.js';
import Product from '../src/models/Product.js';
import Order from '../src/models/Order.js';
import jwt from 'jsonwebtoken';

// Helper to generate a dummy JWT
const generateTestToken = (userId) => {
    return jwt.sign({ id: userId }, process.env.JWT_SECRET || 'supersecretkey_apex_prestige', {
        expiresIn: '1h',
    });
};

describe('POST /api/orders/checkout - Apex Prestige Engine Tests', () => {
    let mockSession;
    let validToken;
    let mockUser;
    let mockProduct;
    let userFindByIdSpy;
    let productFindByIdSpy;
    let orderSaveSpy;

    beforeEach(() => {
        jest.clearAllMocks();

        mockSession = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn(),
            abortTransaction: jest.fn(),
            endSession: jest.fn(),
        };

        jest.spyOn(mongoose, 'startSession').mockResolvedValue(mockSession);

        validToken = generateTestToken('60d0fe4f5311236168a109ca');

        mockUser = {
            _id: '60d0fe4f5311236168a109ca',
            loyaltyPoints: 50,
            save: jest.fn().mockResolvedValue(true)
        };

        mockProduct = {
            _id: '60d0fe4f5311236168a109cc',
            title: 'Prestige Watch',
            price: 250,
            stock: 10,
            save: jest.fn().mockResolvedValue(true)
        };

        userFindByIdSpy = jest.spyOn(User, 'findById').mockReturnValue({
            select: jest.fn().mockResolvedValue({
                _id: '60d0fe4f5311236168a109ca',
                role: 'customer'
            }),
            session: jest.fn().mockResolvedValue(mockUser)
        });

        productFindByIdSpy = jest.spyOn(Product, 'findById').mockReturnValue({
            session: jest.fn().mockResolvedValue(mockProduct)
        });

        orderSaveSpy = jest.spyOn(Order.prototype, 'save').mockResolvedValue(true);
    });

    afterEach(() => {
        userFindByIdSpy.mockRestore();
        productFindByIdSpy.mockRestore();
        orderSaveSpy.mockRestore();
    });

    it('Scenario 1: Successful checkout where points are redeemed correctly and new points are earned', async () => {
        // Product Price = $250. Qty = 1. Subtotal = 250.
        // User redeems 50 points (loyaltyPoints limit).
        // Discount Applied = 50. Final Total = 200.
        // Points Earned = Math.floor(200 / 100) = 2.
        const res = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                items: [{ product: '60d0fe4f5311236168a109cc', quantity: 1 }],
                pointsToRedeem: 50
            });

        expect(res.statusCode).toEqual(201);
        expect(res.body.success).toBe(true);
        expect(res.body.loyaltySummary).toEqual({
            pointsRedeemed: 50,
            pointsEarned: 2,
            newBalance: 2 // Assuming user points calculation -> user.loyaltyPoints(50) - 50 + 2 = 2 (Wait, the controller does this!)
        });
        
        // Assert transaction flows correctly
        expect(mockSession.startTransaction).toHaveBeenCalled();
        expect(mockProduct.save).toHaveBeenCalled();
        expect(mockUser.save).toHaveBeenCalled();
        expect(mockSession.commitTransaction).toHaveBeenCalled();
        expect(mockSession.endSession).toHaveBeenCalled();
    });

    it('Scenario 2: Failed checkout when user attempts to redeem more points than they possess (expect a 400 error)', async () => {
        const res = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                items: [{ product: '60d0fe4f5311236168a109cc', quantity: 1 }],
                pointsToRedeem: 100 // user only has 50 points
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toEqual('Insufficient loyalty points to redeem');
        
        // Assert rollbacks
        expect(mockSession.abortTransaction).toHaveBeenCalled();
    });

    it('Scenario 3: Failed checkout where product stock is insufficient', async () => {
        // User wants 20 qty, but stock is 10
        const res = await request(app)
            .post('/api/orders/checkout')
            .set('Authorization', `Bearer ${validToken}`)
            .send({
                items: [{ product: '60d0fe4f5311236168a109cc', quantity: 20 }],
                pointsToRedeem: 10
            });

        expect(res.statusCode).toEqual(400);
        expect(res.body.message).toContain('Insufficient stock for product: Prestige Watch');
        
        // Assert rollbacks
        expect(mockSession.abortTransaction).toHaveBeenCalled();
    });
});
