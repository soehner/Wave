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
 */
export const waveVertexShader = /* glsl */ `
  uniform float u_time;

  // Per-Source Wellenparameter (Arrays der Laenge 8)
  uniform float u_amplitudes[8];
  uniform float u_waveNumbers[8];    // k = 2pi / lambda
  uniform float u_angularFreqs[8];   // omega = 2pi * f
  uniform float u_phases[8];         // phi
  uniform float u_dampings[8];       // d (Daempfungskonstante, 1/m)

  // Quellenparameter
  uniform int u_sourceType;      // 0=POINT, 1=CIRCLE, 2=BAR, 3=TRIANGLE
  uniform int u_sourceCount;     // 1..8
  uniform vec2 u_sourcePositions[8];

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

    for (int i = 0; i < 8; i++) {
      if (i >= u_sourceCount) break;

      float r = distanceToSource(position.xy, u_sourcePositions[i]);
      float envelope = exp(-u_dampings[i] * r);
      z += u_amplitudes[i] * envelope * sin(u_waveNumbers[i] * r - u_angularFreqs[i] * u_time + u_phases[i]);

      sumMaxAmp += u_amplitudes[i];
    }

    // Normierung: Summe der Amplituden als theoretisches Maximum
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
