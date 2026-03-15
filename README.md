# Dental CAD STL Viewer - Radiation Stent Planning System

## 🎯 Project Overview

**Dental CAD STL Viewer** is a clinical-grade web application designed to help dental professionals create custom radiation protection stents for oral care patients. The system allows users to upload dental scans (STL format), preview them in 3D, select radiation shield parameters, and generate AI-powered 3D CAD models that protect remaining healthy teeth from scatter radiation during treatment.

### Clinical Goal
To preserve remaining healthy teeth of oral care patients during radiation therapy by creating personalized, patient-specific radiation stents based on 3D dental scan data.

---

## ✨ Key Features

### 1. **Dual STL Upload & Preview**
- Upload primary and antagonist (opposing jaw) dental scans
- Independent preview of each scan using standard dental shade (Vita A1/A2)
- Toggle between scans using preview selector buttons
- Real-time 3D visualization with interactive controls

### 2. **Jaw Configuration Selection**
- Select tooth position: Upper Jaw, Lower Jaw, Lateral Left, Lateral Right
- Original pre-treatment scan documentation

### 3. **Stent Option Selection (Optional)**
- Configure stent parameters for radiation protection
- Multiple stent position options matching jaw configurations
- Optional field - users can opt out

### 4. **Radiation Shield Planning**
- **NEW**: Dedicated radiation shield configuration for oral care patients
- Four coverage zones:
  - **Lateral Left**: Shields left lateral teeth & soft tissue from scatter radiation
  - **Lateral Right**: Shields right lateral teeth from direct beam exposure
  - **Reduced Coverage**: Minimal coverage for early-stage treatment preservation
  - **Upper Arch Full**: Full upper arch protection for comprehensive radiation planning
- Optional selection with clear clinical descriptions

### 5. **AI-Powered 3D CAD Generation**
- Automatic STL processing and CAD model generation
- Simulated AI output (ready for real API integration)
- Results show in result viewer with full interactive controls

### 6. **Seamless 3D Viewer Experience**
- **360° Free Rotation**: No pole lock - rotate from any angle for complete inspection
- **Smooth Zoom**: Scroll wheel zoom with configurable depth range
- **Pan Controls**: Right-click drag for measurement and inspection
- **Auto-Rotation**: Demo mode for passive viewing
- **Wireframe Toggle**: Switch between solid and wireframe modes
- **Reset View**: Recenter the model
- **Standard Dental Shade**: #E8D5C3 (Vita A1/A2) - globally recognized tooth color for design reference


### File Format Support
- **STL (Stereolithography)** - Binary and ASCII formats
- Max file size: 200 MB per scan

---

## 📋 Requirements & Architecture

### Data Flow

```
1. UPLOAD STEP
   ├─ User uploads primary scan (STL file)
   ├─ Optional: Upload antagonist scan
   ├─ Select jaw position (required)
   ├─ Select stent option (optional)
   ├─ Select radiation shield (optional)
   └─ Real-time 3D preview in standard dental shade

2. PROCESSING
   ├─ Scan data + configuration sent to App state
   ├─ Simulated AI processing (1.2s delay)
   └─ CAD model URL generated

3. RESULT VIEWER
   ├─ 3D CAD model loads from /models/ folder
   ├─ Full interactive controls
   ├─ Auto-rotate demo mode enabled
   ├─ Display scan metadata & shield configuration
   └─ Option to download final STL
```

### Component Structure

```
src/
├── App.js                           # Main app logic & state management
├── components/
│   ├── UploadStep.jsx              # Upload & preview interface
│   ├── UploadStep.module.css       # Upload styling
│   ├── ResultViewer.jsx            # Final CAD result display
│   ├── ResultViewer.module.css     # Result styling
│   └── STLViewerR3F.jsx            # Unified 3D viewer (file & URL)
└── public/
    └── models/
        └── DV0001_LATERALIZING_LEFT.stl  # Sample output model
```

---

## 🚀 Getting Started

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start

# Build for production
npm build
```

The app will open at `http://localhost:3000`

### Usage Flow

1. **Upload Scans**
   - Drag & drop or click to upload primary scan (STL)
   - Optionally upload antagonist scan
   - View previews in real-time

2. **Configure Treatment**
   - Select jaw position (required)
   - Choose stent option if needed
   - Select radiation shield zone for patient protection

3. **Confirm & Process**
   - Click "Confirm & Process"
   - Wait for AI processing (~1.2 seconds)
   - View final 3D CAD model

4. **Inspect 3D Model**
   - Drag to rotate (full 360°)
   - Scroll to zoom in/out
   - Right-click drag to pan
   - Use toolbar: toggle auto-rotate, wireframe, reset view
   - Download final STL for 3D printing

## 📝 License & Clinical Use

This application is designed for clinical use in oral cancer patient treatment planning. Ensure compliance with:
- HIPAA (if handling patient data)
- Medical device regulations in your jurisdiction
- Institutional review and approval

---

## 👥 Contributing & Support

For issues, feature requests, or clinical feedback:
1. Document the issue with clear steps to reproduce
2. Include browser console output (F12)
3. Specify STL file type and approximate size
4. Describe the clinical use case

---

## 📚 References

- **Vita Shade Guide**: https://www.vita-zahnfabrik.com/
- **Three.js Documentation**: https://threejs.org/docs/
- **STL Format**: https://en.wikipedia.org/wiki/STL_(file_format)

---

**Last Updated**: March 15, 2026
**Version**: 1.0.0 - Initial Release
