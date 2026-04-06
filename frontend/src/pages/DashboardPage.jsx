import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { Crown } from 'lucide-react';
import api from '../services/api';

const DashboardPage = () => {
    const { user, points, setUser } = useAuthStore();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [profileLoading, setProfileLoading] = useState(false);
    const [profileMessage, setProfileMessage] = useState('');
    const [profileForm, setProfileForm] = useState({
        name: '',
        email: '',
        password: ''
    });

    useEffect(() => {
        const fetchOrders = async () => {
            try {
                const res = await api.get('/orders/my');
                setOrders(res.data.data || []);
            } catch (err) {
                setError(err.response?.data?.message || err.message || 'Failed to load orders');
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            setProfileForm({
                name: user.name || '',
                email: user.email || '',
                password: ''
            });
            fetchOrders();
        }
    }, [user]);

    const handleProfileChange = (e) => {
        setProfileForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        setProfileMessage('');

        try {
            const payload = {
                name: profileForm.name,
                email: profileForm.email
            };

            if (profileForm.password.trim()) {
                payload.password = profileForm.password;
            }

            const res = await api.put('/auth/me', payload);
            setUser(res.data.data);
            setProfileForm((prev) => ({ ...prev, password: '' }));
            setProfileMessage('Profile updated successfully.');
        } catch (err) {
            setProfileMessage(err.response?.data?.message || err.message || 'Failed to update profile');
        } finally {
            setProfileLoading(false);
        }
    };

    if (!user) return <div className="text-center mt-20">Please log in to view your dashboard.</div>;

    return (
        <div className="max-w-5xl mx-auto px-4 py-12">
            <div className="bg-prestige-card rounded-2xl p-8 border border-prestige-accent/20 mb-8 flex items-center gap-6">
                <div className="bg-prestige-dark p-6 rounded-full border border-prestige-accent/50">
                    <Crown className="w-16 h-16 text-prestige-accent" />
                </div>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Welcome, {user.name}</h1>
                    <p className="text-prestige-muted text-lg">Your Apex Prestige Status is active.</p>
                </div>
                <div className="ml-auto text-right">
                    <div className="text-sm text-prestige-muted uppercase tracking-widest mb-1">Available Points</div>
                    <div className="text-5xl font-black text-prestige-accent">{points}</div>
                </div>
            </div>

            <h2 className="text-2xl font-bold mb-6">Recent Orders</h2>
            <div className="bg-prestige-card rounded-xl border border-white/5 p-8">
                {loading && <p className="text-prestige-muted text-center">Loading your orders...</p>}
                {!loading && error && <p className="text-red-400 text-center">{error}</p>}
                {!loading && !error && orders.length === 0 && (
                    <p className="text-prestige-muted text-center">No orders yet. Place your first order from the shop.</p>
                )}
                {!loading && !error && orders.length > 0 && (
                    <div className="space-y-4">
                        {orders.map((order) => (
                            <div key={order._id} className="border border-white/10 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-prestige-muted">Order ID: {order._id}</span>
                                    <span className="text-sm font-semibold text-prestige-accent uppercase">{order.status}</span>
                                </div>
                                <div className="text-sm text-prestige-muted mb-2">Items: {order.items.length}</div>
                                <div className="font-semibold text-white">Total: ${order.finalTotal.toFixed(2)}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <h2 className="text-2xl font-bold mt-10 mb-6">Profile Settings</h2>
            <form onSubmit={handleProfileSave} className="bg-prestige-card rounded-xl border border-white/5 p-8 space-y-4">
                <div>
                    <label className="block text-sm text-prestige-muted mb-1">Name</label>
                    <input
                        name="name"
                        value={profileForm.name}
                        onChange={handleProfileChange}
                        required
                        className="w-full px-4 py-3 rounded-md bg-prestige-dark border border-white/10 text-white outline-none focus:border-prestige-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm text-prestige-muted mb-1">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={profileForm.email}
                        onChange={handleProfileChange}
                        required
                        className="w-full px-4 py-3 rounded-md bg-prestige-dark border border-white/10 text-white outline-none focus:border-prestige-accent"
                    />
                </div>

                <div>
                    <label className="block text-sm text-prestige-muted mb-1">New Password (optional)</label>
                    <input
                        type="password"
                        name="password"
                        value={profileForm.password}
                        onChange={handleProfileChange}
                        minLength={8}
                        className="w-full px-4 py-3 rounded-md bg-prestige-dark border border-white/10 text-white outline-none focus:border-prestige-accent"
                    />
                </div>

                {profileMessage && <p className="text-sm text-prestige-muted">{profileMessage}</p>}

                <button
                    type="submit"
                    disabled={profileLoading}
                    className="w-full py-3 bg-prestige-accent text-prestige-dark font-bold rounded-lg hover:bg-yellow-400 transition"
                >
                    {profileLoading ? 'Saving...' : 'Save Profile'}
                </button>
            </form>
        </div>
    );
};

export default DashboardPage;
