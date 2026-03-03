"use client";

import { useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { waveVertexShader, waveFragmentShader } from "@/lib/wave-shader";
import type { WaveUniforms } from "@/lib/wave-params";

function checkWebGLSupport(): boolean {
  if (typeof document === "undefined") return true;
  const c = document.createElement("canvas");
  return !!(c.getContext("webgl2") || c.getContext("webgl"));
}

const webglSupported = checkWebGLSupport();
const subscribeNoop = () => () => {};
const getWebGLSnapshot = () => webglSupported;
const getWebGLServerSnapshot = () => true;

const GRID_SEGMENTS = 128;
const PLANE_SIZE = 10;

const DEFAULT_CAMERA_POSITION = new THREE.Vector3(8, 8, 6);
const DEFAULT_CAMERA_TARGET = new THREE.Vector3(0, 0, 0);

interface UseWaveAnimationOptions {
  isPlaying: boolean;
  onFpsUpdate?: (fps: number) => void;
  waveUniforms?: WaveUniforms;
}

export function useWaveAnimation({
  isPlaying,
  onFpsUpdate,
  waveUniforms,
}: UseWaveAnimationOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const uniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const prevTimestampRef = useRef<number>(0);
  const isPlayingRef = useRef(isPlaying);
  const onFpsUpdateRef = useRef(onFpsUpdate);
  const fpsCountRef = useRef(0);
  const fpsTimeRef = useRef(0);
  const isWebGLSupported = useSyncExternalStore(subscribeNoop, getWebGLSnapshot, getWebGLServerSnapshot);

  // Refs synchron halten
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    onFpsUpdateRef.current = onFpsUpdate;
  }, [onFpsUpdate]);

  // Uniform-Werte aktualisieren wenn sich Parameter aendern
  const uAmplitude = waveUniforms?.amplitude;
  const uWaveNumber = waveUniforms?.waveNumber;
  const uAngularFreq = waveUniforms?.angularFreq;
  const uPhase = waveUniforms?.phase;
  const uDamping = waveUniforms?.damping;

  useEffect(() => {
    if (!uniformsRef.current) return;
    if (uAmplitude === undefined) return;
    const u = uniformsRef.current;
    u.u_amplitude.value = uAmplitude;
    u.u_waveNumber.value = uWaveNumber!;
    u.u_angularFreq.value = uAngularFreq!;
    u.u_phase.value = uPhase!;
    u.u_damping.value = uDamping!;
  }, [uAmplitude, uWaveNumber, uAngularFreq, uPhase, uDamping]);

  const resetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.copy(DEFAULT_CAMERA_POSITION);
      controlsRef.current.target.copy(DEFAULT_CAMERA_TARGET);
      controlsRef.current.update();
    }
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // WebGL-Support prüfen
    if (!isWebGLSupported) return;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0xf8f9fa);
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // Szene
    const scene = new THREE.Scene();

    // Kamera
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.copy(DEFAULT_CAMERA_POSITION);
    cameraRef.current = camera;

    // OrbitControls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.copy(DEFAULT_CAMERA_TARGET);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 3;
    controls.maxDistance = 25;
    controls.update();
    controlsRef.current = controls;

    // Beleuchtung
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight.position.set(5, 5, 10);
    scene.add(dirLight);

    // Koordinatengitter auf Z=0-Ebene
    const gridHelper = new THREE.GridHelper(PLANE_SIZE, 10, 0xcccccc, 0xe0e0e0);
    gridHelper.rotation.x = Math.PI / 2;
    scene.add(gridHelper);

    // Achsenlinien
    const axesLen = PLANE_SIZE / 2 + 1;

    const addAxisLine = (
      from: THREE.Vector3,
      to: THREE.Vector3,
      color: number
    ) => {
      const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
      scene.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color })));
    };

    addAxisLine(
      new THREE.Vector3(-axesLen, 0, 0),
      new THREE.Vector3(axesLen, 0, 0),
      0xcc3333
    );
    addAxisLine(
      new THREE.Vector3(0, -axesLen, 0),
      new THREE.Vector3(0, axesLen, 0),
      0x33aa33
    );
    addAxisLine(
      new THREE.Vector3(0, 0, -2),
      new THREE.Vector3(0, 0, 2),
      0x3366cc
    );

    // Achsenbeschriftungen als Sprites
    const addLabel = (text: string, pos: THREE.Vector3, color: string) => {
      const c = document.createElement("canvas");
      c.width = 64;
      c.height = 64;
      const ctx = c.getContext("2d")!;
      ctx.fillStyle = color;
      ctx.font = "bold 48px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(text, 32, 32);

      const tex = new THREE.CanvasTexture(c);
      const sprite = new THREE.Sprite(
        new THREE.SpriteMaterial({ map: tex, depthTest: false })
      );
      sprite.position.copy(pos);
      sprite.scale.set(0.5, 0.5, 1);
      scene.add(sprite);
    };

    addLabel("X", new THREE.Vector3(axesLen + 0.3, 0, 0), "#cc3333");
    addLabel("Y", new THREE.Vector3(0, axesLen + 0.3, 0), "#33aa33");
    addLabel("Z", new THREE.Vector3(0, 0, 2.3), "#3366cc");

    // Wellen-Mesh
    const geometry = new THREE.PlaneGeometry(
      PLANE_SIZE,
      PLANE_SIZE,
      GRID_SEGMENTS,
      GRID_SEGMENTS
    );

    // Initiale Uniform-Werte (Defaults; der separate Effekt ueberschreibt sie sofort)
    const uniforms = {
      u_time: { value: 0.0 },
      u_amplitude: { value: 1.0 },
      u_waveNumber: { value: Math.PI },
      u_angularFreq: { value: 2 * Math.PI },
      u_phase: { value: 0.0 },
      u_damping: { value: 0.0 },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      vertexShader: waveVertexShader,
      fragmentShader: waveFragmentShader,
      uniforms,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Dezentes Wireframe-Overlay
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x999999,
      wireframe: true,
      transparent: true,
      opacity: 0.06,
    });
    const wireframe = new THREE.Mesh(geometry, wireMat);
    scene.add(wireframe);

    // Resize
    const handleResize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      renderer.setSize(w, h);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // Animationsloop
    fpsTimeRef.current = performance.now();

    const animate = (timestamp: number) => {
      animFrameRef.current = requestAnimationFrame(animate);

      // FPS
      fpsCountRef.current++;
      const fpsElapsed = timestamp - fpsTimeRef.current;
      if (fpsElapsed >= 1000) {
        onFpsUpdateRef.current?.(
          Math.round((fpsCountRef.current * 1000) / fpsElapsed)
        );
        fpsCountRef.current = 0;
        fpsTimeRef.current = timestamp;
      }

      controls.update();

      // Zeit nur voranschreiten wenn isPlaying
      if (isPlayingRef.current && prevTimestampRef.current > 0) {
        const dt = (timestamp - prevTimestampRef.current) / 1000;
        timeRef.current += dt;
        uniforms.u_time.value = timeRef.current;
      }
      prevTimestampRef.current = isPlayingRef.current ? timestamp : 0;

      renderer.render(scene, camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      renderer.dispose();
      geometry.dispose();
      material.dispose();
      wireMat.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [isWebGLSupported]);

  return {
    containerRef,
    resetCamera,
    webglSupported: isWebGLSupported,
  };
}
