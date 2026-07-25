import React, { useEffect, useRef } from 'react';
import { Card } from './Card';
import type { CardProps } from './Card';

interface CarouselProps {
  items: CardProps[];
}

export const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track) return;

    const animations = new Map<Element, Animation>();
    const entries = track.querySelectorAll('.carousel-item');


    entries.forEach((entry) => {
      const animation = entry.animate(
        [
          { scale: '0.9', opacity: '0.5' },
          { scale: '1.06', opacity: '1', offset: 0.5 },
          { scale: '0.9', opacity: '0.5' }
        ],
        {
          duration: 1, // Controlled via currentTime
          fill: 'both',
        }
      );
      animation.pause();
      animations.set(entry, animation);
    });


    // Tick function to update translations and card scaling in JS
    const tick = () => {
      const containerRect = container.getBoundingClientRect();
      const scrollHeight = containerRect.height - window.innerHeight;

      if (scrollHeight <= 0) return;

      // Calculate progress of vertical scroll through the tall section
      const progress = -containerRect.top / scrollHeight;
      const clampedProgress = Math.max(0, Math.min(1, progress));

      const maxTranslate = track.scrollWidth - window.innerWidth;
      track.style.transform = `translate3d(${-clampedProgress * maxTranslate}px, 0, 0)`;

      entries.forEach((entry) => {
        const animation = animations.get(entry);
        // if (!animation) return;

        const entryRect = entry.getBoundingClientRect();
        const entryCenter = entryRect.left + entryRect.width / 2;

        const cardProgress = entryCenter / window.innerWidth;
        animation.currentTime = Math.max(0, Math.min(1, cardProgress));
      });
    };

    window.addEventListener('scroll', tick, { passive: true });
    window.addEventListener('resize', tick);

    tick();

    return () => {
      window.removeEventListener('scroll', tick);
      window.removeEventListener('resize', tick);
      animations.forEach((animation) => animation.cancel());
    };
  }, [items]);

  return (
    <div className="scroll-container" ref={containerRef}>
      <div className="sticky-wrapper">
        <div className="carousel-scroller-viewport">
          <div className="carousel-track" ref={trackRef}>
            {items.map((item, index) => (
              <div className="carousel-item" key={`carousel-item-${index}`}>
                <Card {...item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
