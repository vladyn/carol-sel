import React from 'react';

export const Card: React.FC<CardProps> = ({
  image,
  title,
  caption,
  description,
  className = '',
}) => {
  return (
    <div className={`carousel-card ${className}`}>
      <div className="card-image-wrapper">
        <img src={image} alt={title} className="card-image" loading="lazy" />
        <div className="card-overlay" />
      </div>
      <div className="card-content">
        <span className="card-caption">{caption}</span>
        <h3 className="card-title">{title}</h3>
        <p className="card-description">{description}</p>
      </div>
    </div>
  );
};

export interface CardProps {
  image: string;
  title: string;
  caption: string;
  description: string;
  className?: string;
}