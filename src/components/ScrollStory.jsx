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
    const [activeStates, setActiveStates] = useState(new Array(STORY_DATA.length).fill(false));
    const [uicActive, setUicActive] = useState(false);

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

        itemRefs.current.forEach(el => el && storyObserver.observe(el));
        if (uicRef.current) uicObserver.observe(uicRef.current);

        return () => {
            storyObserver.disconnect();
            uicObserver.disconnect();
        };
    }, []);

    return (
        <div className="scroll-story-container">
            <div className="timeline-dot" />
            <div className="timeline-line" />

            {/* UIC block — right side, starts the zigzag before "The Spark" */}
            <div
                ref={uicRef}
                className={`story-item right uic-block ${uicActive ? 'active' : ''}`}
                style={{ marginTop: '75vh' }}
            >
                <div className="uic-content">
                    <img src="/images/UIC.png" alt="University of Illinois Chicago" className="uic-image" />
                    <p className="uic-caption">Graduated December 2022</p>
                </div>
                <div className="story-connector" />
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
