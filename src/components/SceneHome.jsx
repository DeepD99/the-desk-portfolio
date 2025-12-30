import React from 'react';
import { objectMap } from '../content/objectMap';

export default function SceneHome({ onCardClick, activeKey, isTransitioning }) {
    return (
        <div className={`scene-root scene-home ${isTransitioning ? 'transitioning' : ''}`}>
            <div className="blueprint-container">
                {objectMap.map((obj) => (
                    <div
                        key={obj.id}
                        data-card-id={obj.id}
                        className="blueprint-square polaroid-card"
                        style={{
                            left: obj.style.left,
                            top: obj.style.top,
                            width: obj.style.width,
                            height: obj.style.height || obj.style.width,
                        }}
                        onClick={(e) => onCardClick(e, obj)}
                    >
                        <div className="image-stack">
                            {obj.images?.open && (
                                <img
                                    src={obj.images.open}
                                    alt={obj.label}
                                    className="blueprint-image image-open"
                                />
                            )}
                            {obj.images?.closed && (
                                <img
                                    src={obj.images.closed}
                                    alt={obj.label}
                                    className="blueprint-image image-closed"
                                />
                            )}
                        </div>
                        <span className="blueprint-label">{obj.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
