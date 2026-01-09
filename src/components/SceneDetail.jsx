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
                <h1 className="immersive-title">{isAbout ? "ABOUT" : "WORK"}</h1>

                {/* ✅ Resume ripple preview lives INSIDE the existing SceneDetail */}
                {!isAbout && (
                    <div style={{ width: "min(820px, 92vw)", height: "min(1100px, 80vh)" }}>
                        <ResumeRipplePreview src="/resume/resume-preview.webp" amp={0.011} />
                    </div>
                )}
            </div>
        </div>
    );
}
