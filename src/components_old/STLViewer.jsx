import React, { useEffect, useRef, useCallback } from 'react';
import * as THREE from 'three';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

const STLViewer = ({
  stlFile,
  stlUrl,
  style = {},
  // Tooth/enamel-like default (STL has no intrinsic color)
  accentColor = '#E8DDC8',
  background = '#0D1B2E',
  autoRotate = false,
  wireframe = false,
  showGrid = true,
  enablePan = false,
}) => {
  const mountRef = useRef(null);
  const sceneRef = useRef({});

  const cleanup = useCallback(() => {
    const s = sceneRef.current;
    if (s.animId) cancelAnimationFrame(s.animId);
    if (s.controls) s.controls.dispose();
    if (s.renderer) {
      s.renderer.dispose();
      if (mountRef.current && s.renderer.domElement.parentNode === mountRef.current) {
        mountRef.current.removeChild(s.renderer.domElement);
      }
    }
    if (s.mesh) {
      s.mesh.geometry.dispose();
      s.mesh.material.dispose();
    }
    sceneRef.current = {};
  }, []);

  const initScene = useCallback((geometry) => {
    cleanup();
    const mount = mountRef.current;
    if (!mount) return;

    const w = mount.clientWidth || 600;
    const h = mount.clientHeight || 500;

    // Scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(background);

    // Grid
    if (showGrid) {
      const gridHelper = new THREE.GridHelper(200, 30, 0x1a3355, 0x1a3355);
      gridHelper.position.y = -50;
      scene.add(gridHelper);
    }

    // Camera
    const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 10000);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(w, h);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    mount.appendChild(renderer.domElement);

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
    // Avoid "pole lock" where rotation feels stuck near top/bottom.
    // Keep a small margin so the camera never reaches the exact poles.
    controls.minPolarAngle = 0.15;
    controls.maxPolarAngle = Math.PI - 0.15;
    controls.minDistance = 10;
    controls.maxDistance = 5000;

    // Center geometry
    geometry.computeBoundingBox();
    const bbox = geometry.boundingBox;
    const center = new THREE.Vector3();
    bbox.getCenter(center);
    geometry.translate(-center.x, -center.y, -center.z);
    const size = new THREE.Vector3();
    bbox.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 100 / maxDim;
    geometry.scale(scale, scale, scale);

    // Material — tooth/enamel aesthetic (STL has no intrinsic color)
    const material = new THREE.MeshPhysicalMaterial({
      color: new THREE.Color(accentColor),
      metalness: 0.0,
      roughness: 0.52,
      clearcoat: 0.35,
      clearcoatRoughness: 0.35,
      transparent: true,
      opacity: 0.92,
      side: THREE.DoubleSide,
      wireframe,
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    scene.add(mesh);

    // Lights
    const ambient = new THREE.AmbientLight(0xffffff, 0.4);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(80, 120, 60);
    dirLight.castShadow = true;
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x88bbff, 0.5);
    fillLight.position.set(-80, -40, -60);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x2DC4C4, 0.4);
    rimLight.position.set(0, -80, 80);
    scene.add(rimLight);

    // Camera position
    const dist = maxDim * scale * 1.8;
    camera.position.set(dist * 0.7, dist * 0.5, dist);
    camera.lookAt(0, 0, 0);
    controls.update();

    // Resize handler
    const handleResize = () => {
      if (!mount) return;
      const nw = mount.clientWidth;
      const nh = mount.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(mount);

    // Animate
    const animate = () => {
      const id = requestAnimationFrame(animate);
      sceneRef.current.animId = id;
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    sceneRef.current = { scene, camera, renderer, controls, mesh, resizeObserver };
  }, [cleanup, accentColor, background, autoRotate, wireframe, showGrid, enablePan]);

  useEffect(() => {
    const loader = new STLLoader();

    const handleGeometry = (geometry) => initScene(geometry);

    if (stlFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const geometry = loader.parse(e.target.result);
        handleGeometry(geometry);
      };
      reader.readAsArrayBuffer(stlFile);
    } else if (stlUrl) {
      loader.load(stlUrl, handleGeometry, undefined, (err) => console.error('STL load error:', err));
    }

    return cleanup;
  }, [stlFile, stlUrl, initScene, cleanup]);

  return (
    <div
      ref={mountRef}
      style={{ width: '100%', height: '100%', borderRadius: 'inherit', overflow: 'hidden', ...style }}
    />
  );
};

export default STLViewer;
