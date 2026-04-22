// Orb.tsx
//
// Reference R3F component for "Your Korean Friend" — Minji's presence sphere.
// See docs/orb-readme.md for integration guide and docs/prd.md §5.3.1 for spec.
//
// This file intentionally inlines everything (shader, mesh, canvas wrapper) so it
// can be dropped in as a single working unit, then refactored into the component
// structure from section 5.3.1 of the PRD once it's confirmed to render correctly.

import { Canvas, useFrame } from '@react-three/fiber';
import { useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// ---------------------------------------------------------------------------
// Shader code
// ---------------------------------------------------------------------------

const vertexShader = /* glsl */ `
  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;

  void main() {
    vNormal = normalize(normalMatrix * normal);
    vec4 worldPos = modelMatrix * vec4(position, 1.0);
    vWorldPos = worldPos.xyz;
    vLocalPos = position;
    gl_Position = projectionMatrix * viewMatrix * worldPos;
  }
`;

const fragmentShader = /* glsl */ `
  uniform float uTime;
  uniform float uAmplitude;
  uniform float uNoiseSpeed;
  uniform vec3  uBaseColor;
  uniform vec3  uFresnelColor;
  uniform float uFresnelPower;
  uniform float uNoiseScale;
  uniform vec3  uLightDir;

  varying vec3 vNormal;
  varying vec3 vWorldPos;
  varying vec3 vLocalPos;

  // 3D simplex noise (Ashima / Stefan Gustavson). Public domain.
  vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
  vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }

  float snoise(vec3 v) {
    const vec2 C = vec2(1.0/6.0, 1.0/3.0);
    const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
    vec3 i  = floor(v + dot(v, C.yyy));
    vec3 x0 = v - i + dot(i, C.xxx);
    vec3 g = step(x0.yzx, x0.xyz);
    vec3 l = 1.0 - g;
    vec3 i1 = min(g.xyz, l.zxy);
    vec3 i2 = max(g.xyz, l.zxy);
    vec3 x1 = x0 - i1 + C.xxx;
    vec3 x2 = x0 - i2 + C.yyy;
    vec3 x3 = x0 - D.yyy;
    i = mod(i, 289.0);
    vec4 p = permute(permute(permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0));
    float n_ = 1.0/7.0;
    vec3 ns = n_ * D.wyz - D.xzx;
    vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
    vec4 x_ = floor(j * ns.z);
    vec4 y_ = floor(j - 7.0 * x_);
    vec4 x = x_ * ns.x + ns.yyyy;
    vec4 y = y_ * ns.x + ns.yyyy;
    vec4 h = 1.0 - abs(x) - abs(y);
    vec4 b0 = vec4(x.xy, y.xy);
    vec4 b1 = vec4(x.zw, y.zw);
    vec4 s0 = floor(b0)*2.0 + 1.0;
    vec4 s1 = floor(b1)*2.0 + 1.0;
    vec4 sh = -step(h, vec4(0.0));
    vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
    vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
    vec3 p0 = vec3(a0.xy, h.x);
    vec3 p1 = vec3(a0.zw, h.y);
    vec3 p2 = vec3(a1.xy, h.z);
    vec3 p3 = vec3(a1.zw, h.w);
    vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2,p2), dot(p3,p3)));
    p0 *= norm.x; p1 *= norm.y; p2 *= norm.z; p3 *= norm.w;
    vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
    m = m * m;
    return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
  }

  void main() {
    float t = uTime * (uNoiseSpeed + uAmplitude * 0.6);
    // Soft, large cloud-like noise (dominant low-freq layer + gentle high-freq).
    float n1 = snoise(vLocalPos * uNoiseScale + vec3(t * 0.3));
    float n2 = snoise(vLocalPos * uNoiseScale * 1.9 + vec3(t * 0.5));
    float noise = n1 * 0.8 + n2 * 0.2;
    float surfaceLight = smoothstep(-0.6, 0.6, noise);

    // Lambert diffuse so the sphere has a clear light/dark hemisphere.
    vec3 N = normalize(vNormal);
    vec3 L = normalize(uLightDir);
    float lambert = max(dot(N, L), 0.0);
    float ambient = 0.28;
    float lit = ambient + lambert * 0.9;

    // Smoke modulates the lit base: dark patches feel like shadowed cloud,
    // bright patches feel like illuminated cloud peaks.
    vec3 baseLit = uBaseColor * lit;
    vec3 darkBand  = baseLit * 0.55;
    vec3 lightBand = baseLit * 1.55;
    vec3 color = mix(darkBand, lightBand, surfaceLight);

    // Rim/fresnel for atmospheric edge glow.
    vec3 viewDir = normalize(cameraPosition - vWorldPos);
    float fresnel = pow(1.0 - max(dot(viewDir, N), 0.0), uFresnelPower);
    color += uFresnelColor * fresnel * 0.5;

    color *= (1.0 + uAmplitude * 0.15);

    gl_FragColor = vec4(color, 1.0);
  }
`;

// ---------------------------------------------------------------------------
// State-driven uniform values
// ---------------------------------------------------------------------------

export type OrbState =
  | 'idle'
  | 'minji_speaking'
  | 'user_listening'
  | 'user_speaking'
  | 'processing';

interface StateParams {
  noiseSpeed: number;
  scale: number;
  baseColor: THREE.Color;
  fresnelColor: THREE.Color;
}

const STATE_PARAMS: Record<OrbState, StateParams> = {
  idle: {
    noiseSpeed: 0.35,
    scale: 1.0,
    baseColor: new THREE.Color('#6d7f92'),
    fresnelColor: new THREE.Color('#c8d8ea'),
  },
  minji_speaking: {
    noiseSpeed: 0.9,
    scale: 1.02,
    baseColor: new THREE.Color('#7688a0'),
    fresnelColor: new THREE.Color('#d6e4f4'),
  },
  user_listening: {
    noiseSpeed: 0.2,
    scale: 0.98,
    baseColor: new THREE.Color('#64768a'),
    fresnelColor: new THREE.Color('#b8cce0'),
  },
  user_speaking: {
    noiseSpeed: 0.6,
    scale: 1.01,
    baseColor: new THREE.Color('#6a7e94'),
    fresnelColor: new THREE.Color('#c0d4ea'),
  },
  processing: {
    noiseSpeed: 0.45,
    scale: 1.0,
    baseColor: new THREE.Color('#6e8094'),
    fresnelColor: new THREE.Color('#c4d4e6'),
  },
};

// ---------------------------------------------------------------------------
// OrbSphere — the actual mesh
// ---------------------------------------------------------------------------

interface OrbSphereProps {
  state: OrbState;
  amplitude: number;
}

function OrbSphere({ state, amplitude }: OrbSphereProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uAmplitude: { value: 0 },
      uNoiseSpeed: { value: 0.35 },
      uBaseColor: { value: new THREE.Color('#6d7f92') },
      uFresnelColor: { value: new THREE.Color('#c8d8ea') },
      uFresnelPower: { value: 2.2 },
      uNoiseScale: { value: 1.4 },
      uLightDir: { value: new THREE.Vector3(-0.6, 0.8, 0.5).normalize() },
    }),
    []
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    const mesh = meshRef.current;
    if (!mat || !mesh) return;

    const target = STATE_PARAMS[state];
    // 4.0 is roughly a 250ms ease.
    const lerpRate = Math.min(delta * 4.0, 1);

    mat.uniforms.uTime.value += delta;
    mat.uniforms.uAmplitude.value = THREE.MathUtils.lerp(
      mat.uniforms.uAmplitude.value,
      amplitude,
      lerpRate
    );
    mat.uniforms.uNoiseSpeed.value = THREE.MathUtils.lerp(
      mat.uniforms.uNoiseSpeed.value,
      target.noiseSpeed,
      lerpRate
    );
    mat.uniforms.uBaseColor.value.lerp(target.baseColor, lerpRate);
    mat.uniforms.uFresnelColor.value.lerp(target.fresnelColor, lerpRate);

    const targetScale = target.scale + amplitude * 0.03;
    const currentScale = mesh.scale.x;
    const nextScale = THREE.MathUtils.lerp(currentScale, targetScale, lerpRate);
    mesh.scale.setScalar(nextScale);

    mesh.rotation.y += delta * 0.05;
  });

  return (
    <mesh ref={meshRef}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        uniforms={uniforms}
      />
    </mesh>
  );
}

// ---------------------------------------------------------------------------
// Orb — public component, owns the Canvas
// ---------------------------------------------------------------------------

interface OrbProps {
  state?: OrbState;
  amplitude?: number;
  size?: number;
}

export function Orb({ state = 'idle', amplitude = 0, size = 280 }: OrbProps) {
  return (
    <div
      style={{
        width: size,
        height: size,
        background:
          'radial-gradient(circle at 50% 50%, rgba(90, 120, 160, 0.15) 0%, transparent 60%)',
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 3], fov: 40 }}
        gl={{
          antialias: true,
          alpha: true,
          premultipliedAlpha: false,
          preserveDrawingBuffer: true,
        }}
        dpr={[1, 2]}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[3, 2, 2]} intensity={0.8} color="#c8d8ea" />
        <directionalLight position={[-2, -1, -2]} intensity={0.4} color="#4a6890" />

        <OrbSphere state={state} amplitude={amplitude} />
      </Canvas>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Demo wrapper for quick visual verification. Remove before shipping to prod.
// ---------------------------------------------------------------------------

export function OrbDemo() {
  const [state, setState] = useState<OrbState>('idle');
  const [amplitude, setAmplitude] = useState(0);

  const states: OrbState[] = [
    'idle',
    'minji_speaking',
    'user_listening',
    'user_speaking',
    'processing',
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 24,
        padding: 48,
        background: '#0f141b',
        minHeight: '100vh',
        color: '#e8ecf2',
        fontFamily: 'system-ui, sans-serif',
      }}
    >
      <Orb state={state} amplitude={amplitude} size={320} />

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
        {states.map((s) => (
          <button
            key={s}
            onClick={() => setState(s)}
            style={{
              padding: '8px 16px',
              background: state === s ? '#3a4a60' : '#1f2833',
              color: '#e8ecf2',
              border: '1px solid #2a3542',
              borderRadius: 4,
              cursor: 'pointer',
              fontSize: 13,
            }}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, width: 320 }}>
        <span style={{ fontSize: 13, opacity: 0.7 }}>amplitude</span>
        <input
          type="range"
          min={0}
          max={1}
          step={0.01}
          value={amplitude}
          onChange={(e) => setAmplitude(parseFloat(e.target.value))}
          style={{ flex: 1 }}
        />
        <span style={{ fontSize: 13, opacity: 0.7, width: 36 }}>{amplitude.toFixed(2)}</span>
      </div>
    </div>
  );
}
