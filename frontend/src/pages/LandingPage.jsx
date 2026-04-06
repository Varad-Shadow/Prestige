import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Crown, Sparkles, TrendingUp } from 'lucide-react';

const LandingPage = () => {
    return (
        <div className="min-h-screen bg-prestige-dark text-prestige-text flex flex-col items-center">
            {/* Hero Section */}
            <motion.section 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="flex flex-col items-center text-center mt-24 px-4 w-full max-w-4xl"
            >
                <div className="p-4 bg-prestige-card/50 rounded-full mb-6 border border-prestige-accent/20">
                    <Crown className="h-12 w-12 text-prestige-accent" />
                </div>
                <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
                    Elevate Your <span className="text-prestige-accent">Status.</span>
                </h1>
                <p className="text-lg md:text-xl text-prestige-muted max-w-2xl mb-10 leading-relaxed">
                    Welcome to the Apex Prestige E-Commerce Platform. Shop premium collections, earn prestige points, and unlock exclusive rewards reserved for the elite.
                </p>
                <Link to="/shop" className="px-8 py-4 bg-prestige-accent text-prestige-dark font-bold rounded-lg text-lg hover:bg-yellow-400 transition transform hover:scale-105 shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                    Enter The Shop
                </Link>
            </motion.section>

            {/* Features Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-32 max-w-6xl px-4 pb-20 w-full">
                <FeatureCard 
                    icon={<TrendingUp className="h-8 w-8 text-prestige-accent" />}
                    title="Earn Points"
                    desc="Receive 1 Apex Prestige point for every $100 spent."
                />
                <FeatureCard 
                    icon={<Sparkles className="h-8 w-8 text-prestige-accent" />}
                    title="Redeem Instantly"
                    desc="Apply your points directly at checkout to reduce your final total."
                />
                <FeatureCard 
                    icon={<Crown className="h-8 w-8 text-prestige-accent" />}
                    title="Exclusive Tiers"
                    desc="Unlock access to higher rewards and hidden store items based on your balance."
                />
            </div>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }) => (
    <motion.div 
        whileHover={{ y: -5 }}
        className="bg-prestige-card p-8 rounded-2xl border border-white/5 hover:border-prestige-accent/50 transition-colors"
    >
        <div className="mb-4">{icon}</div>
        <h3 className="text-xl font-bold mb-2 text-white">{title}</h3>
        <p className="text-prestige-muted">{desc}</p>
    </motion.div>
);

export default LandingPage;
