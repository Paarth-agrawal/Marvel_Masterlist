import React from 'react';
import type { Tier } from '../../types';

const TIER_LABELS: Record<Tier, string> = {
  'mcu': 'MCU',
  'x-men': 'X-Men',
  'spider-man': 'Spider-Man',
  'legacy': 'Legacy',
  'tv': 'TV',
  'animation': 'Animation',
};

interface TierBadgeProps {
  tier: Tier;
  className?: string;
}

export const TierBadge: React.FC<TierBadgeProps> = ({ tier, className = '' }) => {
  return (
    <span className={`tier-badge tier-badge-${tier} ${className}`}>
      {TIER_LABELS[tier]}
    </span>
  );
};
