import React, { useEffect, useRef } from 'react';
import workData from '../content/work';
import musicData from '../content/music';
import philosophyData from '../content/philosophy';
import aboutData from '../content/about';

const contentMap = {
    work: workData,
    music: musicData,
    philosophy: philosophyData,
    about: aboutData
};

export default function SceneDetail({ activeKey, onBack, isTransitioning, className }) {
    const content = contentMap[activeKey];
    const backButtonRef = useRef(null);

    useEffect(() => {
        if (!isTransitioning && backButtonRef.current) {
            backButtonRef.current.focus();
        }
    }, [isTransitioning]);

    if (!content) return null;

    return (
        <div className={`scene-root scene-detail ${isTransitioning ? 'transitioning' : ''} ${className || ''}`}>
            <div className="detail-container">
                <header className="detail-header">
                    <button
                        ref={backButtonRef}
                        className="back-btn"
                        onClick={onBack}
                        aria-label="Back to home"
                    >
                        ← BACK
                    </button>
                    <h1 className="detail-title">{content.title}</h1>
                </header>

                <div className="hero-placeholder-wrapper">
                    {/* This is where the FLIP clone will land */}
                    <div className="hero-placeholder" data-hero-placeholder></div>
                </div>

                <main className="detail-content">
                    <p className="description-lead">
                        {content.description || "Exploring the intersection of design, technology, and human experience through a lens of minimal aesthetics and maximal functionality."}
                    </p>

                    {content.items && (
                        <div className="section-block">
                            <h2 className="section-label">Key Highlights</h2>
                            <ul className="content-list">
                                {content.items.map((item, i) => (
                                    <li key={i} className="content-item">
                                        <span className="item-index">0{i + 1}</span>
                                        <span className="item-text">{item}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <div className="filler-text">
                        <p>This space is dedicated to the pursuit of excellence in digital craftsmanship. Each project is a journey through complex problem spaces, resulting in simple, intuitive solutions that stand the test of time.</p>
                    </div>
                </main>
            </div>
        </div>
    );
}
