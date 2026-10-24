import React, { useState, useRef, useEffect } from 'react';
import { Film, WifiOff } from 'lucide-react';
import { useProgressStore } from '../../store/progressStore';
import { extractDominantColor } from '../../utils/dominantColor';

interface PosterProps {
  url: string;
  title: string;
  className?: string;
  style?: React.CSSProperties;
  onColorExtracted?: (color: string) => void;
  width?: number;
  height?: number;
}

export const Poster: React.FC<PosterProps> = ({
  url,
  title,
  className = '',
  style,
  onColorExtracted,
  width = 300,
  height = 450,
}) => {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);
  const { progress } = useProgressStore();
  const isDataSaver = Boolean(progress.preferences?.dataSaver);

  // Data Saver mode: don't load external poster image at all
  if (isDataSaver) {
    return (
      <div className={`poster-fallback poster-datasaver ${className}`} style={style}>
        <WifiOff size={24} color="var(--accent-gold)" />
        <span style={{ fontWeight: 600, padding: '0 0.5rem' }}>{title}</span>
        <span style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)' }}>
          Data Saver Mode
        </span>
      </div>
    );
  }

  if (failed || !url) {
    return (
      <div className={`poster-fallback ${className}`} style={style}>
        <Film size={28} />
        <span>{title}</span>
      </div>
    );
  }

  const handleLoad = () => {
    setLoaded(true);
    if (imgRef.current && onColorExtracted) {
      try {
        const color = extractDominantColor(imgRef.current);
        onColorExtracted(color);
      } catch {
        // ignore cross-origin canvas security limits
      }
    }
  };

  return (
    <div className={`poster-container ${className}`} style={{ position: 'relative', width: '100%', height: '100%', ...style }}>
      {/* Grey shimmer loading skeleton */}
      {!loaded && <div className="poster-skeleton shimmer" aria-hidden="true" />}
      <img
        ref={imgRef}
        src={url}
        alt={`${title} poster`}
        width={width}
        height={height}
        crossOrigin="anonymous"
        className={`poster-img ${loaded ? 'loaded' : 'loading'}`}
        onLoad={handleLoad}
        onError={() => setFailed(true)}
        loading="lazy"
        decoding="async"
      />
    </div>
  );
};
