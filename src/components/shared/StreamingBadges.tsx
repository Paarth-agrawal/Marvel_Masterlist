import React, { useMemo } from 'react';
import type { StreamingRecord } from '../../types';
import { ExternalLink, Info } from 'lucide-react';
import { sortAndFilterProviders } from '../../utils/streamingApi';

interface StreamingBadgesProps {
  record: StreamingRecord | null;
}

const TYPE_LABELS: Record<string, string> = {
  subscription: 'Sub',
  rental:       'Rent',
  rent:         'Rent',
  purchase:     'Buy',
  buy:          'Buy',
  free:         'Free',
  unknown:      '?',
};

const TYPE_CLASS: Record<string, string> = {
  subscription: 'streaming-badge-sub',
  rental:       'streaming-badge-rent',
  rent:         'streaming-badge-rent',
  purchase:     'streaming-badge-purchase',
  buy:          'streaming-badge-purchase',
  free:         'streaming-badge-free',
  unknown:      '',
};

function getBrandClass(name: string): string {
  const n = name.toLowerCase();
  if (n.includes('hotstar') || n.includes('disney')) return 'streaming-brand-hotstar';
  if (n.includes('netflix')) return 'streaming-brand-netflix';
  if (n.includes('prime') || n.includes('amazon')) return 'streaming-brand-prime';
  return '';
}

export const StreamingBadges: React.FC<StreamingBadgesProps> = ({ record }) => {
  const validProviders = useMemo(() => {
    return record ? sortAndFilterProviders(record.providers) : [];
  }, [record]);

  if (!record) {
    return (
      <span className="streaming-unavailable">
        <Info size={12} />
        Streaming info unavailable
      </span>
    );
  }

  if (validProviders.length === 0) {
    return (
      <span className="streaming-not-found">
        Not found on checked services
      </span>
    );
  }

  return (
    <div className="streaming-badges">
      {validProviders.map((p, i) => {
        const brandClass = getBrandClass(p.name);
        const isJioHotstar = p.name.includes('Hotstar');
        return (
          <a
            key={i}
            href={p.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className={`streaming-badge ${brandClass || (TYPE_CLASS[p.type] ?? '')} ${isJioHotstar ? 'streaming-badge-prominent' : ''} ${!p.verified ? 'streaming-badge-unverified' : ''}`}
            title={!p.verified ? `${p.name} — Availability not verified — check provider website` : `Watch on ${p.name}`}
          >
            {p.name} · {TYPE_LABELS[p.type]}
            {!p.verified && ' ⚠'}
            <ExternalLink size={10} />
          </a>
        );
      })}
    </div>
  );
};
