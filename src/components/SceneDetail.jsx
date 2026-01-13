import React, { useEffect, useRef } from "react";
import ScrollStory from "./ScrollStory";

export default function SceneDetail({ activeKey, onBack, isTransitioning, className, isWipe, activeScene }) {
    const backButtonRef = useRef(null);

    useEffect(() => {
        if (!isTransitioning && backButtonRef.current) {
            backButtonRef.current.focus();
        }
    }, [isTransitioning]);

    if (activeKey !== "work" && activeKey !== "about") return null;

    const isAbout = activeKey === "about";
    const isWipeEntering = isWipe && activeScene === 'transitioning-wipe';

    return (
        <div
            className={`scene-root scene-detail ${isAbout ? 'about-immersive' : 'work-immersive'} ${isTransitioning ? "transitioning" : ""
                } ${isWipeEntering ? 'is-wipe-reveal' : ''} ${className || ""}`}
            style={{
                background: '#000',
                overflowY: isAbout ? 'auto' : 'hidden',
                height: '100dvh'
            }}
        >
            <button
                ref={backButtonRef}
                className="back-btn immersive-back"
                onClick={onBack}
                aria-label="Back to home"
            >
                ← BACK
            </button>

            {isAbout && <ScrollStory />}
        </div>
    );
}
