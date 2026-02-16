import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Leaf, Zap, Shield, Droplets, Star, TrendingUp, ChevronLeft, ChevronRight, Check } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import JuiceCard from '../components/features/JuiceCard'
import JuiceDetailSheet from '../components/features/JuiceDetailSheet'
import '../styles/Home.css'

const JUICE_CATEGORIES = [
    { id: 'all', name: 'All', color: '#6B7280', emoji: '🍹' },
    { id: 'detox', name: 'Detox', color: '#7CB518', emoji: '🥬' },
    { id: 'energy', name: 'Energy', color: '#FF6B35', emoji: '⚡' },
    { id: 'immunity', name: 'Immunity', color: '#FFB627', emoji: '🛡️' },
    { id: 'refresh', name: 'Refresh', color: '#2EC4B6', emoji: '💧' },
    { id: 'protein', name: 'Protein', color: '#9B5DE5', emoji: '💪' },
]

function Home() {
    const { juices } = useApp()
    const { user } = useAuth()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [isAutoPlaying, setIsAutoPlaying] = useState(true)
    const [selectedJuice, setSelectedJuice] = useState(null)
    const [isSheetOpen, setIsSheetOpen] = useState(false)
    const [selectedCategories, setSelectedCategories] = useState(['all'])
    const touchStartX = useRef(0)
    const touchEndX = useRef(0)

    const toggleCategory = (categoryId) => {
        if (categoryId === 'all') {
            setSelectedCategories(['all'])
        } else {
            setSelectedCategories(prev => {
                const withoutAll = prev.filter(id => id !== 'all')
                if (withoutAll.includes(categoryId)) {
                    const newSelection = withoutAll.filter(id => id !== categoryId)
                    return newSelection.length === 0 ? ['all'] : newSelection
                } else {
                    return [...withoutAll, categoryId]
                }
            })
        }
    }

    const filteredJuices = useMemo(() => {
        if (selectedCategories.includes('all')) return juices
        return juices.filter(juice => selectedCategories.includes(juice.category))
    }, [juices, selectedCategories])

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
                    {/* Category Filter */}
                    <div className="category-filter">
                        <div className="category-filter-label">Browse Juices</div>
                        <div className="category-circles">
                            {JUICE_CATEGORIES.map(category => {
                                const isSelected = selectedCategories.includes(category.id)
                                
                                return (
                                    <button
                                        key={category.id}
                                        className={`category-circle-item ${isSelected ? 'selected' : ''}`}
                                        onClick={() => toggleCategory(category.id)}
                                        style={{ '--cat-color': category.color }}
                                    >
                                        <div className="circle-avatar">
                                            <span className="circle-emoji">{category.emoji}</span>
                                            {isSelected && (
                                                <span className="circle-check">
                                                    <Check size={12} strokeWidth={3} />
                                                </span>
                                            )}
                                        </div>
                                        <span className="circle-name">{category.name}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                    <div className="juices-scroll">
                        {filteredJuices.map(juice => (
                            <div key={juice.id} className="juice-item">
                                <JuiceCard juice={juice} onCardClick={handleJuiceClick} />
                            </div>
                        ))}
                        {filteredJuices.length === 0 && (
                            <div className="no-juices">
                                <span className="no-juices-emoji">🍹</span>
                                <p>No juices found in this category</p>
                            </div>
                        )}
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
        </div>
    )
}

export default Home
