import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const DURATION = 750;
const HEADPHONES_DURATION = 2000; // Longer duration for leaf-falling animation
const EASING = 'cubic-bezier(.2, .8, .2, 1)';
const LEAF_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)'; // Easing for leaf fall

const TransitionLayer = forwardRef(({ onTransitionComplete }, ref) => {
    const [clone, setClone] = useState(null);
    const [showBlackOverlay, setShowBlackOverlay] = useState(false);
    const [overlayMode, setOverlayMode] = useState('forward'); // 'forward' | 'reverse'
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
            setOverlayMode('forward');

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
            setOverlayMode('forward');

            return new Promise((resolve) => setTimeout(resolve, 50));
        },
        clearClone: () => {
            setClone(null);
            setShowBlackOverlay(false);
            setOverlayMode('forward');
        },
        startReverseBlackTransition: () => {
            // Start the reverse black overlay transition
            setOverlayMode('reverse');
            setShowBlackOverlay(true);
            return new Promise((resolve) => {
                // Wait for overlay to fade in
                setTimeout(() => {
                    resolve();
                }, 1800); // Match fadeToBlack duration
            });
        }
    }));

    // Trigger animation after mount
    useEffect(() => {
        if (clone) {
            const timer = requestAnimationFrame(() => {
                const cloneEl = containerRef.current?.querySelector('.transition-clone');
                const imgEl = cloneEl?.querySelector('img');

                if (cloneEl) {
                    if (clone.id === 'obj_headphones' && clone.direction === 'forward') {
                        // Step 1: Move to center of screen
                        const centerX = window.innerWidth / 2 - clone.first.width / 2;
                        const centerY = window.innerHeight / 2 - clone.first.height / 2;

                        // First, move to center (quick)
                        // Use transform3d for GPU acceleration
                        cloneEl.style.transition = `transform 400ms ${EASING}`;
                        cloneEl.style.width = `${clone.first.width}px`;
                        cloneEl.style.height = `${clone.first.height}px`;
                        cloneEl.style.transform = `translate3d(${centerX}px, ${centerY}px, 0) rotate(0deg)`;
                        cloneEl.style.willChange = 'transform, opacity';

                        // Step 2: After reaching center, fall like a leaf
                        setTimeout(() => {
                            const fallDistance = window.innerHeight + 200; // Fall below viewport
                            const leafRotation = 360 + Math.random() * 180 - 90; // Random rotation between 270-450 degrees

                            // Use transform3d for GPU acceleration
                            cloneEl.style.transition = `transform ${HEADPHONES_DURATION - 400}ms ${LEAF_EASING}, opacity ${HEADPHONES_DURATION - 400}ms ${LEAF_EASING}`;
                            cloneEl.style.transform = `translate3d(${centerX + (Math.random() * 100 - 50)}px, ${centerY + fallDistance}px, 0) rotate(${leafRotation}deg)`;
                            cloneEl.style.opacity = '0';

                            // Check when image leaves screen and trigger black overlay
                            let checkCount = 0;
                            let lastCheckTime = performance.now();
                            const checkImagePosition = (currentTime) => {
                                // Throttle checks to ~60fps
                                if (currentTime - lastCheckTime < 16) {
                                    requestAnimationFrame(checkImagePosition);
                                    return;
                                }
                                lastCheckTime = currentTime;

                                const rect = cloneEl.getBoundingClientRect();
                                // When image is below viewport (top > window.innerHeight) or mostly out
                                if (rect.top > window.innerHeight * 0.8 || rect.bottom < 0) {
                                    setOverlayMode('forward');
                                    setShowBlackOverlay(true);
                                } else if (checkCount < 200) { // Limit checks to prevent infinite loop
                                    checkCount++;
                                    requestAnimationFrame(checkImagePosition);
                                }
                            };

                            // Start checking after a short delay to let animation begin
                            setTimeout(() => {
                                requestAnimationFrame(checkImagePosition);
                            }, 300);
                        }, 400);

                        if (imgEl) {
                            imgEl.style.transition = `filter ${HEADPHONES_DURATION}ms ${EASING}`;
                            imgEl.style.filter = 'brightness(0.8)';
                        }
                    } else {
                        // Normal behavior
                        cloneEl.style.width = `${clone.last.width}px`;
                        cloneEl.style.height = `${clone.last.height}px`;
                        cloneEl.style.transform = `translate(${clone.last.left}px, ${clone.last.top}px) rotate(0deg)`;

                        if (imgEl) {
                            imgEl.style.transition = `filter ${DURATION}ms ${EASING}`;
                            imgEl.style.filter = 'brightness(1)';
                        }
                    }
                }
            });
            return () => cancelAnimationFrame(timer);
        }
    }, [clone]);

    const isHeadphones = clone?.id === 'obj_headphones';
    if (!clone) return null;

    const isHeadphonesTransition = isHeadphones && clone.direction === 'forward';
    const transitionDuration = isHeadphonesTransition ? HEADPHONES_DURATION : DURATION;

    const style = {
        top: 0,
        left: 0,
        width: clone.first.width,
        height: clone.first.height,
        transform: `translate3d(${clone.first.left}px, ${clone.first.top}px, 0)`,
        transition: isHeadphonesTransition
            ? `transform 400ms ${EASING}, opacity ${transitionDuration}ms ${EASING}`
            : `transform ${transitionDuration}ms ${EASING}, opacity ${transitionDuration}ms ${EASING}`,
        zIndex: isHeadphones ? 10000 : 9999,
        opacity: 1,
        willChange: 'transform, opacity'
    };

    return (
        <>
            <div className="transition-layer-container" ref={containerRef}>
                <div
                    className="transition-clone"
                    style={{
                        ...style,
                        transform: `translate3d(${clone.first.left}px, ${clone.first.top}px, 0) rotate(-2deg)`
                    }}
                >
                    <div className="clone-image-wrapper">
                        <img src={clone.image} alt="" />
                    </div>
                    <span className="blueprint-label">{clone.label}</span>
                </div>
            </div>
            {showBlackOverlay && (
                <div className={`black-overlay ${overlayMode === 'reverse' ? 'reverse' : 'forward'}`} />
            )}
        </>
    );
});

export default TransitionLayer;

