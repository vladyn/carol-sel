import React, { render, screen, cleanup } from "@testing-library/react";
import { Card } from './Card';
import type { CardProps } from './Card';
import { describe, it, expect, afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});

const defaultProps: CardProps = {
  image: '/images/mountain.jpg',
  title: 'Mountain View',
  caption: 'Featured',
  description: 'A scenic overlook in the Alps.',
};

describe('Card', () => {
  it('renders the image with correct src and alt text', () => {
    render(<Card {...defaultProps} />);
    const image = screen.getByRole('img', { name: defaultProps.title });

    expect(image).toHaveAttribute('src', defaultProps.image);
    expect(image).toHaveAttribute('alt', defaultProps.title);
  });

  it('applies lazy loading to the image', () => {
    render(<Card {...defaultProps} />);
    const image = screen.getByRole('img', { name: defaultProps.title });

    expect(image).toHaveAttribute('loading', 'lazy');
  });

  it('renders the title as a heading', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByRole('heading', { name: defaultProps.title, level: 3 })).toBeInTheDocument();
  });

  it('renders the caption text', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText(defaultProps.caption)).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<Card {...defaultProps} />);
    expect(screen.getByText(defaultProps.description)).toBeInTheDocument();
  });

  it('applies the base carousel-card class when no className is passed', () => {
    const { container } = render(<Card {...defaultProps} />);
    const root = container.firstChild as HTMLElement;

    expect(root).toHaveClass('carousel-card');
  });

  it('merges a custom className with the base class', () => {
    const { container } = render(<Card {...defaultProps} className="neon-card-first" />);
    const root = container.firstChild as HTMLElement;

    expect(root).toHaveClass('carousel-card');
    expect(root).toHaveClass('neon-card-first');
  });

  it('does not crash and renders empty text nodes for empty string props', () => {
    render(<Card {...defaultProps} caption="" description="" />);
    expect(document.querySelector('.card-caption')).toBeInTheDocument();
    expect(document.querySelector('.card-description')).toBeInTheDocument();
  });
});
