"use client";

import React, { forwardRef, useMemo, useRef, useLayoutEffect, useCallback, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Color, Mesh, ShaderMaterial } from "three";

type NormalizedRGB = [number, number, number];

const hexToNormalizedRGB = (hex: string): NormalizedRGB => {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  return [r, g, b];
};

interface UniformValue<T = number | Color> {
  value: T;
}

interface SilkUniforms {
  uSpeed: UniformValue<number>;
  uScale: UniformValue<number>;
  uNoiseIntensity: UniformValue<number>;
  uColor: UniformValue<Color>;
  uRotation: UniformValue<number>;
  uTime: UniformValue<number>;
  [uniform: string]: UniformValue<number | Color>;
}

const vertexShader = `
varying vec2 vUv;
varying vec3 vPosition;

void main() {
  vPosition = position;
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
varying vec2 vUv;
varying vec3 vPosition;

uniform float uTime;
uniform vec3  uColor;
uniform float uSpeed;
uniform float uScale;
uniform float uRotation;
uniform float uNoiseIntensity;

const float e = 2.71828182845904523536;

float noise(vec2 texCoord) {
  float G = e;
  vec2  r = (G * sin(G * texCoord));
  return fract(r.x * r.y * (1.0 + texCoord.x));
}

vec2 rotateUvs(vec2 uv, float angle) {
  float c = cos(angle);
  float s = sin(angle);
  mat2  rot = mat2(c, -s, s, c);
  return rot * uv;
}

void main() {
  float rnd        = noise(gl_FragCoord.xy);
  vec2  uv         = rotateUvs(vUv * uScale, uRotation);
  vec2  tex        = uv * uScale;
  float tOffset    = uSpeed * uTime;

  tex.y += 0.03 * sin(8.0 * tex.x - tOffset);

  float pattern = 0.6 +
                  0.4 * sin(5.0 * (tex.x + tex.y +
                                   cos(3.0 * tex.x + 5.0 * tex.y) +
                                   0.02 * tOffset) +
                           sin(20.0 * (tex.x + tex.y - 0.1 * tOffset)));

  vec4 col = vec4(uColor, 1.0) * vec4(pattern) - rnd / 15.0 * uNoiseIntensity;
  col.a = 1.0;
  gl_FragColor = col;
}
`;

interface SilkPlaneProps {
  uniforms: SilkUniforms;
}

const SilkPlane = forwardRef<Mesh, SilkPlaneProps>(function SilkPlane(
  { uniforms },
  ref
) {
  const isMobileDevice = useCallback(() => {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }, []);
  
  const fixedScale = isMobileDevice() ? 4 : 3; // Larger scale on mobile to prevent edge artifacts

  useLayoutEffect(() => {
    if (ref && typeof ref !== 'function' && ref.current) {
      ref.current.scale.set(fixedScale, fixedScale, 1);
      // Lock position to prevent any movement
      ref.current.position.set(0, 0, 0);
    }
  }, [ref, fixedScale]);

  // Static time-based animation that ignores scroll and viewport changes
  const startTime = useRef(Date.now());
  const isMobile = isMobileDevice();
  
  useFrame(() => {
    if (ref && typeof ref !== 'function' && ref.current) {
      const material = ref.current.material as ShaderMaterial;
      if (material.uniforms && material.uniforms.uTime) {
        // Use absolute time instead of delta to prevent scroll-based jumps
         const elapsed = (Date.now() - startTime.current) / 1000;
          const speed = isMobile ? 0.08 : 0.12; // Even slower animation
          material.uniforms.uTime.value = elapsed * speed;
      }
    }
  });

  return (
    <mesh ref={ref}>
      <planeGeometry args={[1, 1, 1, 1]} />
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
      />
    </mesh>
  );
});
SilkPlane.displayName = "SilkPlane";

export interface SilkProps {
  speed?: number;
  scale?: number;
  color?: string;
  noiseIntensity?: number;
  rotation?: number;
}

const Silk: React.FC<SilkProps> = ({
  speed = 3,
  scale = 1.3,
  color = "#4B3F72",
  noiseIntensity = 1,
  rotation = 0.5,
}) => {
  const meshRef = useRef<Mesh>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const uniforms = useMemo<SilkUniforms>(
    () => ({
      uSpeed: { value: speed },
      uScale: { value: scale },
      uNoiseIntensity: { value: noiseIntensity },
      uColor: { value: new Color(...hexToNormalizedRGB(color)) },
      uRotation: { value: rotation },
      uTime: { value: 0 },
    }),
    [speed, scale, noiseIntensity, color, rotation]
  );

  // Prevent scroll-related reflows on mobile
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && containerRef.current) {
      const container = containerRef.current;
      container.style.position = 'fixed'; // Use fixed instead of absolute on mobile
      container.style.pointerEvents = 'none';
      
      // Prevent any scroll-related updates
      const preventScrollUpdate = () => {
        container.style.transform = 'translate3d(0, 0, 0)';
      };
      
      window.addEventListener('scroll', preventScrollUpdate, { passive: true });
      window.addEventListener('resize', preventScrollUpdate, { passive: true });
      
      return () => {
        window.removeEventListener('scroll', preventScrollUpdate);
        window.removeEventListener('resize', preventScrollUpdate);
      };
    }
  }, []);

  return (
    <div 
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        zIndex: -1,
        backgroundColor: color,
        willChange: 'transform',
        transform: 'translate3d(0, 0, 0)',
        backfaceVisibility: 'hidden',
        perspective: '1000px',
        WebkitBackfaceVisibility: 'hidden',
        WebkitPerspective: '1000px',
        overflow: 'hidden' // Prevent any overflow issues
      }}>
      <Canvas 
          frameloop="always"
          camera={{ position: [0, 0, 1] }}
          gl={{ 
            antialias: false,
            alpha: true,
            powerPreference: 'high-performance',
            preserveDrawingBuffer: true // Prevent canvas clearing on mobile
          }}
          style={{ 
            width: '100%', 
            height: '100%', 
            display: 'block',
            transform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            position: 'absolute',
            top: 0,
            left: 0
          }}
        >
        <SilkPlane ref={meshRef} uniforms={uniforms} />
      </Canvas>
    </div>
  );
};

export default Silk;
