import React, { useState, useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

const DURATION = 750;
const HEADPHONES_DURATION = 2000;
const EASING = 'cubic-bezier(.16, 1, .3, 1)';
const LEAF_EASING = 'cubic-bezier(0.4, 0.0, 0.2, 1)';

const TransitionLayer = forwardRef(({ onTransitionComplete }, ref) => {
    const [clone, setClone] = useState(null);
    const [showBlackOverlay, setShowBlackOverlay] = useState(false);
    const [overlayMode, setOverlayMode] = useState('forward');
    const [isAnimating, setIsAnimating] = useState(false);
    const [immersiveStage, setImmersiveStage] = useState('none'); // 'none' | 'centered' | 'zoomed'
    const [wipeStage, setWipeStage] = useState('none'); // 'none' | 'exiting' | 'prepare' | 'swiping'
    const containerRef = useRef(null);
    const animationTimers = useRef([]);

    const clearTimers = () => {
        animationTimers.current.forEach(timer => clearTimeout(timer));
        animationTimers.current = [];
    };

    useImperativeHandle(ref, () => ({
        startTransition: async ({ cardEl, content, targetRect, isImmersive }) => {
            clearTimers();
            const firstRect = cardEl.getBoundingClientRect();

            setIsAnimating(false);
            setImmersiveStage('none');
            setWipeStage('none');
            setShowBlackOverlay(false);
            setOverlayMode('forward');

            setClone({
                first: firstRect,
                last: targetRect,
                image: content.images?.closed || content.images?.open,
                label: content.label,
                id: content.id,
                direction: 'forward',
                isImmersive,
                key: Date.now()
            });

            return new Promise((resolve) => {
                const timer = setTimeout(resolve, 50);
                animationTimers.current.push(timer);
            });
        },
        startBackTransition: async ({ cardEl, content, currentRect }) => {
            clearTimers();
            const targetCard = document.querySelector(`[data-card-id="${content.id}"]`);
            const lastRect = targetCard?.getBoundingClientRect() || { left: 0, top: 0, width: 300, height: 300 };

            setIsAnimating(false);
            setOverlayMode('forward');

            setClone({
                first: currentRect,
                last: lastRect,
                image: content.images?.closed || content.images?.open,
                label: content.label,
                id: content.id,
                direction: 'back',
                key: Date.now()
            });

            return new Promise((resolve) => {
                const timer = setTimeout(resolve, 50);
                animationTimers.current.push(timer);
            });
        },
        clearClone: () => {
            clearTimers();
            setClone(null);
            setIsAnimating(false);
            setShowBlackOverlay(false);
            setOverlayMode('forward');
        },
        startReverseBlackTransition: () => {
            clearTimers();
            setOverlayMode('reverse');
            setShowBlackOverlay(true);
            return new Promise((resolve) => {
                const timer = setTimeout(resolve, 2000);
                animationTimers.current.push(timer);
            });
        },
        startFadeOut: () => {
            setOverlayMode('fade-out');
            return new Promise((resolve) => {
                const timer = setTimeout(resolve, 2000);
                animationTimers.current.push(timer);
            });
        },
        startFadeOutBlack: () => {
            // Reveal Spotify scene (stay black but fade opacity)
            setOverlayMode('fade-out-black');
            return new Promise((resolve) => {
                const timer = setTimeout(resolve, 2000);
                animationTimers.current.push(timer);
            });
        }
    }));

    useEffect(() => {
        if (!clone) return;

        const startTimer = setTimeout(() => {
            setIsAnimating(true);

            if (clone.id === 'obj_headphones' && clone.direction === 'forward') {
                const centerX = window.innerWidth / 2 - clone.first.width / 2;
                const centerY = window.innerHeight / 2 - clone.first.height / 2;

                const fallTimer = setTimeout(() => {
                    const cloneEl = containerRef.current?.querySelector('.transition-clone');
                    if (cloneEl) {
                        const fallDistance = window.innerHeight + 500;
                        const leafRotation = 360 + Math.random() * 180 - 90;

                        cloneEl.style.transition = `transform ${HEADPHONES_DURATION - 400}ms ${LEAF_EASING}, opacity ${HEADPHONES_DURATION - 1000}ms ease-in`;
                        cloneEl.style.transform = `translate3d(${centerX + (Math.random() * 100 - 50)}px, ${centerY + fallDistance}px, 0) rotate(${leafRotation}deg)`;
                        cloneEl.style.opacity = '0';

                        const imgEl = cloneEl.querySelector('img');
                        if (imgEl) {
                            imgEl.style.filter = 'brightness(0.8)';
                        }
                    }

                    const blackoutTimer = setTimeout(() => {
                        setOverlayMode('forward');
                        setShowBlackOverlay(true);
                    }, 400);
                    animationTimers.current.push(blackoutTimer);
                }, 400);
                animationTimers.current.push(fallTimer);
            } else if (clone.isImmersive && clone.direction === 'forward') {
                // Stage 1: Move to center
                setImmersiveStage('centered');

                // Stage 2: Portal Zoom
                const zoomTimer = setTimeout(() => {
                    setImmersiveStage('zoomed');
                }, 250); // Wait for centering to nearly complete
                animationTimers.current.push(zoomTimer);
            } else if (clone.id === 'obj_business_cards' && clone.direction === 'forward') {
                // Stage 1: Exit Right
                setWipeStage('exiting');

                // Stage 2: Prepare for Wipe (Jump to right edge as full height)
                const prepareTimer = setTimeout(() => {
                    setWipeStage('prepare');
                }, 500);

                // Stage 3: Swipe Across
                const swipeTimer = setTimeout(() => {
                    setWipeStage('swiping');
                }, 550);

                animationTimers.current.push(prepareTimer, swipeTimer);
            }
        }, 50);

        animationTimers.current.push(startTimer);

        return () => clearTimers();
    }, [clone?.key]);

    if (!clone) {
        return showBlackOverlay ? (
            <div className={`black-overlay ${overlayMode === 'forward' ? 'forward' : ''} ${overlayMode === 'reverse' ? 'reverse' : ''} ${overlayMode === 'fade-out' ? 'fade-out' : ''}`}></div>
        ) : null;
    }

    const isHeadphones = clone.id === 'obj_headphones';
    const isHeadphonesForward = isHeadphones && clone.direction === 'forward';
    const centerX = window.innerWidth / 2 - clone.first.width / 2;
    const centerY = window.innerHeight / 2 - clone.first.height / 2;

    let currentStyle = {
        position: 'fixed',
        top: 0,
        left: 0,
        width: clone.first.width,
        height: clone.first.height,
        transform: `translate3d(${clone.first.left}px, ${clone.first.top}px, 0) rotate(-2deg)`,
        opacity: 1,
        transition: 'none',
        zIndex: isHeadphones ? 10000 : 9999,
        willChange: 'transform, opacity',
        pointerEvents: 'none'
    };

    if (isAnimating) {
        if (isHeadphonesForward) {
            currentStyle.transition = `transform 400ms ${EASING}, width 400ms ${EASING}, height 400ms ${EASING}`;
            currentStyle.transform = `translate3d(${centerX}px, ${centerY}px, 0) rotate(0deg)`;
        } else if (clone.isImmersive && clone.direction === 'forward') {
            if (immersiveStage === 'centered') {
                currentStyle.transition = `transform 450ms ${EASING}`;
                currentStyle.transform = `translate3d(${centerX}px, ${centerY}px, 0) rotate(0deg)`;
            } else if (immersiveStage === 'zoomed') {
                currentStyle.transition = `transform 1000ms cubic-bezier(.4, 0, .2, 1)`;
                currentStyle.transform = `translate3d(${centerX}px, ${centerY}px, 0) scale(15)`;
                currentStyle.opacity = 1;
            }
        } else if (clone.id === 'obj_business_cards' && clone.direction === 'forward') {
            if (wipeStage === 'exiting') {
                currentStyle.transition = `transform 500ms ${EASING}, opacity 500ms ease-in`;
                currentStyle.transform = `translate3d(${window.innerWidth + 200}px, ${clone.first.top}px, 0) rotate(15deg)`;
            } else if (wipeStage === 'prepare') {
                currentStyle.transition = 'none';
                currentStyle.width = '100vw';
                currentStyle.height = '100vh';
                currentStyle.left = 0;
                currentStyle.top = 0;
                currentStyle.background = 'var(--bg-bone)';
                currentStyle.borderRadius = '0';
                currentStyle.transform = `translate3d(100vw, 0, 0)`;
                currentStyle.boxShadow = '-25px 0 80px rgba(0,0,0,0.15)';
            } else if (wipeStage === 'swiping') {
                currentStyle.transition = `transform 1000ms cubic-bezier(0.4, 0, 0.2, 1)`;
                currentStyle.width = '100vw';
                currentStyle.height = '100vh';
                currentStyle.left = 0;
                currentStyle.top = 0;
                currentStyle.background = 'var(--bg-bone)';
                currentStyle.borderRadius = '0';
                currentStyle.transform = `translate3d(-100vw, 0, 0)`;
                currentStyle.boxShadow = '-25px 0 80px rgba(0,0,0,0.15)';
            }
        } else {
            currentStyle.transition = `transform ${DURATION}ms ${EASING}, width ${DURATION}ms ${EASING}, height ${DURATION}ms ${EASING}, opacity ${DURATION}ms ${EASING}`;
            currentStyle.width = `${clone.last.width}px`;
            currentStyle.height = `${clone.last.height}px`;
            currentStyle.transform = `translate3d(${clone.last.left}px, ${clone.last.top}px, 0) rotate(0deg)`;
        }
    }

    const isWipeActive = wipeStage === 'prepare' || wipeStage === 'swiping';

    return (
        <>
            <div className="transition-layer-container" ref={containerRef} style={{ pointerEvents: 'none', position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', zIndex: 10000 }}>
                <div
                    className="transition-clone"
                    style={currentStyle}
                >
                    <div className="clone-image-wrapper" style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'transparent',
                        borderRadius: '2px'
                    }}>
                        <img
                            src={clone.image}
                            alt=""
                            style={{
                                width: isWipeActive ? '100%' : 'auto',
                                height: isWipeActive ? '100%' : 'auto',
                                maxWidth: isWipeActive ? '100%' : '90%',
                                maxHeight: isWipeActive ? '100%' : '90%',
                                objectFit: isWipeActive ? 'cover' : 'contain',
                                filter: (clone.isImmersive && (immersiveStage === 'centered' || immersiveStage === 'zoomed')) ? 'brightness(0)' : 'brightness(1)',
                                transition: (clone.isImmersive) ? `filter 400ms ease-in, opacity 400ms ease-in` : 'none',
                                opacity: 1,
                                visibility: 'visible',
                                transitionProperty: 'filter, opacity'
                            }}
                        />
                    </div>
                    {clone.label && (
                        <span className="blueprint-label" style={{
                            display: 'block',
                            textAlign: 'center',
                            marginTop: '10px',
                            opacity: isHeadphonesForward ? 0 : 1,
                            transition: 'opacity 300ms ease'
                        }}>{clone.label}</span>
                    )}
                </div>
            </div>
            {showBlackOverlay && (
                <div className={`black-overlay ${overlayMode === 'forward' ? 'forward' : ''} ${overlayMode === 'reverse' ? 'reverse' : ''} ${overlayMode === 'fade-out' ? 'fade-out' : ''} ${overlayMode === 'fade-out-black' ? 'fade-out-black' : ''}`}></div>
            )}
        </>
    );
});

export default TransitionLayer;
