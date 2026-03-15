import React, { useState, useRef, useCallback } from 'react';
import STLViewer from './STLViewerR3F';
import styles from './UploadStep.module.css';

const UploadStep = ({ onConfirm }) => {

  const [file1, setFile1] = useState(null);
  const [file2, setFile2] = useState(null);
  const [toothType, setToothType] = useState("");
  const [stentOption, setStentOption] = useState("");

  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [viewerKey, setViewerKey] = useState(0);

  const inputRef = useRef();

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

  const onDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    handleFile(f, 1);
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className={styles.container}>

      {!file1 ? (

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

            <h2 className={styles.dropTitle}>Upload Medical Scan</h2>

            <p className={styles.dropSub}>
              Drag & drop your <span>.STL</span> file here, or click to browse
            </p>

            <div className={styles.specs}>
              <span>STL format</span>
              <span className={styles.dot} />
              <span>Max 200 MB</span>
              <span className={styles.dot} />
              <span>ASCII or Binary</span>
            </div>

          </div>

          {error && <p className={styles.error}>{error}</p>}

        </div>

      ) : (

        <div className={styles.splitLayout}>

          {/* LEFT PANEL */}

          <div className={styles.leftPane}>

            {/* Tooth Position Dropdown */}

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: 500 }}>Tooth Position</label>

              <select
                value={toothType}
                onChange={(e) => setToothType(e.target.value)}
                style={{ width: "100%", marginTop: "6px", padding: "8px" }}
              >
                <option value="">Select position</option>
                <option value="upper">Upper Jaw</option>
                <option value="reduced">Reduced Jaw</option>
                <option value="lateral_left">Lateral Left</option>
                <option value="lateral_right">Lateral Right</option>
              </select>
            </div>

            {/* Stent / Treatment option (optional) */}
            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontWeight: 500 }}>Stent Option (optional)</label>

              <select
                value={stentOption}
                onChange={(e) => setStentOption(e.target.value)}
                style={{ width: "100%", marginTop: "6px", padding: "8px" }}
              >
                <option value="">None (opt out)</option>
                <option value="upper">Upper Jaw</option>
                <option value="reduced">Reduced Jaw</option>
                <option value="lateral_left">Lateral Left</option>
                <option value="lateral_right">Lateral Right</option>
              </select>
            </div>


            {/* FILE 1 */}

            <div className={styles.previewHeader}>
              <div className={styles.fileInfo}>
                <FileIcon />

                <div>
                  <p className={styles.fileName}>{file1.name}</p>
                  <p className={styles.fileMeta}>
                    {formatSize(file1.size)} · STL Mesh
                  </p>
                </div>

              </div>

              <button
                className={styles.reuploadBtn}
                onClick={() => { setFile1(null); setError(''); }}
              >
                Replace File
              </button>

            </div>


            {/* SECOND FILE INPUT */}

            <div style={{ marginTop: "20px" }}>

              <label>Upload Second Scan</label>

              <input
                type="file"
                accept=".stl"
                onChange={(e) => handleFile(e.target.files[0], 2)}
              />

            </div>


            {/* CONFIRM BAR */}

            <div className={styles.confirmBar}>

              <div className={styles.confirmNote}>
                <CheckCircleIcon />
                <p>Verify the scan geometry looks correct before proceeding</p>
              </div>

              <div className={styles.confirmActions}>

                <button
                  className={styles.cancelBtn}
                  onClick={() => { setFile1(null); setFile2(null); }}
                >
                  Re-upload
                </button>

                <button
                  className={styles.confirmBtn}
                  onClick={() => {

                    if (typeof onConfirm === "function") {

                      onConfirm({
                        toothType,
                        stentOption,
                        scan1: file1,
                        scan2: file2
                      });

                    }

                  }}
                >
                  Confirm & Upload
                  <ArrowIcon />
                </button>

              </div>

            </div>

          </div>


          {/* RIGHT PANEL - PREVIEW */}

          <div className={styles.rightPane}>

            <div className={styles.viewerWrapSmall}>

              {(file1 || file2) && (
                <STLViewer
                  key={viewerKey}
                  scan1={file1}
                  scan2={file2}
                />
              )}

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

              <div className={styles.scanLine} />

            </div>

          </div>

        </div>

      )}

    </div>
  );
};


// ICONS (unchanged)

const ScanIcon = () => (
  <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
    <rect x="4" y="4" width="32" height="32" rx="8" stroke="#2B7FE0" strokeWidth="2" strokeDasharray="4 3"/>
    <path d="M12 20h16M20 12v16" stroke="#2DC4C4" strokeWidth="2.5" strokeLinecap="round"/>
    <circle cx="20" cy="20" r="4" fill="#2B7FE0" fillOpacity="0.18" stroke="#2B7FE0" strokeWidth="2"/>
  </svg>
);

const FileIcon = () => (
  <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
    <path d="M5 2h8l5 5v13a1 1 0 01-1 1H5a1 1 0 01-1-1V3a1 1 0 011-1z" fill="#EBF3FF" stroke="#2B7FE0" strokeWidth="1.5"/>
    <path d="M13 2v5h5" stroke="#2B7FE0" strokeWidth="1.5" strokeLinejoin="round"/>
    <path d="M8 11h6M8 14h4" stroke="#2B7FE0" strokeWidth="1.5" strokeLinecap="round"/>
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