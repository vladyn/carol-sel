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
const LAPS_PER_VIEWPORT = 2;

const normalizeProgress = (progress: number) => ((progress % 1) + 1) % 1;

export const Carousel: React.FC<CarouselProps> = ({ items }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(0);

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

    const render = () => {
      const itemWidth = entries[0].getBoundingClientRect().width;
      const gap = parseFloat(getComputedStyle(track).gap) || 0;
      const copyWidth = items.length * (itemWidth + gap);

      // The middle copy is the "active" lap. translateStart skips the
      // leading copy entirely; loopDistance is exactly one copy's width.

      const translate = copyWidth + progressRef.current * copyWidth;
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

    const advance = (deltaY: number) => {
      // Keep the position virtual. Unlike document scroll, this value can
      // cross either boundary, so both directions wrap at the same instant.
      const pixelsPerLap = Math.max(window.innerHeight * LAPS_PER_VIEWPORT, 1);
      progressRef.current = normalizeProgress(progressRef.current + deltaY / pixelsPerLap);
      render();
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.deltaY === 0) return;
      event.preventDefault();
      const delta = event.deltaMode === WheelEvent.DOM_DELTA_LINE
        ? event.deltaY * 16
        : event.deltaMode === WheelEvent.DOM_DELTA_PAGE
          ? event.deltaY * window.innerHeight
          : event.deltaY;
      advance(delta);
    };

    let touchY: number | null = null;
    const handleTouchStart = (event: TouchEvent) => {
      touchY = event.touches[0]?.clientY ?? null;
    };
    const handleTouchMove = (event: TouchEvent) => {
      const nextTouchY = event.touches[0]?.clientY;
      if (touchY === null || nextTouchY === undefined) return;
      event.preventDefault();
      advance(touchY - nextTouchY);
      touchY = nextTouchY;
    };
    const handleTouchEnd = () => {
      touchY = null;
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);
    window.addEventListener('resize', render);

    render();

    return () => {
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', render);
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
