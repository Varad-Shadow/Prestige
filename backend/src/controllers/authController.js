import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import Joi from 'joi';
import bcrypt from 'bcryptjs';
import {
    isInMemoryMode,
    initInMemoryStore,
    findUserByEmail,
    findUserById,
    createUserInStore,
    updateUserInStore
} from '../store/inMemoryStore.js';

// Validation Schema
const registerSchema = Joi.object({
    name: Joi.string().required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
});

const updateProfileSchema = Joi.object({
    name: Joi.string().min(2),
    email: Joi.string().email(),
    password: Joi.string().min(8)
}).min(1);

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const registerUser = async (req, res, next) => {
    try {
        if (isInMemoryMode()) {
            await initInMemoryStore();
        }

        const { error } = registerSchema.validate(req.body);
        if (error) {
            res.status(400);
            throw new Error(error.details[0].message);
        }

        const { name, email, password } = req.body;

        const userExists = isInMemoryMode()
            ? findUserByEmail(email)
            : await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        const user = isInMemoryMode()
            ? await createUserInStore({ name, email, password })
            : await User.create({
                name,
                email,
                password,
            });

        if (user) {
            res.status(201).json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    loyaltyPoints: user.loyaltyPoints,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
export const loginUser = async (req, res, next) => {
    try {
        if (isInMemoryMode()) {
            await initInMemoryStore();
        }

        const { error } = loginSchema.validate(req.body);
        if (error) {
            res.status(400);
            throw new Error(error.details[0].message);
        }

        const { email, password } = req.body;

        const user = isInMemoryMode()
            ? findUserByEmail(email)
            : await User.findOne({ email });

        const passwordMatch = user
            ? (isInMemoryMode()
                ? await bcrypt.compare(password, user.password)
                : await user.matchPassword(password))
            : false;

        if (user && passwordMatch) {
            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    loyaltyPoints: user.loyaltyPoints,
                    token: generateToken(user._id),
                }
            });
        } else {
            res.status(401);
            throw new Error('Invalid email or password');
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Get user profile
// @route   GET /api/auth/me
// @access  Private
export const getUserProfile = async (req, res, next) => {
    try {
        if (isInMemoryMode()) {
            await initInMemoryStore();
        }

        const user = isInMemoryMode()
            ? findUserById(req.user._id)
            : await User.findById(req.user._id);

        if (user) {
            res.json({
                success: true,
                data: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    loyaltyPoints: user.loyaltyPoints,
                }
            });
        } else {
            res.status(404);
            throw new Error('User not found');
        }
    } catch (err) {
        next(err);
    }
};

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
export const updateUserProfile = async (req, res, next) => {
    try {
        if (isInMemoryMode()) {
            await initInMemoryStore();
        }

        const { error, value } = updateProfileSchema.validate(req.body);
        if (error) {
            res.status(400);
            throw new Error(error.details[0].message);
        }

        const user = isInMemoryMode()
            ? findUserById(req.user._id)
            : await User.findById(req.user._id);
        if (!user) {
            res.status(404);
            throw new Error('User not found');
        }

        if (value.email && value.email !== user.email) {
            const emailExists = isInMemoryMode()
                ? findUserByEmail(value.email)
                : await User.findOne({ email: value.email });
            if (emailExists) {
                res.status(400);
                throw new Error('Email is already in use');
            }
        }

        const updatedUser = isInMemoryMode()
            ? await updateUserInStore(req.user._id, value)
            : await (async () => {
                if (value.name) user.name = value.name;
                if (value.email) user.email = value.email;
                if (value.password) user.password = value.password;
                return user.save();
            })();

        res.json({
            success: true,
            data: {
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                loyaltyPoints: updatedUser.loyaltyPoints
            }
        });
    } catch (err) {
        next(err);
    }
};
