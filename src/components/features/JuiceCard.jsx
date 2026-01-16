import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import '../../styles/JuiceCard.css'

function JuiceCard({ juice, onSelect, selected }) {
    return (
        <div
            className={`juice-card card ${selected ? 'selected' : ''} ${onSelect ? 'clickable' : ''}`}
            onClick={onSelect ? () => onSelect(juice) : undefined}
        >
            <div className={`juice-card-image ${juice.category}-bg`}>
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
        </div>
    )
}

JuiceCard.propTypes = {
    juice: PropTypes.shape({
        id: PropTypes.number,
        name: PropTypes.string.isRequired,
        description: PropTypes.string,
        price: PropTypes.number.isRequired,
        category: PropTypes.string.isRequired,
        image: PropTypes.string.isRequired,
        calories: PropTypes.number,
        size: PropTypes.string
    }).isRequired,
    onSelect: PropTypes.func,
    selected: PropTypes.bool
}

export default JuiceCard
