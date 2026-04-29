import React, { useState, useEffect } from 'react';
import STLViewer from './STLViewerR3F';
import styles from './ResultViewer.module.css';

const SHIELD_LABELS = {
  lateral_left:  'Lateral Left',
  lateral_right: 'Lateral Right',
  reduced:       'Reduced Coverage',
  upper:         'Upper Arch Full',
};

const PROGRESS_STEPS = [
  'Removing teeth',
  'Filling empty holes',
  'Generating splint surface',
  'Solidify splint',
  'Generating wall segment',
  'Tongue blade displacement',
  'Prong adjustment',
];

const ResultViewer = ({ resultUrl, scanData, onStartOver, onSetResultUrl, sampleResultUrl }) => {
  const originalFile  = scanData?.scan1;
  const secondFile    = scanData?.scan2;
  const toothPosition = scanData?.toothType;
  const stentOption   = scanData?.stentOption;
  const shieldOption  = scanData?.shieldOption; // ← new

  const formatOption = (value) => {
    if (!value) return '—';
    return value
      .replace(/_/g, ' ')
      .replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const [wireframe,   setWireframe]   = useState(false);
  const [autoRotate,  setAutoRotate]  = useState(true);
  const [viewerKey,   setViewerKey]   = useState(0);
  const [isLoading,   setIsLoading]   = useState(false);
  const [progressIndex, setProgressIndex] = useState(0);

  const accentColor = wireframe ? '#3E4A5A' : '#E8D5C3';

  const handleReset = () => setViewerKey(k => k + 1);

  const canRender = Boolean(resultUrl);
  const isWaitingForResult = Boolean(scanData && !resultUrl);
  const progressPercentage = Math.min(100, Math.round((progressIndex / PROGRESS_STEPS.length) * 100));
  const currentStep = PROGRESS_STEPS[Math.min(progressIndex, PROGRESS_STEPS.length - 1)] || 'Preparing AI generation...';

  useEffect(() => {
    if (!scanData || canRender) {
      setProgressIndex(0);
      return undefined;
    }

    setProgressIndex(0);

    const timers = [];
    const delayPerStep = 900;

    PROGRESS_STEPS.forEach((step, index) => {
      timers.push(window.setTimeout(() => {
        setProgressIndex(index + 1);

        if (index === PROGRESS_STEPS.length - 1 && !resultUrl && typeof onSetResultUrl === 'function' && sampleResultUrl) {
          onSetResultUrl(sampleResultUrl);
        }
      }, delayPerStep * (index + 1)));
    });

    return () => timers.forEach(window.clearTimeout);
  }, [scanData, canRender, onSetResultUrl, resultUrl, sampleResultUrl]);

  return (
    <div className={styles.container}>

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.statusBadge}>
            <span className={styles.statusDot} />
            {canRender ? 'AI Generation Complete' : 'Waiting for AI Output'}
          </div>
          <h2 className={styles.headerTitle}>3D CAD Model</h2>
        </div>
        <button className={styles.startOverBtn} onClick={onStartOver}>
          <UploadIcon /> New Scan
        </button>
      </div>

      {/* ── Main 3D Viewer ─────────────────────────────────────────────────── */}
      <div className={styles.viewerContainer}>
        <div className={styles.viewerInner}>
          {canRender ? (
            <>
              {isLoading && (
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: 'rgba(7, 17, 31, 0.7)',
                  zIndex: 10,
                }}>
                  <div style={{ color: '#2DC4C4', fontSize: '14px', fontWeight: 700 }}>
                    Loading 3D model...
                  </div>
                </div>
              )}
              <STLViewer
                key={viewerKey}
                stlUrl={resultUrl}
                accentColor={accentColor}
                background="#07111F"
                autoRotate={autoRotate}
                wireframe={wireframe}
                showGrid={false}
                enablePan={true}
              />
            </>
          ) : isWaitingForResult ? (
            <div className={styles.progressState}>
              <div className={styles.progressHeader}>
                <p className={styles.progressTitle}>AI design in progress</p>
                <p className={styles.progressSub}>
                  This is a prototype loading screen; the real AI build may take longer.
                </p>
              </div>

              <div className={styles.progressBar}>
                <div className={styles.progressBarFill} style={{ width: `${progressPercentage}%` }} />
                <div className={styles.progressBarLabel}>{currentStep}</div>
              </div>

              <div className={styles.progressCurrent}>
                <span>Step {Math.min(progressIndex + 1, PROGRESS_STEPS.length)} of {PROGRESS_STEPS.length}</span>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <p className={styles.emptyTitle}>No AI CAD model yet</p>
              <p className={styles.emptySub}>
                Upload preview is for scan verification only.
              </p>
              <div className={styles.emptyMeta}>
                <span>Uploaded scan:</span>
                <span className={styles.mono}>
                  {originalFile?.name || '—'}{secondFile ? ` + ${secondFile.name}` : ''}
                </span>
              </div>
              {shieldOption && (
                <div className={styles.shieldBadge}>
                  <ShieldIcon />
                  Radiation shield: <strong>{SHIELD_LABELS[shieldOption] || formatOption(shieldOption)}</strong>
                </div>
              )}
            </div>
          )}

          {/* Corner watermark */}
          <div className={styles.watermark}>
            <LogoMark />
            MedScan 3D
          </div>
        </div>

        {/* ── Toolbar ──────────────────────────────────────────────────────── */}
        <div className={styles.toolbar}>
          <div className={styles.toolGroup}>
            <ToolButton
              active={autoRotate}
              onClick={() => setAutoRotate(v => !v)}
              label="360° Auto-Rotate"
              icon={<Rotate360Icon />}
              disabled={!canRender}
            />
            <ToolButton
              active={wireframe}
              onClick={() => setWireframe(v => !v)}
              label="Wireframe"
              icon={<WireframeIcon />}
              disabled={!canRender}
            />
          </div>

          <div className={styles.toolDivider} />

          <div className={styles.toolGroup}>
            <ToolButton onClick={handleReset} label="Reset View" icon={<ResetIcon />} disabled={!canRender} />
          </div>

          <div className={styles.toolHints}>
            <HintPill icon="🖱️" text="Drag to rotate" />
            <HintPill icon="⚲"  text="Scroll to zoom" />
          </div>
        </div>
      </div>

      {/* ── Info Bar ────────────────────────────────────────────────────────── */}
      <div className={styles.infoBar}>
        <InfoItem label="Source"     value={originalFile?.name || '—'} mono />
        <InfoItem label="Stentra Type"
          value={shieldOption ? (SHIELD_LABELS[shieldOption] || formatOption(shieldOption)) : 'None'}
          highlight={Boolean(shieldOption)}
        />
        <InfoItem label="Format"     value="STL Mesh" />
        <InfoItem label="Status"     value="AI Generated" highlight />
        <div className={styles.downloadWrap}>
          <button className={styles.downloadBtn} disabled={!canRender}>
            <DownloadIcon /> Download STL
          </button>
        </div>
      </div>
    </div>
  );
};

/* ── Sub-components ─────────────────────────────────────────────────────────── */

const ToolButton = ({ active, onClick, label, icon, disabled }) => (
  <button
    className={`${styles.toolBtn} ${active ? styles.toolBtnActive : ''}`}
    onClick={onClick}
    title={label}
    disabled={disabled}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const HintPill = ({ icon, text }) => (
  <div className={styles.hintPill}>
    <span>{icon}</span>
    <span>{text}</span>
  </div>
);

const InfoItem = ({ label, value, mono, highlight }) => (
  <div className={styles.infoItem}>
    <span className={styles.infoLabel}>{label}</span>
    <span className={`${styles.infoValue} ${mono ? styles.mono : ''} ${highlight ? styles.highlight : ''}`}>
      {value}
    </span>
  </div>
);

/* ── Icons ─────────────────────────────────────────────────────────────────── */

const UploadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 9V3M4 6l3-3 3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 10v1.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const Rotate360Icon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2.5 7.5a5 5 0 0110 0 5 5 0 01-10 0" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M11 5l1.5 2.5L11 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor"/>
  </svg>
);

const WireframeIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M7.5 2L13 5.5v7L7.5 16 2 12.5v-7L7.5 2z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M7.5 2v13.5M2 5.5l5.5 3 5.5-3" stroke="currentColor" strokeWidth="1" strokeOpacity="0.5"/>
  </svg>
);

const ResetIcon = () => (
  <svg width="15" height="15" viewBox="0 0 15 15" fill="none">
    <path d="M2 7.5A5.5 5.5 0 1113 7.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
    <path d="M2 4.5V7.5H5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const DownloadIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2v7M4 7l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M2 10v1.5a.5.5 0 00.5.5h9a.5.5 0 00.5-.5V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 1.5L2.5 3.5v3.5C2.5 9.75 4.5 11.75 7 12.5c2.5-.75 4.5-2.75 4.5-5.5V3.5L7 1.5z"
      stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
    <path d="M4.5 7l2 2L9.5 5.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const LogoMark = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="1" y="1" width="14" height="14" rx="4" fill="#2B7FE0" fillOpacity="0.2" stroke="#2B7FE0" strokeWidth="1"/>
    <path d="M5 8h6M8 5v6" stroke="#2DC4C4" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export default ResultViewer;
