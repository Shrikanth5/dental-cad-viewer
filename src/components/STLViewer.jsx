import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

/**
 * STLViewer — Handles both:
 * 1. File-based dual-scan preview (upload step): scan1 and scan2 as File objects
 * 2. URL-based AI result viewer: stlUrl as URL string
 */
export default function STLViewer({ 
  scan1, 
  scan2, 
  stlUrl,
  autoRotate = false,
  wireframe = false,
  showGrid = true,
  enablePan = false,
  accentColor = '#C9A876',
  background = '#0D1B2E',
  style = {}
}) {
  const mountRef = useRef(null);
  const sceneRef = useRef({});

  // ── Cleanup ────────────────────────────────────────────────────────────────
  const cleanup = useCallback(() => {
    const s = sceneRef.current;
    if (s.animId)    cancelAnimationFrame(s.animId);
    if (s.controls)  s.controls.dispose();
    if (s.resizeObs) s.resizeObs.disconnect();
    if (s.renderer) {
      s.renderer.dispose();
      if (mountRef.current && s.renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(s.renderer.domElement);
      }
    }
    s.meshes?.forEach(m => { m.geometry.dispose(); m.material.dispose(); });
    sceneRef.current = {};
  }, []);

  // ── Build / rebuild scene whenever files or URL change ──────────────────────
  useEffect(() => {
    // If stlUrl is provided (AI result mode)
    if (stlUrl) {
      cleanup();
      const mount = mountRef.current;
      if (!mount) return;

      const w = mount.clientWidth  || 600;
      const h = mount.clientHeight || 500;

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(background);

      const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10000);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
      renderer.setPixelRatio(window.devicePixelRatio);
      renderer.setSize(w, h);
      renderer.shadowMap.enabled   = true;
      renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
      renderer.toneMapping         = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.2;
      mount.appendChild(renderer.domElement);

      const controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.06;
      controls.autoRotate = autoRotate;
      controls.autoRotateSpeed = 1.2;
      controls.enablePan = enablePan;
      controls.enableZoom = true;
      controls.enableRotate = true;
      controls.rotateSpeed = 0.8;
      controls.zoomSpeed = 0.9;
      controls.panSpeed = 0.8;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI;
      controls.minDistance = 10;
      controls.maxDistance = 5000;

      // Lights
      scene.add(new THREE.AmbientLight(0xffffff, 0.45));
      const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
      dirLight.position.set(80, 120, 60);
      dirLight.castShadow = true;
      scene.add(dirLight);
      const fill = new THREE.DirectionalLight(0x88bbff, 0.45);
      fill.position.set(-80, -40, -60);
      scene.add(fill);
      const rim = new THREE.DirectionalLight(0x2DC4C4, 0.35);
      rim.position.set(0, -80, 80);
      scene.add(rim);

      if (showGrid) {
        const gridHelper = new THREE.GridHelper(200, 30, 0x1a3355, 0x1a3355);
        gridHelper.position.y = -50;
        scene.add(gridHelper);
      }

      // Setup resize observer early
      const handleResize = () => {
        if (!mount) return;
        camera.aspect = mount.clientWidth / mount.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(mount.clientWidth, mount.clientHeight);
      };
      const resizeObs = new ResizeObserver(handleResize);
      resizeObs.observe(mount);

      // Store initial scene state
      sceneRef.current = { scene, camera, renderer, controls, resizeObs, meshes: [], animId: null };

      // Start animation loop
      let animId;
      const animate = () => {
        animId = requestAnimationFrame(animate);
        if (sceneRef.current) {
          sceneRef.current.animId = animId;
        }
        controls.update();
        renderer.render(scene, camera);
      };
      animate();

      // Load from URL
      const loader = new STLLoader();
      console.log('Loading STL from URL:', stlUrl);
      loader.load(
        stlUrl,
        (geometry) => {
          console.log('STL loaded successfully, vertices:', geometry.attributes.position.count);
          geometry.computeVertexNormals();
          geometry.computeBoundingBox();
          const center = new THREE.Vector3();
          geometry.boundingBox.getCenter(center);
          geometry.translate(-center.x, -center.y, -center.z);
          
          const size   = new THREE.Vector3();
          geometry.boundingBox.getSize(size);
          const maxDim = Math.max(size.x, size.y, size.z) || 1;
          const scale  = 100 / maxDim;
          geometry.scale(scale, scale, scale);

          const material = new THREE.MeshPhysicalMaterial({
            color:              new THREE.Color(accentColor),
            metalness:          0.0,
            roughness:          0.52,
            clearcoat:          0.35,
            clearcoatRoughness: 0.35,
            transparent:        true,
            opacity:            0.93,
            side:               THREE.DoubleSide,
            wireframe:          wireframe,
          });

          const mesh = new THREE.Mesh(geometry, material);
          mesh.castShadow    = true;
          mesh.receiveShadow = true;
          scene.add(mesh);
          console.log('Mesh added to scene');

          const dist = 220;
          camera.position.set(dist * 0.7, dist * 0.5, dist);
          camera.lookAt(0, 0, 0);
          controls.target.set(0, 0, 0);
          controls.update();
          console.log('Camera positioned, mesh ready for interaction');

          if (sceneRef.current.meshes) sceneRef.current.meshes.push(mesh);
        },
        (progress) => {
          console.log('STL loading progress:', Math.round((progress.loaded / progress.total) * 100) + '%');
        },
        (err) => {
          console.error('STL load error:', err);
          console.error('Failed URL:', stlUrl);
        }
      );

      return cleanup;
    }

    // If files are provided (preview mode)
    if (!scan1) return;
    cleanup();

    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth  || 600;
    const h = mount.clientHeight || 300;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0D1B2E');

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10000);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.shadowMap.enabled   = true;
    renderer.shadowMap.type      = THREE.PCFSoftShadowMap;
    renderer.toneMapping         = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.45));
    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(80, 120, 60);
    dirLight.castShadow = true;
    scene.add(dirLight);
    const fill = new THREE.DirectionalLight(0x88bbff, 0.45);
    fill.position.set(-80, -40, -60);
    scene.add(fill);
    const rim = new THREE.DirectionalLight(0x2DC4C4, 0.35);
    rim.position.set(0, -80, 80);
    scene.add(rim);

    // Controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.06;
    controls.autoRotate = autoRotate;
    controls.autoRotateSpeed = 1.2;
    controls.enablePan = enablePan;
    controls.enableZoom = true;
    controls.enableRotate = true;
    controls.rotateSpeed = 0.8;
    controls.zoomSpeed = 0.9;
    controls.panSpeed = 0.8;
    // Allow full 360 rotation for seamless experience
    controls.minPolarAngle = 0;
    controls.maxPolarAngle = Math.PI;
    controls.minDistance = 10;
    controls.maxDistance = 5000;

    // Animate loop
    let animId;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      sceneRef.current.animId = animId;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize observer
    const handleResize = () => {
      if (!mount) return;
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(mount.clientWidth, mount.clientHeight);
    };
    const resizeObs = new ResizeObserver(handleResize);
    resizeObs.observe(mount);

    sceneRef.current = { scene, camera, renderer, controls, resizeObs, meshes: [] };

    // ── Load files → center → scale → add mesh ────────────────────────────
    const COLORS = ['#E8D5C3', '#E8D5C3']; // Vita A1/A2 - standard dental shade
    const files  = [scan1, scan2].filter(Boolean);
    let loaded   = 0;

    const fitCamera = () => {
      const dist = files.length > 1 ? 380 : 220;
      camera.position.set(dist * 0.65, dist * 0.45, dist);
      camera.lookAt(0, 0, 0);
      controls.target.set(0, 0, 0);
      controls.update();
    };

    files.forEach((file, idx) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const loader = new STLLoader();
        const geom   = loader.parse(e.target.result);
        geom.computeVertexNormals();

        // Center geometry
        geom.computeBoundingBox();
        const center = new THREE.Vector3();
        geom.boundingBox.getCenter(center);
        geom.translate(-center.x, -center.y, -center.z);

        // Scale to 100 units
        const size   = new THREE.Vector3();
        geom.boundingBox.getSize(size);
        const maxDim = Math.max(size.x, size.y, size.z) || 1;
        const s      = 100 / maxDim;
        geom.scale(s, s, s);

        // Side-by-side offset when two scans
        const offsetX = files.length > 1 ? (idx === 0 ? -60 : 60) : 0;

        const material = new THREE.MeshPhysicalMaterial({
          color:              new THREE.Color(COLORS[idx] || '#2dc4c4'),
          metalness:          0.0,
          roughness:          0.52,
          clearcoat:          0.35,
          clearcoatRoughness: 0.35,
          transparent:        true,
          opacity:            0.93,
          side:               THREE.DoubleSide,
        });

        const mesh = new THREE.Mesh(geom, material);
        mesh.castShadow    = true;
        mesh.receiveShadow = true;
        mesh.position.x    = offsetX;
        scene.add(mesh);

        if (sceneRef.current.meshes) sceneRef.current.meshes.push(mesh);

        loaded++;
        if (loaded === files.length) fitCamera();
      };
      reader.readAsArrayBuffer(file);
    });

    return cleanup;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stlUrl, scan1, scan2, autoRotate, wireframe, showGrid, enablePan, accentColor, background]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', borderRadius: 'inherit', overflow: 'hidden', ...style }}
    />
  );
}