import React from 'react'
import { Link } from 'react-router-dom'

function JuiceCard({ juice, onSelect, selected }) {
    const categoryColors = {
        detox: 'var(--color-detox)',
        energy: 'var(--color-energy)',
        immunity: 'var(--color-immunity)',
        refresh: 'var(--color-refresh)',
        protein: 'var(--color-protein)'
    }

    return (
        <div
            className={`juice-card card ${selected ? 'selected' : ''}`}
            onClick={onSelect ? () => onSelect(juice) : undefined}
            style={{ cursor: onSelect ? 'pointer' : 'default' }}
        >
            <div className="juice-card-image" style={{ background: `${categoryColors[juice.category]}15` }}>
                <span className="juice-emoji">{juice.image}</span>
            </div>
            <div className="juice-card-body">
                <span className={`badge badge-${juice.category}`}>{juice.category}</span>
                <h3 className="juice-name">{juice.name}</h3>
                <p className="juice-description">{juice.description}</p>
                <div className="juice-meta">
                    <span className="juice-calories">{juice.calories} cal</span>
                    <span className="juice-size">{juice.size}</span>
                </div>
                <div className="juice-footer">
                    <span className="juice-price">₹{juice.price}</span>
                    {!onSelect && (
                        <Link to="/subscribe" className="btn btn-primary btn-sm">
                            Subscribe
                        </Link>
                    )}
                </div>
            </div>

            <style>{`
                .juice-card {
                    transition: all var(--transition-base);
                }

                .juice-card.selected {
                    border: 2px solid var(--color-primary);
                    transform: scale(1.02);
                }

                .juice-card-image {
                    height: 160px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .juice-emoji {
                    font-size: 64px;
                }

                .juice-card-body {
                    padding: var(--space-4);
                }

                .juice-name {
                    font-size: var(--text-lg);
                    margin: var(--space-2) 0;
                }

                .juice-description {
                    font-size: var(--text-sm);
                    color: var(--color-gray-500);
                    margin-bottom: var(--space-3);
                    line-height: 1.5;
                }

                .juice-meta {
                    display: flex;
                    gap: var(--space-4);
                    font-size: var(--text-xs);
                    color: var(--color-gray-400);
                    margin-bottom: var(--space-4);
                }

                .juice-footer {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                }

                .juice-price {
                    font-family: var(--font-display);
                    font-size: var(--text-xl);
                    font-weight: var(--font-bold);
                    color: var(--color-primary);
                }
            `}</style>
        </div>
    )
}

export default JuiceCard
