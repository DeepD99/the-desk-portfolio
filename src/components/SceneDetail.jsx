import React, { useEffect, useRef } from "react";
import ResumeRipplePreview from "./ResumeRipplePreview";

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
            className={`scene-root scene-detail work-immersive ${isTransitioning ? "transitioning" : ""
                } ${isWipeEntering ? 'is-wipe-reveal' : ''} ${className || ""}`}
        >
            <button
                ref={backButtonRef}
                className="back-btn immersive-back"
                onClick={onBack}
                aria-label="Back to home"
            >
                ← BACK
            </button>

            <div className="immersive-content">
                <h1 className="immersive-title">
                    {activeKey === 'work' ? "WORK" : "ABOUT"}
                </h1>

                {/* Resume preview can be added back here if needed */}
            </div>
        </div>
    );
}
