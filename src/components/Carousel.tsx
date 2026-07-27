import React, { useEffect, useMemo, useRef } from 'react';
import { Card } from './Card';
import type { CardProps } from './Card';

interface CarouselProps {
  items: CardProps[];
}

// Duplicate the item set so a visually identical copy always sits on
// either side of the "active" lap — this is what makes the scroll
// reset below imperceptible.
const COPIES = 3;

export const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const isResetting = useRef(false);

  // Spread the strips of items across the carousel.
  const carouselItems = useMemo(() => {
    if (items.length === 0) return items;
    return Array.from({ length: COPIES }, () => items).flat();
  }, [items]);

  useEffect(() => {
    const container = containerRef.current;
    const track = trackRef.current;
    if (!container || !track || items.length === 0) return;

    const animations = new Map<Element, Animation>();
    const entries = track.querySelectorAll('.carousel-item');
    const viewport = track.parentElement;

    if (!viewport || entries.length === 0) return;

    entries.forEach((entry) => {
      const animation = entry.animate(
          [
            { scale: '0.9', opacity: '0.5' },
            { scale: '1.06', opacity: '1', offset: 0.5 },
            { scale: '0.9', opacity: '0.5' },
          ],
          { duration: 1, fill: 'both' }
      );
      animation.pause();
      animations.set(entry, animation);
    });

    const tick = () => {
      if (isResetting.current) return;

      const containerRect = container.getBoundingClientRect();
      const scrollHeight = containerRect.height - window.innerHeight;
      if (scrollHeight <= 0) return;

      const itemWidth = entries[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const copyWidth = items.length * (itemWidth + gap);

      // The middle copy is the "active" lap. translateStart skips the
      // leading copy entirely; loopDistance is exactly one copy's width.
      const translateStart = copyWidth;
      const loopDistance = copyWidth;

      // Deliberately unclamped: once progress crosses 0 or 1, we jump the
      // real scroll position by one lap's worth of pixels. Because every
      // copy renders identical content, the jump lands on a pixel-identical
      // frame, so it reads as continuous, infinite motion.
      const rawProgress = -containerRect.top / scrollHeight;

      if (rawProgress >= 1 || rawProgress < 0) {
        isResetting.current = true;
        window.scrollBy(0, rawProgress >= 1 ? -scrollHeight : scrollHeight);
        requestAnimationFrame(() => {
          isResetting.current = false;
          tick();
        });
        return;
      }

      const translate = translateStart + rawProgress * loopDistance;
      track.style.transform = `translate3d(${-translate}px, 0, 0)`;

      entries.forEach((entry) => {
        const animation = animations.get(entry);
        if (!animation) return;

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
              {carouselItems.map((item, index) => (
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
