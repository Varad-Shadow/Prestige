import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuthStore } from '../store/useAuthStore';

const LoginPage = () => {
    const navigate = useNavigate();
    const { login } = useAuthStore();
    const [isRegister, setIsRegister] = useState(false);
    const [form, setForm] = useState({ name: '', email: '', password: '' });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const onChange = (e) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const path = isRegister ? '/auth/register' : '/auth/login';
            const payload = isRegister
                ? { name: form.name, email: form.email, password: form.password }
                : { email: form.email, password: form.password };

            const res = await api.post(path, payload);
            const { data } = res.data;
            login({
                _id: data._id,
                name: data.name,
                email: data.email,
                role: data.role,
                loyaltyPoints: data.loyaltyPoints
            }, data.token);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-md mx-auto px-4 py-12">
            <div className="bg-prestige-card rounded-xl p-8 border border-prestige-accent/20">
                <h1 className="text-3xl font-bold mb-6 text-white">{isRegister ? 'Create Account' : 'Login'}</h1>

                <form onSubmit={onSubmit} className="space-y-4">
                    {isRegister && (
                        <div>
                            <label className="block text-sm text-prestige-muted mb-1">Name</label>
                            <input
                                name="name"
                                value={form.name}
                                onChange={onChange}
                                required
                                className="w-full px-4 py-3 rounded-md bg-prestige-dark border border-white/10 text-white outline-none focus:border-prestige-accent"
                            />
                        </div>
                    )}

                    <div>
                        <label className="block text-sm text-prestige-muted mb-1">Email</label>
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={onChange}
                            required
                            className="w-full px-4 py-3 rounded-md bg-prestige-dark border border-white/10 text-white outline-none focus:border-prestige-accent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm text-prestige-muted mb-1">Password</label>
                        <input
                            type="password"
                            name="password"
                            value={form.password}
                            onChange={onChange}
                            required
                            minLength={8}
                            className="w-full px-4 py-3 rounded-md bg-prestige-dark border border-white/10 text-white outline-none focus:border-prestige-accent"
                        />
                    </div>

                    {error && <p className="text-sm text-red-400">{error}</p>}

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 bg-prestige-accent text-prestige-dark font-bold rounded-lg hover:bg-yellow-400 transition"
                    >
                        {loading ? 'Please wait...' : (isRegister ? 'Register' : 'Login')}
                    </button>
                </form>

                <button
                    type="button"
                    onClick={() => setIsRegister((prev) => !prev)}
                    className="mt-6 w-full text-sm text-prestige-muted hover:text-white"
                >
                    {isRegister ? 'Already have an account? Login' : 'No account yet? Register'}
                </button>
            </div>
        </div>
    );
};

export default LoginPage;
