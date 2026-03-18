"use client";

import React, { Suspense, useMemo } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls, Environment, useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { GLTF } from "three-stdlib";

type PartStatus = "green" | "amber" | "red";

type GLTFResult = GLTF & {
  nodes: {
    EngineL: THREE.Mesh
    blades: THREE.Mesh
    casing: THREE.Mesh
    conemesh: THREE.Mesh
    conemesh_1: THREE.Mesh
    cone2: THREE.Mesh
    Core: THREE.Mesh
    Cube004: THREE.Mesh
    exhaust: THREE.Mesh
    fanWheel: THREE.Mesh
    Intake: THREE.Mesh
    IntakeInterior: THREE.Mesh
    Nacelle: THREE.Mesh
    Nozzle: THREE.Mesh
    Plane: THREE.Mesh
    Pylon: THREE.Mesh
    shroud: THREE.Mesh
  }
}

const getStatusColor = (status: PartStatus) => {
  switch (status) {
    case "green": return "#22c55e";
    case "amber": return "#f59e0b";
    case "red": return "#ef4444";
    default: return "#94a3b8";
  }
};

function EngineModel({ status, highlightedParts = [] }: { status: PartStatus, highlightedParts?: string[] }) {
  const { nodes } = useGLTF('/A320.glb') as unknown as GLTFResult;
  
  const color = getStatusColor(status);
  
  const material = useMemo(() => new THREE.MeshStandardMaterial({
    color: color,
    wireframe: true,
    transparent: true,
    opacity: 0.8,
    emissive: color,
    emissiveIntensity: 0.5
  }), [color]);

  const highlightMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ff0000",
    emissive: "#ff3333",
    emissiveIntensity: 2,
    metalness: 0.5,
    roughness: 0.2,
    opacity: 1,
    transparent: false
  }), []);

  const getMaterial = (partName: string) => {
    return highlightedParts.includes(partName) ? highlightMaterial : material;
  };

  return (
    <group scale={1.2} rotation={[0, -Math.PI / 2, 0]} position={[0, -1, 0]}>
      <mesh geometry={nodes.EngineL.geometry} material={getMaterial('EngineL')}>
        <mesh geometry={nodes.blades.geometry} material={getMaterial('blades')} />
        <mesh geometry={nodes.casing.geometry} material={getMaterial('casing')} />
        <mesh geometry={nodes.conemesh.geometry} material={getMaterial('conemesh')} />
        <mesh geometry={nodes.conemesh_1.geometry} material={getMaterial('conemesh_1')} />
        <mesh geometry={nodes.cone2.geometry} material={getMaterial('cone2')} />
        <mesh geometry={nodes.Core.geometry} material={getMaterial('Core')} />
        <mesh geometry={nodes.Cube004.geometry} material={getMaterial('Cube004')} />
        <mesh geometry={nodes.exhaust.geometry} material={getMaterial('exhaust')} />
        <mesh geometry={nodes.fanWheel.geometry} material={getMaterial('fanWheel')} />
        <mesh geometry={nodes.Intake.geometry} material={getMaterial('Intake')} />
        <mesh geometry={nodes.IntakeInterior.geometry} material={getMaterial('IntakeInterior')} />
        <mesh geometry={nodes.Nacelle.geometry} material={getMaterial('Nacelle')} />
        <mesh geometry={nodes.Nozzle.geometry} material={getMaterial('Nozzle')} />
        <mesh geometry={nodes.Plane.geometry} material={getMaterial('Plane')} />
        <mesh geometry={nodes.Pylon.geometry} material={getMaterial('Pylon')} />
        <mesh geometry={nodes.shroud.geometry} material={getMaterial('shroud')} />
      </mesh>
    </group>
  );
}

export default function EngineFocusView({ status, highlightedParts = [] }: { status: PartStatus, highlightedParts?: string[] }) {
  return (
    <div className="w-full h-full overflow-hidden  pointer-events-auto">
      <Canvas camera={{ position: [8, 4, 8], fov: 30 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <Suspense fallback={null}>
          <EngineModel status={status} highlightedParts={highlightedParts} />
          <Environment preset="city" />
        </Suspense>
        <OrbitControls autoRotate autoRotateSpeed={0.5} enableZoom={true} enablePan={false} minDistance={5} maxDistance={20} />
      </Canvas>
    </div>
  );
}
