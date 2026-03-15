import React from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import * as THREE from "three";

function STLMesh({ file, position }) {
  const [geometry, setGeometry] = React.useState(null);

  React.useEffect(() => {
    if (!file) return;

    const loader = new STLLoader();

    const reader = new FileReader();

    reader.onload = (e) => {
      const geom = loader.parse(e.target.result);
      geom.computeVertexNormals();
      setGeometry(geom);
    };

    reader.readAsArrayBuffer(file);

  }, [file]);

  if (!geometry) return null;

  return (
    <mesh geometry={geometry} position={position}>
      <meshStandardMaterial color="#2dc4c4" metalness={0.2} roughness={0.5} />
    </mesh>
  );
}

export default function STLViewer({ scan1, scan2 }) {

  return (
    <Canvas camera={{ position: [0, 0, 120] }}>

      <ambientLight intensity={0.7} />
      <directionalLight position={[10, 10, 5]} intensity={1} />

      {/* First Scan */}
      {scan1 && <STLMesh file={scan1} position={[-40, 0, 0]} />}

      {/* Second Scan */}
      {scan2 && <STLMesh file={scan2} position={[40, 0, 0]} />}

      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        rotateSpeed={0.8}
      />

    </Canvas>
  );
}