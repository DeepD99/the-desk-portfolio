import { useState, useCallback, useRef, useEffect } from 'react';
import SceneHome from './components/SceneHome';
import SceneDetail from './components/SceneDetail';
import TransitionLayer from './components/TransitionLayer';
import LoadingIndicator from './components/LoadingIndicator';
import { objectMap } from './content/objectMap';
import './styles/main.css';

export default function App() {
  const [activeScene, setActiveScene] = useState('home'); // 'home' | 'detail'
  const [activeKey, setActiveKey] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const transitionLayerRef = useRef();

  useEffect(() => {
    if (isTransitioning) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isTransitioning]);

  const handleCardClick = useCallback(async (e, obj) => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setActiveKey(obj.contentKey);

    const cardEl = e.currentTarget;

    // Step 1: Briefly switch to detail scene in background to measure placeholder
    // We'll show both scenes during transition
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
  }, [isTransitioning]);

  const handleBack = useCallback(async () => {
    if (isTransitioning) return;

    setIsTransitioning(true);

    const placeholder = document.querySelector('[data-hero-placeholder]');
    const currentRect = placeholder?.getBoundingClientRect() || {
      left: window.innerWidth / 2 - 210,
      top: window.innerHeight * 0.6,
      width: 420,
      height: 504
    };

    // NOTE: objectMap is not defined in the provided context.
    // This line assumes objectMap is available in this scope.
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
  }, [isTransitioning, activeKey]);

  return (
    <div className={`app-container ${isTransitioning ? 'is-transitioning' : ''}`}>
      {(activeScene === 'home' || activeScene === 'transitioning-to-detail' || activeScene === 'transitioning-back') && (
        <SceneHome
          onCardClick={handleCardClick}
          isTransitioning={isTransitioning || activeScene === 'transitioning-to-detail'}
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

      <TransitionLayer ref={transitionLayerRef} />

      <LoadingIndicator />
    </div>
  );
}
