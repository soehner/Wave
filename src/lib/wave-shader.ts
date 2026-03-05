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

  // Reflexion (PROJ-15)
  uniform int u_reflectionType;         // 0=aus, 1=festes Ende, 2=loses Ende
  uniform float u_reflectionWallX;      // X-Position der Wand
  uniform int u_reflectionDisplayMode;  // 0=total, 1=nur einfallend, 2=nur reflektiert

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
    // Spiegelquellen duerfen nicht mitgezaehlt werden, sonst wird
    // die Amplitude bei stehenden Wellen halbiert
    for (int i = 0; i < 16; i++) {
      if (i >= originalCount) break;
      sumMaxAmp += u_amplitudes[i];
    }

    for (int i = 0; i < 16; i++) {
      if (i >= effectiveCount) break;

      // Bestimme ob diese Quelle einfallend oder reflektiert ist
      bool isReflected = (u_reflectionType > 0) && (i >= originalCount);

      // Displaymode-Filter
      if (u_reflectionDisplayMode == 1 && isReflected) continue;  // nur einfallend
      if (u_reflectionDisplayMode == 2 && !isReflected) continue; // nur reflektiert

      // BUG-3 Fix: Wand-Clipping -- Wellen nur auf der Quellenseite der Wand
      // Einfallende Welle: nur auf der gleichen Seite wie die Originalquelle
      // Reflektierte Welle: nur auf der gegenueberliegenden Seite der Spiegelquelle
      //   (= gleiche Seite wie die Originalquelle)
      if (u_reflectionType > 0) {
        bool sourceIsLeft = u_sourcePositions[i].x < u_reflectionWallX;
        bool vertexIsLeft = position.x < u_reflectionWallX;
        if (isReflected) {
          // Spiegelquelle ist auf der Gegenseite -> reflektierte Welle auf der Originalseite
          if (sourceIsLeft == vertexIsLeft) continue;
        } else {
          // Originalquelle -> Welle nur auf ihrer Seite
          if (sourceIsLeft != vertexIsLeft) continue;
        }
      }

      float r = distanceToSource(position.xy, u_sourcePositions[i]);
      float envelope = exp(-u_dampings[i] * r);

      // Wellenfront: Welle breitet sich mit v = omega/k aus
      float waveSpeed = u_angularFreqs[i] / max(u_waveNumbers[i], 0.001);
      float wavefrontR = waveSpeed * u_time;
      float mask = 1.0 - smoothstep(wavefrontR - 0.3, wavefrontR + 0.1, r);

      z += u_amplitudes[i] * envelope * sin(u_waveNumbers[i] * r - u_angularFreqs[i] * u_time + u_phases[i]) * mask;
    }

    // Normierung: Summe der Originalquellen-Amplituden als theoretisches Maximum
    // Damit bleibt konstruktive Interferenz in der Farbskala sichtbar
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
