import React, { useState } from 'react';
import { objectMap } from '../content/objectMap';

export default function DeskCollage({ onObjectSelect }) {
    const [hoveredId, setHoveredId] = useState(null);

    return (
        <div className="desk-blueprint">
            <div className="blueprint-container">
                {objectMap.map((obj) => {
                    const isHovered = hoveredId === obj.id;

                    return (
                        <div
                            key={obj.id}
                            className={`blueprint-square ${isHovered ? 'hovered' : ''}`}
                            style={{
                                left: obj.style.left,
                                top: obj.style.top,
                                width: obj.style.width,
                                height: obj.style.height || obj.style.width,
                            }}
                            onMouseEnter={() => setHoveredId(obj.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            onClick={() => onObjectSelect(obj.id)}
                        >
                            <div className="image-stack">
                                {obj.images?.open && (
                                    <img
                                        src={obj.images.open}
                                        alt={`${obj.label} open`}
                                        className="blueprint-image image-open"
                                    />
                                )}
                                {obj.images?.closed && (
                                    <img
                                        src={obj.images.closed}
                                        alt={`${obj.label} closed`}
                                        className="blueprint-image image-closed"
                                    />
                                )}
                            </div>
                            <span className="blueprint-label">{obj.label}</span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
