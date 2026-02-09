import { useState } from 'react';

export default function PricingPage({ onClose }) {
    const [selectedPlan, setSelectedPlan] = useState(null);
    const [billingCycle, setBillingCycle] = useState('monthly');

    const plans = [
        {
            id: 'basic',
            name: 'Basic',
            icon: '📊',
            description: 'Essential analytics for small operators',
            monthlyPrice: 9999,
            yearlyPrice: 99990,
            features: [
                { name: 'Station Analytics Dashboard', included: true },
                { name: 'Real-time KPI Monitoring', included: true },
                { name: 'Basic Reporting', included: true },
                { name: 'Up to 10 Stations', included: true },
                { name: 'Email Support', included: true },
                { name: 'Scenario Simulation', included: false },
                { name: 'Recommendations Engine', included: false },
                { name: 'Stock Optimization', included: false },
            ],
            color: 'from-blue-500 to-cyan-500',
            popular: false
        },
        {
            id: 'pro',
            name: 'Pro',
            icon: '🚀',
            description: 'Advanced simulation for growing networks',
            monthlyPrice: 24999,
            yearlyPrice: 249990,
            features: [
                { name: 'Everything in Basic', included: true },
                { name: 'Scenario Simulation Engine', included: true },
                { name: 'What-If Analysis', included: true },
                { name: 'AI Recommendations', included: true },
                { name: 'Up to 50 Stations', included: true },
                { name: 'Priority Support', included: true },
                { name: 'Stock Optimization', included: false },
                { name: 'Cost Optimization', included: false },
            ],
            color: 'from-purple-500 to-pink-500',
            popular: true
        },
        {
            id: 'advanced',
            name: 'Advanced',
            icon: '⚡',
            description: 'Complete optimization suite for enterprises',
            monthlyPrice: 49999,
            yearlyPrice: 499990,
            features: [
                { name: 'Everything in Pro', included: true },
                { name: 'Stock/Replenishment Policy', included: true },
                { name: 'Cost Optimization Engine', included: true },
                { name: 'City-level Planning', included: true },
                { name: 'Unlimited Stations', included: true },
                { name: 'Dedicated Account Manager', included: true },
                { name: 'Custom Integrations', included: true },
                { name: 'SLA Guarantee', included: true },
            ],
            color: 'from-orange-500 to-red-500',
            popular: false
        }
    ];

    const addons = [
        {
            name: 'One-time Scenario Analysis',
            description: 'Comprehensive network analysis report for cities/government',
            price: 199999,
            icon: '📋'
        },
        {
            name: 'Custom Training Session',
            description: '2-hour live training for your operations team',
            price: 49999,
            icon: '🎓'
        },
        {
            name: 'API Access',
            description: 'Full API access for custom integrations',
            price: 14999,
            priceLabel: '/month',
            icon: '🔗'
        }
    ];

    const formatPrice = (price) => {
        return new Intl.NumberFormat('en-IN', {
            style: 'currency',
            currency: 'INR',
            maximumFractionDigits: 0
        }).format(price);
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/90 backdrop-blur-md animate-fade-in"
                onClick={onClose}
            ></div>

            {/* Content */}
            <div className="relative min-h-screen p-4 md:p-8 flex items-start justify-center">
                <div className="relative w-full max-w-6xl animate-slide-in pb-12">
                    {/* Close Button */}
                    <button
                        onClick={onClose}
                        className="absolute -top-4 -right-4 md:top-0 md:right-0 z-10 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:rotate-90"
                    >
                        ✕
                    </button>

                    {/* Header */}
                    <div className="text-center mb-12 pt-8">
                        <div className="inline-block px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-sm font-bold mb-4 animate-bounce-subtle">
                            ✨ UNLOCK FULL POTENTIAL
                        </div>
                        <h2 className="text-4xl md:text-6xl font-black mb-4 tracking-tight">
                            <span className="text-white">Choose Your </span>
                            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent text-glow">Power Plan</span>
                        </h2>
                        <p className="text-gray-400 text-lg max-w-2xl mx-auto leading-relaxed">
                            Scale your battery swapping network with precision analytics, AI-driven recommendations, and enterprise-grade optimization tools.
                        </p>

                        {/* Billing Toggle */}
                        <div className="flex items-center justify-center gap-6 mt-10 bg-white/5 inline-flex p-1.5 rounded-full border border-white/10 backdrop-blur-sm">
                            <button
                                onClick={() => setBillingCycle('monthly')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 ${billingCycle === 'monthly'
                                    ? 'bg-white/10 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setBillingCycle('yearly')}
                                className={`px-6 py-2 rounded-full text-sm font-bold transition-all duration-300 flex items-center gap-2 ${billingCycle === 'yearly'
                                    ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg'
                                    : 'text-gray-400 hover:text-white'
                                    }`}
                            >
                                Yearly
                                <span className={`text-[10px] bg-white/20 px-1.5 py-0.5 rounded text-white ${billingCycle === 'yearly' ? 'block' : 'hidden'}`}>
                                    -17%
                                </span>
                            </button>
                        </div>
                    </div>

                    {/* Pricing Cards */}
                    <div className="grid md:grid-cols-3 gap-8 mb-16 px-2 md:px-0">
                        {plans.map((plan, idx) => (
                            <div
                                key={plan.id}
                                className={`relative glass-card p-8 rounded-3xl transition-all duration-500 group ${selectedPlan === plan.id
                                    ? `ring-2 ring-offset-2 ring-offset-black ${plan.id === 'basic' ? 'ring-blue-500' : plan.id === 'pro' ? 'ring-purple-500' : 'ring-orange-500'} scale-105`
                                    : 'hover:scale-[1.02] hover:bg-white/10'
                                    } ${plan.popular ? 'md:-mt-8 md:mb-8 z-10 shadow-2xl shadow-purple-900/40 bg-gradient-to-b from-slate-800/80 to-slate-900/90' : 'bg-slate-900/60'}`}
                                onClick={() => setSelectedPlan(plan.id)}
                                style={{ animationDelay: `${idx * 0.1}s` }}
                            >
                                {/* Glow Effect */}
                                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${plan.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>

                                {/* Popular Badge */}
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-4 py-1.5 rounded-full shadow-lg shadow-purple-500/30 flex items-center gap-1">
                                            <span>🔥</span> MOST POPULAR
                                        </div>
                                    </div>
                                )}

                                {/* Plan Header */}
                                <div className="text-center mb-8 relative">
                                    <div className={`w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br ${plan.color} flex items-center justify-center text-3xl mb-4 shadow-lg`}>
                                        {plan.icon}
                                    </div>
                                    <h3 className="text-2xl font-black text-white mb-2">{plan.name}</h3>
                                    <p className="text-gray-400 text-sm h-10">{plan.description}</p>
                                </div>

                                {/* Price */}
                                <div className="text-center mb-8 pb-8 border-b border-white/10 relative">
                                    <div className="flex items-baseline justify-center gap-1">
                                        <span className="text-gray-400 text-xl font-medium">₹</span>
                                        <span className={`text-5xl font-black bg-gradient-to-r ${plan.color} bg-clip-text text-transparent tracking-tight`}>
                                            {billingCycle === 'monthly'
                                                ? (plan.monthlyPrice / 1000).toFixed(0) + 'K'
                                                : (plan.yearlyPrice / 100000).toFixed(1) + 'L'
                                            }
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm mt-1 font-medium">
                                        billed {billingCycle === 'monthly' ? 'monthly' : 'yearly'}
                                    </p>
                                </div>

                                {/* Features */}
                                <ul className="space-y-4 mb-8 relative">
                                    {plan.features.map((feature, idx) => (
                                        <li key={idx} className="flex items-start gap-3">
                                            <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${feature.included
                                                ? `bg-gradient-to-br ${plan.color} text-white shadow-sm`
                                                : 'bg-white/5 text-gray-500'
                                                }`}>
                                                <span className="text-[10px] font-bold">{feature.included ? '✓' : '✕'}</span>
                                            </div>
                                            <span className={`text-sm leading-tight ${feature.included ? 'text-gray-200 font-medium' : 'text-gray-600 line-through'}`}>
                                                {feature.name}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {/* CTA Button */}
                                <button className={`w-full py-4 rounded-xl font-bold transition-all duration-300 relative overflow-hidden group/btn ${plan.popular
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-purple-500/50'
                                    : 'bg-white/10 text-white hover:bg-white/20'
                                    }`}>
                                    <span className="relative z-10 flex items-center justify-center gap-2">
                                        {plan.popular ? 'Get Started Now' : 'Select Plan'}
                                        <span className="group-hover/btn:translate-x-1 transition-transform">→</span>
                                    </span>
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Add-ons */}
                    <div className="glass-card p-8 rounded-3xl mb-12 animate-slide-in" style={{ animationDelay: '0.4s' }}>
                        <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                            <span className="text-3xl">🎁</span>
                            <span>Power-Up Add-ons</span>
                        </h3>
                        <div className="grid md:grid-cols-3 gap-6">
                            {addons.map((addon, idx) => (
                                <div key={idx} className="bg-white/5 rounded-2xl p-5 border border-white/5 hover:bg-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group">
                                    <div className="flex items-start gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl shadow-inner border border-white/5 group-hover:scale-110 transition-transform">
                                            {addon.icon}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="text-white font-bold text-base mb-1">{addon.name}</h4>
                                            <p className="text-gray-400 text-xs mb-3 leading-relaxed">{addon.description}</p>
                                            <p className="text-cyan-400 font-bold text-lg flex items-baseline gap-1">
                                                {formatPrice(addon.price)}
                                                {addon.priceLabel && <span className="text-gray-500 font-normal text-xs">{addon.priceLabel}</span>}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Enterprise Contact */}
                    <div className="text-center animate-slide-in" style={{ animationDelay: '0.5s' }}>
                        <p className="text-gray-400 mb-4 text-lg">
                            Building a city-wide infrastructure?
                        </p>
                        <button className="group relative inline-flex items-center gap-2 px-8 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-semibold transition-all duration-300 border border-white/10 hover:border-cyan-500/50">
                            <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">Contact Enterprise Sales</span>
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
