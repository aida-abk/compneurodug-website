import {
  BufferGeometry,
  DoubleSide,
  Group,
  LineBasicMaterial,
  LineLoop,
  LineSegments,
  MathUtils,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  PlaneGeometry,
  Scene,
  SphereGeometry,
  Vector2,
  Vector3,
  WebGLRenderer,
} from 'three';

/*
 * The logo's recursive squares unfolded into a 3D wireframe cluster.
 * Same geometry as the static HeroArt.astro, with each square on its own
 * depth layer so cursor movement reveals the structure. Plain Three.js with
 * named imports so the bundle only carries what the scene uses.
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
const CONNECTOR_DELAY = 0.6;
const NODE_DELAY = 1.3;
const TERMINAL_DELAY = 1.7;
const TERMINAL_DURATION = 1.2;
const DRIFT_SPEED = 0.15;
const POINTER_TILT = 0.35; // radians at the viewport edge
const POINTER_EASE = 0.04;
const CAMERA_FOV = 35;
const CAMERA_Z = 6.8;

const easeOut = (t: number) => 1 - Math.pow(1 - MathUtils.clamp(t, 0, 1), 3);
const deg = MathUtils.degToRad;

interface Ring {
  side: number;
  angle: number;
  z: number;
  dx: number;
  dy: number;
  opacity: number;
}

const rings: Ring[] = Array.from({ length: RING_COUNT }, (_, i) => {
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

function corner(r: Ring, k: number): Vector3 {
  const a = r.angle + deg(45 + k * 90);
  const radius = (r.side / 2) * Math.SQRT2;
  return new Vector3(r.dx + Math.cos(a) * radius, r.dy + Math.sin(a) * radius, r.z);
}

function square(side: number): BufferGeometry {
  const h = side / 2;
  return new BufferGeometry().setFromPoints([
    new Vector3(-h, -h, 0),
    new Vector3(h, -h, 0),
    new Vector3(h, h, 0),
    new Vector3(-h, h, 0),
  ]);
}

/**
 * Renders the cluster into `container`. Calls `onReady` after the first frame.
 * Returns a function that stops rendering and frees GPU resources.
 */
export function mountHero(container: HTMLElement, colors: HeroColors, onReady: () => void): () => void {
  const renderer = new WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.domElement.setAttribute('aria-hidden', 'true');
  renderer.domElement.style.display = 'block';
  container.appendChild(renderer.domElement);

  const scene = new Scene();
  const camera = new PerspectiveCamera(CAMERA_FOV, 1, 0.1, 50);
  camera.position.z = CAMERA_Z;

  // Outer group drifts and tilts; inner group flips y to match the SVG
  // fallback, whose y axis points down.
  const root = new Group();
  const cluster = new Group();
  cluster.scale.set(1, -1, 1);
  root.add(cluster);
  scene.add(root);

  const disposables: { dispose(): void }[] = [];
  const track = <T extends { dispose(): void }>(d: T) => (disposables.push(d), d);

  const loops = rings.map((r) => {
    const material = track(new LineBasicMaterial({ color: colors.structure, transparent: true, opacity: 0 }));
    const loop = new LineLoop(track(square(r.side)), material);
    loop.position.set(r.dx, r.dy, r.z);
    cluster.add(loop);
    return { loop, material };
  });

  const connectorPoints: Vector3[] = [];
  rings.slice(0, -1).forEach((r, i) => {
    for (let k = 0; k < 4; k++) connectorPoints.push(corner(r, k), corner(rings[i + 1], k));
  });
  const connectorMaterial = track(new LineBasicMaterial({ color: colors.structure, transparent: true, opacity: 0 }));
  cluster.add(new LineSegments(track(new BufferGeometry().setFromPoints(connectorPoints)), connectorMaterial));

  const nodeMaterial = track(new MeshBasicMaterial({ color: colors.signal }));
  const nodes = [2, 5, 8].map((ri, i) => {
    const node = new Mesh(track(new SphereGeometry(0.075 - i * 0.015, 24, 16)), nodeMaterial);
    node.position.copy(corner(rings[ri], i));
    node.scale.setScalar(0.0001);
    cluster.add(node);
    return node;
  });

  const last = rings[rings.length - 1];
  const terminalMaterial = track(
    new MeshBasicMaterial({ color: colors.signal, transparent: true, opacity: 0, side: DoubleSide }),
  );
  const terminal = new Mesh(track(new PlaneGeometry(0.44, 0.44)), terminalMaterial);
  terminal.position.set(last.dx, last.dy, last.z + 0.05);
  cluster.add(terminal);

  // ---- Input and sizing ----
  const pointer = new Vector2();
  const tilt = new Vector2();
  const onPointerMove = (e: PointerEvent) => {
    pointer.set((e.clientX / window.innerWidth) * 2 - 1, (e.clientY / window.innerHeight) * 2 - 1);
  };
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  const resize = () => {
    const { clientWidth: w, clientHeight: h } = container;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(container);
  resize();

  // ---- Animation loop: runs only while the hero is on screen ----
  const start = performance.now();
  let frame = 0;
  let visible = true;
  let ready = false;

  const render = () => {
    const t = (performance.now() - start) / 1000;

    loops.forEach(({ loop, material }, i) => {
      const r = rings[i];
      const p = easeOut((t - i * INTRO_STAGGER) / INTRO_DURATION);
      loop.scale.setScalar(0.93 + 0.07 * p);
      loop.rotation.z = r.angle + deg(-8) * (1 - p);
      loop.position.z = r.z + Math.sin(t * 0.4 + i * 0.5) * 0.04 * p;
      material.opacity = r.opacity * p;
    });

    connectorMaterial.opacity = 0.3 * easeOut((t - CONNECTOR_DELAY) / INTRO_DURATION);

    nodes.forEach((node, i) => {
      node.scale.setScalar(Math.max(easeOut((t - NODE_DELAY - i * 0.2) / 0.6), 0.0001));
    });

    const pt = easeOut((t - TERMINAL_DELAY) / TERMINAL_DURATION);
    terminal.scale.setScalar(0.35 + 0.65 * pt);
    terminal.rotation.z = deg(29) + deg(-18) * (1 - pt);
    terminalMaterial.opacity = pt;

    tilt.lerp(pointer, POINTER_EASE);
    root.rotation.y = Math.sin(t * DRIFT_SPEED) * 0.25 + tilt.x * POINTER_TILT;
    root.rotation.x = Math.cos(t * DRIFT_SPEED * 0.8) * 0.12 - tilt.y * POINTER_TILT * 0.7;

    renderer.render(scene, camera);
    if (!ready) {
      ready = true;
      onReady();
    }
    frame = requestAnimationFrame(render);
  };

  const play = () => {
    if (!frame && visible && !document.hidden) frame = requestAnimationFrame(render);
  };
  const pause = () => {
    cancelAnimationFrame(frame);
    frame = 0;
  };

  const intersection = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) play();
    else pause();
  });
  intersection.observe(container);

  const onVisibility = () => (document.hidden ? pause() : play());
  document.addEventListener('visibilitychange', onVisibility);

  play();

  return () => {
    pause();
    intersection.disconnect();
    resizeObserver.disconnect();
    window.removeEventListener('pointermove', onPointerMove);
    document.removeEventListener('visibilitychange', onVisibility);
    disposables.forEach((d) => d.dispose());
    renderer.dispose();
    renderer.domElement.remove();
  };
}
