import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * STLViewerR3F — supports both:
 *   1. File-based (upload preview): scan1 / scan2 as File objects
 *   2. URL-based (AI result): stlUrl as URL string
 */
const STLViewerR3F = ({ scan1, scan2, stlUrl }) => {
  const mountRef = useRef(null);
  const sceneRef = useRef({});

  // ── Cleanup — mirrors STLViewer.jsx exactly ──────────────────────────────
  const cleanup = useCallback(() => {
    const s = sceneRef.current;
    if (s.animId)      cancelAnimationFrame(s.animId);
    if (s.controls)    s.controls.dispose();
    if (s.resizeObs)   s.resizeObs.disconnect();
    if (s.renderer) {
      s.renderer.dispose();
      if (mountRef.current && s.renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(s.renderer.domElement);
      }
    }
    if (s.meshes) {
      s.meshes.forEach(m => {
        m.geometry.dispose();
        m.material.dispose();
        if (s.scene) s.scene.remove(m);
      });
    }
    sceneRef.current = {};
  }, []);

  // ── initScene — called once both geometries are ready ────────────────────
  //    geometries: array of { geom, color }
  const initScene = useCallback((geometries) => {
    cleanup();
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth  || 600;
    const h = mount.clientHeight || 400;

    // ── Scene ──────────────────────────────────────────────────────────────
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#111820'); // very dark neutral — max contrast

    // No grid for clean, professional appearance

    // ── Camera ─────────────────────────────────────────────────────────────
    const camera = new THREE.PerspectiveCamera(38, w / h, 0.1, 20000);

    // ── Renderer ───────────────────────────────────────────────────────────
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.shadowMap.enabled   = true;
    renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
    // Use LinearToneMapping + exposure 1.0 for neutral, clinically accurate colour
    renderer.toneMapping         = THREE.LinearToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.outputColorSpace    = THREE.SRGBColorSpace;
    mount.appendChild(renderer.domElement);

    // ── Controls — full free rotation, no pole restriction ─────────────────
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping  = true;
    controls.dampingFactor  = 0.08;
    controls.rotateSpeed    = 0.9;
    controls.zoomSpeed      = 1.0;
    controls.panSpeed       = 0.8;
    controls.enablePan      = true;   // allow pan for measurement inspection
    controls.enableZoom     = true;
    controls.enableRotate   = true;
    // Full sphere — no polar restrictions so clinicians can inspect from any angle
    controls.minPolarAngle  = 0;
    controls.maxPolarAngle  = Math.PI;
    controls.minDistance    = 5;
    controls.maxDistance    = 10000;

    // ── Process each geometry: centre + scale to 100 units ─────────────────
    const meshes = [];
    let   combinedMaxDim = 0;

    geometries.forEach(({ geom, color }, idx) => {
      geom.computeBoundingBox();
      const bbox   = geom.boundingBox;
      const center = new THREE.Vector3();
      bbox.getCenter(center);
      geom.translate(-center.x, -center.y, -center.z);

      const size   = new THREE.Vector3();
      bbox.getSize(size);
      const maxDim = Math.max(size.x, size.y, size.z) || 1;
      const scale  = 100 / maxDim;
      geom.scale(scale, scale, scale);
      combinedMaxDim = Math.max(combinedMaxDim, 100); // normalised = always 100

      // Side-by-side: leave a 20-unit gap between the two models
      const offsetX = geometries.length > 1 ? (idx === 0 ? -60 : 60) : 0;

      // ── Clinical material: bright matte, no tint, DoubleSide ─────────────
      const material = new THREE.MeshStandardMaterial({
        color:     new THREE.Color(color),
        metalness: 0.0,
        roughness: 0.65,   // matte → every ridge and groove casts a readable shadow
        side:      THREE.DoubleSide,
      });

      const mesh = new THREE.Mesh(geom, material);
      mesh.castShadow    = true;
      mesh.receiveShadow = true;
      mesh.position.x    = offsetX;
      scene.add(mesh);
      meshes.push(mesh);
    });

    // ── Lights — bright, neutral, multi-directional for clinical clarity ────
    // Key light: strong overhead-front
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2);
    keyLight.position.set(60, 140, 100);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.set(1024, 1024);
    scene.add(keyLight);

    // Fill light: opposite side, slightly cooler, softens harsh shadows
    const fillLight = new THREE.DirectionalLight(0xddeeff, 1.2);
    fillLight.position.set(-100, 40, -80);
    scene.add(fillLight);

    // Back/rim light: separates model from background
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.9);
    rimLight.position.set(0, -60, -120);
    scene.add(rimLight);

    // Under-fill: removes dark pockets on occlusal surfaces
    const underLight = new THREE.DirectionalLight(0xffffff, 0.7);
    underLight.position.set(0, -140, 0);
    scene.add(underLight);

    // Ambient: lifts the floor so no part is pitch-black
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));

    // ── Camera position: computed from actual normalised size ───────────────
    //    dist formula mirrors STLViewer.jsx: maxDim * scale * 1.8
    //    With two models side-by-side the effective spread is ~220 units
    const spread = geometries.length > 1 ? 220 : 100;
    const dist   = spread * 1.8;
    camera.position.set(dist * 0.7, dist * 0.5, dist);
    camera.lookAt(0, 0, 0);
    controls.update();

    // ── Resize observer ────────────────────────────────────────────────────
    const handleResize = () => {
      if (!mount) return;
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(mount);

    // ── Animate ────────────────────────────────────────────────────────────
    const animate = () => {
      const id = requestAnimationFrame(animate);
      sceneRef.current.animId = id;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = { scene, camera, renderer, controls, meshes, resizeObs };
  }, [cleanup]);

  // ── Load files then fire initScene ────────────────────────────────────────
  useEffect(() => {
    if (!scan1 && !stlUrl) {
      cleanup();
      return;
    }

    const loader  = new STLLoader();

    // URL-based mode (final AI result)
    if (stlUrl) {
      console.log('STLViewerR3F: Loading from URL:', stlUrl);
      loader.load(
        stlUrl,
        (geometry) => {
          console.log('STLViewerR3F: URL loaded successfully');
          geometry.computeVertexNormals();
          initScene([{ geom: geometry, color: '#E8D5C3' }]);
        },
        (progress) => {
          console.log('STLViewerR3F: Loading', Math.round((progress.loaded / progress.total) * 100) + '%');
        },
        (err) => {
          console.error('STLViewerR3F: URL load error:', err, stlUrl);
        }
      );
      return cleanup;
    }

    // File-based mode (upload preview)
    const files   = [
      { file: scan1, color: '#E8D5C3' },
      scan2 ? { file: scan2, color: '#E8D5C3' } : null,
    ].filter(Boolean);

    const results  = new Array(files.length);
    let   finished = 0;

    files.forEach(({ file, color }, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const geom = loader.parse(e.target.result);
          geom.computeVertexNormals();
          results[idx] = { geom, color };
          finished++;
          if (finished === files.length) {
            initScene(results);
          }
        } catch (parseErr) {
          console.error('STLViewerR3F: Parse error:', parseErr);
        }
      };
      reader.onerror = (e) => console.error('STLViewerR3F: FileReader error:', e);
      reader.readAsArrayBuffer(file);
    });

    return cleanup;
  }, [stlUrl, scan1, scan2, initScene, cleanup]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', borderRadius: 'inherit', overflow: 'hidden' }}
    />
  );
};

export default STLViewerR3F;