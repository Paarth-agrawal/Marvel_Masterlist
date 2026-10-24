import type { UserProgress, TitleProgress } from '../types';

/**
 * Export progress as JSON
 */
export function exportProgressJSON(progress: UserProgress): void {
  const date = new Date().toISOString().split('T')[0];
  const filename = `marvel-watchlist-backup-${date}.json`;
  const json = JSON.stringify(progress, null, 2);
  downloadFile(json, filename, 'application/json');
}

/**
 * Export progress as CSV
 */
export function exportProgressCSV(
  progress: UserProgress,
  catalogTitles: Record<string, string>
): void {
  const date = new Date().toISOString().split('T')[0];
  const filename = `marvel-watchlist-${date}.csv`;

  const header = 'title,id,status,updatedAt\n';
  const rows = Object.entries(progress.watchProgress)
    .map(([id, entry]: [string, TitleProgress]) => {
      const title = (catalogTitles[id] ?? id).replace(/"/g, '""');
      return `"${title}","${id}","${entry.status}","${entry.updatedAt}"`;
    })
    .join('\n');

  downloadFile(header + rows, filename, 'text/csv');
}

function downloadFile(content: string, filename: string, type: string): void {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface ImportValidationResult {
  valid: boolean;
  error?: string;
  matchedCount?: number;
  unmatchedCount?: number;
  data?: UserProgress;
}

/**
 * Validate and parse an imported backup file
 */
export function validateImport(
  raw: string,
  knownIds: Set<string>
): ImportValidationResult {
  try {
    const parsed = JSON.parse(raw) as unknown;

    if (typeof parsed !== 'object' || parsed === null) {
      return { valid: false, error: 'Invalid backup file. No changes were made.' };
    }

    const obj = parsed as Record<string, unknown>;

    if (obj.version === undefined || obj.watchProgress === undefined) {
      return { valid: false, error: 'Invalid backup file. No changes were made.' };
    }

    const progress = (obj as unknown) as UserProgress;
    let matched = 0;
    let unmatched = 0;

    for (const id of Object.keys(progress.watchProgress)) {
      if (knownIds.has(id)) matched++;
      else unmatched++;
    }

    return {
      valid: true,
      matchedCount: matched,
      unmatchedCount: unmatched,
      data: progress,
    };
  } catch {
    return { valid: false, error: 'Invalid backup file. No changes were made.' };
  }
}

/**
 * Apply import: only include IDs that exist in the current catalog
 */
export function applyImport(
  current: UserProgress,
  imported: UserProgress,
  knownIds: Set<string>
): UserProgress {
  const filteredProgress: Record<string, TitleProgress> = {};
  for (const [id, entry] of Object.entries(imported.watchProgress)) {
    if (knownIds.has(id)) filteredProgress[id] = entry;
  }

  return {
    ...current,
    watchProgress: filteredProgress,
    lastUpdated: new Date().toISOString(),
  };
}
