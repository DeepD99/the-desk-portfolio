import React from 'react';
import { objectMap } from '../content/objectMap';

export default function SceneHome({ onCardClick, isTransitioning, activeScene, isLaptopTransition, isWipeTransition }) {
    const isSpotifyTransition = activeScene === 'transitioning-to-spotify';
    return (
        <div className={`scene-root scene-home ${isTransitioning ? 'transitioning' : ''} ${isSpotifyTransition ? 'is-headphones-transition' : ''} ${isLaptopTransition ? 'is-laptop-transition' : ''} ${isWipeTransition ? 'is-wipe-transition' : ''}`}>
            {objectMap.map((obj) => (
                <div
                    key={obj.id}
                    className="blueprint-square"
                    style={obj.style}
                    onClick={(e) => onCardClick(e, obj)}
                    data-card-id={obj.id}
                    data-is-laptop={obj.id === 'obj_laptop'}
                    data-is-business-card={obj.id === 'obj_business_cards'}
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
