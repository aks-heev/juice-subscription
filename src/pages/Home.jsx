import React, { useState, useEffect, useCallback, useRef } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Zap, Shield, Droplets, Star, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import JuiceCard from '../components/features/JuiceCard'
import JuiceDetailSheet from '../components/features/JuiceDetailSheet'

function Home() {
    const { juices } = useApp()
    const { user } = useAuth()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const [selectedJuice, setSelectedJuice] = useState(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    const handleJuiceClick = (juice) => {
        setSelectedJuice(juice)
        setIsSheetOpen(true)
    }

    const handleCloseSheet = () => {
        setIsSheetOpen(false)
    }

    const features = [
        { icon: Leaf, title: 'Fresh Daily', description: 'Cold-pressed every morning from locally sourced fruits and vegetables', color: 'var(--color-detox)', emoji: '🥬', bg: 'linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 50%, #a5d6a7 100%)' },
        { icon: Zap, title: 'Energy Boost', description: 'Natural ingredients that fuel your body and keep you going all day', color: 'var(--color-energy)', emoji: '⚡', bg: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 50%, #ffcc80 100%)' },
        { icon: Shield, title: 'Immunity Shield', description: 'Packed with antioxidants and vitamins to strengthen your immune system', color: 'var(--color-immunity)', emoji: '🛡️', bg: 'linear-gradient(135deg, #fce4ec 0%, #f8bbd0 50%, #f48fb1 100%)' },
        { icon: Droplets, title: 'Pure Hydration', description: 'Refreshing blends that keep you hydrated with natural electrolytes', color: 'var(--color-refresh)', emoji: '💧', bg: 'linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%)' }
    ]

    const totalSlides = 1 + features.length

    const nextSlide = useCallback(() => {
        setCurrentSlide(prev => (prev + 1) % totalSlides)
    }, [totalSlides])

    const prevSlide = useCallback(() => {
        setCurrentSlide(prev => (prev - 1 + totalSlides) % totalSlides)
    }, [totalSlides])

    // Auto-advance
    useEffect(() => {
        if (!isAutoPlaying) return
        const timer = setInterval(nextSlide, 4500)
        return () => clearInterval(timer)
    }, [isAutoPlaying, nextSlide])

    // Swipe handlers
    const handleTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX
        setIsAutoPlaying(false)
    }
    const handleTouchMove = (e) => {
        touchEndX.current = e.touches[0].clientX
    }
    const handleTouchEnd = () => {
        const diff = touchStartX.current - touchEndX.current
        if (Math.abs(diff) > 50) {
            diff > 0 ? nextSlide() : prevSlide()
        }
        setTimeout(() => setIsAutoPlaying(true), 5000)
    }

    return (
        <div className="page home-page">
            {/* Hero Carousel */}
            <section className="hero-carousel">
                <div 
                    className="carousel-track"
                    style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    onTouchStart={handleTouchStart}
                    onTouchMove={handleTouchMove}
                    onTouchEnd={handleTouchEnd}
                >
                    {/* Slide 1: Hero */}
                    <div className="carousel-slide hero-slide">
                        <div className="slide-bg-art">
                            <span className="bg-fruit bg-fruit-1">🍊</span>
                            <span className="bg-fruit bg-fruit-2">🍋</span>
                            <span className="bg-fruit bg-fruit-3">🥝</span>
                            <span className="bg-fruit bg-fruit-4">🍓</span>
                            <span className="bg-fruit bg-fruit-5">🫐</span>
                            <span className="bg-fruit bg-fruit-6">🍎</span>
                        </div>
                        <div className="container slide-content">
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
                                <Link to={user ? "/subscribe" : "/phone-auth"} className="btn btn-primary btn-cta">
                                    {user ? "Start Subscription" : "Get Started"} <ArrowRight size={18} />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Feature Slides */}
                    {features.map((feature, index) => (
                        <div key={index} className="carousel-slide feature-slide" style={{ background: feature.bg }}>
                            <div className="slide-bg-art">
                                <span className="bg-fruit bg-fruit-1">🍊</span>
                                <span className="bg-fruit bg-fruit-2">🥤</span>
                                <span className="bg-fruit bg-fruit-3">🍹</span>
                                <span className="bg-fruit bg-fruit-4">{feature.emoji}</span>
                                <span className="bg-fruit bg-fruit-5">🍇</span>
                                <span className="bg-fruit bg-fruit-6">🥭</span>
                            </div>
                            <div className="container slide-content feature-slide-content">
                                <div className="feature-slide-icon" style={{ background: `${feature.color}25`, color: feature.color }}>
                                    <feature.icon size={36} />
                                </div>
                                <h2 className="feature-slide-title">{feature.title}</h2>
                                <p className="feature-slide-desc">{feature.description}</p>
                                <div className="feature-slide-emoji">{feature.emoji}</div>
                                <Link to={user ? "/subscribe" : "/phone-auth"} className="btn btn-primary btn-cta-feature">
                                    {user ? "Subscribe Now" : "Get Started"} <ArrowRight size={16} />
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Carousel Controls */}
                <div className="carousel-controls">
                    <button className="carousel-arrow carousel-prev" onClick={() => { prevSlide(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 5000); }}>
                        <ChevronLeft size={20} />
                    </button>
                    <div className="carousel-dots">
                        {Array.from({ length: totalSlides }).map((_, i) => (
                            <button
                                key={i}
                                className={`carousel-dot ${currentSlide === i ? 'active' : ''}`}
                                onClick={() => { setCurrentSlide(i); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 5000); }}
                            />
                        ))}
                    </div>
                    <button className="carousel-arrow carousel-next" onClick={() => { nextSlide(); setIsAutoPlaying(false); setTimeout(() => setIsAutoPlaying(true), 5000); }}>
                        <ChevronRight size={20} />
                    </button>
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
                                <JuiceCard juice={juice} onCardClick={handleJuiceClick} />
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

            {/* Juice Detail Bottom Sheet */}
            <JuiceDetailSheet
                juice={selectedJuice}
                isOpen={isSheetOpen}
                onClose={handleCloseSheet}
            />

            <style>{`
                .home-page {
                    background: var(--bg-primary);
                }

                /* ===== Hero Carousel ===== */
                .hero-carousel {
                    position: relative;
                    overflow: hidden;
                    background: var(--bg-primary);
                }

                .carousel-track {
                    display: flex;
                    transition: transform 0.5s cubic-bezier(0.4, 0, 0.2, 1);
                    will-change: transform;
                }

                .carousel-slide {
                    flex: 0 0 100%;
                    min-height: 420px;
                    position: relative;
                    overflow: hidden;
                    display: flex;
                    align-items: center;
                }

                /* Background fruit art */
                .slide-bg-art {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                    overflow: hidden;
                }

                .bg-fruit {
                    position: absolute;
                    font-size: 60px;
                    opacity: 0.07;
                    filter: blur(1px);
                    user-select: none;
                }
                .bg-fruit-1 { top: 8%; right: 10%; font-size: 80px; transform: rotate(-15deg); }
                .bg-fruit-2 { bottom: 15%; right: 25%; font-size: 50px; transform: rotate(20deg); }
                .bg-fruit-3 { top: 50%; left: 5%; font-size: 70px; transform: rotate(-30deg); }
                .bg-fruit-4 { bottom: 10%; left: 15%; font-size: 55px; transform: rotate(10deg); }
                .bg-fruit-5 { top: 15%; left: 30%; font-size: 45px; transform: rotate(25deg); }
                .bg-fruit-6 { bottom: 40%; right: 5%; font-size: 65px; transform: rotate(-20deg); }

                .slide-content {
                    position: relative;
                    z-index: 2;
                    width: 100%;
                    padding-top: var(--space-8);
                    padding-bottom: var(--space-12);
                }

                /* Hero Slide */
                .hero-slide {
                    background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
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

                /* Feature Slides */
                .feature-slide {
                    color: #333;
                }

                .feature-slide-content {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    text-align: center;
                    justify-content: center;
                }

                .feature-slide-icon {
                    width: 72px;
                    height: 72px;
                    border-radius: var(--radius-xl);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: var(--space-5);
                    backdrop-filter: blur(8px);
                }

                .feature-slide-title {
                    font-size: var(--text-2xl);
                    font-weight: var(--font-extrabold);
                    margin-bottom: var(--space-3);
                    color: #1a1a1a;
                }

                .feature-slide-desc {
                    font-size: var(--text-base);
                    color: #555;
                    line-height: 1.6;
                    max-width: 340px;
                    margin: 0 auto var(--space-4);
                }

                .feature-slide-emoji {
                    font-size: 48px;
                    margin-bottom: var(--space-5);
                    animation: floatEmoji 3s ease-in-out infinite;
                }

                @keyframes floatEmoji {
                    0%, 100% { transform: translateY(0); }
                    50% { transform: translateY(-8px); }
                }

                .btn-cta-feature {
                    display: inline-flex;
                    align-items: center;
                    gap: var(--space-2);
                    padding: var(--space-3) var(--space-6);
                    font-size: var(--text-sm);
                    font-weight: var(--font-semibold);
                    border-radius: var(--radius-lg);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                /* Carousel Controls */
                .carousel-controls {
                    position: absolute;
                    bottom: var(--space-4);
                    left: 0;
                    right: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: var(--space-3);
                    z-index: 5;
                }

                .carousel-arrow {
                    width: 36px;
                    height: 36px;
                    border-radius: var(--radius-full);
                    border: none;
                    background: rgba(255, 255, 255, 0.85);
                    backdrop-filter: blur(8px);
                    color: #333;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    transition: all var(--transition-fast);
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .carousel-arrow:hover {
                    background: white;
                    transform: scale(1.1);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .carousel-dots {
                    display: flex;
                    gap: var(--space-2);
                    align-items: center;
                }

                .carousel-dot {
                    width: 8px;
                    height: 8px;
                    border-radius: var(--radius-full);
                    border: none;
                    background: rgba(0, 0, 0, 0.2);
                    cursor: pointer;
                    transition: all 0.3s ease;
                    padding: 0;
                }

                .carousel-dot.active {
                    width: 24px;
                    background: var(--color-primary);
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
                    display: grid;
                    grid-template-columns: repeat(2, 1fr);
                    gap: var(--space-2);
                    padding-bottom: var(--space-4);
                }

                .juices-scroll::-webkit-scrollbar {
                    display: none;
                }

                .juice-item {
                    min-width: 0;
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

                    .carousel-slide {
                        min-height: 480px;
                    }

                    .feature-slide-title {
                        font-size: var(--text-3xl);
                    }

                    .feature-slide-desc {
                        max-width: 440px;
                    }

                    .juice-item {
                        min-width: 0;
                    }
                }

                @media (min-width: 768px) {
                    .carousel-slide {
                        min-height: 520px;
                    }

                    .hero-title {
                        font-size: var(--text-5xl);
                    }

                    .hero-subtitle {
                        font-size: var(--text-lg);
                        max-width: 500px;
                    }

                    .feature-slide-icon {
                        width: 88px;
                        height: 88px;
                    }

                    .feature-slide-title {
                        font-size: var(--text-4xl);
                    }

                    .feature-slide-desc {
                        font-size: var(--text-lg);
                        max-width: 520px;
                    }

                    .feature-slide-emoji {
                        font-size: 64px;
                    }

                    .bg-fruit {
                        opacity: 0.06;
                    }
                    .bg-fruit-1 { font-size: 120px; }
                    .bg-fruit-3 { font-size: 100px; }
                    .bg-fruit-6 { font-size: 90px; }

                    .carousel-arrow {
                        width: 44px;
                        height: 44px;
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
                    .slide-content {
                        max-width: 700px;
                    }
                }
            `}</style>
        </div>
    )
}

export default Home
