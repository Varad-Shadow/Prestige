import dotenv from 'dotenv';
import { connectDB } from '../src/config/db.js';
import Product from '../src/models/Product.js';
import User from '../src/models/User.js';
import { products, users } from '../src/data/seedData.js';

dotenv.config();

const runSeed = async () => {
    try {
        await connectDB();

        await Product.deleteMany({});
        await User.deleteMany({ email: { $in: users.map((u) => u.email) } });

        await Product.insertMany(products);

        for (const user of users) {
            const doc = new User(user);
            await doc.save();
        }

        console.log('Seed completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error(`Seed failed: ${error.message}`);
        process.exit(1);
    }
};

runSeed();
