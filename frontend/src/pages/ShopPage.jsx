import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useCartStore } from '../store/useCartStore';

const ShopPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { addItem } = useCartStore();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const res = await api.get('/products');
                // Need to use res.data.data because our backend returns { success, count, data }
                setProducts(res.data.data);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to load products');
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <div className="min-h-screen pt-20 flex justify-center text-prestige-accent text-xl">Loading premium collections...</div>;
    if (error) return <div className="min-h-screen pt-20 flex justify-center text-red-400 text-xl">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 py-12">
            <h1 className="text-4xl font-bold mb-8 text-white">The Collection</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {products.map(product => (
                    <div key={product._id} className="bg-prestige-card rounded-xl overflow-hidden border border-white/5 hover:border-prestige-accent/50 transition duration-300 flex flex-col">
                        <img src={product.imageUrl || 'https://via.placeholder.com/300x300'} alt={product.title} className="w-full h-48 object-cover" />
                        <div className="p-5 flex flex-col flex-grow">
                            <h3 className="text-lg font-semibold text-white mb-1">{product.title}</h3>
                            <p className="text-prestige-muted text-sm mb-4 line-clamp-2">{product.description}</p>
                            <div className="mt-auto flex items-center justify-between">
                                <span className="font-bold text-lg">${product.price.toFixed(2)}</span>
                                <button 
                                    onClick={() => addItem(product)}
                                    className="px-4 py-2 bg-white/5 hover:bg-prestige-accent text-white hover:text-prestige-dark rounded-md font-medium transition"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ShopPage;
