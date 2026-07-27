// Carousel.test.tsx
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Carousel } from './Carousel';
import type { CardProps } from './Card';

vi.mock('./Card', () => ({
    Card: ({ title }: { title: string }) => <div data-testid="card">{title}</div>,
}));

const items: CardProps[] = [
    { image: '/a.jpg', title: 'Alpha', caption: 'One', description: 'First card' },
    { image: '/b.jpg', title: 'Beta', caption: 'Two', description: 'Second card' },
    { image: '/c.jpg', title: 'Gamma', caption: 'Three', description: 'Third card' },
];

const ITEM_WIDTH = 300;
const CONTAINER_HEIGHT = 3000;
const VIEWPORT_HEIGHT = 800;
const SCROLL_HEIGHT = CONTAINER_HEIGHT - VIEWPORT_HEIGHT; // 2200

function makeRect(partial: Partial<DOMRect>): DOMRect {
    return {
        top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
        toJSON: () => ({}),
        ...partial,
    };
}

let getRectMock: ReturnType<typeof vi.spyOn>;

// Places container.top wherever `rawProgress = -top / scrollHeight` yields
// the given progress, mirroring the component's own math exactly.
const setProgress = (progress: number) => {
    const top = -progress * SCROLL_HEIGHT;
    getRectMock.mockImplementation(function (this: HTMLElement) {
        if (this.classList.contains('scroll-container')) {
            return makeRect({ top, height: CONTAINER_HEIGHT });
        }
        if (this.classList.contains('carousel-item')) {
            return makeRect({ left: 0, width: ITEM_WIDTH });
        }
        return makeRect({});
    });
};

beforeEach(() => {
    vi.spyOn(window, 'innerHeight', 'get').mockReturnValue(VIEWPORT_HEIGHT);
    vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1200);

    // jsdom has no Web Animations API implementation.
    Element.prototype.animate = vi.fn().mockReturnValue({
        pause: vi.fn(),
        play: vi.fn(),
        cancel: vi.fn(),
        currentTime: 0,
    }) as unknown as typeof Element.prototype.animate;

    // @ts-ignore
    window.scrollBy = vi.fn();

    getRectMock = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');
    setProgress(0);
});

afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
});

const getTrack = () => document.querySelector('.carousel-track') as HTMLElement;

describe('Carousel', () => {
    it('renders three duplicated copies of the item set', () => {
        render(<Carousel items={items} />);
        expect(screen.getAllByTestId('card')).toHaveLength(items.length * 3);
    });

    it('renders no items when given an empty list, without crashing', () => {
        const { container } = render(<Carousel items={[]} />);
        expect(container.querySelectorAll('.carousel-item')).toHaveLength(0);
    });

    it('translates the track in proportion to scroll progress', () => {
        render(<Carousel items={items} />);
        setProgress(0.5);
        window.dispatchEvent(new Event('scroll'));

        const copyWidth = items.length * ITEM_WIDTH; // 900
        const expectedTranslate = copyWidth + 0.5 * copyWidth; // 1350

        const match = getTrack().style.transform.match(/translate3d\((-?\d+(\.\d+)?)px/);
        expect(match).not.toBeNull();
        expect(parseFloat(match![1])).toBeCloseTo(-expectedTranslate, 2);
    });

    it('wraps forward the instant progress reaches 1', () => {
        render(<Carousel items={items} />);
        setProgress(1); // exact boundary — no margin in this version
        window.dispatchEvent(new Event('scroll'));

        expect(window.scrollBy).toHaveBeenCalledWith(0, -SCROLL_HEIGHT);
    });

    it('does not wrap just below the forward boundary', () => {
        render(<Carousel items={items} />);
        setProgress(0.999);
        window.dispatchEvent(new Event('scroll'));

        expect(window.scrollBy).not.toHaveBeenCalled();
    });

    it('wraps backward the instant progress dips below 0', () => {
        render(<Carousel items={items} />);
        setProgress(-0.001);
        window.dispatchEvent(new Event('scroll'));

        expect(window.scrollBy).toHaveBeenCalledWith(0, SCROLL_HEIGHT);
    });

    it('removes scroll and resize listeners on unmount', () => {
        const removeSpy = vi.spyOn(window, 'removeEventListener');
        const { unmount } = render(<Carousel items={items} />);
        unmount();

        expect(removeSpy).toHaveBeenCalledWith('scroll', expect.any(Function));
        expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        // No 'wheel' listener exists in this version.
        expect(removeSpy).not.toHaveBeenCalledWith('wheel', expect.any(Function));
    });
});
