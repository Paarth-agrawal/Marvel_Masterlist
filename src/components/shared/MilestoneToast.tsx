import React, { useEffect, useState, useRef } from 'react';
import { useCatalog } from '../../hooks/useCatalog';
import { useProgressStore } from '../../store/progressStore';
import { Sparkles, Trophy, ShieldAlert, Award } from 'lucide-react';

interface Toast {
  id: string;
  percent: number;
  message: string;
  icon: 'quarter' | 'half' | 'threequarter' | 'complete';
}

const MILESTONE_MESSAGES: Record<number, { message: string; icon: Toast['icon'] }> = {
  25: { message: 'Quarter of the Marvel universe done!', icon: 'quarter' },
  50: { message: 'Halfway through the multiverse!', icon: 'half' },
  75: { message: 'Almost there, Avenger!', icon: 'threequarter' },
  100: { message: 'You are the most powerful being in the universe.', icon: 'complete' },
};

export const MilestoneToast: React.FC = () => {
  const { catalog } = useCatalog();
  const { progress } = useProgressStore();
  const [toast, setToast] = useState<Toast | null>(null);
  const prevPercentRef = useRef<number | null>(null);

  useEffect(() => {
    if (!catalog || catalog.length === 0) return;
    const completedCount = catalog.filter(
      (p) => progress.watchProgress[p.id]?.status === 'completed'
    ).length;
    const currentPercent = Math.round((completedCount / catalog.length) * 100);

    if (prevPercentRef.current !== null) {
      const prev = prevPercentRef.current;
      // Check if crossed any milestone
      for (const threshold of [25, 50, 75, 100]) {
        if (prev < threshold && currentPercent >= threshold) {
          const config = MILESTONE_MESSAGES[threshold];
          setToast({
            id: String(Date.now()),
            percent: threshold,
            message: config.message,
            icon: config.icon,
          });
          const timer = setTimeout(() => {
            setToast(null);
          }, 5000);
          return () => clearTimeout(timer);
        }
      }
    }

    prevPercentRef.current = currentPercent;
  }, [catalog, progress.watchProgress]);

  if (!toast) return null;

  return (
    <div className="milestone-toast-container" role="status" aria-live="polite">
      <div className="milestone-toast fade-in">
        <div className="milestone-toast-icon">
          {toast.icon === 'complete' ? (
            <Trophy size={20} color="var(--accent-gold)" />
          ) : toast.icon === 'threequarter' ? (
            <ShieldAlert size={20} color="var(--accent-red)" />
          ) : toast.icon === 'half' ? (
            <Award size={20} color="#60a5fa" />
          ) : (
            <Sparkles size={20} color="var(--accent-gold)" />
          )}
        </div>
        <div className="milestone-toast-body">
          <div className="milestone-toast-title">
            Milestone Reached · {toast.percent}% Complete
          </div>
          <div className="milestone-toast-desc">{toast.message}</div>
        </div>
        <button
          className="milestone-toast-close"
          onClick={() => setToast(null)}
          aria-label="Dismiss toast"
        >
          ×
        </button>
      </div>
    </div>
  );
};
