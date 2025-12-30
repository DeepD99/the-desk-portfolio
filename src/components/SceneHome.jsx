import React from 'react';
import { objectMap } from '../content/objectMap';

export default function SceneHome({ onCardClick, isTransitioning }) {
    return (
        <div className={`scene-root scene-home ${isTransitioning ? 'transitioning' : ''}`}>
            {objectMap.map((obj) => (
                <div
                    key={obj.id}
                    className="polaroid-card"
                    style={obj.style}
                    onClick={(e) => onCardClick(e, obj)}
                    data-card-id={obj.id}
                >
                    <div className="image-stack">
                        {obj.images?.closed && (
                            <img
                                src={obj.images.closed}
                                alt={obj.label}
                                className="blueprint-image image-closed"
                            />
                        )}
                        {obj.images?.open && (
                            <img
                                src={obj.images.open}
                                alt={obj.label}
                                className="blueprint-image image-open"
                            />
                        )}
                    </div>
                    <span className="blueprint-label">{obj.label}</span>
                </div>
            ))}
        </div>
    );
}
