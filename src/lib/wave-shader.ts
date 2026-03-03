/**
 * GLSL Vertex Shader für die Wellengleichung
 * z(x, y, t) = A * exp(-d * r) * sin(k * r - ω * t + φ)
 * mit r = √(x² + y²)
 */
export const waveVertexShader = /* glsl */ `
  uniform float u_time;
  uniform float u_amplitude;
  uniform float u_waveNumber;    // k = 2π / λ
  uniform float u_angularFreq;   // ω = 2π · f
  uniform float u_phase;         // φ
  uniform float u_damping;       // d (Dämpfungskonstante, 1/m)

  varying float v_displacement;

  void main() {
    float r = length(position.xy);
    float envelope = exp(-u_damping * r);
    float z = u_amplitude * envelope * sin(u_waveNumber * r - u_angularFreq * u_time + u_phase);

    v_displacement = z / max(u_amplitude * envelope, 0.001); // normiert auf [-1, 1]

    vec3 newPosition = vec3(position.x, position.y, z);
    gl_Position = projectionMatrix * modelViewMatrix * vec4(newPosition, 1.0);
  }
`;

/**
 * GLSL Fragment Shader für die Farbskala
 * Blau (Tal) → Weiß (Null) → Rot (Berg)
 */
export const waveFragmentShader = /* glsl */ `
  varying float v_displacement;

  void main() {
    vec3 color;

    if (v_displacement > 0.0) {
      // Positiv: Weiß → Rot
      color = mix(vec3(1.0, 1.0, 1.0), vec3(0.9, 0.2, 0.15), v_displacement);
    } else {
      // Negativ: Weiß → Blau
      color = mix(vec3(1.0, 1.0, 1.0), vec3(0.15, 0.35, 0.85), -v_displacement);
    }

    gl_FragColor = vec4(color, 1.0);
  }
`;
