import React, { useEffect, useRef } from 'react';
import Canvas from './SpotifyVisualizer/Canvas';

export default function SceneSpotify({ onBack, isTransitioning, className }) {
    const containerRef = useRef(null);

    useEffect(() => {
        // Prevent manual scrolling when this scene is active
        if (!isTransitioning) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isTransitioning]);

    return (
        <div
            ref={containerRef}
            className={`scene-root scene-spotify ${isTransitioning ? 'transitioning' : ''} ${className || ''}`}
        >
            <div className="spotify-container">
                <button
                    className="back-btn spotify-back-btn"
                    onClick={onBack}
                    aria-label="Back to home"
                >
                    ← BACK
                </button>
                <Canvas />
            </div>
        </div>
    );
}

