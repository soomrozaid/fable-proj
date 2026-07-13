"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { buildMatrix } from "@/lib/qr/matrix";

/**
 * The product, made tangible: a QR code carved as a stone stele. The code is
 * the real production URL — scannable straight off the screen. The stone never
 * changes; the destination behind it does (DOM layer handles that story).
 */

const INK = "#26221d";
const STONE = "#ece5d3";
const PATINA = "#2c6e63";

function QRStele({ url, animate }: { url: string; animate: boolean }) {
  const group = useRef<THREE.Group>(null);
  const instRef = useRef<THREE.InstancedMesh>(null);

  const { positions, size } = useMemo(() => {
    const m = buildMatrix(url, "M");
    const out: Array<[number, number]> = [];
    for (let r = 0; r < m.size; r++) {
      for (let c = 0; c < m.size; c++) {
        if (m.get(r, c)) out.push([c, r]);
      }
    }
    return { positions: out, size: m.size };
  }, [url]);

  const unit = 2.6 / size; // stele face spans ~2.6 world units

  useLayoutEffect(() => {
    // Position instances once; front faces stay coplanar so the code scans.
    const mesh = instRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    positions.forEach(([c, r], i) => {
      dummy.position.set(
        (c - size / 2 + 0.5) * unit,
        (size / 2 - r - 0.5) * unit,
        0.06,
      );
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    });
    mesh.instanceMatrix.needsUpdate = true;
  }, [positions, size, unit]);

  useFrame(({ clock, pointer }) => {
    if (!group.current) return;
    if (!animate) return;
    const t = clock.elapsedTime;
    // Gentle presence: breathing tilt + pointer parallax, never enough to break scanning.
    group.current.rotation.y = Math.sin(t * 0.35) * 0.16 + pointer.x * 0.18;
    group.current.rotation.x = Math.cos(t * 0.28) * 0.05 + -pointer.y * 0.1;
    group.current.position.y = Math.sin(t * 0.6) * 0.03;
  });

  const pad = unit * 4; // quiet zone carved into the slab

  return (
    <group ref={group}>
      {/* slab */}
      <mesh position={[0, 0, -0.09]}>
        <boxGeometry args={[2.6 + pad * 2, 2.6 + pad * 2, 0.3]} />
        <meshStandardMaterial color={STONE} roughness={0.85} metalness={0.05} />
      </mesh>
      {/* chiseled edge accent */}
      <mesh position={[0, -(2.6 + pad * 2) / 2 - 0.09, -0.09]}>
        <boxGeometry args={[2.6 + pad * 2 + 0.12, 0.18, 0.42]} />
        <meshStandardMaterial color={PATINA} roughness={0.6} metalness={0.2} />
      </mesh>
      {/* carved modules */}
      <instancedMesh
        ref={instRef}
        args={[undefined, undefined, positions.length]}
        key={positions.length}
      >
        <boxGeometry args={[unit * 0.94, unit * 0.94, 0.12]} />
        <meshStandardMaterial color={INK} roughness={0.55} metalness={0.1} />
      </instancedMesh>
    </group>
  );
}

export default function StoneScene({
  url,
  animate,
}: {
  url: string;
  animate: boolean;
}) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      camera={{ position: [0, 0, 4.9], fov: 42 }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      frameloop={animate ? "always" : "demand"}
      aria-hidden="true"
      style={{ background: "transparent" }}
    >
      <ambientLight intensity={0.9} />
      <directionalLight position={[3, 4, 5]} intensity={1.4} />
      <directionalLight
        position={[-4, -2, 2]}
        intensity={0.35}
        color={PATINA}
      />
      <QRStele url={url} animate={animate} />
    </Canvas>
  );
}
