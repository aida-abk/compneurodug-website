import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/*
 * The logo's recursive squares unfolded into a 3D wireframe cluster.
 * Same geometry as the static HeroArt.astro, with each square on its own
 * depth layer so cursor movement reveals the structure.
 *
 * Motion (pending Aida's review):
 *  - Intro plays once: squares unfold back to front, coral nodes appear,
 *    the coral terminal settles last (timing echoes the animated logo).
 *  - Then a slow drift plus a gentle tilt toward the cursor.
 */

export interface HeroColors {
  structure: string;
  signal: string;
}

const RING_COUNT = 12;
const INTRO_STAGGER = 0.12; // s between squares
const INTRO_DURATION = 1.1; // s per square
const NODE_DELAY = 1.3;
const TERMINAL_DELAY = 1.7;
const TERMINAL_DURATION = 1.2;
const DRIFT_SPEED = 0.15;
const POINTER_TILT = 0.35; // radians at the viewport edge
const POINTER_EASE = 0.04;

const easeOut = (t: number) => 1 - Math.pow(1 - Math.min(Math.max(t, 0), 1), 3);
const deg = THREE.MathUtils.degToRad;

interface Ring {
  side: number;
  angle: number;
  z: number;
  dx: number;
  dy: number;
  opacity: number;
}

function buildRings(): Ring[] {
  return Array.from({ length: RING_COUNT }, (_, i) => {
    const t = i / (RING_COUNT - 1);
    return {
      side: 3.8 - t * 3.0,
      angle: deg(-18 + i * 9),
      z: -1.8 + t * 3.0,
      dx: Math.sin(i * 1.3) * 0.1,
      dy: Math.cos(i * 1.1) * 0.08,
      opacity: 0.25 + 0.6 * t,
    };
  });
}

function corner(r: Ring, k: number): THREE.Vector3 {
  const a = r.angle + deg(45 + k * 90);
  const radius = (r.side / 2) * Math.SQRT2;
  return new THREE.Vector3(r.dx + Math.cos(a) * radius, r.dy + Math.sin(a) * radius, r.z);
}

function squarePoints(side: number): THREE.Vector3[] {
  const h = side / 2;
  return [
    new THREE.Vector3(-h, -h, 0),
    new THREE.Vector3(h, -h, 0),
    new THREE.Vector3(h, h, 0),
    new THREE.Vector3(-h, h, 0),
  ];
}

function Cluster({ colors, pointer }: { colors: HeroColors; pointer: React.RefObject<THREE.Vector2> }) {
  const group = useRef<THREE.Group>(null);
  const ringRefs = useRef<THREE.LineLoop[]>([]);
  const nodeRefs = useRef<THREE.Mesh[]>([]);
  const terminal = useRef<THREE.Mesh>(null);
  const connectorMaterial = useRef<THREE.LineBasicMaterial>(null);
  const tilt = useRef(new THREE.Vector2());

  const rings = useMemo(buildRings, []);

  const ringGeometries = useMemo(
    () => rings.map((r) => new THREE.BufferGeometry().setFromPoints(squarePoints(r.side))),
    [rings],
  );

  const connectorGeometry = useMemo(() => {
    const points: THREE.Vector3[] = [];
    rings.slice(0, -1).forEach((r, i) => {
      for (let k = 0; k < 4; k++) points.push(corner(r, k), corner(rings[i + 1], k));
    });
    return new THREE.BufferGeometry().setFromPoints(points);
  }, [rings]);

  const nodes = useMemo(() => [2, 5, 8].map((ri, i) => ({ pos: corner(rings[ri], i), r: 0.075 - i * 0.015 })), [rings]);
  const last = rings[rings.length - 1];

  useEffect(
    () => () => {
      ringGeometries.forEach((g) => g.dispose());
      connectorGeometry.dispose();
    },
    [ringGeometries, connectorGeometry],
  );

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime();

    rings.forEach((r, i) => {
      const loop = ringRefs.current[i];
      if (!loop) return;
      const p = easeOut((t - i * INTRO_STAGGER) / INTRO_DURATION);
      const scale = 0.93 + 0.07 * p;
      loop.scale.setScalar(scale);
      loop.rotation.z = r.angle + deg(-8) * (1 - p);
      // Gentle breathing in depth once settled.
      loop.position.z = r.z + Math.sin(t * 0.4 + i * 0.5) * 0.04 * p;
      (loop.material as THREE.LineBasicMaterial).opacity = r.opacity * p;
    });

    if (connectorMaterial.current) {
      connectorMaterial.current.opacity = 0.3 * easeOut((t - 0.6) / INTRO_DURATION);
    }

    nodeRefs.current.forEach((node, i) => {
      if (!node) return;
      node.scale.setScalar(Math.max(easeOut((t - NODE_DELAY - i * 0.2) / 0.6), 0.0001));
    });

    if (terminal.current) {
      const p = easeOut((t - TERMINAL_DELAY) / TERMINAL_DURATION);
      terminal.current.scale.setScalar(0.35 + 0.65 * p);
      terminal.current.rotation.z = deg(29) + deg(-18) * (1 - p);
      (terminal.current.material as THREE.MeshBasicMaterial).opacity = p;
    }

    if (group.current && pointer.current) {
      tilt.current.lerp(pointer.current, POINTER_EASE);
      group.current.rotation.y = Math.sin(t * DRIFT_SPEED) * 0.25 + tilt.current.x * POINTER_TILT;
      group.current.rotation.x = Math.cos(t * DRIFT_SPEED * 0.8) * 0.12 - tilt.current.y * POINTER_TILT * 0.7;
    }
  });

  return (
    <group ref={group}>
      {/* Flip y so the cluster matches the SVG fallback (SVG y points down). */}
      <group scale={[1, -1, 1]}>
      {rings.map((r, i) => (
        <lineLoop
          key={i}
          ref={(el) => {
            if (el) ringRefs.current[i] = el;
          }}
          geometry={ringGeometries[i]}
          position={[r.dx, r.dy, r.z]}
        >
          <lineBasicMaterial color={colors.structure} transparent opacity={0} />
        </lineLoop>
      ))}

      <lineSegments geometry={connectorGeometry}>
        <lineBasicMaterial ref={connectorMaterial} color={colors.structure} transparent opacity={0} />
      </lineSegments>

      {nodes.map(({ pos, r }, i) => (
        <mesh
          key={i}
          position={pos}
          ref={(el) => {
            if (el) nodeRefs.current[i] = el;
          }}
        >
          <sphereGeometry args={[r, 24, 16]} />
          <meshBasicMaterial color={colors.signal} />
        </mesh>
      ))}

      <mesh ref={terminal} position={[last.dx, last.dy, last.z + 0.05]}>
        <planeGeometry args={[0.44, 0.44]} />
        <meshBasicMaterial color={colors.signal} transparent opacity={0} side={THREE.DoubleSide} />
      </mesh>
      </group>
    </group>
  );
}

export default function HeroScene({
  colors,
  active,
  onReady,
}: {
  colors: HeroColors;
  /** False while the hero is off screen: rendering pauses. */
  active: boolean;
  onReady: () => void;
}) {
  const pointer = useRef(new THREE.Vector2());

  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      pointer.current.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener('pointermove', onMove, { passive: true });
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  return (
    <Canvas
      aria-hidden="true"
      frameloop={active ? 'always' : 'never'}
      dpr={[1, 2]}
      camera={{ fov: 35, position: [0, 0, 6.8] }}
      gl={{ antialias: true, alpha: true, powerPreference: 'low-power' }}
      onCreated={() => requestAnimationFrame(onReady)}
    >
      <Cluster colors={colors} pointer={pointer} />
    </Canvas>
  );
}
