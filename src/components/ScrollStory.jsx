import React, { useEffect, useRef, useState } from 'react';

const STORY_DATA = [
    {
        side: 'left',
        title: 'The Spark',
        text: 'It all started with a simple vision: to bridge the gap between complex data and intuitive design. Every great journey begins with a single line of code and a curious mind.'
    },
    {
        side: 'right',
        title: 'Deep Learning',
        text: 'Moving beyond the surface, we dove into the depths of neural networks. Understanding the architecture of intelligence became a passion that fueled late nights and endless iterations.'
    },
    {
        side: 'left',
        title: 'Creative Fusion',
        text: "Where logic meets aesthetics is where the magic happens. We don't just build tools; we craft experiences that resonate on a human level, using technology as our canvas."
    },
    {
        side: 'right',
        title: 'The Future',
        text: "Tomorrow is an open graph. We are continuously expanding the boundaries of what's possible, one node at a time. The path forward is illuminated by the light of innovation."
    }
];

export default function ScrollStory() {
    const itemRefs = useRef([]);
    const uicRef = useRef(null);
    const gradRef = useRef(null);
    const [activeStates, setActiveStates] = useState(new Array(STORY_DATA.length).fill(false));
    const [uicActive, setUicActive] = useState(false);
    const [gradActive, setGradActive] = useState(false);

    useEffect(() => {
        const scrollRoot = document.querySelector('.scene-detail.about-immersive');

        // Observer for story boxes — resets when leaving viewport
        const storyObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(entry => {
                    const idx = parseInt(entry.target.dataset.idx);
                    setActiveStates(prev => {
                        const next = [...prev];
                        next[idx] = entry.isIntersecting;
                        return next;
                    });
                });
            },
            {
                root: scrollRoot,
                rootMargin: '0px 0px -25% 0px',
                threshold: 0,
            }
        );

        // Observer for UIC block — same reset behaviour
        const uicObserver = new IntersectionObserver(
            (entries) => {
                setUicActive(entries[0].isIntersecting);
            },
            {
                root: scrollRoot,
                rootMargin: '0px 0px -25% 0px',
                threshold: 0,
            }
        );

        // Observer for grad pic — same reset behaviour
        const gradObserver = new IntersectionObserver(
            (entries) => {
                setGradActive(entries[0].isIntersecting);
            },
            {
                root: scrollRoot,
                rootMargin: '0px 0px -25% 0px',
                threshold: 0,
            }
        );

        itemRefs.current.forEach(el => el && storyObserver.observe(el));
        if (uicRef.current) uicObserver.observe(uicRef.current);

        // Delay the grad pic observer so the browser paints opacity:0
        // before the callback fires (element is in the initial viewport)
        const timer = setTimeout(() => {
            if (gradRef.current) gradObserver.observe(gradRef.current);
        }, 200);

        return () => {
            clearTimeout(timer);
            storyObserver.disconnect();
            uicObserver.disconnect();
            gradObserver.disconnect();
        };
    }, []);

    return (
        <div className="scroll-story-container">
            <div className="timeline-dot" />
            <div className="timeline-line" />

            {/* ── Paired row: grad pic (left) + UIC (right), same vertical level ── */}
            <div className="paired-story-row" style={{ marginTop: '75vh' }}>

                {/* Grad pic — left 43% */}
                <div ref={gradRef} className={`paired-left ${gradActive ? 'active' : ''}`}>
                    <div className="grad-pic-glow-wrapper">
                        <img src="/images/grad pic.jpg" alt="Graduation" className="grad-pic-image" />
                    </div>
                </div>

                {/* UIC — right 57% */}
                <div ref={uicRef} className={`paired-right ${uicActive ? 'active' : ''}`}>
                    <div className="uic-content">
                        <img src="/images/UIC.png" alt="University of Illinois Chicago" className="uic-image" />
                        <p className="uic-caption">Graduated December 2022</p>
                    </div>
                </div>

                {/* Connectors — absolutely positioned relative to the full-width row */}
                <div className={`paired-connector paired-conn-left ${gradActive ? 'visible' : ''}`} />
                <div className={`paired-connector paired-conn-right ${uicActive ? 'visible' : ''}`} />

            </div>

            {STORY_DATA.map((item, idx) => (
                <div
                    key={idx}
                    ref={el => itemRefs.current[idx] = el}
                    data-idx={idx}
                    className={`story-item ${item.side} ${activeStates[idx] ? 'active' : ''}`}
                    style={{ marginTop: idx === 0 ? '45vh' : '55vh' }}
                >
                    <div className="story-content">
                        <h3>{item.title}</h3>
                        <p>{item.text}</p>
                    </div>
                    <div className="story-connector" />
                </div>
            ))}

            <div style={{ height: '50vh' }} />
        </div>
    );
}
