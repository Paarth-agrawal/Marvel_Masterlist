import React from 'react';
import type { WatchStatus } from '../../types';
import { useProgressStore } from '../../store/progressStore';

interface WatchStatusSelectProps {
  productionId: string;
  isUpcoming?: boolean;
  size?: 'sm' | 'md';
}

const STATUS_LABELS: Record<WatchStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed:   'Completed ✓',
  skipped:     'Skipped',
};

export const WatchStatusSelect: React.FC<WatchStatusSelectProps> = ({
  productionId,
  isUpcoming = false,
  size = 'sm',
}) => {
  const { progress, setWatchStatus } = useProgressStore();
  const currentStatus = (progress.watchProgress[productionId]?.status ?? 'not_started') as WatchStatus;

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    e.stopPropagation();
    const newStatus = e.target.value as WatchStatus;
    if (isUpcoming && newStatus === 'completed') {
      alert("This title hasn't been released yet.");
      return;
    }
    setWatchStatus(productionId, newStatus);
  };

  return (
    <select
      id={`status-${productionId}`}
      className={`status-select ${currentStatus} ${size === 'md' ? '' : ''}`}
      value={currentStatus}
      onChange={handleChange}
      onClick={(e) => e.stopPropagation()}
      disabled={isUpcoming && currentStatus !== 'completed'}
      aria-label={`Watch status for ${productionId}`}
    >
      {(Object.keys(STATUS_LABELS) as WatchStatus[]).map((s) => (
        <option key={s} value={s}>{STATUS_LABELS[s]}</option>
      ))}
    </select>
  );
};

// Circular checkbox for quick toggle
interface WatchCheckboxProps {
  productionId: string;
  isUpcoming?: boolean;
}

export const WatchCheckbox: React.FC<WatchCheckboxProps> = ({ productionId, isUpcoming = false }) => {
  const { progress, setWatchStatus } = useProgressStore();
  const [isPulsing, setIsPulsing] = React.useState(false);
  const currentStatus = (progress.watchProgress[productionId]?.status ?? 'not_started') as WatchStatus;
  const isCompleted = currentStatus === 'completed';

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isUpcoming) {
      alert("This title hasn't been released yet.");
      return;
    }
    const nextCompleted = !isCompleted;
    if (nextCompleted) {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 500);
    }
    setWatchStatus(productionId, nextCompleted ? 'completed' : 'not_started');
  };

  return (
    <button
      id={`checkbox-${productionId}`}
      className={`watch-checkbox ${isCompleted ? 'checked' : ''} ${currentStatus === 'in_progress' ? 'in-progress' : ''} ${isPulsing ? 'pulsing' : ''}`}
      onClick={handleClick}
      aria-label={isCompleted ? 'Mark as not started' : 'Mark as completed'}
      title={isCompleted ? 'Mark as not started' : 'Mark as completed'}
    >
      {isCompleted && (
        <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
          <path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
};
