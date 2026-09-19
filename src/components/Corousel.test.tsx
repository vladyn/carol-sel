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
const VIEWPORT_HEIGHT = 800;

function makeRect(partial: Partial<DOMRect>): DOMRect {
    return {
        top: 0, left: 0, right: 0, bottom: 0, width: 0, height: 0, x: 0, y: 0,
        toJSON: () => ({}),
        ...partial,
    };
}

let getRectMock: ReturnType<typeof vi.spyOn>;

const mockRects = () => {
    getRectMock.mockImplementation(function (this: HTMLElement) {
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

    getRectMock = vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect');
    mockRects();
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

    it('translates the track in proportion to wheel progress', () => {
        render(<Carousel items={items} />);
        document.querySelector('.scroll-container')!.dispatchEvent(
            new WheelEvent('wheel', { deltaY: VIEWPORT_HEIGHT, cancelable: true }),
        );

        const copyWidth = items.length * ITEM_WIDTH; // 900
        const expectedTranslate = copyWidth + 0.5 * copyWidth; // 1350

        const match = getTrack().style.transform.match(/translate3d\((-?\d+(\.\d+)?)px/);
        expect(match).not.toBeNull();
        expect(parseFloat(match![1])).toBeCloseTo(-expectedTranslate, 2);
    });

    it('wraps forward without changing document scroll position', () => {
        render(<Carousel items={items} />);
        const container = document.querySelector('.scroll-container')!;
        container.dispatchEvent(new WheelEvent('wheel', { deltaY: VIEWPORT_HEIGHT * 2, cancelable: true }));

        const match = getTrack().style.transform.match(/translate3d\((-?\d+(\.\d+)?)px/);
        expect(parseFloat(match![1])).toBeCloseTo(-items.length * ITEM_WIDTH, 2);
    });

    it('wraps backward from the first frame', () => {
        render(<Carousel items={items} />);
        const event = new WheelEvent('wheel', { deltaY: -VIEWPORT_HEIGHT, cancelable: true });
        document.querySelector('.scroll-container')!.dispatchEvent(event);

        const match = getTrack().style.transform.match(/translate3d\((-?\d+(\.\d+)?)px/);
        expect(parseFloat(match![1])).toBeCloseTo(-(items.length * ITEM_WIDTH * 1.5), 2);
        expect(event.defaultPrevented).toBe(true);
    });

    it('removes input and resize listeners on unmount', () => {
        const removeSpy = vi.spyOn(window, 'removeEventListener');
        const { unmount } = render(<Carousel items={items} />);
        const container = document.querySelector('.scroll-container')!;
        const containerRemoveSpy = vi.spyOn(container, 'removeEventListener');
        unmount();

        expect(removeSpy).toHaveBeenCalledWith('resize', expect.any(Function));
        expect(containerRemoveSpy).toHaveBeenCalledWith('wheel', expect.any(Function));
    });
});
