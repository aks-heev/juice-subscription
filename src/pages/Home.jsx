import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Zap, Shield, Droplets, Star, TrendingUp } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import JuiceCard from '../components/features/JuiceCard'

function Home() {
    const { juices } = useApp()
    const { user } = useAuth()

    const features = [
        { icon: Leaf, title: 'Fresh Daily', description: 'Cold-pressed every morning', color: 'var(--color-detox)' },
        { icon: Zap, title: 'Energy Boost', description: 'Natural ingredients only', color: 'var(--color-energy)' },
        { icon: Shield, title: 'Immunity', description: 'Packed with antioxidants', color: 'var(--color-immunity)' },
        { icon: Droplets, title: 'Hydration', description: 'Pure refreshment', color: 'var(--color-refresh)' }
    ]

    return (
        <div className="page home-page">
            {/* Compact Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <div className="hero-badge">
                            <span className="emoji">🍊</span>
                            <span>Premium Fresh Juices</span>
                        </div>
                        <h1 className="hero-title">
                            Fresh Juice,<br />
                            <span className="gradient-text">Delivered Daily</span>
                        </h1>
                        <p className="hero-subtitle">
                            Cold-pressed juices delivered to your doorstep every morning
                        </p>
                        
                        {/* Quick Stats */}
                        <div className="quick-stats">
                            <div className="stat-item">
                                <Star size={16} />
                                <span>4.9★</span>
                            </div>
                            <div className="stat-item">
                                <TrendingUp size={16} />
                                <span>10K+ Subscribers</span>
                            </div>
                        </div>

                        <div className="hero-cta">
                            <Link to={user ? "/subscribe" : "/register"} className="btn btn-primary btn-cta">
                                {user ? "Start Subscription" : "Get Started"} <ArrowRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="container">
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card">
                                <div className="feature-icon" style={{ background: `${feature.color}20`, color: feature.color }}>
                                    <feature.icon size={20} />
                                </div>
                                <div className="feature-text">
                                    <h3 className="feature-title">{feature.title}</h3>
                                    <p className="feature-description">{feature.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Juices Section */}
            <section className="juices-section">
                <div className="container">
                    <div className="section-header">
                        <div>
                            <h2 className="section-title">Popular Juices</h2>
                            <p className="section-subtitle">Handcrafted with fresh ingredients</p>
                        </div>
                    </div>
                    <div className="juices-scroll">
                        {juices.map(juice => (
                            <div key={juice.id} className="juice-item">
                                <JuiceCard juice={juice} />
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Start Your Wellness Journey</h2>
                        <p className="cta-subtitle">Join thousands enjoying fresh juices daily</p>
                        <Link to={user ? "/subscribe" : "/register"} className="btn btn-cta-white">
                            {user ? "Subscribe Now" : "Sign Up Now"} <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            <style>{`
                .home-page {
                    background: var(--bg-primary);
                }

                /* Hero Section - Compact Mobile-First */
                .hero {
                    padding: var(--space-6) 0 var(--space-8);
                    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
                }

                .hero-content {
                    max-width: 100%;
                }

                .hero-badge {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-2) var(--space-4);
                    background: rgba(255, 107, 53, 0.1);
                    border-radius: var(--radius-full);
                    font-size: var(--text-sm);
                    font-weight: var(--font-medium);
                    color: var(--color-primary);
                    margin-bottom: var(--space-4);
                }

                .hero-badge .emoji {
                    font-size: 18px;
                }

                .hero-title {
                    font-size: var(--text-3xl);
                    font-weight: var(--font-extrabold);
                    margin-bottom: var(--space-3);
                    line-height: 1.2;
                }

                .hero-subtitle {
                    font-size: var(--text-base);
                    color: var(--color-gray-600);
                    margin-bottom: var(--space-4);
                    line-height: 1.5;
                }

                .quick-stats {
                    display: flex;
                    gap: var(--space-4);
                    margin-bottom: var(--space-6);
                    padding: var(--space-3) 0;
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    font-size: var(--text-sm);
                    font-weight: var(--font-medium);
                    color: var(--color-gray-700);
                }

                .stat-item svg {
                    color: var(--color-warning);
                }

                .hero-cta {
                    display: flex;
                }

                .btn-cta {
                    width: 100%;
                    justify-content: center;
                    padding: var(--space-4) var(--space-6);
                    font-size: var(--text-base);
                }

                /* Features Section - Compact */
                .features-section {
                    padding: var(--space-8) 0;
                    background: var(--bg-card);
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: 1fr;
                    gap: var(--space-4);
                }

                .feature-card {
                    display: flex;
                    align-items: flex-start;
                    gap: var(--space-3);
                    padding: var(--space-4);
                    background: var(--bg-primary);
                    border-radius: var(--radius-lg);
                    transition: all var(--transition-base);
                }

                .feature-card:active {
                    transform: scale(0.98);
                }

                .feature-icon {
                    width: 44px;
                    height: 44px;
                    border-radius: var(--radius-md);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    flex-shrink: 0;
                }

                .feature-text {
                    flex: 1;
                }

                .feature-title {
                    font-size: var(--text-base);
                    font-weight: var(--font-semibold);
                    margin-bottom: var(--space-1);
                }

                .feature-description {
                    font-size: var(--text-sm);
                    color: var(--color-gray-600);
                    line-height: 1.4;
                }

                /* Juices Section - Horizontal Scroll */
                .juices-section {
                    padding: var(--space-8) 0 var(--space-10);
                    background: var(--bg-primary);
                }

                .section-header {
                    margin-bottom: var(--space-6);
                }

                .section-title {
                    font-size: var(--text-xl);
                    font-weight: var(--font-bold);
                    margin-bottom: var(--space-1);
                }

                .section-subtitle {
                    font-size: var(--text-sm);
                    color: var(--color-gray-600);
                }

                .juices-scroll {
                    display: flex;
                    gap: var(--space-4);
                    overflow-x: auto;
                    scroll-snap-type: x mandatory;
                    scrollbar-width: none;
                    -webkit-overflow-scrolling: touch;
                    padding-bottom: var(--space-4);
                    margin: 0 calc(-1 * var(--container-padding));
                    padding-left: var(--container-padding);
                    padding-right: var(--container-padding);
                }

                .juices-scroll::-webkit-scrollbar {
                    display: none;
                }

                .juice-item {
                    flex: 0 0 280px;
                    scroll-snap-align: start;
                }

                /* CTA Section */
                .cta-section {
                    padding: var(--space-12) 0;
                    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
                    text-align: center;
                }

                .cta-content {
                    max-width: 100%;
                }

                .cta-title {
                    font-size: var(--text-2xl);
                    font-weight: var(--font-bold);
                    color: white;
                    margin-bottom: var(--space-2);
                }

                .cta-subtitle {
                    font-size: var(--text-base);
                    color: rgba(255, 255, 255, 0.9);
                    margin-bottom: var(--space-6);
                }

                .btn-cta-white {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-4) var(--space-8);
                    background: white;
                    color: var(--color-primary);
                    font-weight: var(--font-semibold);
                    border-radius: var(--radius-lg);
                    text-decoration: none;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                    transition: all var(--transition-base);
                }

                .btn-cta-white:active {
                    transform: scale(0.98);
                }

                /* Tablet and Desktop */
                @media (min-width: 640px) {
                    .hero-title {
                        font-size: var(--text-4xl);
                    }

                    .btn-cta {
                        width: auto;
                    }

                    .features-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: var(--space-5);
                    }

                    .juice-item {
                        flex: 0 0 320px;
                    }
                }

                @media (min-width: 768px) {
                    .hero {
                        padding: var(--space-12) 0 var(--space-16);
                    }

                    .hero-title {
                        font-size: var(--text-5xl);
                    }

                    .hero-subtitle {
                        font-size: var(--text-lg);
                        max-width: 500px;
                    }

                    .features-grid {
                        grid-template-columns: repeat(4, 1fr);
                        gap: var(--space-6);
                    }

                    .feature-card {
                        flex-direction: column;
                        text-align: center;
                        align-items: center;
                    }

                    .juices-scroll {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: var(--space-6);
                        overflow-x: visible;
                        margin: 0;
                        padding: 0;
                    }

                    .juice-item {
                        flex: unset;
                    }

                    .cta-title {
                        font-size: var(--text-3xl);
                    }
                }

                @media (min-width: 1024px) {
                    .hero-content {
                        max-width: 700px;
                    }
                }
            `}</style>
        </div>
    )
}

export default Home
