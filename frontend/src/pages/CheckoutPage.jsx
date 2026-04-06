import React, { useState } from 'react';
import { useCartStore } from '../store/useCartStore';
import { useAuthStore } from '../store/useAuthStore';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';

const CheckoutPage = () => {
    const { items, getCartSubtotal, clearCart } = useCartStore();
    const { points, setPoints, token } = useAuthStore();
    const [pointsToRedeem, setPointsToRedeem] = useState(0);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const subtotal = getCartSubtotal();
    // Maximum points user can redeem is up to the subtotal of the cart
    const maxRedeemable = Math.floor(Math.min(points, subtotal));
    
    const discountApplied = pointsToRedeem;
    const finalTotal = subtotal - discountApplied;
    const pointsEarned = Math.floor(finalTotal / 100);

    const handleCheckout = async () => {
        if (!token) {
            setError('You must be logged in to checkout.');
            return;
        }
        
        setLoading(true);
        setError('');
        
        try {
            const formattedItems = items.map(i => ({
                product: i.product._id,
                quantity: i.quantity
            }));

            const res = await api.post('/orders/checkout', {
                items: formattedItems,
                pointsToRedeem
            });

            // Update user's points dynamically
            setPoints(res.data.loyaltySummary.newBalance);
            clearCart();
            alert('Order placed successfully!');
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Error processing checkout');
        } finally {
            setLoading(false);
        }
    };

    if (items.length === 0) return <div className="text-center mt-20 text-xl text-prestige-muted">Your cart is empty.</div>;

    return (
        <div className="max-w-4xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
            <div className="flex-1">
                <h1 className="text-3xl font-bold mb-6">Checkout</h1>
                <div className="bg-prestige-card rounded-xl p-6 border border-white/5">
                    {items.map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center mb-4 pb-4 border-b border-white/10 last:border-0">
                            <div>
                                <h3 className="font-semibold">{item.product.title}</h3>
                                <p className="text-sm text-prestige-muted">Qty: {item.quantity}</p>
                            </div>
                            <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                        </div>
                    ))}
                </div>
            </div>

            <div className="w-full md:w-96">
                <div className="bg-prestige-card rounded-xl p-6 border border-prestige-accent/20 sticky top-24">
                    <h2 className="text-xl font-bold mb-6">Order Summary</h2>
                    
                    <div className="flex justify-between mb-4">
                        <span className="text-prestige-muted">Subtotal</span>
                        <span>${subtotal.toFixed(2)}</span>
                    </div>

                    {/* REDEEM POINTS SLIDER/INPUT (CRITICAL UI) */}
                    <div className="mb-6 p-4 bg-black/40 rounded-lg border border-prestige-accent/30">
                        <div className="flex justify-between mb-2">
                            <span className="text-sm font-semibold text-prestige-accent">Redeem Prestige Points</span>
                            <span className="text-sm text-prestige-muted">Bal: {points}</span>
                        </div>
                        <input 
                            type="range" 
                            min="0" 
                            max={maxRedeemable} 
                            value={pointsToRedeem}
                            onChange={(e) => setPointsToRedeem(Number(e.target.value))}
                            className="w-full accent-prestige-accent cursor-pointer"
                        />
                        <div className="flex justify-between mt-2 text-sm">
                            <span>0</span>
                            <span className="text-prestige-accent font-bold">-{pointsToRedeem}</span>
                            <span>{maxRedeemable}</span>
                        </div>
                    </div>

                    <div className="flex justify-between mb-4 text-prestige-accent font-medium">
                        <span>Discount Applied</span>
                        <span>-${discountApplied.toFixed(2)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-6 pt-4 border-t border-white/10">
                        <span className="text-xl font-bold">Final Total</span>
                        <span className="text-2xl font-bold">${finalTotal.toFixed(2)}</span>
                    </div>

                    <div className="mb-6 text-center text-sm text-prestige-muted bg-prestige-dark p-3 rounded border border-white/5">
                        You will earn <span className="font-bold text-prestige-accent">{pointsEarned} PTS</span> on this order.
                    </div>

                    {error && <div className="mb-4 text-red-500 text-sm text-center">{error}</div>}

                    <button 
                        onClick={handleCheckout}
                        disabled={loading}
                        className="w-full py-4 bg-prestige-accent text-prestige-dark font-bold rounded-lg hover:bg-yellow-400 transition"
                    >
                        {loading ? 'Processing...' : 'Place Order'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
