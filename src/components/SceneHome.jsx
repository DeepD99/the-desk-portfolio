import { useState, useCallback, useRef, useEffect } from 'react';
import SceneHome from './components/SceneHome';
import SceneDetail from './components/SceneDetail';
import SceneSpotify from './components/SceneSpotify';
import TransitionLayer from './components/TransitionLayer.temp';
import LoadingIndicator from './components/LoadingIndicator';
import { objectMap } from './content/objectMap';
import './styles/main.css';

export default function App() {
    const [activeScene, setActiveScene] = useState('home'); // 'home' | 'detail' | 'spotify'
    const [activeKey, setActiveKey] = useState(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const transitionLayerRef = useRef();
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        if (isTransitioning) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => { document.body.style.overflow = ''; };
    }, [isTransitioning]);

    // Prevent manual scrolling during headphones transition
    useEffect(() => {
        const preventScroll = (e) => {
            if (activeScene === 'spotify' || (isTransitioning && activeScene === 'transitioning-to-spotify')) {
                e.preventDefault();
                e.stopPropagation();
                return false;
            }
        };

        window.addEventListener('wheel', preventScroll, { passive: false });
        window.addEventListener('touchmove', preventScroll, { passive: false });
        window.addEventListener('scroll', preventScroll, { passive: false });

        return () => {
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
            window.removeEventListener('scroll', preventScroll);
        };
    }, [activeScene, isTransitioning]);

    const handleCardClick = useCallback(async (e, obj) => {
        if (isTransitioning) return;

        setIsTransitioning(true);
        setActiveKey(obj.contentKey);

        const cardEl = e.currentTarget;
        const isHeadphones = obj.id === 'obj_headphones';

        if (isHeadphones) {
            // Special transition for headphones
            setActiveScene('transitioning-to-spotify');

            // Start the leaf-falling transition
            await transitionLayerRef.current.startTransition({
                cardEl,
                content: obj,
                targetRect: { left: 0, top: 0, width: 0, height: 0 } // Not used for headphones
            });

            // Extend page height and enable scrolling
            const originalBodyHeight = document.body.style.height;
            document.body.style.height = '200vh'; // Extend body to allow scrolling
            document.body.classList.add('allow-scroll');

            // Wait for image to leave screen before starting scroll and fade
            const scrollStartDelay = 1000; // Start scrolling after image has left viewport
            const scrollDuration = 1500; // Duration of scroll animation
            const startScroll = window.scrollY || 0;
            const scrollDistance = window.innerHeight; // Scroll down 1 viewport height to reveal Spotify
            const startTime = Date.now();

            // Use requestAnimationFrame for smoother scrolling
            let rafId = null;
            const scrollStep = () => {
                const elapsed = Date.now() - startTime;
                const progress = Math.min(elapsed / scrollDuration, 1);
                const easeProgress = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                const currentScroll = startScroll + (scrollDistance * easeProgress);

                window.scrollTo({ top: currentScroll, behavior: 'auto' });

                if (progress < 1) {
                    rafId = requestAnimationFrame(scrollStep);
                }
            };

            // Start scrolling after image leaves screen
            setTimeout(() => {
                scrollStep();
            }, scrollStartDelay);

            // Cleanup function to cancel animation if component unmounts
            const cleanup = () => {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                }
            };

            // Wait for animation to complete, then show Spotify scene
            setTimeout(() => {
                // Show Spotify scene immediately - it will fade in
                setActiveScene('spotify');
                setIsTransitioning(false);

                // Reset body height and prevent scrolling first
                document.body.classList.remove('allow-scroll');
                document.body.style.overflow = 'hidden';
                document.body.style.height = originalBodyHeight || '';
                window.scrollTo({ top: 0, behavior: 'instant' });

                // Clear clone and overlay after overlay fades out
                setTimeout(() => {
                    transitionLayerRef.current.clearClone();
                }, 800); // Wait for black overlay fade out animation
            }, 3000); // Increased to allow for black overlay fade

            return cleanup;
        } else {
            // Normal transition for other items
            setActiveScene('transitioning-to-detail');

            // Wait for DOM to update so SceneDetail is rendered
            setTimeout(async () => {
                const placeholder = document.querySelector('[data-hero-placeholder]');
                const targetRect = placeholder?.getBoundingClientRect() || {
                    left: window.innerWidth / 2 - 210,
                    top: window.innerHeight * 0.6,
                    width: 420,
                    height: 504
                };

                await transitionLayerRef.current.startTransition({
                    cardEl,
                    content: obj,
                    targetRect
                });

                // Wait for animation duration
                setTimeout(() => {
                    setIsTransitioning(false);
                    setActiveScene('detail');
                    transitionLayerRef.current.clearClone();
                }, 750);
            }, 50);
        }
    }, [isTransitioning]);

    const handleBack = useCallback(async () => {
        if (isTransitioning) return;

        setIsTransitioning(true);

        if (activeScene === 'spotify') {
            // Reverse black transition for Spotify scene
            setActiveScene('transitioning-back');

            // Start reverse black overlay transition (fades in)
            await transitionLayerRef.current.startReverseBlackTransition();

            // After black overlay fully fades in, switch to home scene
            // The home scene will be visible but the overlay will fade out
            setActiveScene('home');
            setIsTransitioning(false);

            // Add fade-in class to home scene for animation
            const homeScene = document.querySelector('.scene-home');
            if (homeScene) {
                homeScene.classList.add('fade-in');
            }

            // Fade out black overlay and fade in home scene
            setTimeout(() => {
                transitionLayerRef.current.clearClone();
                if (homeScene) {
                    homeScene.classList.remove('fade-in');
                }
                window.scrollTo({ top: 0, behavior: 'instant' });
                document.body.classList.remove('allow-scroll');
            }, 1200); // Wait for fade out animation + color shift
        } else {
            // Normal back transition for detail scene
            const placeholder = document.querySelector('[data-hero-placeholder]');
            const currentRect = placeholder?.getBoundingClientRect() || {
                left: window.innerWidth / 2 - 210,
                top: window.innerHeight * 0.6,
                width: 420,
                height: 504
            };

            const obj = objectMap.find(o => o.contentKey === activeKey);

            await transitionLayerRef.current.startBackTransition({
                content: obj,
                currentRect
            });

            setActiveScene('transitioning-back');

            // Reverse transition
            setTimeout(() => {
                setActiveScene('home');
                setIsTransitioning(false);
                transitionLayerRef.current.clearClone();
            }, 750);
        }
    }, [isTransitioning, activeKey, activeScene]);

    return (
        <div className={`app-container ${isTransitioning ? 'is-transitioning' : ''}`} ref={scrollContainerRef}>
            {(activeScene === 'home' || activeScene === 'transitioning-to-detail' || activeScene === 'transitioning-back' || activeScene === 'transitioning-to-spotify') && (
                <SceneHome
                    onCardClick={handleCardClick}
                    isTransitioning={isTransitioning || activeScene === 'transitioning-to-detail' || activeScene === 'transitioning-to-spotify'}
                />
            )}

            {(activeScene === 'detail' || activeScene === 'transitioning-to-detail' || activeScene === 'transitioning-back') && (
                <SceneDetail
                    activeKey={activeKey}
                    onBack={handleBack}
                    isTransitioning={isTransitioning}
                    className={`${(activeScene === 'detail' || activeScene === 'transitioning-to-detail') ? 'active' : ''} ${activeScene === 'transitioning-back' ? 'transitioning-out' : ''}`}
                />
            )}

            {(activeScene === 'spotify' || activeScene === 'transitioning-to-spotify') && (
                <SceneSpotify
                    onBack={handleBack}
                    isTransitioning={isTransitioning}
                    className={`${activeScene === 'spotify' ? 'active' : ''} ${activeScene === 'transitioning-to-spotify' ? 'transitioning-in' : ''}`}
                />
            )}

            <TransitionLayer ref={transitionLayerRef} />

            <LoadingIndicator />
        </div>
    );
}
