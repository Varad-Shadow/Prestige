import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isInMemoryMode, initInMemoryStore, findUserById } from '../store/inMemoryStore.js';

export const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            if (isInMemoryMode()) {
                await initInMemoryStore();
                const user = findUserById(decoded.id);
                req.user = user
                    ? {
                        _id: user._id,
                        name: user.name,
                        email: user.email,
                        role: user.role,
                        loyaltyPoints: user.loyaltyPoints
                    }
                    : null;
            } else {
                req.user = await User.findById(decoded.id).select('-password');
            }
            
            if (!req.user) {
                res.status(401);
                throw new Error('Not authorized, user not found');
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(401);
            next(new Error('Not authorized, token failed'));
        }
    } else {
        res.status(401);
        next(new Error('Not authorized, no token'));
    }
};
