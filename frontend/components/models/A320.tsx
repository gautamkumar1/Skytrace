
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

export function A320Model({ status, onPartClick, activePart, ...props }: A320ModelProps & React.JSX.IntrinsicElements['group']) {
  const { nodes } = useGLTF('/A320.glb') as unknown as GLTFResult

  const isFaded = (part: string) => activePart !== null && activePart !== part;
  const getOpacity = (part: string) => (isFaded(part) ? 0.1 : 0.8);

  // Wireframe materials for the "Digital Twin" aesthetic
  const materialFuselage = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#ffffff",
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
    emissiveIntensity: activePart === "wings" ? 1 : 0.2
  }), [status.wings, activePart]);

  const materialEngines = useMemo(() => new THREE.MeshStandardMaterial({
    color: getStatusColor(status.engines),
    wireframe: true,
    transparent: true,
    opacity: getOpacity("engines"),
    emissive: getStatusColor(status.engines),
    emissiveIntensity: activePart === "engines" ? 1 : 0.2
  }), [status.engines, activePart]);

  const materialUndercarriage = useMemo(() => new THREE.MeshStandardMaterial({
    color: getStatusColor(status.undercarriage),
    wireframe: true,
    transparent: true,
    opacity: getOpacity("undercarriage"),
    emissive: getStatusColor(status.undercarriage),
    emissiveIntensity: activePart === "undercarriage" ? 1 : 0.2
  }), [status.undercarriage, activePart]);

  const materialGlass = useMemo(() => new THREE.MeshStandardMaterial({
    color: "#60a5fa",
    wireframe: true,
    transparent: true,
    opacity: getOpacity("fuselage")
  }), [activePart]);

  return (
    <group {...props} dispose={null} scale={0.4} rotation={[0, -Math.PI / 2, 0]}>
      <group onClick={(e) => { e.stopPropagation(); onPartClick("fuselage"); }}>
        <group position={[18.329, 2.599, 0.035]} rotation={[Math.PI, 0, -Math.PI]}>
          <mesh geometry={nodes.Belly.geometry} material={materialFuselage} />
          <mesh geometry={nodes.Cargo1.geometry} material={materialFuselage} />
          <mesh geometry={nodes.Cargo1Int.geometry} material={materialFuselage} />
          <mesh geometry={nodes.Cargo2.geometry} material={materialFuselage} />
          <mesh geometry={nodes.Cargo2Int.geometry} material={materialFuselage} />
          <mesh geometry={nodes.Cargo3.geometry} material={materialFuselage} />
          <mesh geometry={nodes.Cargo3Int.geometry} material={materialFuselage} />
          <mesh geometry={nodes.DoorL1.geometry} material={materialFuselage} />
          <mesh geometry={nodes.DoorL2.geometry} material={materialFuselage} />
          <mesh geometry={nodes.DoorL3.geometry} material={materialFuselage} />
          <mesh geometry={nodes.DoorL4.geometry} material={materialFuselage} />
          <mesh geometry={nodes.DoorR1.geometry} material={materialFuselage} />
          <mesh geometry={nodes.DoorR2.geometry} material={materialFuselage} />
          <mesh geometry={nodes.DoorR3.geometry} material={materialFuselage} />
          <mesh geometry={nodes.DoorR4.geometry} material={materialFuselage} />
          <mesh geometry={nodes.Fuselage001.geometry} material={materialFuselage} />
          <mesh geometry={nodes.Nose.geometry} material={materialFuselage} />
          <mesh geometry={nodes.Ports.geometry} material={materialFuselage} />
          <mesh geometry={nodes.CockpitFrame001.geometry} material={materialFuselage} />
          <mesh geometry={nodes.Windows.geometry} material={materialGlass} />
          <mesh geometry={nodes.CockpitWindows.geometry} material={materialGlass} />
        </group>
        <group position={[-15.195, 2.514, 0.054]} rotation={[Math.PI, 0, -Math.PI]}>
          <mesh geometry={nodes.Rudder.geometry} material={materialFuselage} />
          <mesh geometry={nodes.Vstab001.geometry} material={materialFuselage} />
        </group>
        <group position={[-16.383, 2.518, 0.035]} rotation={[Math.PI, 0, -Math.PI]}>
          <mesh geometry={nodes.ElevatorL.geometry} material={materialFuselage} />
          <mesh geometry={nodes.ElevatorR.geometry} material={materialFuselage} />
          <mesh geometry={nodes.HstabFlapL.geometry} material={materialFuselage} />
          <mesh geometry={nodes.HstabFlapR.geometry} material={materialFuselage} />
          <mesh geometry={nodes.Hstabs001.geometry} material={materialFuselage} />
        </group>
      </group>

      {/* WINGS GROUP */}
      <group onClick={(e) => { e.stopPropagation(); onPartClick("wings"); }} position={[3.186, 1.573, 0.041]} rotation={[Math.PI, 0, -Math.PI]}>
        <mesh geometry={nodes.AileronL.geometry} material={materialWings} />
        <mesh geometry={nodes.AileronR.geometry} material={materialWings} />
        <mesh geometry={nodes.FairingL1.geometry} material={materialWings} />
        <mesh geometry={nodes.FairingL2.geometry} material={materialWings} />
        <mesh geometry={nodes.FairingL3.geometry} material={materialWings} />
        <mesh geometry={nodes.FairingR1.geometry} material={materialWings} />
        <mesh geometry={nodes.FairingR2.geometry} material={materialWings} />
        <mesh geometry={nodes.FairingR3.geometry} material={materialWings} />
        <mesh geometry={nodes.FairingPylons.geometry} material={materialWings} />
        <mesh geometry={nodes.FlapL1.geometry} material={materialWings} />
        <mesh geometry={nodes.FlapL2.geometry} material={materialWings} />
        <mesh geometry={nodes.FlapR1.geometry} material={materialWings} />
        <mesh geometry={nodes.FlapR2.geometry} material={materialWings} />
        <mesh geometry={nodes.Flaps1.geometry} material={materialWings} />
        <mesh geometry={nodes.SlatL1.geometry} material={materialWings} />
        <mesh geometry={nodes.SlatL2.geometry} material={materialWings} />
        <mesh geometry={nodes.SlatL3.geometry} material={materialWings} />
        <mesh geometry={nodes.SlatL4.geometry} material={materialWings} />
        <mesh geometry={nodes.SlatL5.geometry} material={materialWings} />
        <mesh geometry={nodes.SlatR1.geometry} material={materialWings} />
        <mesh geometry={nodes.SlatR2.geometry} material={materialWings} />
        <mesh geometry={nodes.SlatR3.geometry} material={materialWings} />
        <mesh geometry={nodes.SlatR4.geometry} material={materialWings} />
        <mesh geometry={nodes.SlatR5.geometry} material={materialWings} />
        <mesh geometry={nodes.SpoilerL1.geometry} material={materialWings} />
        <mesh geometry={nodes.SpoilerL2.geometry} material={materialWings} />
        <mesh geometry={nodes.SpoilerL3.geometry} material={materialWings} />
        <mesh geometry={nodes.SpoilerL4.geometry} material={materialWings} />
        <mesh geometry={nodes.SpoilerL5.geometry} material={materialWings} />
        <mesh geometry={nodes.SpoilerR1.geometry} material={materialWings} />
        <mesh geometry={nodes.SpoilerR2.geometry} material={materialWings} />
        <mesh geometry={nodes.SpoilerR3.geometry} material={materialWings} />
        <mesh geometry={nodes.SpoilerR4.geometry} material={materialWings} />
        <mesh geometry={nodes.SpoilerR5.geometry} material={materialWings} />
        <mesh geometry={nodes.Wingbox.geometry} material={materialWings} />
        <mesh geometry={nodes.Wings001.geometry} material={materialWings} />
        <mesh geometry={nodes.Wingtips.geometry} material={materialWings} />
      </group>

      {/* ENGINES GROUP */}
      <group onClick={(e) => { e.stopPropagation(); onPartClick("engines"); }}>
        <mesh geometry={nodes.EngineL.geometry} material={materialEngines} position={[3.992, 0.511, -6.251]} rotation={[Math.PI, 0, -Math.PI]}>
          <mesh geometry={nodes.blades.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.casing.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.conemesh.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.conemesh_1.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.cone2.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.Core.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.Cube004.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.exhaust.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.fanWheel.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.Intake.geometry} material={materialEngines} />
          <mesh geometry={nodes.IntakeInterior.geometry} material={materialEngines} />
          <mesh geometry={nodes.Nacelle.geometry} material={materialEngines} />
          <mesh geometry={nodes.Nozzle.geometry} material={materialEngines} />
          <mesh geometry={nodes.Plane.geometry} material={materialEngines} />
          <mesh geometry={nodes.Pylon.geometry} material={materialEngines} />
          <mesh geometry={nodes.shroud.geometry} material={materialEngines} />
        </mesh>
        <mesh geometry={nodes.EngineR.geometry} material={materialEngines} position={[4.137, 0.481, 6.335]} rotation={[Math.PI, 0, -Math.PI]}>
          <mesh geometry={nodes.blades001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.casing001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.conemesh001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.conemesh001_1.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.cone2001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.Core001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.Cube000.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.exhaust001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.fanWheel001.geometry} material={materialEngines} position={[0.326, 0.011, 0]} />
          <mesh geometry={nodes.Intake001.geometry} material={materialEngines} />
          <mesh geometry={nodes.IntakeInterior001.geometry} material={materialEngines} />
          <mesh geometry={nodes.Nacelle001.geometry} material={materialEngines} />
          <mesh geometry={nodes.Nozzle001.geometry} material={materialEngines} />
          <mesh geometry={nodes.Plane001.geometry} material={materialEngines} />
          <mesh geometry={nodes.Pylon001.geometry} material={materialEngines} />
          <mesh geometry={nodes.shroud001.geometry} material={materialEngines} />
        </mesh>
      </group>

      {/* UNDERCARRIAGE GROUP */}
      <group onClick={(e) => { e.stopPropagation(); onPartClick("undercarriage"); }} position={[18.329, 2.599, 0.035]} rotation={[Math.PI, 0, -Math.PI]}>
        <mesh geometry={nodes.GearLDoor.geometry} material={materialUndercarriage} />
        <mesh geometry={nodes.GearNAftDoorL.geometry} material={materialUndercarriage} />
        <mesh geometry={nodes.GearNAftDoorR.geometry} material={materialUndercarriage} />
        <mesh geometry={nodes.GearNDoorC.geometry} material={materialUndercarriage} />
        <mesh geometry={nodes.GearNFwdDoorL.geometry} material={materialUndercarriage} />
        <mesh geometry={nodes.GearNFwdDoorR.geometry} material={materialUndercarriage} />
        <mesh geometry={nodes.GearNWell.geometry} material={materialUndercarriage} />
        <mesh geometry={nodes.GearRDoor.geometry} material={materialUndercarriage} />
      </group>
    </group>
  )
}

useGLTF.preload('/A320.glb')

