import React, { useState } from 'react';
import { Film } from 'lucide-react';

interface PosterProps {
  url: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
}

export const Poster: React.FC<PosterProps> = ({ url, title, className = '', style }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !url) {
    return (
      <div className={`poster-fallback ${className}`} style={style}>
        <Film size={28} />
        <span>{title}</span>
      </div>
    );
  }

  return (
    <img
      src={url}
      alt={`${title} poster`}
      className={className}
      style={style}
      onError={() => setFailed(true)}
      loading="lazy"
    />
  );
};
