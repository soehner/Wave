/**
 * GLSL Vertex Shader fuer die Wellengleichung mit Mehrquellen-Superposition
 *
 * Pro Quelle i: z_i(x,y,t) = A_i * exp(-d_i*r) * sin(k_i*r - w_i*t + phi_i)
 * Superposition: z_total = sum_i z_i  (Beitraege aller Quellen addiert)
 *
 * Quellentypen bestimmen die Abstandsberechnung r:
 *   POINT (0):    r = Abstand zum Quellpunkt
 *   CIRCLE (1):   r = |Abstand zum Mittelpunkt - Kreisradius|
 *   BAR (2):      r = kuerzester Abstand zur Linienstrecke (entlang Y)
 *   TRIANGLE (3): r = kuerzester Abstand zur Dreieckskontur
 *
 * Reflexion (PROJ-15): Spiegelquellen-Methode
 *   u_reflectionType: 0 = aus, 1 = festes Ende (Phase +pi), 2 = loses Ende (Phase +0)
 *   u_reflectionWallX: X-Position der Reflexionswand
 *   u_reflectionDisplayMode: 0 = total (einfallend+reflektiert), 1 = nur einfallend, 2 = nur reflektiert
 *
 * PROJ-16: Mausgesteuerte Wellenausbreitung
 *   Bei aktivem Mouse-Tracking wird die Sinuswelle der gesteuerten Quelle
 *   deaktiviert. Stattdessen propagiert die Z-History (Ringpuffer) als Welle
 *   nach aussen. Nur Daempfung bleibt als Parameter relevant.
 */
export const waveVertexShader = /* glsl */ `
  uniform float u_time;

  // Per-Source Wellenparameter (Arrays der Laenge 16 fuer Original + Spiegelquellen)
  uniform float u_amplitudes[16];
  uniform float u_waveNumbers[16];    // k = 2pi / lambda
  uniform float u_angularFreqs[16];   // omega = 2pi * f
  uniform float u_phases[16];         // phi
  uniform float u_dampings[16];       // d (Daempfungskonstante, 1/m)

  // Quellenparameter
  uniform int u_sourceType;      // 0=POINT, 1=CIRCLE, 2=BAR, 3=TRIANGLE
  uniform int u_sourceCount;     // 1..16
  uniform vec2 u_sourcePositions[16];
  uniform float u_sourceZ[16];   // Z-Hoehe jeder Quelle (PROJ-16)

  // Reflexion (PROJ-15)
  uniform int u_reflectionType;         // 0=aus, 1=festes Ende, 2=loses Ende
  uniform float u_reflectionWallX;      // X-Position der Wand
  uniform int u_reflectionDisplayMode;  // 0=total, 1=nur einfallend, 2=nur reflektiert

  // PROJ-16: Mausgesteuerte Wellenausbreitung (Z-History Ringpuffer)
  uniform float u_zHistory[256];       // Ringpuffer der letzten 256 Z-Werte
  uniform int u_zHistoryHead;          // Index des juengsten Samples
  uniform float u_zHistoryDt;          // Zeitintervall zwischen Samples (s)
  uniform int u_mouseTrackingSource;   // -1 = aus, 0..7 = Einzelquelle, 8 = alle Quellen

  varying float v_displacement;

  // Konstanten fuer Quellenformen
  const float CIRCLE_RADIUS = 1.0;
  const float BAR_HALF_LENGTH = 2.0;
  const float TRI_SIZE = 1.5;

  // Abstand von Punkt p zur Strecke a-b (muss vor distanceToSource stehen)
  float distToSegment(vec2 p, vec2 a, vec2 b) {
    vec2 ab = b - a;
    float t = clamp(dot(p - a, ab) / dot(ab, ab), 0.0, 1.0);
    return length(p - (a + t * ab));
  }

  float distanceToSource(vec2 p, vec2 srcPos) {
    vec2 rel = p - srcPos;

    if (u_sourceType == 0) {
      // POINT: euklidischer Abstand
      return length(rel);
    }
    else if (u_sourceType == 1) {
      // CIRCLE: Abstand zum Kreisring
      return abs(length(rel) - CIRCLE_RADIUS);
    }
    else if (u_sourceType == 2) {
      // BAR: kuerzester Abstand zu vertikaler Linienstrecke
      float clampedY = clamp(rel.y, -BAR_HALF_LENGTH, BAR_HALF_LENGTH);
      return length(vec2(rel.x, rel.y - clampedY));
    }
    else {
      // TRIANGLE: Abstand zur gleichseitigen Dreieckskontur
      vec2 a = srcPos + vec2(0.0, TRI_SIZE);
      vec2 b = srcPos + vec2(-TRI_SIZE * 0.866, -TRI_SIZE * 0.5);
      vec2 c = srcPos + vec2( TRI_SIZE * 0.866, -TRI_SIZE * 0.5);
      float d1 = distToSegment(p, a, b);
      float d2 = distToSegment(p, b, c);
      float d3 = distToSegment(p, c, a);
      return min(min(d1, d2), d3);
    }
  }

  void main() {
    float z = 0.0;
    float sumMaxAmp = 0.0;

    // Bestimme effektive Quellenanzahl basierend auf Reflexionsmodus
    int effectiveCount = u_sourceCount;
    int originalCount = u_sourceCount;

    // Bei Reflexion: Originalquellen sind 0..originalCount-1,
    // Spiegelquellen sind originalCount..effectiveCount-1
    if (u_reflectionType > 0) {
      originalCount = u_sourceCount / 2;
      effectiveCount = u_sourceCount;
    }

    // BUG-2 Fix: Normierung nur mit Originalquellen-Amplituden
    for (int i = 0; i < 16; i++) {
      if (i >= originalCount) break;
      sumMaxAmp += u_amplitudes[i];
    }

    // Sinuswellen-Superposition (fuer alle Quellen AUSSER mausgesteuerte)
    for (int i = 0; i < 16; i++) {
      if (i >= effectiveCount) break;

      // PROJ-16: Sinuswelle fuer mausgesteuerte Quelle(n) ueberspringen
      // Wert 8 = alle Quellen tracken (keine Sinuswellen)
      if (u_mouseTrackingSource >= 0) {
        if (u_mouseTrackingSource == 8) continue;
        if (i == u_mouseTrackingSource) continue;
        if (u_reflectionType > 0 && i == originalCount + u_mouseTrackingSource) continue;
      }

      // Bestimme ob diese Quelle einfallend oder reflektiert ist
      bool isReflected = (u_reflectionType > 0) && (i >= originalCount);

      // Displaymode-Filter
      if (u_reflectionDisplayMode == 1 && isReflected) continue;  // nur einfallend
      if (u_reflectionDisplayMode == 2 && !isReflected) continue; // nur reflektiert

      // BUG-3 Fix: Wand-Clipping -- Wellen nur auf der Quellenseite der Wand
      if (u_reflectionType > 0) {
        bool sourceIsLeft = u_sourcePositions[i].x < u_reflectionWallX;
        bool vertexIsLeft = position.x < u_reflectionWallX;
        if (isReflected) {
          if (sourceIsLeft == vertexIsLeft) continue;
        } else {
          if (sourceIsLeft != vertexIsLeft) continue;
        }
      }

      float r2d = distanceToSource(position.xy, u_sourcePositions[i]);
      float r = r2d;
      float envelope = exp(-u_dampings[i] * r);

      // Wellenfront: Welle breitet sich mit v = omega/k aus
      float waveSpeed = u_angularFreqs[i] / max(u_waveNumbers[i], 0.001);
      float wavefrontR = waveSpeed * u_time;
      float mask = 1.0 - smoothstep(wavefrontR - 0.3, wavefrontR + 0.1, r);

      z += u_amplitudes[i] * envelope * sin(u_waveNumbers[i] * r - u_angularFreqs[i] * u_time + u_phases[i]) * mask;
    }

    // PROJ-16: Gauss-Bump fuer Quellen mit Z != 0 (nicht fuer mausgesteuerte Quelle)
    float bumpWidth = 0.8;
    float bumpFactor = 1.0 / (2.0 * bumpWidth * bumpWidth);
    for (int i = 0; i < 16; i++) {
      if (i >= effectiveCount) break;
      // PROJ-16: Gauss-Bump fuer mausgesteuerte Quelle(n) ueberspringen
      if (u_mouseTrackingSource >= 0) {
        if (u_mouseTrackingSource == 8) continue;
        if (i == u_mouseTrackingSource) continue;
        if (u_reflectionType > 0 && i == originalCount + u_mouseTrackingSource) continue;
      }
      float sz = u_sourceZ[i];
      if (abs(sz) > 0.01) {
        float rd = distanceToSource(position.xy, u_sourcePositions[i]);
        z += sz * exp(-rd * rd * bumpFactor);
      }
    }

    // PROJ-16: Mausgesteuerte Wellenausbreitung aus Z-History-Ringpuffer
    // Jeder Oberflaechenpunkt empfaengt den Z-Wert, der zum Zeitpunkt
    // (jetzt - Laufzeit) an der Quelle herrschte: z(r) = zHistory(t - r/v)
    // Wert 8 bei u_mouseTrackingSource = alle Originalquellen nutzen Z-History.
    if (u_mouseTrackingSource >= 0) {
      for (int histI = 0; histI < 8; histI++) {
        // Bestimme ob diese Quelle Z-History nutzt
        bool useHistory = false;
        if (u_mouseTrackingSource < 8) {
          if (histI == u_mouseTrackingSource) useHistory = true;
        } else {
          // u_mouseTrackingSource == 8: alle Originalquellen
          if (histI < originalCount) useHistory = true;
        }
        if (!useHistory) continue;

        vec2 trackPos = u_sourcePositions[histI];
        float trackWaveSpeed = u_angularFreqs[histI] / max(u_waveNumbers[histI], 0.001);

        // Einfallende History-Welle
        bool emitIncident = true;
        if (u_reflectionType > 0) {
          if (u_reflectionDisplayMode == 2) {
            emitIncident = false;
          } else {
            bool srcIsLeft = trackPos.x < u_reflectionWallX;
            bool vtxIsLeft = position.x < u_reflectionWallX;
            if (srcIsLeft != vtxIsLeft) emitIncident = false;
          }
        }

        if (emitIncident) {
          float r = distanceToSource(position.xy, trackPos);
          float envelope = exp(-u_dampings[histI] * r);
          float samplesBackF = r / max(trackWaveSpeed, 0.1) / max(u_zHistoryDt, 0.0001);
          float clampedF = clamp(samplesBackF, 0.0, 255.0);
          int s0 = int(floor(clampedF));

          if (s0 >= 255) {
            int oldIdx = u_zHistoryHead - 255;
            if (oldIdx < 0) oldIdx += 256;
            float oldVal = 0.0;
            for (int j = 0; j < 256; j++) {
              if (j == oldIdx) oldVal = u_zHistory[j];
            }
            z += envelope * oldVal;
          } else {
            float frac = clampedF - float(s0);
            int idx0 = u_zHistoryHead - s0;
            if (idx0 < 0) idx0 += 256;
            int idx1 = u_zHistoryHead - s0 - 1;
            if (idx1 < 0) idx1 += 256;

            float z0h = 0.0;
            float z1h = 0.0;
            for (int j = 0; j < 256; j++) {
              if (j == idx0) z0h = u_zHistory[j];
              if (j == idx1) z1h = u_zHistory[j];
            }
            z += envelope * (z0h + frac * (z1h - z0h));
          }
        }

        // Reflektierte History-Welle (Spiegelquellen-Methode)
        if (u_reflectionType > 0 && u_reflectionDisplayMode != 1) {
          vec2 mirrorPos = vec2(2.0 * u_reflectionWallX - trackPos.x, trackPos.y);
          bool mirrorIsLeft = mirrorPos.x < u_reflectionWallX;
          bool vtxIsLeft2 = position.x < u_reflectionWallX;

          if (mirrorIsLeft != vtxIsLeft2) {
            float rMirror = distanceToSource(position.xy, mirrorPos);
            float envelopeM = exp(-u_dampings[histI] * rMirror);
            float samplesBackMF = rMirror / max(trackWaveSpeed, 0.1) / max(u_zHistoryDt, 0.0001);
            float reflSign = (u_reflectionType == 1) ? -1.0 : 1.0;

            if (samplesBackMF >= 0.0 && samplesBackMF < 255.0) {
              int sm0 = int(floor(samplesBackMF));
              float fracM = samplesBackMF - float(sm0);
              int midx0 = u_zHistoryHead - sm0;
              if (midx0 < 0) midx0 += 256;
              int midx1 = u_zHistoryHead - sm0 - 1;
              if (midx1 < 0) midx1 += 256;

              float mz0 = 0.0;
              float mz1 = 0.0;
              for (int j = 0; j < 256; j++) {
                if (j == midx0) mz0 = u_zHistory[j];
                if (j == midx1) mz1 = u_zHistory[j];
              }
              z += envelopeM * reflSign * (mz0 + fracM * (mz1 - mz0));
            }
          }
        }
      } // end histI loop
    }

    // Normierung
    // Hinweis: kein spezieller Override fuer Mouse-Tracking -- Z-History-Werte saturieren
    // bei Bedarf (clamp), aber andere Quellen bleiben voll sichtbar (PROJ-16 Bugfix)
    float normFactor = max(sumMaxAmp, 0.001);
    v_displacement = clamp(z / normFactor, -1.0, 1.0);

    vec3 newPosition = vec3(position.x, position.y, z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

/**
 * GLSL Fragment Shader fuer die Farbskala
 * Blau (Tal) -> Weiss (Null) -> Rot (Berg)
 */
export const waveFragmentShader = /* glsl */ `
  varying float v_displacement;

  void main() {
    vec3 color;

    if (v_displacement > 0.0) {
      color = mix(vec3(1.0, 1.0, 1.0), vec3(0.9, 0.2, 0.15), v_displacement);
    } else {
      color = mix(vec3(1.0, 1.0, 1.0), vec3(0.15, 0.35, 0.85), -v_displacement);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;
