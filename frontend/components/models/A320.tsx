
import * as THREE from 'three'
import React, { useMemo } from 'react'
import { useGLTF } from '@react-three/drei'
import { GLTF } from 'three-stdlib'

type PartStatus = "green" | "amber" | "red";

type GLTFResult = GLTF & {
  nodes: {
    CockpitFrame001: THREE.Mesh
    CockpitWindows: THREE.Mesh
    Belly: THREE.Mesh
    Cargo1: THREE.Mesh
    Cargo1Int: THREE.Mesh
    Cargo2: THREE.Mesh
    Cargo2Int: THREE.Mesh
    Cargo3: THREE.Mesh
    Cargo3Int: THREE.Mesh
    DoorL1: THREE.Mesh
    DoorL2: THREE.Mesh
    DoorL3: THREE.Mesh
    DoorL4: THREE.Mesh
    DoorR1: THREE.Mesh
    DoorR2: THREE.Mesh
    DoorR3: THREE.Mesh
    DoorR4: THREE.Mesh
    Fuselage001: THREE.Mesh
    GearLDoor: THREE.Mesh
    GearNAftDoorL: THREE.Mesh
    GearNAftDoorR: THREE.Mesh
    GearNDoorC: THREE.Mesh
    GearNFwdDoorL: THREE.Mesh
    GearNFwdDoorR: THREE.Mesh
    GearNWell: THREE.Mesh
    GearRDoor: THREE.Mesh
    Nose: THREE.Mesh
    Ports: THREE.Mesh
    Windows: THREE.Mesh
    Rudder: THREE.Mesh
    Vstab001: THREE.Mesh
    ElevatorL: THREE.Mesh
    ElevatorR: THREE.Mesh
    HstabFlapL: THREE.Mesh
    HstabFlapR: THREE.Mesh
    Hstabs001: THREE.Mesh
    AileronL: THREE.Mesh
    AileronR: THREE.Mesh
    FairingL1: THREE.Mesh
    FairingL2: THREE.Mesh
    FairingL3: THREE.Mesh
    FairingPylons: THREE.Mesh
    FairingR1: THREE.Mesh
    FairingR2: THREE.Mesh
    FairingR3: THREE.Mesh
    FlapL1: THREE.Mesh
    FlapL2: THREE.Mesh
    FlapR1: THREE.Mesh
    FlapR2: THREE.Mesh
    Flaps1: THREE.Mesh
    SlatL1: THREE.Mesh
    SlatL2: THREE.Mesh
    SlatL3: THREE.Mesh
    SlatL4: THREE.Mesh
    SlatL5: THREE.Mesh
    SlatR1: THREE.Mesh
    SlatR2: THREE.Mesh
    SlatR3: THREE.Mesh
    SlatR4: THREE.Mesh
    SlatR5: THREE.Mesh
    SpoilerL1: THREE.Mesh
    SpoilerL2: THREE.Mesh
    SpoilerL3: THREE.Mesh
    SpoilerL4: THREE.Mesh
    SpoilerL5: THREE.Mesh
    SpoilerR1: THREE.Mesh
    SpoilerR2: THREE.Mesh
    SpoilerR3: THREE.Mesh
    SpoilerR4: THREE.Mesh
    SpoilerR5: THREE.Mesh
    Wingbox: THREE.Mesh
    Wings001: THREE.Mesh
    Wingtips: THREE.Mesh
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
    EngineR: THREE.Mesh
    blades001: THREE.Mesh
    casing001: THREE.Mesh
    conemesh001: THREE.Mesh
    conemesh001_1: THREE.Mesh
    cone2001: THREE.Mesh
    Core001: THREE.Mesh
    Cube000: THREE.Mesh
    exhaust001: THREE.Mesh
    fanWheel001: THREE.Mesh
    Intake001: THREE.Mesh
    IntakeInterior001: THREE.Mesh
    Nacelle001: THREE.Mesh
    Nozzle001: THREE.Mesh
    Plane001: THREE.Mesh
    Pylon001: THREE.Mesh
    shroud001: THREE.Mesh
  }
  materials: {
    ['CockpitFrame.002']: THREE.MeshStandardMaterial
    ['Glass.002']: THREE.MeshStandardMaterial
    ['DefaultWhite.012']: THREE.MeshStandardMaterial
    ['DoorInterior.002']: THREE.MeshStandardMaterial
    GearDoor: THREE.MeshStandardMaterial
    ['DefaultWhite.013']: THREE.MeshStandardMaterial
    ['DefaultWhite.007']: THREE.MeshStandardMaterial
    ['DefaultWhite.006']: THREE.MeshStandardMaterial
    ['DefaultWhite.004']: THREE.MeshStandardMaterial
    ['DefaultWhite.005']: THREE.MeshStandardMaterial
    ['DefaultWhite.009']: THREE.MeshStandardMaterial
    grey: THREE.MeshStandardMaterial
    aluminum: THREE.MeshStandardMaterial
    black: THREE.MeshStandardMaterial
    white: THREE.MeshStandardMaterial
    ['DefaultWhite.008']: THREE.MeshStandardMaterial
    IntakeInterior: THREE.MeshStandardMaterial
    Nozzle: THREE.MeshStandardMaterial
    Pylon: THREE.MeshStandardMaterial
    ['DefaultWhite.011']: THREE.MeshStandardMaterial
    ['grey.001']: THREE.MeshStandardMaterial
    ['aluminum.001']: THREE.MeshStandardMaterial
    ['black.001']: THREE.MeshStandardMaterial
    ['white.001']: THREE.MeshStandardMaterial
    ['DefaultWhite.010']: THREE.MeshStandardMaterial
    ['IntakeInterior.001']: THREE.MeshStandardMaterial
    ['Nozzle.001']: THREE.MeshStandardMaterial
    ['Pylon.001']: THREE.MeshStandardMaterial
  }
}

interface A320ModelProps {
  status: {
    undercarriage: PartStatus;
    wings: PartStatus;
    engines: PartStatus;
  };
  onPartClick: (part: string) => void;
  activePart: string | null;
}

const getStatusColor = (status: PartStatus) => {
  switch (status) {
    case "green": return "#22c55e"; // green-500
    case "amber": return "#f59e0b"; // amber-500
    case "red": return "#ef4444"; // red-500
    default: return "#94a3b8";
  }
};

export function A320Model({ status, onPartClick, activePart, ...props }: A320ModelProps) {
  const { nodes: a320Nodes } = useGLTF('/A320.glb') as unknown as GLTFResult
  const { nodes: gearNodes } = useGLTF('/airplane.glb') as any

  const isFaded = (part: string) => activePart !== null && activePart !== part;
  const getOpacity = (part: string) => (isFaded(part) ? 0.1 : 0.7);

  // Wireframe materials for the "Digital Twin" aesthetic
  const materialFuselage = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#cbd5e1",
    wireframe: true,
    transparent: true,
    opacity: getOpacity("fuselage")
  }), [activePart]);

  const materialWings = useMemo(() => new THREE.MeshStandardMaterial({
    color: getStatusColor(status.wings),
    wireframe: true,
    transparent: true,
    opacity: getOpacity("wings"),
    emissive: getStatusColor(status.wings),
    emissiveIntensity: activePart === "wings" ? 1 : 0.4
  }), [status.wings, activePart]);

  const materialEngines = useMemo(() => new THREE.MeshStandardMaterial({
    color: getStatusColor(status.engines),
    wireframe: true,
    transparent: true,
    opacity: getOpacity("engines"),
    emissive: getStatusColor(status.engines),
    emissiveIntensity: activePart === "engines" ? 1 : 0.4
  }), [status.engines, activePart]);

  const materialUndercarriage = useMemo(() => new THREE.MeshStandardMaterial({
    color: getStatusColor(status.undercarriage),
    wireframe: true,
    transparent: true,
    opacity: getOpacity("undercarriage"),
    emissive: getStatusColor(status.undercarriage),
    emissiveIntensity: activePart === "undercarriage" ? 1 : 0.6
  }), [status.undercarriage, activePart]);

  const materialTire = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#1e293b",
    wireframe: true,
    transparent: true,
    opacity: getOpacity("undercarriage")
  }), [activePart]);

  const materialGlass = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#60a5fa",
    wireframe: true,
    transparent: true,
    opacity: getOpacity("fuselage")
  }), [activePart]);

  return (
    <group {...props} dispose={null} scale={0.25} rotation={[0, -Math.PI / 2, 0]}>
      <group onClick={(e) => { e.stopPropagation(); onPartClick("fuselage"); }}>
        <group position={[18.329, 2.599, 0.035]} rotation={[Math.PI, 0, -Math.PI]}>
          <mesh geometry={a320Nodes.Belly.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.Cargo1.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.Cargo1Int.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.Cargo2.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.Cargo2Int.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.Cargo3.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.Cargo3Int.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.DoorL1.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.DoorL2.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.DoorL3.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.DoorL4.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.DoorR1.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.DoorR2.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.DoorR3.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.DoorR4.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.Fuselage001.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.Nose.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.Ports.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.CockpitFrame001.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.Windows.geometry} material={materialGlass} />
          <mesh geometry={a320Nodes.CockpitWindows.geometry} material={materialGlass} />
        </group>
        <group position={[-15.195, 2.514, 0.054]} rotation={[Math.PI, 0, -Math.PI]}>
          <mesh geometry={a320Nodes.Rudder.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.Vstab001.geometry} material={materialFuselage} />
        </group>
        <group position={[-16.383, 2.518, 0.035]} rotation={[Math.PI, 0, -Math.PI]}>
          <mesh geometry={a320Nodes.ElevatorL.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.ElevatorR.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.HstabFlapL.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.HstabFlapR.geometry} material={materialFuselage} />
          <mesh geometry={a320Nodes.Hstabs001.geometry} material={materialFuselage} />
        </group>
      </group>

      {/* WINGS GROUP */}
      <group onClick={(e) => { e.stopPropagation(); onPartClick("wings"); }} position={[3.186, 1.573, 0.041]} rotation={[Math.PI, 0, -Math.PI]}>
        <mesh geometry={a320Nodes.AileronL.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.AileronR.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.FairingL1.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.FairingL2.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.FairingL3.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.FairingR1.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.FairingR2.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.FairingR3.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.FairingPylons.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.FlapL1.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.FlapL2.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.FlapR1.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.FlapR2.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.Flaps1.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SlatL1.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SlatL2.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SlatL3.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SlatL4.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SlatL5.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SlatR1.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SlatR2.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SlatR3.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SlatR4.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SlatR5.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SpoilerL1.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SpoilerL2.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SpoilerL3.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SpoilerL4.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SpoilerL5.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SpoilerR1.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SpoilerR2.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SpoilerR3.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SpoilerR4.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.SpoilerR5.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.Wingbox.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.Wings001.geometry} material={materialWings} />
        <mesh geometry={a320Nodes.Wingtips.geometry} material={materialWings} />
      </group>

      {/* ENGINES GROUP */}
      <group onClick={(e) => { e.stopPropagation(); onPartClick("engines"); }}>
        <mesh geometry={a320Nodes.EngineL.geometry} material={materialEngines} position={[3.992, 0.511, -6.251]} rotation={[Math.PI, 0, -Math.PI]}>
          <mesh geometry={a320Nodes.blades.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.casing.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.conemesh.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.conemesh_1.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.cone2.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.Core.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.Cube004.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.exhaust.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.fanWheel.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.Intake.geometry} material={materialEngines} />
          <mesh geometry={a320Nodes.IntakeInterior.geometry} material={materialEngines} />
          <mesh geometry={a320Nodes.Nacelle.geometry} material={materialEngines} />
          <mesh geometry={a320Nodes.Nozzle.geometry} material={materialEngines} />
          <mesh geometry={a320Nodes.Plane.geometry} material={materialEngines} />
          <mesh geometry={a320Nodes.Pylon.geometry} material={materialEngines} />
          <mesh geometry={a320Nodes.shroud.geometry} material={materialEngines} />
        </mesh>
        <mesh geometry={a320Nodes.EngineR.geometry} material={materialEngines} position={[4.137, 0.481, 6.335]} rotation={[Math.PI, 0, -Math.PI]}>
          <mesh geometry={a320Nodes.blades001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.casing001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.conemesh001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.conemesh001_1.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.cone2001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.Core001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.Cube000.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.exhaust001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.fanWheel001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={a320Nodes.Intake001.geometry} material={materialEngines} />
          <mesh geometry={a320Nodes.IntakeInterior001.geometry} material={materialEngines} />
          <mesh geometry={a320Nodes.Nacelle001.geometry} material={materialEngines} />
          <mesh geometry={a320Nodes.Nozzle001.geometry} material={materialEngines} />
          <mesh geometry={a320Nodes.Plane001.geometry} material={materialEngines} />
          <mesh geometry={a320Nodes.Pylon001.geometry} material={materialEngines} />
          <mesh geometry={a320Nodes.shroud001.geometry} material={materialEngines} />
        </mesh>
      </group>

      {/* UNDERCARRIAGE GROUP */}
      <group onClick={(e) => { e.stopPropagation(); onPartClick("undercarriage"); }}>
        {/* Nose Gear - Combined with Fuselage/Nose section for perfect alignment */}
        <group position={[18.329, 2.599, 0.035]} rotation={[Math.PI, 0, -Math.PI]}>
          <mesh geometry={a320Nodes.GearLDoor.geometry} material={materialUndercarriage} />
          <mesh geometry={a320Nodes.GearNAftDoorL.geometry} material={materialUndercarriage} />
          <mesh geometry={a320Nodes.GearNAftDoorR.geometry} material={materialUndercarriage} />
          <mesh geometry={a320Nodes.GearNDoorC.geometry} material={materialUndercarriage} />
          <mesh geometry={a320Nodes.GearNFwdDoorL.geometry} material={materialUndercarriage} />
          <mesh geometry={a320Nodes.GearNFwdDoorR.geometry} material={materialUndercarriage} />
          <mesh geometry={a320Nodes.GearNWell.geometry} material={materialUndercarriage} />
          <mesh geometry={a320Nodes.GearRDoor.geometry} material={materialUndercarriage} />
          
          {/* Nose Gear Strut & Wheels */}
          <group position={[7.46, -2.12, 0]} scale={0.06} rotation={[0, Math.PI, 0]}>
            <mesh geometry={gearNodes.front_gear_1.geometry} material={materialUndercarriage} />
            <mesh geometry={gearNodes.front_gear_2.geometry} material={materialTire} />
          </group>
        </group>
        
        {/* Main Landing Gear - Aligned with Wing Root Section */}
        <group position={[3.186, 1.573, 0.041]} rotation={[Math.PI, 0, -Math.PI]}>
          <group position={[4.89, -0.97, 0]} scale={[0.22, 0.75, 0.22]} rotation={[0, Math.PI, 0]}>
            <mesh geometry={gearNodes.rear_gears_1.geometry} material={materialUndercarriage} />
            <mesh geometry={gearNodes.rear_gears_2.geometry} material={materialTire} />
          </group>
        </group>
      </group>
    </group>
  )
}

useGLTF.preload('/A320.glb')
useGLTF.preload('/airplane.glb')
