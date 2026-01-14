import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Zap, Shield, Droplets, Star } from 'lucide-react'
import { useApp } from '../context/AppContext'
import JuiceCard from '../components/JuiceCard'

function Home() {
    const { juices } = useApp()

    const features = [
        { icon: Leaf, title: 'Fresh Daily', description: 'Cold-pressed every morning', color: 'var(--color-detox)' },
        { icon: Zap, title: 'Energy Boost', description: 'Natural ingredients only', color: 'var(--color-energy)' },
        { icon: Shield, title: 'Immunity Power', description: 'Packed with antioxidants', color: 'var(--color-immunity)' },
        { icon: Droplets, title: 'Hydration', description: 'Pure refreshment', color: 'var(--color-refresh)' }
    ]

    return (
        <div className="page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container">
                    <div className="hero-content">
                        <span className="badge badge-primary animate-bounce">🍊 Fresh & Natural</span>
                        <h1 className="hero-title">
                            Fresh Juice,<br />
                            <span className="gradient-text">Delivered Daily</span>
                        </h1>
                        <p className="hero-subtitle">
                            Subscribe to premium cold-pressed juices and start your journey to a healthier lifestyle.
                        </p>
                        <div className="hero-actions">
                            <Link to="/subscribe" className="btn btn-primary btn-lg">
                                Start Subscription <ArrowRight size={20} />
                            </Link>
                            <Link to="/dashboard" className="btn btn-secondary btn-lg">
                                View My Orders
                            </Link>
                        </div>
                        <div className="hero-stats">
                            <div className="hero-stat">
                                <Star size={16} className="text-warning" />
                                <span><strong>4.9</strong> Rating</span>
                            </div>
                            <div className="hero-stat">
                                <span><strong>10K+</strong> Happy Customers</span>
                            </div>
                            <div className="hero-stat">
                                <span><strong>50+</strong> Juice Recipes</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="section">
                <div className="container">
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card card">
                                <div className="feature-icon" style={{ background: `${feature.color}20`, color: feature.color }}>
                                    <feature.icon size={24} />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Juices Section */}
            <section className="section" style={{ background: 'var(--bg-secondary)' }}>
                <div className="container">
                    <div className="section-header text-center mb-8">
                        <h2 className="section-title">Our Popular Juices</h2>
                        <p className="text-muted">Handcrafted with love, delivered fresh to your door</p>
                    </div>
                    <div className="juices-grid">
                        {juices.map(juice => (
                            <JuiceCard key={juice.id} juice={juice} />
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="section cta-section">
                <div className="container text-center">
                    <h2 className="cta-title">Ready to Get Started?</h2>
                    <p className="cta-subtitle">Join thousands of happy customers on their wellness journey</p>
                    <Link to="/subscribe" className="btn btn-primary btn-lg">
                        Subscribe Now <ArrowRight size={20} />
                    </Link>
                </div>
            </section>

            <style>{`
                .hero {
                    padding: var(--space-16) 0 var(--space-20);
                    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
                }

                .hero-content {
                    max-width: 700px;
                }

                .hero-title {
                    font-size: var(--text-5xl);
                    font-weight: var(--font-extrabold);
                    margin: var(--space-4) 0;
                    line-height: 1.1;
                }

                .hero-subtitle {
                    font-size: var(--text-lg);
                    color: var(--color-gray-600);
                    margin-bottom: var(--space-8);
                    max-width: 500px;
                }

                .hero-actions {
                    display: flex;
                    gap: var(--space-4);
                    flex-wrap: wrap;
                }

                .hero-stats {
                    display: flex;
                    gap: var(--space-6);
                    margin-top: var(--space-10);
                    padding-top: var(--space-6);
                    border-top: 1px solid var(--color-gray-200);
                }

                .hero-stat {
                    display: flex;
                    align-items: center;
                    gap: var(--space-2);
                    font-size: var(--text-sm);
                    color: var(--color-gray-600);
                }

                .features-grid {
                    display: grid;
                    grid-template-columns: repeat(4, 1fr);
                    gap: var(--space-6);
                }

                .feature-card {
                    padding: var(--space-6);
                    text-align: center;
                }

                .feature-icon {
                    width: 56px;
                    height: 56px;
                    border-radius: var(--radius-lg);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto var(--space-4);
                }

                .feature-title {
                    font-size: var(--text-lg);
                    margin-bottom: var(--space-2);
                }

                .feature-description {
                    font-size: var(--text-sm);
                    color: var(--color-gray-500);
                }

                .juices-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: var(--space-6);
                }

                .cta-section {
                    background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-accent) 100%);
                    color: white;
                }

                .cta-title {
                    font-size: var(--text-3xl);
                    color: white;
                    margin-bottom: var(--space-2);
                }

                .cta-subtitle {
                    opacity: 0.9;
                    margin-bottom: var(--space-6);
                }

                .cta-section .btn-primary {
                    background: white;
                    color: var(--color-primary);
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }

                @media (max-width: 1024px) {
                    .features-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                    .juices-grid {
                        grid-template-columns: repeat(2, 1fr);
                    }
                }

                @media (max-width: 768px) {
                    .hero-title {
                        font-size: var(--text-4xl);
                    }
                    .features-grid {
                        grid-template-columns: 1fr;
                    }
                    .juices-grid {
                        grid-template-columns: 1fr;
                    }
                    .hero-stats {
                        flex-wrap: wrap;
                    }
                }
            `}</style>
        </div>
    )
}

export default Home
