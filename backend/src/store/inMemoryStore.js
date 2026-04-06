import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { products as seedProducts, users as seedUsers } from '../data/seedData.js';

const store = {
    initialized: false,
    users: [],
    products: [],
    orders: []
};

const toId = () => randomUUID().replace(/-/g, '').slice(0, 24);

export const isInMemoryMode = () => process.env.USE_IN_MEMORY_STORE === '1';

export const initInMemoryStore = async () => {
    if (!isInMemoryMode() || store.initialized) {
        return;
    }

    store.products = seedProducts.map((p) => ({
        ...p,
        _id: toId(),
        createdAt: new Date(),
        updatedAt: new Date()
    }));

    const userDocs = [];
    for (const u of seedUsers) {
        const hashed = await bcrypt.hash(u.password, 10);
        userDocs.push({
            _id: toId(),
            name: u.name,
            email: u.email.toLowerCase(),
            password: hashed,
            role: u.role,
            loyaltyPoints: u.loyaltyPoints,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    store.users = userDocs;
    store.orders = [];
    store.initialized = true;
};

export const listProducts = ({ keyword, category } = {}) => {
    let data = [...store.products];

    if (keyword) {
        const k = keyword.toLowerCase();
        data = data.filter((p) => p.title.toLowerCase().includes(k));
    }

    if (category) {
        data = data.filter((p) => p.category === category);
    }

    return data;
};

export const createProductInStore = (payload) => {
    const product = {
        _id: toId(),
        ...payload,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    store.products.push(product);
    return product;
};

export const findProductById = (id) => store.products.find((p) => p._id === id);

export const findUserByEmail = (email) => store.users.find((u) => u.email === email.toLowerCase());

export const findUserById = (id) => store.users.find((u) => u._id === id);

export const createUserInStore = async ({ name, email, password, role = 'customer', loyaltyPoints = 0 }) => {
    const hashed = await bcrypt.hash(password, 10);
    const user = {
        _id: toId(),
        name,
        email: email.toLowerCase(),
        password: hashed,
        role,
        loyaltyPoints,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    store.users.push(user);
    return user;
};

export const updateUserInStore = async (id, updates) => {
    const user = findUserById(id);
    if (!user) return null;

    if (updates.name) user.name = updates.name;
    if (updates.email) user.email = updates.email.toLowerCase();
    if (updates.password) user.password = await bcrypt.hash(updates.password, 10);
    if (typeof updates.loyaltyPoints === 'number') user.loyaltyPoints = updates.loyaltyPoints;
    user.updatedAt = new Date();
    return user;
};

export const createOrderInStore = (orderData) => {
    const order = {
        _id: toId(),
        ...orderData,
        createdAt: new Date(),
        updatedAt: new Date()
    };
    store.orders.push(order);
    return order;
};

export const listOrdersForUser = (userId) => {
    return store.orders
        .filter((o) => o.user === userId)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
};
