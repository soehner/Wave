"use client";

import { useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { waveVertexShader, waveFragmentShader } from "@/lib/wave-shader";
import type { WaveUniformArrays } from "@/lib/wave-params";
import type { SourceUniforms } from "@/lib/wave-sources";

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

/** Parameter fuer die 3D-Schnittebene */
export interface CrossSectionPlane3DConfig {
  isActive: boolean;
  orientation: "x" | "y";
  position: number;
}

interface UseWaveAnimationOptions {
  isPlaying: boolean;
  onFpsUpdate?: (fps: number) => void;
  waveUniformArrays?: WaveUniformArrays;
  sourceUniforms?: SourceUniforms;
  crossSectionConfig?: CrossSectionPlane3DConfig;
}

export function useWaveAnimation({
  isPlaying,
  onFpsUpdate,
  waveUniformArrays,
  sourceUniforms,
  crossSectionConfig,
}: UseWaveAnimationOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const uniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const markerGroupRef = useRef<THREE.Group | null>(null);
  const crossSectionGroupRef = useRef<THREE.Group | null>(null);
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

  // Uniform-Arrays aktualisieren wenn sich Parameter aendern
  useEffect(() => {
    if (!uniformsRef.current || !waveUniformArrays) return;
    const u = uniformsRef.current;
    u.u_amplitudes.value = waveUniformArrays.amplitudes;
    u.u_waveNumbers.value = waveUniformArrays.waveNumbers;
    u.u_angularFreqs.value = waveUniformArrays.angularFreqs;
    u.u_phases.value = waveUniformArrays.phases;
    u.u_dampings.value = waveUniformArrays.dampings;
  }, [waveUniformArrays]);

  // Source-Uniforms aktualisieren und Marker-Meshes verwalten
  const sType = sourceUniforms?.sourceType;
  const sCount = sourceUniforms?.sourceCount;
  const sPositions = sourceUniforms?.sourcePositions;

  useEffect(() => {
    if (!uniformsRef.current) return;
    if (sType === undefined || sCount === undefined || !sPositions) return;
    const u = uniformsRef.current;
    u.u_sourceType.value = sType;
    u.u_sourceCount.value = sCount;

    // Positionen in das vec2-Array schreiben
    const posArray = u.u_sourcePositions.value as THREE.Vector2[];
    for (let i = 0; i < 8; i++) {
      if (i < sPositions.length) {
        posArray[i].set(sPositions[i].x, sPositions[i].y);
      } else {
        posArray[i].set(0, 0);
      }
    }

    // Marker-Meshes aktualisieren
    const group = markerGroupRef.current;
    if (!group) return;

    // Alte Marker entfernen
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    const markerMaterial = new THREE.MeshBasicMaterial({
      color: 0xff6600,
      transparent: true,
      opacity: 0.8,
    });
    const lineMaterial = new THREE.LineBasicMaterial({
      color: 0xff6600,
      linewidth: 2,
    });

    const CIRCLE_RADIUS = 1.0;
    const BAR_HALF_LENGTH = 2.0;
    const TRI_SIZE = 1.5;

    for (let i = 0; i < sCount; i++) {
      const pos = sPositions[i];
      if (!pos) continue;

      if (sType === 0) {
        // POINT: kleine Kugel
        const geo = new THREE.SphereGeometry(0.12, 16, 16);
        const marker = new THREE.Mesh(geo, markerMaterial.clone());
        marker.position.set(pos.x, pos.y, 0);
        group.add(marker);
      } else if (sType === 1) {
        // CIRCLE: Ring
        const curve = new THREE.EllipseCurve(0, 0, CIRCLE_RADIUS, CIRCLE_RADIUS, 0, Math.PI * 2, false, 0);
        const pts = curve.getPoints(64);
        const geo = new THREE.BufferGeometry().setFromPoints(
          pts.map((p) => new THREE.Vector3(p.x + pos.x, p.y + pos.y, 0))
        );
        const line = new THREE.Line(geo, lineMaterial.clone());
        group.add(line);
      } else if (sType === 2) {
        // BAR: vertikale Linie
        const pts = [
          new THREE.Vector3(pos.x, pos.y - BAR_HALF_LENGTH, 0),
          new THREE.Vector3(pos.x, pos.y + BAR_HALF_LENGTH, 0),
        ];
        const geo = new THREE.BufferGeometry().setFromPoints(pts);
        const line = new THREE.Line(geo, lineMaterial.clone());
        group.add(line);
      } else {
        // TRIANGLE: gleichseitiges Dreieck
        const a = new THREE.Vector3(pos.x, pos.y + TRI_SIZE, 0);
        const b = new THREE.Vector3(pos.x - TRI_SIZE * 0.866, pos.y - TRI_SIZE * 0.5, 0);
        const c = new THREE.Vector3(pos.x + TRI_SIZE * 0.866, pos.y - TRI_SIZE * 0.5, 0);
        const geo = new THREE.BufferGeometry().setFromPoints([a, b, c, a]);
        const line = new THREE.Line(geo, lineMaterial.clone());
        group.add(line);
      }
    }
  }, [sType, sCount, sPositions]);

  // 3D-Schnittebene verwalten
  const csActive = crossSectionConfig?.isActive ?? false;
  const csOrientation = crossSectionConfig?.orientation ?? "x";
  const csPosition = crossSectionConfig?.position ?? 0;

  useEffect(() => {
    const group = crossSectionGroupRef.current;
    if (!group) return;

    // Alte Objekte entfernen
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Line) {
        child.geometry.dispose();
        if (Array.isArray(child.material)) {
          child.material.forEach((m) => m.dispose());
        } else {
          child.material.dispose();
        }
      }
    }

    if (!csActive) return;

    // Halbtransparente Schnittebene
    const planeGeo = new THREE.PlaneGeometry(PLANE_SIZE, 4);
    const planeMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
      depthWrite: false,
    });
    const planeMesh = new THREE.Mesh(planeGeo, planeMat);

    if (csOrientation === "x") {
      // Ebene senkrecht zur X-Achse: steht in der YZ-Ebene bei x = csPosition
      planeMesh.rotation.y = Math.PI / 2;
      planeMesh.position.set(csPosition, 0, 0);
    } else {
      // Ebene senkrecht zur Y-Achse: steht in der XZ-Ebene bei y = csPosition
      planeMesh.rotation.x = Math.PI / 2;
      planeMesh.position.set(0, csPosition, 0);
    }

    group.add(planeMesh);

    // Kontrastreiche Linie an der Schnittposition auf der z=0-Ebene
    const halfSize = PLANE_SIZE / 2;
    const linePoints = csOrientation === "x"
      ? [
          new THREE.Vector3(csPosition, -halfSize, 0),
          new THREE.Vector3(csPosition, halfSize, 0),
        ]
      : [
          new THREE.Vector3(-halfSize, csPosition, 0),
          new THREE.Vector3(halfSize, csPosition, 0),
        ];

    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x00ffff,
      linewidth: 2,
    });
    const line = new THREE.Line(lineGeo, lineMat);
    group.add(line);
  }, [csActive, csOrientation, csPosition]);

  const resetCamera = useCallback(() => {
    if (cameraRef.current && controlsRef.current) {
      cameraRef.current.position.copy(DEFAULT_CAMERA_POSITION);
      controlsRef.current.target.copy(DEFAULT_CAMERA_TARGET);
      controlsRef.current.update();
    }
  }, []);

  const resetTime = useCallback(() => {
    timeRef.current = 0;
    prevTimestampRef.current = 0;
    if (uniformsRef.current) {
      uniformsRef.current.u_time.value = 0;
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
    sceneRef.current = scene;

    // Quellenmarker-Gruppe
    const markerGroup = new THREE.Group();
    scene.add(markerGroup);
    markerGroupRef.current = markerGroup;

    // Schnittebenen-Gruppe
    const crossSectionGroup = new THREE.Group();
    scene.add(crossSectionGroup);
    crossSectionGroupRef.current = crossSectionGroup;

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
    const defaultPositions = Array.from({ length: 8 }, () => new THREE.Vector2(0, 0));
    const zeros = [0, 0, 0, 0, 0, 0, 0, 0];
    const uniforms = {
      u_time: { value: 0.0 },
      u_amplitudes: { value: [1.0, ...zeros.slice(1)] },
      u_waveNumbers: { value: [Math.PI, ...zeros.slice(1)] },
      u_angularFreqs: { value: [2 * Math.PI, ...zeros.slice(1)] },
      u_phases: { value: [...zeros] },
      u_dampings: { value: [...zeros] },
      u_sourceType: { value: 0 },
      u_sourceCount: { value: 1 },
      u_sourcePositions: { value: defaultPositions },
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
    resetTime,
    webglSupported: isWebGLSupported,
    /** Geteilte Zeitreferenz fuer die CPU-seitige Schnittberechnung */
    timeRef,
  };
}
