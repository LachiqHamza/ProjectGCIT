"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { VIEWS, type VillaView, type ViewId } from "@/lib/villa";

export type SceneCommand = { id: number; type: "zoom-in" | "zoom-out" | "left" | "right" | "reset" };
type Props = {
  view: VillaView;
  autoRotate: boolean;
  quality: "balanced" | "high";
  command: SceneCommand | null;
  onReady: () => void;
  onProgress: (value: number) => void;
  onError: (message: string) => void;
  onInteraction: () => void;
};
type Runtime = {
  renderer: THREE.WebGLRenderer;
  camera: THREE.PerspectiveCamera;
  controls: OrbitControls;
  setView: (view: VillaView) => void;
  invalidate: () => void;
  orbit: (angle: number) => void;
  zoom: (factor: number) => void;
};

export default function VillaScene({ view, autoRotate, quality, command, onReady, onProgress, onError, onInteraction }: Props) {
  const container = useRef<HTMLDivElement>(null);
  const runtime = useRef<Runtime | null>(null);
  const currentView = useRef(view);
  const rotation = useRef(false);
  const currentQuality = useRef(quality);
  useEffect(() => { currentView.current = view; runtime.current?.setView(view); }, [view]);
  useEffect(() => {
    rotation.current = autoRotate;
    runtime.current?.invalidate();
  }, [autoRotate]);
  useEffect(() => {
    currentQuality.current = quality;
    const r = runtime.current;
    if (r) { r.renderer.setPixelRatio(Math.min(window.devicePixelRatio, quality === "high" ? 2 : 1.3)); r.invalidate(); }
  }, [quality]);
  useEffect(() => {
    const r = runtime.current;
    if (!r || !command) return;
    if (command.type === "reset") r.setView(currentView.current);
    if (command.type === "zoom-in") r.zoom(.83);
    if (command.type === "zoom-out") r.zoom(1.2);
    if (command.type === "left") r.orbit(-Math.PI / 12);
    if (command.type === "right") r.orbit(Math.PI / 12);
  }, [command]);

  useEffect(() => {
    const el = container.current;
    if (!el) return;
    let disposed = false;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
    } catch {
      onError("3D is not available on this device. You can still view the renders and room descriptions.");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.3));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.localClippingEnabled = true;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    const canvas = renderer.domElement;
    canvas.setAttribute("aria-label", "Interactive Villa Bellavista model. Use the room buttons or the controls below to explore.");
    canvas.setAttribute("role", "img");
    canvas.dataset.testid = "villa-canvas";
    el.appendChild(canvas);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#e9ece8");
    const camera = new THREE.PerspectiveCamera(43, 1, .06, 250);
    camera.position.fromArray(VIEWS.exterior.position);
    const controls = new OrbitControls(camera, canvas);
    controls.target.fromArray(VIEWS.exterior.target);
    controls.enableDamping = true;
    controls.dampingFactor = .09;
    controls.maxDistance = 65;
    controls.minDistance = .3;
    controls.maxPolarAngle = Math.PI * .89;
    controls.enablePan = true;
    // One-finger orbit; two-finger pan/zoom. The canvas is only mounted after opt-in.
    const pmrem = new THREE.PMREMGenerator(renderer);
    const environment = new RoomEnvironment();
    const envTarget = pmrem.fromScene(environment, .04);
    scene.environment = envTarget.texture;
    scene.environmentIntensity = .65;
    environment.dispose();
    pmrem.dispose();
    scene.add(new THREE.HemisphereLight(0xe8f1ff, 0x857768, 2.4));
    const sun = new THREE.DirectionalLight(0xfff2df, 3.2);
    sun.position.set(-10, 18, 9);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -24; sun.shadow.camera.right = 24;
    sun.shadow.camera.top = 20; sun.shadow.camera.bottom = -20;
    sun.shadow.camera.near = .5; sun.shadow.camera.far = 60;
    sun.shadow.normalBias = .03;
    scene.add(sun);
    // Interior lights are kept inexpensive; no extra shadow maps.
    for (const p of [[-3, 2.9, -3], [1, 2.9, -4.3], [-4, 6.4, -3], [0, 6.4, -3]]) {
      const l = new THREE.PointLight(0xffe4c2, 16, 7, 2); l.position.fromArray(p); scene.add(l);
    }
    const clipping = new THREE.Plane(new THREE.Vector3(0, -1, 0), 100);
    let model: THREE.Group | null = null;
    let frameId = 0;
    let inViewport = true;
    let previousTime = 0;
    let tween: { from: THREE.Vector3; to: THREE.Vector3; fromTarget: THREE.Vector3; toTarget: THREE.Vector3; start: number; duration: number } | null = null;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const invalidate = () => {
      if (!disposed && !frameId && inViewport && !document.hidden) frameId = requestAnimationFrame(draw);
    };
    const orbit = (angle: number) => {
      tween = null;
      const offset = camera.position.clone().sub(controls.target);
      offset.applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
      camera.position.copy(controls.target).add(offset); controls.update(); invalidate();
    };
    const zoom = (factor: number) => {
      tween = null;
      const v = camera.position.clone().sub(controls.target);
      const length = THREE.MathUtils.clamp(v.length() * factor, controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(v.setLength(length)); controls.update(); invalidate();
    };
    const setView = (v: VillaView) => {
      clipping.constant = v.clip ?? 100;
      if (model) model.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          const materials = Array.isArray(o.material) ? o.material : [o.material];
          for (const mat of materials) { mat.clippingPlanes = v.clip ? [clipping] : []; mat.clipShadows = true; mat.needsUpdate = true; }
        }
      });
      const indoor = !["exterior", "ground", "upper", "pool"].includes(v.id);
      controls.maxDistance = indoor ? 12 : 65;
      const target = new THREE.Vector3(...v.target);
      const destination = new THREE.Vector3(...v.position);
      if (!indoor && camera.aspect < 1.2) destination.sub(target).multiplyScalar(Math.min(1.8, 1.2 / camera.aspect)).add(target);
      tween = { from: camera.position.clone(), to: destination, fromTarget: controls.target.clone(), toTarget: target, start: performance.now(), duration: reducedMotion.matches ? 0 : 950 };
      invalidate();
    };
    function draw(time: number) {
      frameId = 0;
      if (disposed || document.hidden || !inViewport) return;
      const dt = Math.min((time - previousTime) / 1000, .05); previousTime = time;
      let moving = false;
      if (tween) {
        const t = tween.duration === 0 ? 1 : Math.min((time - tween.start) / tween.duration, 1);
        const eased = t * t * (3 - 2 * t);
        camera.position.lerpVectors(tween.from, tween.to, eased);
        controls.target.lerpVectors(tween.fromTarget, tween.toTarget, eased);
        controls.enableDamping = false;
        if (t >= 1) { tween = null; controls.enableDamping = true; } else moving = true;
      } else if (rotation.current && !reducedMotion.matches && currentView.current.id === "exterior") {
        const off = camera.position.clone().sub(controls.target).applyAxisAngle(new THREE.Vector3(0, 1, 0), dt * .09);
        camera.position.copy(controls.target).add(off); moving = true;
      }
      const changed = controls.update();
      renderer.render(scene, camera);
      if (moving || changed) invalidate();
    }
    controls.addEventListener("change", invalidate);
    const cancelTween = () => { tween = null; controls.enableDamping = true; rotation.current = false; onInteraction(); };
    controls.addEventListener("start", cancelTween);
    canvas.addEventListener("focus", cancelTween);
    canvas.tabIndex = 0;
    controls.listenToKeyEvents(canvas);
    const resize = new ResizeObserver(() => {
      const { width, height } = el.getBoundingClientRect();
      if (!width || !height) return;
      camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); invalidate();
    });
    resize.observe(el);
    const observer = new IntersectionObserver(([entry]) => { inViewport = entry.isIntersecting; if (inViewport) invalidate(); }, { threshold: .01 });
    observer.observe(el);
    document.addEventListener("visibilitychange", invalidate);
    const onContextLost = (event: Event) => { event.preventDefault(); onError("The 3D graphics session was interrupted. Reload the viewer to continue."); };
    canvas.addEventListener("webglcontextlost", onContextLost);
    const draco = new DRACOLoader();
    draco.setDecoderPath("/draco/");
    draco.setWorkerLimit(2);
    const loader = new GLTFLoader().setDRACOLoader(draco);
    loader.load("/models/villa-bellavista.glb", (gltf) => {
      if (disposed) { disposeModel(gltf.scene); return; }
      model = gltf.scene;
      model.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.castShadow = true; o.receiveShadow = true;
          const materials = Array.isArray(o.material) ? o.material : [o.material];
          for (const mat of materials) if (mat instanceof THREE.MeshStandardMaterial) mat.envMapIntensity = .9;
        }
      });
      scene.add(model);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, currentQuality.current === "high" ? 2 : 1.3));
      runtime.current = { renderer, camera, controls, setView, invalidate, orbit, zoom };
      setView(currentView.current);
      onProgress(100); onReady(); invalidate();
    }, (event) => { if (!disposed && event.total) onProgress(Math.min(95, Math.round(event.loaded / event.total * 95))); }, () => {
      if (!disposed) onError("The model could not be loaded. Check your connection and try again.");
    });
    invalidate();
    return () => {
      disposed = true; cancelAnimationFrame(frameId); runtime.current = null;
      resize.disconnect(); observer.disconnect(); document.removeEventListener("visibilitychange", invalidate);
      canvas.removeEventListener("webglcontextlost", onContextLost);
      canvas.removeEventListener("focus", cancelTween);
      controls.dispose(); draco.dispose();
      if (model) disposeModel(model);
      envTarget.dispose(); renderer.dispose(); canvas.remove();
    };
  }, [onReady, onProgress, onError, onInteraction]);
  return <div ref={container} className="scene-canvas" />;
}

function disposeModel(model: THREE.Object3D) {
  const textures = new Set<THREE.Texture>();
  const materials = new Set<THREE.Material>();
  model.traverse((o) => {
    if (o instanceof THREE.Mesh) {
      o.geometry.dispose();
      for (const m of Array.isArray(o.material) ? o.material : [o.material]) {
        materials.add(m);
        for (const value of Object.values(m)) if (value instanceof THREE.Texture) textures.add(value);
      }
    }
  });
  for (const t of textures) { const source = t.source.data; if (typeof ImageBitmap !== "undefined" && source instanceof ImageBitmap) source.close(); t.dispose(); }
  for (const m of materials) m.dispose();
}

// Keep ids exported alongside the component for room navigation integrations.
export type { ViewId };
