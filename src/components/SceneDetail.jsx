import React, { useEffect, useRef } from 'react';

export default function SceneDetail({ activeKey, onBack, isTransitioning, className }) {
    const backButtonRef = useRef(null);

    useEffect(() => {
        if (!isTransitioning && backButtonRef.current) {
            backButtonRef.current.focus();
        }
    }, [isTransitioning]);

    if (activeKey !== 'work') return null;

    return (
        <div className={`scene-root scene-detail work-immersive ${isTransitioning ? 'transitioning' : ''} ${className || ''}`}>
            <button
                ref={backButtonRef}
                className="back-btn immersive-back"
                onClick={onBack}
                aria-label="Back to home"
            >
                ← BACK
            </button>
            <div className="immersive-content">
                <h1 className="immersive-title">WORK</h1>
            </div>
        </div>
    );
}
