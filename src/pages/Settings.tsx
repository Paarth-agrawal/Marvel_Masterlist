import React, { useRef, useState } from 'react';
import { useProgressStore } from '../store/progressStore';
import { useCatalog } from '../hooks/useCatalog';
import { exportProgressJSON, exportProgressCSV, validateImport, applyImport } from '../utils/backup';
import { isLocalStorageAvailable } from '../utils/storage';
import { PRESETS } from '../utils/presets';
import { Download, Upload, Trash2, AlertTriangle, CheckCircle, Info } from 'lucide-react';
import type { UserProgress, PresetId } from '../types';

export default function Settings() {
  const {
    progress,
    setPreferences,
    setShowSkipped,
    setShowUpcoming,
    setDataSaver,
    replaceProgress,
    clearProgress,
  } = useProgressStore();
  const { catalog, knownIds } = useCatalog();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importResult, setImportResult] = useState<{ valid: boolean; message: string; data?: UserProgress } | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const storageOk = isLocalStorageAvailable();

  const titleMap = Object.fromEntries(catalog.map((p) => [p.id, p.title]));
  const totalTitles = catalog.length;
  const completedCount = Object.values(progress.watchProgress).filter((v) => v.status === 'completed').length;

  const handleExportJSON = () => exportProgressJSON(progress);
  const handleExportCSV  = () => exportProgressCSV(progress, titleMap);

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const raw = ev.target?.result as string;
      const result = validateImport(raw, knownIds);
      if (!result.valid) {
        setImportResult({ valid: false, message: result.error ?? 'Invalid backup file. No changes were made.' });
      } else {
        setImportResult({
          valid: true,
          message: `This backup contains ${result.matchedCount! + result.unmatchedCount!} entries. ${result.matchedCount} match current titles. ${result.unmatchedCount} are unrecognized (will be ignored).`,
          data: result.data,
        });
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  const handleApplyImport = () => {
    if (!importResult?.data) return;
    const applied = applyImport(progress, importResult.data, knownIds);
    replaceProgress(applied);
    setImportResult({ valid: true, message: '✓ Import applied successfully.' });
  };

  const handleClearProgress = () => {
    clearProgress();
    setShowClearConfirm(false);
  };

  return (
    <div style={{ paddingTop: '1.5rem', maxWidth: 700, margin: '0 auto' }}>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Preferences, region, and data management</p>
      </div>

      {/* localStorage warning */}
      {!storageOk && (
        <div className="alert alert-warning" style={{ marginBottom: '1.5rem' }}>
          <AlertTriangle size={16} style={{ flexShrink: 0 }} />
          <span>localStorage is unavailable. Your progress cannot be saved and the app is running in read-only mode.</span>
        </div>
      )}

      {/* Preferences */}
      <div className="settings-section">
        <div className="settings-section-header">Preferences</div>

        {/* Region */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Region 🇮🇳</div>
            <div className="settings-row-desc">Used for streaming availability lookup</div>
          </div>
          <select
            id="setting-region"
            className="status-select"
            value={progress.preferences.region}
            onChange={(e) => setPreferences({ region: e.target.value })}
          >
            <option value="IN">India (IN) 🇮🇳</option>
            <option value="US">United States (US)</option>
            <option value="GB">United Kingdom (GB)</option>
          </select>
        </div>

        {/* Data Saver Mode */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Data Saver (Slow Connections)</div>
            <div className="settings-row-desc">
              Disables poster image loading entirely and shows text-only cards for faster browsing
            </div>
          </div>
          <button
            id="toggle-data-saver"
            className={`toggle ${progress.preferences.dataSaver ? 'on' : ''}`}
            onClick={() => setDataSaver(!progress.preferences.dataSaver)}
            aria-label="Toggle Data Saver"
          />
        </div>

        {/* Default preset */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Default Catalog Preset</div>
            <div className="settings-row-desc">Which titles to show by default</div>
          </div>
          <select
            id="setting-preset"
            className="status-select"
            value={progress.preferences.activePreset}
            onChange={(e) => setPreferences({ activePreset: e.target.value as PresetId })}
          >
            {PRESETS.map((p) => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </select>
        </div>

        {/* Show skipped */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Show Skipped Titles</div>
            <div className="settings-row-desc">Display skipped titles in the timeline</div>
          </div>
          <button
            id="toggle-show-skipped"
            className={`toggle ${progress.preferences.showSkipped ? 'on' : ''}`}
            onClick={() => setShowSkipped(!progress.preferences.showSkipped)}
            aria-label="Toggle show skipped"
          />
        </div>

        {/* Show upcoming */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Show Upcoming Titles</div>
            <div className="settings-row-desc">Display unreleased titles in the timeline</div>
          </div>
          <button
            id="toggle-show-upcoming"
            className={`toggle ${progress.preferences.showUpcoming ? 'on' : ''}`}
            onClick={() => setShowUpcoming(!progress.preferences.showUpcoming)}
            aria-label="Toggle show upcoming"
          />
        </div>
      </div>

      {/* Data Management */}
      <div className="settings-section">
        <div className="settings-section-header">Data Management</div>

        {/* Stats */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Progress Summary</div>
            <div className="settings-row-desc">
              {completedCount} of {totalTitles} titles completed · Last updated: {new Date(progress.lastUpdated).toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>

        {/* Export JSON */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Export Progress (JSON)</div>
            <div className="settings-row-desc">Full backup of all watch progress</div>
          </div>
          <button id="export-json-btn" className="btn btn-secondary btn-sm" onClick={handleExportJSON}>
            <Download size={14} /> JSON
          </button>
        </div>

        {/* Export CSV */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Export Progress (CSV)</div>
            <div className="settings-row-desc">Spreadsheet-compatible export</div>
          </div>
          <button id="export-csv-btn" className="btn btn-secondary btn-sm" onClick={handleExportCSV}>
            <Download size={14} /> CSV
          </button>
        </div>

        {/* Import */}
        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '0.75rem' }}>
          <div className="settings-row-info">
            <div className="settings-row-label">Import Progress</div>
            <div className="settings-row-desc">Restore from a previous JSON backup</div>
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              id="import-btn"
              className="btn btn-secondary btn-sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={14} /> Choose file
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              style={{ display: 'none' }}
              onChange={handleImportFile}
              id="import-file-input"
            />
          </div>
          {importResult && (
            <div className={`alert ${importResult.valid ? 'alert-info' : 'alert-error'}`} style={{ width: '100%' }}>
              {importResult.valid ? <Info size={14} style={{ flexShrink: 0 }} /> : <AlertTriangle size={14} style={{ flexShrink: 0 }} />}
              <div style={{ flex: 1 }}>
                <span>{importResult.message}</span>
                {importResult.valid && importResult.data && !importResult.message.startsWith('✓') && (
                  <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem' }}>
                    <button id="confirm-import-btn" className="btn btn-primary btn-sm" onClick={handleApplyImport}>
                      <CheckCircle size={14} /> Apply Import
                    </button>
                    <button className="btn btn-ghost btn-sm" onClick={() => setImportResult(null)}>Cancel</button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clear progress */}
        <div className="settings-row">
          <div className="settings-row-info">
            <div className="settings-row-label">Clear All Progress</div>
            <div className="settings-row-desc">Permanently delete all watch progress data</div>
          </div>
          {!showClearConfirm ? (
            <button id="clear-progress-btn" className="btn btn-secondary btn-sm" style={{ color: 'var(--danger)', borderColor: 'rgba(192,25,44,0.4)' }} onClick={() => setShowClearConfirm(true)}>
              <Trash2 size={14} /> Clear
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button id="confirm-clear-btn" className="btn btn-sm" style={{ background: 'var(--danger)', color: 'white' }} onClick={handleClearProgress}>
                Confirm Delete
              </button>
              <button className="btn btn-ghost btn-sm" onClick={() => setShowClearConfirm(false)}>Cancel</button>
            </div>
          )}
        </div>
      </div>

      {/* About */}
      <div className="settings-section">
        <div className="settings-section-header">About</div>
        <div className="settings-row" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <strong style={{ color: 'var(--text-primary)' }}>Marvel Watchlist</strong> — Phase 1 build<br />
            Catalog: {totalTitles} titles across 6 tiers<br />
            Data last updated: October 2026<br />
            Region: {progress.preferences.region}<br />
            Streaming: Static JSON fallback (API key not configured)<br />
            <br />
            <strong>Data Sources:</strong> TMDB IDs for future API integration. Release dates verified against public sources.
            Streaming availability is curated manually for India and may be outdated.
            Always verify on provider websites.
          </div>
        </div>
      </div>
    </div>
  );
}
