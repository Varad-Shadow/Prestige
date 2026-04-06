import Product from '../models/Product.js';
import Joi from 'joi';
import {
    isInMemoryMode,
    initInMemoryStore,
    listProducts,
    createProductInStore
} from '../store/inMemoryStore.js';

const productSchema = Joi.object({
    title: Joi.string().required(),
    description: Joi.string().required(),
    price: Joi.number().min(0).required(),
    stock: Joi.number().min(0).required(),
    category: Joi.string().required(),
    imageUrl: Joi.string().required()
});

// @desc    Fetch all products with basic search and filtering
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
    try {
        const { keyword, category } = req.query;

        if (isInMemoryMode()) {
            await initInMemoryStore();
            const products = listProducts({ keyword, category });
            return res.json({
                success: true,
                count: products.length,
                data: products
            });
        }
        
        let query = {};
        
        if (keyword) {
            query.title = {
                $regex: keyword,
                $options: 'i',
            };
        }
        
        if (category) {
            query.category = category;
        }

        const products = await Product.find(query);
        
        res.json({
            success: true,
            count: products.length,
            data: products
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
    try {
        if (isInMemoryMode()) {
            await initInMemoryStore();
        }

        const { error } = productSchema.validate(req.body);
        if (error) {
            res.status(400);
            throw new Error(error.details[0].message);
        }

        const createdProduct = isInMemoryMode()
            ? createProductInStore(req.body)
            : await new Product(req.body).save();

        res.status(201).json({
            success: true,
            data: createdProduct
        });
    } catch (err) {
        next(err);
    }
};
