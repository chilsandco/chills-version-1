import React, { useEffect, useRef, useState, useCallback } from 'react';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

const CustomCursor: React.FC = () => {
  const ghostRef = useRef<HTMLDivElement>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [pointerType, setPointerType] = useState<'mouse' | 'touch'>('mouse');
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);

  // Touch ripple
  const handleTouchStart = useCallback((e: TouchEvent) => {
    const touch = e.touches[0];
    const id = ++rippleId.current;
    setRipples(prev => [...prev, { id, x: touch.clientX, y: touch.clientY }]);
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== id));
    }, 700);
  }, []);

  useEffect(() => {
    let posX = 0;
    let posY = 0;
    let mouseX = 0;
    let mouseY = 0;
    let isMoving = false;
    let animationFrameId: number;

    const updatePosition = () => {
      // Smooth trailing interpolation (lerp factor 0.15)
      const dx = mouseX - posX;
      const dy = mouseY - posY;
      
      posX += dx * 0.15;
      posY += dy * 0.15;

      const ghost = ghostRef.current;
      if (ghost) {
        ghost.style.transform = `translate3d(${posX}px, ${posY}px, 0)`;
      }

      if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
        animationFrameId = requestAnimationFrame(updatePosition);
      } else {
        isMoving = false;
      }
    };

    const handlePointerMove = (e: PointerEvent) => {
      if (e.pointerType === 'touch') {
        setPointerType('touch');
        setIsVisible(false);
        return;
      }

      setPointerType('mouse');
      setIsVisible(true);
      mouseX = e.clientX;
      mouseY = e.clientY;

      if (!isMoving) {
        isMoving = true;
        animationFrameId = requestAnimationFrame(updatePosition);
      }

      const target = e.target as HTMLElement;
      if (target) {
        const isClickable = target.closest('a, button, [data-cursor], .interactive, select, input, textarea');
        setIsHovering(!!isClickable);
      }
    };

    const handlePointerLeave = () => {
      setIsVisible(false);
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    document.addEventListener('pointerleave', handlePointerLeave);
    document.addEventListener('mouseleave', handlePointerLeave);
    window.addEventListener('touchstart', handleTouchStart, { passive: true });

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      document.removeEventListener('pointerleave', handlePointerLeave);
      document.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('touchstart', handleTouchStart);
      cancelAnimationFrame(animationFrameId);
    };
  }, [handleTouchStart]);

  return (
    <>
      <style>{`
        @keyframes tap-burst {
          0%   { transform: scale(0.2) rotate(0deg);   opacity: 0.9; }
          60%  { transform: scale(1.3) rotate(180deg); opacity: 0.7; }
          100% { transform: scale(1.8) rotate(300deg); opacity: 0;   }
        }
        .tap-snowflake {
          width: 36px;
          height: 36px;
          animation: tap-burst 0.7s cubic-bezier(.22,1,.36,1) forwards;
          filter: brightness(0) saturate(100%) invert(85%) sepia(13%) saturate(1229%)
                  hue-rotate(356deg) brightness(98%) contrast(90%)
                  drop-shadow(0 0 6px rgba(212,175,55,0.8));
        }
        .gold-icon {
          filter: brightness(0) saturate(100%) invert(85%) sepia(13%) saturate(1229%)
                  hue-rotate(356deg) brightness(98%) contrast(90%)
                  drop-shadow(0 0 8px rgba(212, 175, 55, 0.4)) !important;
        }
      `}</style>

      {/* Touch ripples — snowflake logo tap burst for mobile/tablet */}
      {ripples.map(r => (
        <div
          key={r.id}
          style={{
            position: 'fixed',
            left: r.x,
            top: r.y,
            pointerEvents: 'none',
            zIndex: 9999,
            transform: 'translate(-50%, -50%)',
          }}
        >
          <img
            src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1774668881/chils_simple_logo_transparent_kdfrfk.png"
            alt=""
            className="tap-snowflake"
            referrerPolicy="no-referrer"
          />
        </div>
      ))}

      {/* Desktop ghost cursor */}
      {pointerType !== 'touch' && isVisible && (
        <div
          ref={ghostRef}
          className="custom-ghost-cursor fixed top-0 left-0 pointer-events-none z-[9998] -translate-x-1/2 -translate-y-1/2 will-change-transform"
          style={{
            transform: 'translate3d(-100px, -100px, 0)',
            display: 'block',
          }}
        >
          {/* Ghost-Echo Snowflake Logo */}
          <div
            className="relative w-8 h-8 flex items-center justify-center transition-all duration-300"
            style={{
              transform: `scale(${isHovering ? 1.5 : 1.1})`,
              opacity: isHovering ? 0.75 : 0.55,
            }}
          >
            <img 
              src="https://res.cloudinary.com/ddatd5ruz/image/upload/v1774668881/chils_simple_logo_transparent_kdfrfk.png"
              alt="ghost cursor"
              className="w-full h-full object-contain gold-icon animate-[spin_10s_linear_infinite]"
              referrerPolicy="no-referrer"
            />
          </div>

          {/* Ambient Outer Aura on Hover */}
          <div
            className="absolute w-12 h-12 border border-accent/20 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 left-1/2 top-1/2"
            style={{
              transform: `scale(${isHovering ? 1 : 0})`,
              opacity: isHovering ? 1 : 0,
            }}
          />
        </div>
      )}
    </>
  );
};

export default CustomCursor;
