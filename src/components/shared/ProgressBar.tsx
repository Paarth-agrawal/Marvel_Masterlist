import React from 'react';

interface ProgressBarProps {
  value: number;    // 0–100
  height?: number;
  variant?: 'default' | 'success';
  showLabel?: boolean;
  label?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  height = 6,
  variant = 'default',
  showLabel = false,
  label,
}) => {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div>
      {(showLabel || label) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
          <span>{label}</span>
          {showLabel && <span style={{ fontFamily: 'JetBrains Mono, monospace', color: clamped >= 80 ? 'var(--accent-gold)' : 'var(--text-secondary)' }}>{clamped}%</span>}
        </div>
      )}
      <div className="progress-track" style={{ height }}>
        <div
          className={`progress-fill${variant === 'success' ? ' progress-fill-success' : ''}`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  );
};
