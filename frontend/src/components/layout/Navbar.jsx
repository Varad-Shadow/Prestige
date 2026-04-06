import React from 'react';
import { useAuthStore } from '../../store/useAuthStore';
import { useCartStore } from '../../store/useCartStore';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, Crown } from 'lucide-react';

const Navbar = () => {
    const { token, points, user, logout } = useAuthStore();
    const { items } = useCartStore();

    const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

    return (
        <nav className="bg-prestige-dark border-b border-prestige-card sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center gap-2">
                        <Crown className="text-prestige-accent h-6 w-6" />
                        <Link to="/" className="text-xl font-bold text-white tracking-widest uppercase">Apex Prestige</Link>
                    </div>

                    <div className="flex items-center space-x-6">
                        <Link to="/shop" className="text-prestige-muted hover:text-white transition">Shop</Link>
                        
                        <Link to="/checkout" className="relative text-prestige-muted hover:text-white transition">
                            <ShoppingCart className="h-6 w-6" />
                            {itemCount > 0 && (
                                <span className="absolute -top-2 -right-2 bg-prestige-accent text-prestige-dark text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                                    {itemCount}
                                </span>
                            )}
                        </Link>

                        {token ? (
                            <div className="flex items-center space-x-4">
                                <Link to="/dashboard" className="flex items-center gap-2 px-3 py-1 bg-prestige-card rounded-md border border-prestige-accent/20">
                                    <Crown className="h-4 w-4 text-prestige-accent" />
                                    <span className="text-sm font-semibold text-prestige-accent">{points} PTS</span>
                                </Link>
                                <button onClick={logout} className="text-sm text-prestige-muted hover:text-white">Logout</button>
                            </div>
                        ) : (
                            <Link to="/login" className="flex items-center gap-2 text-prestige-muted hover:text-white">
                                <User className="h-5 w-5" />
                                <span>Login</span>
                            </Link>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
