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
        text: 'Where logic meets aesthetics is where the magic happens. We don\'t just build tools; we craft experiences that resonate on a human level, using technology as our canvas.'
    },
    {
        side: 'right',
        title: 'The Future',
        text: 'Tomorrow is an open graph. We are continuously expanding the boundaries of what\'s possible, one node at a time. The path forward is illuminated by the light of innovation.'
    }
];

export default function ScrollStory() {
    const containerRef = useRef(null);
    const [activeStates, setActiveStates] = useState([]);

    useEffect(() => {
        const parent = document.querySelector('.scene-detail.about-immersive');

        const handleScroll = () => {
            if (!containerRef.current || !parent) return;
            const items = containerRef.current.querySelectorAll('.story-item');
            const viewportTriggerPoint = window.innerHeight * 0.75; // Trigger much earlier

            const newStates = Array.from(items).map(item => {
                const rect = item.getBoundingClientRect();
                return rect.top < viewportTriggerPoint;
            });

            setActiveStates(newStates);
        };

        if (parent) {
            parent.addEventListener('scroll', handleScroll, { passive: true });
        }
        handleScroll();

        return () => parent?.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <div ref={containerRef} className="scroll-story-container">
            <div className="central-circle"></div>
            <div className="vertical-line"></div>

            {STORY_DATA.map((item, idx) => {
                const isActive = activeStates[idx];

                return (
                    <div
                        key={idx}
                        className={`story-item ${item.side} ${isActive ? 'active' : ''}`}
                        style={{ marginTop: idx === 0 ? '80vh' : '60vh' }}
                    >
                        <div className="story-connector"></div>
                        <div className="story-content">
                            <h3>{item.title}</h3>
                            <p>{item.text}</p>
                        </div>
                    </div>
                );
            })}
            <div style={{ height: '60vh' }}></div>
        </div>
    );
}

