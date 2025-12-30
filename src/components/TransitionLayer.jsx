import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const DURATION = 750;
const EASING = 'cubic-bezier(.2, .8, .2, 1)';

const TransitionLayer = forwardRef(({ onTransitionComplete }, ref) => {
    const [clone, setClone] = useState(null);
    const containerRef = useRef(null);

    useImperativeHandle(ref, () => ({
        startTransition: async ({ cardEl, content, targetRect }) => {
            const firstRect = cardEl.getBoundingClientRect();
            const lastRect = targetRect;

            // Create clone state
            setClone({
                first: firstRect,
                last: lastRect,
                image: content.images?.closed || content.images?.open,
                label: content.label,
                id: content.id,
                direction: 'forward'
            });

            // We need to wait for the clone to be rendered before we can animate it
            // but since we want to animate SceneA and SceneB too, we'll return a promise
            return new Promise((resolve) => {
                setTimeout(() => {
                    resolve();
                }, 50); // Small delay to ensure clone is in DOM
            });
        },
        startBackTransition: async ({ cardEl, content, currentRect }) => {
            // Find the card in the grid to get its rect
            const targetCard = document.querySelector(`[data-card-id="${content.id}"]`);
            const lastRect = targetCard?.getBoundingClientRect() || { left: 0, top: 0, width: 300, height: 300 };
            const firstRect = currentRect;

            setClone({
                first: firstRect,
                last: lastRect,
                image: content.images?.closed || content.images?.open,
                label: content.label,
                direction: 'back'
            });

            return new Promise((resolve) => setTimeout(resolve, 50));
        },
        clearClone: () => setClone(null)
    }));

    // Trigger animation after mount
    useEffect(() => {
        if (clone) {
            const timer = requestAnimationFrame(() => {
                const cloneEl = containerRef.current?.querySelector('.transition-clone');
                if (cloneEl) {
                    if (clone.id === 'obj_headphones' && clone.direction === 'forward') {
                        // Fullscreen zoom for headphones
                        cloneEl.style.width = '120vw'; // Oversized to ensure full coverage
                        cloneEl.style.height = '120vh';
                        cloneEl.style.transform = `translate(-10vw, -10vh)`; // Center it roughly
                        cloneEl.style.filter = 'brightness(0)'; // Fade to black
                    } else {
                        // Normal behavior
                        cloneEl.style.width = `${clone.last.width}px`;
                        cloneEl.style.height = `${clone.last.height}px`;
                        cloneEl.style.transform = `translate(${clone.last.left}px, ${clone.last.top}px) rotate(0deg)`;
                        cloneEl.style.filter = 'brightness(1)';
                    }
                }
            });
            return () => cancelAnimationFrame(timer);
        }
    }, [clone]);

    const isHeadphones = clone?.id === 'obj_headphones';
    if (!clone) return null;

    const style = {
        top: 0,
        left: 0,
        width: clone.first.width,
        height: clone.first.height,
        transform: `translate(${clone.first.left}px, ${clone.first.top}px)`,
        transition: `transform ${DURATION}ms ${EASING}, width ${DURATION}ms ${EASING}, height ${DURATION}ms ${EASING}, opacity ${DURATION}ms ${EASING}, filter ${DURATION}ms ${EASING}`,
        filter: 'brightness(1)', // Start normal
        zIndex: isHeadphones ? 10000 : 9999
    };

    return (
        <div className="transition-layer-container" ref={containerRef}>
            <div
                className="transition-clone"
                style={{
                    ...style,
                    transform: `translate(${clone.first.left}px, ${clone.first.top}px) rotate(-2deg)`
                }}
            >
                <div className="clone-image-wrapper">
                    <img src={clone.image} alt="" />
                </div>
                <span className="blueprint-label">{clone.label}</span>
            </div>
        </div>
    );
});

export default TransitionLayer;
