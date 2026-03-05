"use client";

import { useRef, useEffect, useCallback, useSyncExternalStore } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { waveVertexShader, waveFragmentShader } from "@/lib/wave-shader";
import type { WaveUniformArrays } from "@/lib/wave-params";
import type { SourceUniforms } from "@/lib/wave-sources";
import type { Probe } from "@/hooks/useProbeData";
import { PROBE_COLORS } from "@/hooks/useProbeData";
import type {
  AnnotationsConfig,
  LambdaArrowData,
  NodeLinePoint,
  WavefrontCircle,
  PathDifferenceData,
} from "@/hooks/useAnnotations";
import type { ReflectionConfig } from "@/hooks/useReflection";

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
  onTimeUpdate?: (time: number) => void;
  speedMultiplier?: number;
  waveUniformArrays?: WaveUniformArrays;
  sourceUniforms?: SourceUniforms;
  crossSectionConfig?: CrossSectionPlane3DConfig;
  /** Ansichtsmodus: "3d" (Standard) oder "2d" (Draufsicht) */
  viewMode?: "3d" | "2d";
  /** Callback wenn auf die Wellenoberflaeche geklickt wird (x, y in Metern) */
  onWaveClick?: (x: number, y: number) => void;
  /** Aktive Sonden fuer 3D-Marker-Darstellung */
  probes?: Probe[];
  /** Annotations-Konfiguration (PROJ-10) */
  annotationsConfig?: AnnotationsConfig;
  lambdaArrowData?: LambdaArrowData | null;
  nodeLinePoints?: NodeLinePoint[];
  wavefrontCircles?: WavefrontCircle[];
  pathDifferenceData?: PathDifferenceData | null;
  /** Reflexions-Konfiguration (PROJ-15) */
  reflectionConfig?: ReflectionConfig;
  /** Spiegelquellen-Positionen und Phasenverschiebungen */
  mirrorSources?: Array<{ x: number; y: number; phaseShift: number }>;
}

export function useWaveAnimation({
  isPlaying,
  onFpsUpdate,
  onTimeUpdate,
  speedMultiplier = 1.0,
  waveUniformArrays,
  sourceUniforms,
  crossSectionConfig,
  viewMode = "3d",
  onWaveClick,
  probes = [],
  annotationsConfig,
  lambdaArrowData,
  nodeLinePoints = [],
  wavefrontCircles = [],
  pathDifferenceData,
  reflectionConfig,
  mirrorSources = [],
}: UseWaveAnimationOptions) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const orthoCameraRef = useRef<THREE.OrthographicCamera | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const uniformsRef = useRef<Record<string, THREE.IUniform> | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const markerGroupRef = useRef<THREE.Group | null>(null);
  const probeMarkerGroupRef = useRef<THREE.Group | null>(null);
  const crossSectionGroupRef = useRef<THREE.Group | null>(null);
  const annotationGroupRef = useRef<THREE.Group | null>(null);
  const reflectionGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const zAxisGroupRef = useRef<THREE.Group | null>(null);
  const animFrameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const prevTimestampRef = useRef<number>(0);
  const isPlayingRef = useRef(isPlaying);
  const onFpsUpdateRef = useRef(onFpsUpdate);
  const onTimeUpdateRef = useRef(onTimeUpdate);
  const speedMultiplierRef = useRef(speedMultiplier);
  const timeUpdateAccRef = useRef(0);
  const lastFrameTimestampRef = useRef(0);
  const fpsCountRef = useRef(0);
  const fpsTimeRef = useRef(0);
  const viewModeRef = useRef(viewMode);
  const saved3DPositionRef = useRef<THREE.Vector3>(DEFAULT_CAMERA_POSITION.clone());
  const saved3DTargetRef = useRef<THREE.Vector3>(DEFAULT_CAMERA_TARGET.clone());
  const activeCameraRef = useRef<THREE.Camera | null>(null);
  const onWaveClickRef = useRef(onWaveClick);
  const meshRef = useRef<THREE.Mesh | null>(null);
  const isWebGLSupported = useSyncExternalStore(subscribeNoop, getWebGLSnapshot, getWebGLServerSnapshot);

  // Refs synchron halten
  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    onFpsUpdateRef.current = onFpsUpdate;
  }, [onFpsUpdate]);

  useEffect(() => {
    onTimeUpdateRef.current = onTimeUpdate;
  }, [onTimeUpdate]);

  useEffect(() => {
    speedMultiplierRef.current = speedMultiplier;
  }, [speedMultiplier]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    onWaveClickRef.current = onWaveClick;
  }, [onWaveClick]);

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
    for (let i = 0; i < 16; i++) {
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

  // Reflexions-Uniforms und Wandmarker aktualisieren (PROJ-15)
  const refActive = reflectionConfig?.isActive ?? false;
  const refWallX = reflectionConfig?.wallX ?? 3.0;
  const refType = reflectionConfig?.endType;
  const refDisplayMode = reflectionConfig?.displayMode;

  useEffect(() => {
    if (!uniformsRef.current) return;
    const u = uniformsRef.current;

    if (!refActive) {
      // Reflexion aus: nur Originalquellen aktiv
      u.u_reflectionType.value = 0;
      u.u_reflectionDisplayMode.value = 0;

      // sourceCount auf Originalanzahl zuruecksetzen
      if (sCount !== undefined) {
        u.u_sourceCount.value = sCount;
      }
      return;
    }

    // Reflexion aktiv
    u.u_reflectionType.value = refType === "fixed" ? 1 : 2;
    u.u_reflectionWallX.value = refWallX;
    u.u_reflectionDisplayMode.value =
      refDisplayMode === "incident" ? 1 : refDisplayMode === "reflected" ? 2 : 0;

    // Spiegelquellen in die Uniform-Arrays einfuegen
    const origCount = sCount ?? 0;
    const totalCount = origCount + mirrorSources.length;
    u.u_sourceCount.value = totalCount;

    const posArray = u.u_sourcePositions.value as THREE.Vector2[];
    const phases = u.u_phases.value as number[];
    const amplitudes = u.u_amplitudes.value as number[];
    const waveNumbers = u.u_waveNumbers.value as number[];
    const angularFreqs = u.u_angularFreqs.value as number[];
    const dampings = u.u_dampings.value as number[];

    for (let i = 0; i < mirrorSources.length; i++) {
      const idx = origCount + i;
      if (idx >= 16) break;
      const mirror = mirrorSources[i];
      posArray[idx].set(mirror.x, mirror.y);
      // Spiegelquelle erbt Parameter der Originalquelle + Phasenverschiebung
      const origIdx = i < origCount ? i : 0;
      phases[idx] = (phases[origIdx] ?? 0) + mirror.phaseShift;
      amplitudes[idx] = amplitudes[origIdx] ?? 0;
      waveNumbers[idx] = waveNumbers[origIdx] ?? 0;
      angularFreqs[idx] = angularFreqs[origIdx] ?? 0;
      dampings[idx] = dampings[origIdx] ?? 0;
    }
  }, [refActive, refWallX, refType, refDisplayMode, mirrorSources, sCount]);

  // Reflexionswand-Marker und Spiegelquellen-Marker (PROJ-15)
  useEffect(() => {
    const group = reflectionGroupRef.current;
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

    if (!refActive) return;

    const halfSize = PLANE_SIZE / 2;

    // Wandlinie (Cyan, volle Y-Breite)
    const wallPts = [
      new THREE.Vector3(refWallX, -halfSize, 0),
      new THREE.Vector3(refWallX, halfSize, 0),
      new THREE.Vector3(refWallX, halfSize, 2),
      new THREE.Vector3(refWallX, -halfSize, 2),
      new THREE.Vector3(refWallX, -halfSize, 0),
    ];
    const wallGeo = new THREE.BufferGeometry().setFromPoints(wallPts);
    const wallMat = new THREE.LineBasicMaterial({ color: 0x00cccc, linewidth: 2 });
    const wallLine = new THREE.Line(wallGeo, wallMat);
    group.add(wallLine);

    // Bodenlinie der Wand (zusaetzliche Sichtbarkeit)
    const wallFloorPts = [
      new THREE.Vector3(refWallX, -halfSize, 0),
      new THREE.Vector3(refWallX, halfSize, 0),
    ];
    const wallFloorGeo = new THREE.BufferGeometry().setFromPoints(wallFloorPts);
    const wallFloorMat = new THREE.LineBasicMaterial({ color: 0x00ffff, linewidth: 2 });
    const wallFloorLine = new THREE.Line(wallFloorGeo, wallFloorMat);
    wallFloorLine.renderOrder = 990;
    group.add(wallFloorLine);

    // Spiegelquellen-Marker (transparent)
    for (const mirror of mirrorSources) {
      const markerGeo = new THREE.SphereGeometry(0.12, 16, 16);
      const markerMat = new THREE.MeshBasicMaterial({
        color: 0xff6600,
        transparent: true,
        opacity: 0.4,
      });
      const marker = new THREE.Mesh(markerGeo, markerMat);
      marker.position.set(mirror.x, mirror.y, 0);
      group.add(marker);
    }
  }, [refActive, refWallX, mirrorSources]);

  // Sondenmarker aktualisieren
  useEffect(() => {
    const group = probeMarkerGroupRef.current;
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

    for (let i = 0; i < probes.length; i++) {
      const probe = probes[i];
      const color = new THREE.Color(PROBE_COLORS[i] || probe.color);

      // Weisser Kreis mit farbigem Rand
      const ringGeo = new THREE.RingGeometry(0.12, 0.18, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.9,
        depthTest: false,
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.position.set(probe.x, probe.y, 0.01);
      ring.renderOrder = 999;
      group.add(ring);

      // Innerer weisser Punkt
      const dotGeo = new THREE.CircleGeometry(0.12, 32);
      const dotMat = new THREE.MeshBasicMaterial({
        color: 0xffffff,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.85,
        depthTest: false,
      });
      const dot = new THREE.Mesh(dotGeo, dotMat);
      dot.position.set(probe.x, probe.y, 0.01);
      dot.renderOrder = 998;
      group.add(dot);
    }
  }, [probes]);

  // Annotations-3D-Geometrie aktualisieren (PROJ-10)
  useEffect(() => {
    const group = annotationGroupRef.current;
    if (!group) return;

    // Alte Annotations-Objekte entfernen
    while (group.children.length > 0) {
      const child = group.children[0];
      group.remove(child);
      if (child instanceof THREE.Mesh || child instanceof THREE.Line || child instanceof THREE.Sprite) {
        if ("geometry" in child && child.geometry) {
          (child.geometry as THREE.BufferGeometry).dispose();
        }
        if ("material" in child) {
          const mat = child.material;
          if (Array.isArray(mat)) {
            mat.forEach((m) => m.dispose());
          } else if (mat && typeof mat === "object" && "dispose" in mat) {
            (mat as THREE.Material).dispose();
          }
        }
      }
    }

    if (!annotationsConfig) return;

    // --- Lambda-Pfeil ---
    if (annotationsConfig.showLambdaArrow && lambdaArrowData) {
      const { startX, endX, y, lambda } = lambdaArrowData;
      const arrowZ = 0.05; // leicht ueber der Ebene

      // Hauptlinie
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(startX, y, arrowZ),
        new THREE.Vector3(endX, y, arrowZ),
      ]);
      const lineMat = new THREE.LineBasicMaterial({ color: 0x3366cc, linewidth: 2 });
      group.add(new THREE.Line(lineGeo, lineMat));

      // Pfeilspitzen (einfache Dreiecke)
      const arrowSize = 0.15;
      // Linke Pfeilspitze (nach links)
      const leftArrowGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(startX, y, arrowZ),
        new THREE.Vector3(startX + arrowSize, y + arrowSize * 0.5, arrowZ),
        new THREE.Vector3(startX + arrowSize, y - arrowSize * 0.5, arrowZ),
        new THREE.Vector3(startX, y, arrowZ),
      ]);
      group.add(new THREE.Line(leftArrowGeo, lineMat.clone()));

      // Rechte Pfeilspitze (nach rechts)
      const rightArrowGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(endX, y, arrowZ),
        new THREE.Vector3(endX - arrowSize, y + arrowSize * 0.5, arrowZ),
        new THREE.Vector3(endX - arrowSize, y - arrowSize * 0.5, arrowZ),
        new THREE.Vector3(endX, y, arrowZ),
      ]);
      group.add(new THREE.Line(rightArrowGeo, lineMat.clone()));

      // Vertikale Begrenzungslinien
      const tickHeight = 0.3;
      const leftTickGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(startX, y - tickHeight, arrowZ),
        new THREE.Vector3(startX, y + tickHeight, arrowZ),
      ]);
      group.add(new THREE.Line(leftTickGeo, lineMat.clone()));

      const rightTickGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(endX, y - tickHeight, arrowZ),
        new THREE.Vector3(endX, y + tickHeight, arrowZ),
      ]);
      group.add(new THREE.Line(rightTickGeo, lineMat.clone()));

      // Label: "lambda = X.X m"
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#3366cc";
      ctx.font = "bold 36px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`\u03BB = ${lambda.toFixed(2)} m`, 128, 32);

      const tex = new THREE.CanvasTexture(canvas);
      const spriteMat = new THREE.SpriteMaterial({ map: tex, depthTest: false });
      const sprite = new THREE.Sprite(spriteMat);
      sprite.position.set((startX + endX) / 2, y + 0.6, arrowZ);
      sprite.scale.set(2.0, 0.5, 1);
      sprite.renderOrder = 1000;
      group.add(sprite);
    }

    // --- Knotenlinien ---
    if (annotationsConfig.showNodeLines && nodeLinePoints.length > 0) {
      const nodeMat = new THREE.PointsMaterial({
        color: 0xffffff,
        size: 0.08,
        transparent: true,
        opacity: 0.7,
        depthTest: false,
      });

      const positions = new Float32Array(nodeLinePoints.length * 3);
      for (let i = 0; i < nodeLinePoints.length; i++) {
        positions[i * 3] = nodeLinePoints[i].x;
        positions[i * 3 + 1] = nodeLinePoints[i].y;
        positions[i * 3 + 2] = 0.02;
      }

      const nodeGeo = new THREE.BufferGeometry();
      nodeGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const points = new THREE.Points(nodeGeo, nodeMat);
      points.renderOrder = 990;
      group.add(points);
    }

    // --- Wellenfront-Kreise ---
    if (annotationsConfig.showWavefronts && wavefrontCircles.length > 0) {
      const wavefrontMat = new THREE.LineBasicMaterial({
        color: 0xffaa00,
        transparent: true,
        opacity: 0.5,
        linewidth: 1,
      });

      for (const circle of wavefrontCircles) {
        const curve = new THREE.EllipseCurve(
          circle.cx, circle.cy,
          circle.radius, circle.radius,
          0, Math.PI * 2,
          false, 0
        );
        const pts = curve.getPoints(64);
        const circleGeo = new THREE.BufferGeometry().setFromPoints(
          pts.map((p) => new THREE.Vector3(p.x, p.y, 0.01))
        );
        const line = new THREE.Line(circleGeo, wavefrontMat.clone());
        line.renderOrder = 985;
        group.add(line);
      }
    }

    // --- Gangunterschied ---
    if (annotationsConfig.showPathDifference && pathDifferenceData) {
      const { source1, source2, target, r1, r2, deltaS, deltaSLambda: dsL } = pathDifferenceData;
      const pathZ = 0.05;

      const dashMat = new THREE.LineDashedMaterial({
        color: 0xff4444,
        dashSize: 0.2,
        gapSize: 0.1,
        linewidth: 1,
      });

      // Linie von Quelle 1 zum Zielpunkt
      const line1Geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(source1.x, source1.y, pathZ),
        new THREE.Vector3(target.x, target.y, pathZ),
      ]);
      const line1 = new THREE.Line(line1Geo, dashMat);
      line1.computeLineDistances();
      line1.renderOrder = 995;
      group.add(line1);

      // Linie von Quelle 2 zum Zielpunkt
      const line2Geo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(source2.x, source2.y, pathZ),
        new THREE.Vector3(target.x, target.y, pathZ),
      ]);
      const line2Mat = new THREE.LineDashedMaterial({
        color: 0x44aaff,
        dashSize: 0.2,
        gapSize: 0.1,
        linewidth: 1,
      });
      const line2 = new THREE.Line(line2Geo, line2Mat);
      line2.computeLineDistances();
      line2.renderOrder = 995;
      group.add(line2);

      // r1-Label
      const r1Canvas = document.createElement("canvas");
      r1Canvas.width = 192;
      r1Canvas.height = 48;
      const r1Ctx = r1Canvas.getContext("2d")!;
      r1Ctx.fillStyle = "#ff4444";
      r1Ctx.font = "bold 28px sans-serif";
      r1Ctx.textAlign = "center";
      r1Ctx.textBaseline = "middle";
      r1Ctx.fillText(`r\u2081 = ${r1.toFixed(2)} m`, 96, 24);
      const r1Tex = new THREE.CanvasTexture(r1Canvas);
      const r1Sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: r1Tex, depthTest: false }));
      r1Sprite.position.set(
        (source1.x + target.x) / 2,
        (source1.y + target.y) / 2 + 0.4,
        pathZ + 0.1
      );
      r1Sprite.scale.set(1.5, 0.4, 1);
      r1Sprite.renderOrder = 1000;
      group.add(r1Sprite);

      // r2-Label
      const r2Canvas = document.createElement("canvas");
      r2Canvas.width = 192;
      r2Canvas.height = 48;
      const r2Ctx = r2Canvas.getContext("2d")!;
      r2Ctx.fillStyle = "#44aaff";
      r2Ctx.font = "bold 28px sans-serif";
      r2Ctx.textAlign = "center";
      r2Ctx.textBaseline = "middle";
      r2Ctx.fillText(`r\u2082 = ${r2.toFixed(2)} m`, 96, 24);
      const r2Tex = new THREE.CanvasTexture(r2Canvas);
      const r2Sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: r2Tex, depthTest: false }));
      r2Sprite.position.set(
        (source2.x + target.x) / 2,
        (source2.y + target.y) / 2 + 0.4,
        pathZ + 0.1
      );
      r2Sprite.scale.set(1.5, 0.4, 1);
      r2Sprite.renderOrder = 1000;
      group.add(r2Sprite);

      // Delta-s-Label am Zielpunkt
      const dsCanvas = document.createElement("canvas");
      dsCanvas.width = 384;
      dsCanvas.height = 48;
      const dsCtx = dsCanvas.getContext("2d")!;
      dsCtx.fillStyle = "#ffffff";
      dsCtx.fillRect(0, 0, 384, 48);
      dsCtx.fillStyle = "#333333";
      dsCtx.font = "bold 24px sans-serif";
      dsCtx.textAlign = "center";
      dsCtx.textBaseline = "middle";
      dsCtx.fillText(`\u0394s = ${deltaS.toFixed(2)} m = ${dsL.toFixed(2)} \u03BB`, 192, 24);
      const dsTex = new THREE.CanvasTexture(dsCanvas);
      const dsSprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: dsTex, depthTest: false }));
      dsSprite.position.set(target.x, target.y - 0.6, pathZ + 0.1);
      dsSprite.scale.set(3.0, 0.4, 1);
      dsSprite.renderOrder = 1001;
      group.add(dsSprite);
    }
  }, [annotationsConfig, lambdaArrowData, nodeLinePoints, wavefrontCircles, pathDifferenceData]);

  // 2D/3D-Ansichtswechsel verwalten
  useEffect(() => {
    const perspCam = cameraRef.current;
    const orthoCam = orthoCameraRef.current;
    const controls = controlsRef.current;
    const renderer = rendererRef.current;
    const crossSectionGroup = crossSectionGroupRef.current;
    const gridHelper = gridHelperRef.current;
    const zAxisGroup = zAxisGroupRef.current;

    if (!perspCam || !orthoCam || !controls || !renderer) return;

    if (viewMode === "2d") {
      // 3D-Kameraposition speichern
      saved3DPositionRef.current.copy(perspCam.position);
      saved3DTargetRef.current.copy(controls.target);

      // Orthokamera ueber dem Mittelpunkt positionieren
      const container = containerRef.current;
      if (container) {
        const aspect = container.clientWidth / container.clientHeight;
        const halfSize = PLANE_SIZE / 2 + 0.5;
        orthoCam.left = -halfSize * aspect;
        orthoCam.right = halfSize * aspect;
        orthoCam.top = halfSize;
        orthoCam.bottom = -halfSize;
        orthoCam.updateProjectionMatrix();
      }
      orthoCam.position.set(0, 0, 20);
      orthoCam.lookAt(0, 0, 0);

      // OrbitControls auf Orthokamera umschalten
      controls.object = orthoCam;
      controls.target.set(0, 0, 0);
      controls.enableRotate = false;
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.update();

      // Aktive Kamera setzen
      activeCameraRef.current = orthoCam;

      // Schnittebenen-3D-Gruppe ausblenden (2D-Diagramm bleibt aktiv)
      if (crossSectionGroup) {
        crossSectionGroup.visible = false;
      }

      // Grid und Z-Achse ausblenden (stoerend in Draufsicht)
      if (gridHelper) {
        gridHelper.visible = false;
      }
      if (zAxisGroup) {
        zAxisGroup.visible = false;
      }
    } else {
      // 3D-Modus: gespeicherte Kameraposition wiederherstellen
      perspCam.position.copy(saved3DPositionRef.current);

      controls.object = perspCam;
      controls.target.copy(saved3DTargetRef.current);
      controls.enableRotate = true;
      controls.enablePan = true;
      controls.enableZoom = true;
      controls.update();

      // Aktive Kamera setzen
      activeCameraRef.current = perspCam;

      // Schnittebenen-3D-Gruppe wieder sichtbar machen (falls aktiv)
      if (crossSectionGroup) {
        crossSectionGroup.visible = true;
      }

      // Grid und Z-Achse wieder anzeigen
      if (gridHelper) {
        gridHelper.visible = true;
      }
      if (zAxisGroup) {
        zAxisGroup.visible = true;
      }

      // Perspektivkamera-AspectRatio aktualisieren
      const container = containerRef.current;
      if (container) {
        perspCam.aspect = container.clientWidth / container.clientHeight;
        perspCam.updateProjectionMatrix();
      }
    }
  }, [viewMode]);

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
    if (controlsRef.current) {
      if (viewModeRef.current === "2d" && orthoCameraRef.current) {
        // Im 2D-Modus: Orthokamera auf Standardposition zuruecksetzen
        const container = containerRef.current;
        if (container) {
          const aspect = container.clientWidth / container.clientHeight;
          const halfSize = PLANE_SIZE / 2 + 0.5;
          const orthoCam = orthoCameraRef.current;
          orthoCam.left = -halfSize * aspect;
          orthoCam.right = halfSize * aspect;
          orthoCam.top = halfSize;
          orthoCam.bottom = -halfSize;
          orthoCam.zoom = 1;
          orthoCam.updateProjectionMatrix();
        }
        orthoCameraRef.current.position.set(0, 0, 20);
        controlsRef.current.target.set(0, 0, 0);
        controlsRef.current.update();
      } else if (cameraRef.current) {
        // Im 3D-Modus: Standardposition
        cameraRef.current.position.copy(DEFAULT_CAMERA_POSITION);
        saved3DPositionRef.current.copy(DEFAULT_CAMERA_POSITION);
        saved3DTargetRef.current.copy(DEFAULT_CAMERA_TARGET);
        controlsRef.current.target.copy(DEFAULT_CAMERA_TARGET);
        controlsRef.current.update();
      }
    }
  }, []);

  const resetTime = useCallback(() => {
    timeRef.current = 0;
    prevTimestampRef.current = 0;
    if (uniformsRef.current) {
      uniformsRef.current.u_time.value = 0;
    }
  }, []);

  /** Einzelbild-Schritt: +1 oder -1 Frame (dt = 1/60 s) */
  const stepFrame = useCallback((direction: 1 | -1) => {
    const dt = 1 / 60;
    timeRef.current = Math.max(0, timeRef.current + dt * direction);
    if (uniformsRef.current) {
      uniformsRef.current.u_time.value = timeRef.current;
    }
    onTimeUpdateRef.current?.(timeRef.current);
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

    // Sondenmarker-Gruppe
    const probeMarkerGroup = new THREE.Group();
    scene.add(probeMarkerGroup);
    probeMarkerGroupRef.current = probeMarkerGroup;

    // Schnittebenen-Gruppe
    const crossSectionGroup = new THREE.Group();
    scene.add(crossSectionGroup);
    crossSectionGroupRef.current = crossSectionGroup;

    // Annotations-Gruppe (PROJ-10)
    const annotationGroup = new THREE.Group();
    scene.add(annotationGroup);
    annotationGroupRef.current = annotationGroup;

    // Reflexions-Gruppe (PROJ-15): Wandmarker + Spiegelquellenmarker
    const reflectionGroup = new THREE.Group();
    scene.add(reflectionGroup);
    reflectionGroupRef.current = reflectionGroup;

    // Kamera (Perspektive fuer 3D)
    const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
    camera.position.copy(DEFAULT_CAMERA_POSITION);
    cameraRef.current = camera;

    // Orthographische Kamera fuer 2D-Draufsicht (einmalig erstellt, bleibt inaktiv)
    const halfSize = PLANE_SIZE / 2 + 0.5;
    const orthoCamera = new THREE.OrthographicCamera(
      -halfSize, halfSize, halfSize, -halfSize, 0.1, 100
    );
    orthoCamera.position.set(0, 0, 20);
    orthoCamera.lookAt(0, 0, 0);
    orthoCameraRef.current = orthoCamera;

    // Aktive Kamera initial auf Perspektive setzen
    activeCameraRef.current = camera;

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
    gridHelperRef.current = gridHelper;

    // Z-Achse und Z-Label in einer Gruppe (im 2D-Modus ausgeblendet)
    const zAxisGroup = new THREE.Group();
    scene.add(zAxisGroup);
    zAxisGroupRef.current = zAxisGroup;

    // Achsenlinien
    const axesLen = PLANE_SIZE / 2 + 1;

    const addAxisLine = (
      from: THREE.Vector3,
      to: THREE.Vector3,
      color: number,
      parent: THREE.Object3D = scene
    ) => {
      const geo = new THREE.BufferGeometry().setFromPoints([from, to]);
      parent.add(new THREE.Line(geo, new THREE.LineBasicMaterial({ color })));
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
      0x3366cc,
      zAxisGroup
    );

    // Achsenbeschriftungen als Sprites
    const addLabel = (text: string, pos: THREE.Vector3, color: string, parent: THREE.Object3D = scene) => {
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
      parent.add(sprite);
    };

    addLabel("X", new THREE.Vector3(axesLen + 0.3, 0, 0), "#cc3333");
    addLabel("Y", new THREE.Vector3(0, axesLen + 0.3, 0), "#33aa33");
    addLabel("Z", new THREE.Vector3(0, 0, 2.3), "#3366cc", zAxisGroup);

    // Wellen-Mesh
    const geometry = new THREE.PlaneGeometry(
      PLANE_SIZE,
      PLANE_SIZE,
      GRID_SEGMENTS,
      GRID_SEGMENTS
    );

    // Initiale Uniform-Werte (Defaults; der separate Effekt ueberschreibt sie sofort)
    const defaultPositions = Array.from({ length: 16 }, () => new THREE.Vector2(0, 0));
    const zeros16 = new Array(16).fill(0);
    const uniforms = {
      u_time: { value: 0.0 },
      u_amplitudes: { value: [1.0, ...zeros16.slice(1)] },
      u_waveNumbers: { value: [Math.PI, ...zeros16.slice(1)] },
      u_angularFreqs: { value: [2 * Math.PI, ...zeros16.slice(1)] },
      u_phases: { value: [...zeros16] },
      u_dampings: { value: [...zeros16] },
      u_sourceType: { value: 0 },
      u_sourceCount: { value: 1 },
      u_sourcePositions: { value: defaultPositions },
      // Reflexion (PROJ-15)
      u_reflectionType: { value: 0 },
      u_reflectionWallX: { value: 3.0 },
      u_reflectionDisplayMode: { value: 0 },
    };
    uniformsRef.current = uniforms;

    const material = new THREE.ShaderMaterial({
      vertexShader: waveVertexShader,
      fragmentShader: waveFragmentShader,
      uniforms,
      side: THREE.DoubleSide,
    });
    const mesh = new THREE.Mesh(geometry, material);
    meshRef.current = mesh;
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

      // Orthokamera-Frustum an Containergroesse anpassen
      const aspect = w / h;
      const orthoHalfSize = PLANE_SIZE / 2 + 0.5;
      orthoCamera.left = -orthoHalfSize * aspect;
      orthoCamera.right = orthoHalfSize * aspect;
      orthoCamera.top = orthoHalfSize;
      orthoCamera.bottom = -orthoHalfSize;
      orthoCamera.updateProjectionMatrix();
    };
    const resizeObserver = new ResizeObserver(handleResize);
    resizeObserver.observe(container);
    handleResize();

    // Raycaster fuer Sonden-Klick
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();
    let pointerDownTime = 0;
    let pointerDownPos = { x: 0, y: 0 };

    const onPointerDown = (e: PointerEvent) => {
      pointerDownTime = performance.now();
      pointerDownPos = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = (e: PointerEvent) => {
      const elapsed = performance.now() - pointerDownTime;
      const moved = Math.hypot(e.clientX - pointerDownPos.x, e.clientY - pointerDownPos.y);

      // Nur kurzer Klick ohne Bewegung (kein Drag/Orbit)
      if (elapsed > 300 || moved > 5) return;
      if (!onWaveClickRef.current) return;

      const rect = renderer.domElement.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      const activeCamera = activeCameraRef.current || camera;
      raycaster.setFromCamera(mouse, activeCamera);

      const intersects = raycaster.intersectObject(mesh);
      if (intersects.length > 0) {
        const point = intersects[0].point;
        // Auf PLANE_SIZE-Grenzen klemmen
        const half = PLANE_SIZE / 2;
        const cx = Math.max(-half, Math.min(half, point.x));
        const cy = Math.max(-half, Math.min(half, point.y));
        onWaveClickRef.current(cx, cy);
      }
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointerup", onPointerUp);

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
        timeRef.current += dt * speedMultiplierRef.current;
        // Ueberlaufschutz: bei > 9999.99 s auf 0 zuruecksetzen
        if (timeRef.current > 9999.99) {
          timeRef.current = 0;
        }
        uniforms.u_time.value = timeRef.current;
      }
      prevTimestampRef.current = isPlayingRef.current ? timestamp : 0;

      // Zeitanzeige-Callback ca. 10x pro Sekunde (alle ~100ms)
      if (onTimeUpdateRef.current && lastFrameTimestampRef.current > 0) {
        timeUpdateAccRef.current += (timestamp - lastFrameTimestampRef.current);
        if (timeUpdateAccRef.current >= 100) {
          timeUpdateAccRef.current = 0;
          onTimeUpdateRef.current(timeRef.current);
        }
      }
      lastFrameTimestampRef.current = timestamp;

      renderer.render(scene, activeCameraRef.current || camera);
    };

    animFrameRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animFrameRef.current);
      resizeObserver.disconnect();
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
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
    stepFrame,
    webglSupported: isWebGLSupported,
    /** Geteilte Zeitreferenz fuer die CPU-seitige Schnittberechnung */
    timeRef,
  };
}
