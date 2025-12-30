import React from 'react'

export default function OverlayPanel({ isOpen, title, content, onClose }) {
    if (!isOpen) return null

    return (
        <div className={`overlay-panel ${isOpen ? 'open' : ''}`}>
            <div className="panel-header">
                <h2 className="panel-title">{title || 'Details'}</h2>
                <button className="close-btn" onClick={onClose}>&times;</button>
            </div>
            <div className="panel-content">
                {content ? (
                    <div className="content-body">
                        {/* If content is an array (list items), render list, else generic text */}
                        {content.items && Array.isArray(content.items) ? (
                            <ul>
                                {content.items.map((item, i) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        ) : (
                            <p>{JSON.stringify(content)}</p>
                        )}
                    </div>
                ) : (
                    <p>No content available for this item.</p>
                )}
            </div>
        </div>
    )
}
