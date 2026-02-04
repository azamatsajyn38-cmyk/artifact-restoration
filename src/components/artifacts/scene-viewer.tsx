"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Environment, Center, Html } from "@react-three/drei";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import * as THREE from "three";

function Loader() {
  return (
    <Html center>
      <div className="text-sm text-white bg-black/50 px-3 py-1 rounded">
        Загрузка модели...
      </div>
    </Html>
  );
}

function GLBModel({ url }: { url: string }) {
  const gltf = useLoader(GLTFLoader, url);
  const ref = useRef<THREE.Group>(null);

  // Auto-rotate
  useFrame((_, delta) => {
    if (ref.current) {
      ref.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <Center>
      <group ref={ref}>
        <primitive object={gltf.scene} />
      </group>
    </Center>
  );
}

function proxyUrl(url: string): string {
  // Внешние URL (Meshy CDN) проксируем через наш сервер для обхода CORS
  if (url.startsWith("http") && !url.startsWith(window.location.origin)) {
    return `/api/proxy?url=${encodeURIComponent(url)}`;
  }
  return url;
}

interface SceneViewerProps {
  glbUrl: string;
}

export function SceneViewer({ glbUrl }: SceneViewerProps) {
  return (
    <div className="w-full h-[400px] rounded-lg overflow-hidden bg-gradient-to-b from-slate-900 to-slate-800">
      <Canvas
        camera={{ position: [0, 1, 3], fov: 50 }}
        gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[5, 5, 5]} intensity={1} />
        <directionalLight position={[-5, 3, -5]} intensity={0.3} />

        <Suspense fallback={<Loader />}>
          <GLBModel url={proxyUrl(glbUrl)} />
        </Suspense>

        <OrbitControls
          enablePan={true}
          enableZoom={true}
          enableRotate={true}
          minDistance={1}
          maxDistance={10}
        />
      </Canvas>
    </div>
  );
}
