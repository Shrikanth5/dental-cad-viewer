import React, { useState, useRef, useCallback } from 'react';
import STLViewer from './STLViewerR3F';
import styles from './UploadStep.module.css';

// Radiation / stent position options shared across dropdowns
const JAW_POSITIONS = [
  { value: 'upper',         label: 'Upper Jaw' },
  { value: 'lower',         label: 'Lower Jaw' },
  { value: 'lateral_left',  label: 'Lateral Left' },
  { value: 'lateral_right', label: 'Lateral Right' },
];

const STENT_POSITIONS = [
  { value: 'upper',         label: 'Upper Jaw Stent' },
  { value: 'reduced',       label: 'Reduced Jaw Stent' },
  { value: 'lateral_left',  label: 'Lateral Left Stent' },
  { value: 'lateral_right', label: 'Lateral Right Stent' },
];

// ─── Radiation Shield Options (new form) ──────────────────────────────────────
const SHIELD_OPTIONS = [
  {
    value: 'lateral_left',
    label: 'Lateral Left',
    desc: 'Shields left lateral teeth & soft tissue from scatter radiation',
  },
  {
    value: 'lateral_right',
    label: 'Lateral Right',
    desc: 'Shields right lateral teeth from direct beam exposure',
  },
  {
    value: 'reduced',
    label: 'Reduced Coverage',
    desc: 'Minimal coverage for early-stage treatment preservation',
  },
  {
    value: 'upper',
    label: 'Upper Arch Full',
    desc: 'Full upper arch protection for comprehensive radiation planning',
  },
];

const UploadStep = ({ onConfirm }) => {
  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [toothType, setToothType]     = useState('');
  const [stentOption, setStentOption] = useState('');
  const [shieldOption, setShieldOption] = useState(''); // new radiation shield form
  const [selectedPreview, setSelectedPreview] = useState('scan1'); // 'scan1' or 'scan2'

  const [dragging, setDragging] = useState(false);
  const [error, setError]       = useState('');
  const [viewerKey, setViewerKey] = useState(0);

  const inputRef  = useRef();
  const input2Ref = useRef();

  // ── Validation ──────────────────────────────────────────────────────────────
  const validateFile = (f) => {
    if (!f.name.toLowerCase().endsWith('.stl')) {
      setError('Only .stl files are supported.');
      return false;
    }
    if (f.size > 200 * 1024 * 1024) {
      setError('File size must be under 200 MB.');
      return false;
    }
    return true;
  };

  const handleFile = useCallback((f, slot) => {
    setError('');
    if (!f) return;
    if (!validateFile(f)) return;
    if (slot === 1) setFile1(f);
    if (slot === 2) setFile2(f);
  }, []);

  // ── Drag & Drop ─────────────────────────────────────────────────────────────
  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f, 1);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024)            return `${bytes} B`;
    if (bytes < 1024 * 1024)     return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  // ── Confirm ─────────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    if (typeof onConfirm === 'function') {
      onConfirm({ toothType, stentOption, shieldOption, scan1: file1, scan2: file2 });
    }
  };

  // ── RENDER: Drop Zone ────────────────────────────────────────────────────────
  if (!file1) {
    return (
      <div className={styles.container}>
        <div
          className={`${styles.dropzone} ${dragging ? styles.dragging : ''}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={onDrop}
          onClick={() => inputRef.current.click()}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".stl"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0], 1)}
          />

          <div className={styles.dropzoneInner}>
            <div className={styles.iconWrap}>
              <ScanIcon />
              <div className={styles.pulseRing} />
            </div>

            <h2 className={styles.dropTitle}>Upload Dental Scan</h2>

            <p className={styles.dropSub}>
              Drag & drop your primary <span>.STL</span> scan here, or click to browse.<br />
              A second scan (antagonist) can be added after.
            </p>

            <div className={styles.specs}>
              <span>STL format</span>
              <span className={styles.dot} />
              <span>Max 200 MB</span>
              <span className={styles.dot} />
              <span>ASCII or Binary</span>
            </div>

            <div className={styles.radiationNote}>
              <ShieldIcon />
              <span>Radiation stent planning for oral patients</span>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>
      </div>
    );
  }

  // ── RENDER: Split Layout ─────────────────────────────────────────────────────
  return (
    <div className={styles.container}>
      <div className={styles.splitLayout}>

        {/* ── LEFT PANEL ──────────────────────────────────────────────────── */}
        <div className={styles.leftPane}>

          {/* Section: Scan Files */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <ScanSmallIcon />
              <span>Scan Files</span>
            </div>

            {/* File 1 */}
            <div className={styles.previewHeader}>
              <div className={styles.fileInfo}>
                <FileIcon />
                <div>
                  <p className={styles.fileName}>{file1.name}</p>
                  <p className={styles.fileMeta}>{formatSize(file1.size)} · Primary Scan</p>
                </div>
              </div>
              <button
                className={styles.reuploadBtn}
                onClick={() => { setFile1(null); setFile2(null); setError(''); }}
              >
                Replace
              </button>
            </div>

            {/* File 2 */}
            <div
              className={`${styles.secondScanZone} ${file2 ? styles.secondScanFilled : ''}`}
              onClick={() => !file2 && input2Ref.current.click()}
            >
              <input
                ref={input2Ref}
                type="file"
                accept=".stl"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0], 2)}
              />
              {file2 ? (
                <div className={styles.previewHeaderInner}>
                  <div className={styles.fileInfo}>
                    <FileIcon />
                    <div>
                      <p className={styles.fileName}>{file2.name}</p>
                      <p className={styles.fileMeta}>{formatSize(file2.size)} · Antagonist Scan</p>
                    </div>
                  </div>
                  <button
                    className={styles.reuploadBtn}
                    onClick={(e) => { e.stopPropagation(); setFile2(null); setSelectedPreview('scan1'); }}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <div className={styles.secondScanEmpty}>
                  <PlusIcon />
                  <span>Add second scan <em>(optional — antagonist jaw)</em></span>
                </div>
              )}
            </div>
          </div>

          {/* Section: Jaw Position */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <ToothIcon />
              <span>Jaw Configuration</span>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formField}>
                <label className={styles.fieldLabel}>Tooth Position <span className={styles.required}>*</span></label>
                <select
                  className={styles.select}
                  value={toothType}
                  onChange={(e) => setToothType(e.target.value)}
                >
                  <option value="">Select jaw position</option>
                  {JAW_POSITIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formField}>
                <label className={styles.fieldLabel}>
                  Stent Option
                  <span className={styles.optionalTag}>optional</span>
                </label>
                <select
                  className={styles.select}
                  value={stentOption}
                  onChange={(e) => setStentOption(e.target.value)}
                >
                  <option value="">None — opt out</option>
                  {STENT_POSITIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Section: Radiation Shield (NEW) */}
          <div className={styles.sectionCard}>
            <div className={styles.sectionHeader}>
              <ShieldIcon />
              <span>Radiation Shield Planning</span>
              <span className={styles.sectionBadge}>Oral Care</span>
            </div>

            <p className={styles.sectionDesc}>
              Select the shield coverage zone to protect remaining healthy teeth from scatter
              radiation during treatment. Leave unselected to opt out.
            </p>

            <div className={styles.shieldGrid}>
              {SHIELD_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`${styles.shieldCard} ${shieldOption === opt.value ? styles.shieldCardActive : ''}`}
                  onClick={() => setShieldOption(v => v === opt.value ? '' : opt.value)}
                >
                  <div className={styles.shieldCardTop}>
                    <span className={styles.shieldLabel}>{opt.label}</span>
                    {shieldOption === opt.value && (
                      <span className={styles.shieldCheck}><CheckSmallIcon /></span>
                    )}
                  </div>
                  <p className={styles.shieldDesc}>{opt.desc}</p>
                </button>
              ))}
            </div>

            {shieldOption && (
              <div className={styles.shieldSelected}>
                <ShieldCheckIcon />
                <span>
                  Shield zone set to <strong>{SHIELD_OPTIONS.find(o => o.value === shieldOption)?.label}</strong>.
                  AI will generate a custom stent to protect remaining dentition.
                </span>
              </div>
            )}
          </div>

          {/* Confirm Bar */}
          <div className={styles.confirmBar}>
            <div className={styles.confirmNote}>
              <CheckCircleIcon />
              <p>Verify the scan geometry looks correct before proceeding</p>
            </div>

            <div className={styles.confirmActions}>
              <button
                className={styles.cancelBtn}
                onClick={() => { setFile1(null); setFile2(null); setError(''); }}
              >
                Re-upload
              </button>

              <button
                className={styles.confirmBtn}
                onClick={handleConfirm}
                disabled={!toothType}
                title={!toothType ? 'Please select a tooth position first' : undefined}
              >
                Confirm & Process
                <ArrowIcon />
              </button>
            </div>
          </div>

          {error && <p className={styles.error}>{error}</p>}
        </div>

        {/* ── RIGHT PANEL — 3D Preview ────────────────────────────────────── */}
        <div className={styles.rightPane}>
          {/* Preview selector if both files uploaded */}
          {file1 && file2 && (
            <div className={styles.previewSelector}>
              <button
                className={`${styles.previewBtn} ${selectedPreview === 'scan1' ? styles.previewBtnActive : ''}`}
                onClick={() => setSelectedPreview('scan1')}
              >
                Primary Scan
              </button>
              <button
                className={`${styles.previewBtn} ${selectedPreview === 'scan2' ? styles.previewBtnActive : ''}`}
                onClick={() => setSelectedPreview('scan2')}
              >
                Antagonist Scan
              </button>
            </div>
          )}

          <div className={styles.viewerWrapSmall}>
            <STLViewer
              key={viewerKey}
              scan1={selectedPreview === 'scan1' ? file1 : file2}
              scan2={null}
            />

            <div className={styles.viewerOverlay}>
              <div className={styles.viewerBadge}>
                <RotateIcon /> Drag to rotate · Scroll to zoom
              </div>
              <button
                type="button"
                className={styles.viewerResetBtn}
                onClick={() => setViewerKey(k => k + 1)}
              >
                Reset view
              </button>
            </div>
          </div>

          {/* Summary card beneath viewer */}
          <div className={styles.summaryCard}>
            <SummaryRow label="Primary scan" value={file1?.name} mono />
            {file2 && <SummaryRow label="Antagonist" value={file2.name} mono />}
            <SummaryRow label="Previewing" value={
              selectedPreview === 'scan1' ? 'Primary Scan' : 'Antagonist Scan'
            } />
            <SummaryRow label="Jaw position"
              value={JAW_POSITIONS.find(o => o.value === toothType)?.label || '—'} />
            <SummaryRow label="Stent"
              value={STENT_POSITIONS.find(o => o.value === stentOption)?.label || 'None'} />
            <SummaryRow label="Radiation shield"
              value={SHIELD_OPTIONS.find(o => o.value === shieldOption)?.label || 'Not selected'}
              highlight={Boolean(shieldOption)}
            />
          </div>
        </div>

      </div>
    </div>
  );
};

// ── Sub-components ─────────────────────────────────────────────────────────────
const SummaryRow = ({ label, value, mono, highlight }) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '7px 0', borderBottom: '1px solid var(--border)',
    fontSize: '13px',
  }}>
    <span style={{ color: 'var(--text-muted)', fontWeight: 700 }}>{label}</span>
    <span style={{
      fontWeight: 800,
      fontFamily: mono ? 'var(--font-mono)' : undefined,
      color: highlight ? '#0b6a45' : 'var(--text-primary)',
      maxWidth: '55%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
    }}>
      {value || '—'}
    </span>
  </div>
);

// ── Icons ──────────────────────────────────────────────────────────────────────
const ScanIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="4" y="4" width="32" height="32" rx="8" stroke="#2B7FE0" strokeWidth="2" strokeDasharray="4 3"/>
    <path d="M12 20h16M20 12v16" stroke="#2DC4C4" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="20" cy="20" r="4" fill="#2B7FE0" fillOpacity="0.18" stroke="#2B7FE0" strokeWidth="2"/>
  </svg>
);

const ScanSmallIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <rect x="2" y="2" width="12" height="12" rx="3" stroke="#2B7FE0" strokeWidth="1.5" strokeDasharray="3 2"/>
    <path d="M5 8h6M8 5v6" stroke="#2DC4C4" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const FileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M5 2h8l5 5v13a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#EBF3FF" stroke="#2B7FE0" strokeWidth="1.5"/>
    <path d="M13 2v5h5" stroke="#2B7FE0" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M8 11h6M8 14h4" stroke="#2B7FE0" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const PlusIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const ToothIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M5 2C3.5 2 2 3 2 5c0 1 .4 2 1 2.8L4 14h2l1-4 1 4h2l1-6.2C11.6 7 12 6 12 5c0-2-1.5-3-3-3-.8 0-1.5.4-1.8.8C6.9 2.3 6.5 2 6 2H5z" stroke="#2B7FE0" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);

const ShieldIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2L3 4v4c0 3 2.5 5.4 5 6 2.5-.6 5-3 5-6V4L8 2z" stroke="#1DB87A" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);

const ShieldCheckIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M8 2L3 4v4c0 3 2.5 5.4 5 6 2.5-.6 5-3 5-6V4L8 2z" stroke="#1DB87A" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M5.5 8l2 2L11 6" stroke="#1DB87A" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckSmallIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
    <path d="M2.5 6l2.5 2.5L9.5 4" stroke="#1DB87A" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const RotateIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M2 7a5 5 0 1010 0 5 5 0 00-10 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M11.5 4.5L13 7l-1.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="8" cy="8" r="7" stroke="#1DB87A" strokeWidth="1.5"/>
    <path d="M5 8l2 2 4-4" stroke="#1DB87A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const ArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export default UploadStep;
