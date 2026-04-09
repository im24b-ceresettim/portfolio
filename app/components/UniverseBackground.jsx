'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const SATURN_R = 1.8;
const RING_INNER_R = 2.0;
const RING_OUTER_R = 4.5;
const STAR_COUNT = 4000;

const THEMES = {
  dark: {
    bg: new THREE.Color(0x000000),
    ambientIntensity: 0.35,
    sunIntensity: 1.3,
    starsOpacity: 0.9,
    exposure: 1.0,
  },
  light: {
    bg: new THREE.Color(0xffffff),
    ambientIntensity: 0.8,
    sunIntensity: 2.0,
    starsOpacity: 0,
    exposure: 1.5,
  },
};

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function smoothstep(edge0, edge1, x) {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

function createSaturnTexture() {
  const w = 2048;
  const h = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  for (let y = 0; y < h; y++) {
    const t = y / h;
    const b1 = Math.sin(t * Math.PI * 36) * 0.06;
    const b2 = Math.sin(t * Math.PI * 14.4 + 0.8) * 0.08;
    const b3 = Math.sin(t * Math.PI * 72 + 2.2) * 0.025;
    const noise = (Math.random() - 0.5) * 0.018;
    const shade = Math.max(0, Math.min(1, 0.72 + b1 + b2 + b3 + noise));

    const r = Math.round(220 * shade);
    const g = Math.round(196 * shade);
    const b = Math.round(152 * shade);
    ctx.fillStyle = `rgb(${r},${g},${b})`;
    ctx.fillRect(0, y, w, 1);
  }

  for (let i = 0; i < 22; i++) {
    const y = Math.floor(Math.random() * h);
    const bh = Math.floor(5 + Math.random() * 32);
    const a = 0.02 + Math.random() * 0.05;
    ctx.fillStyle = `rgba(255,248,220,${a})`;
    ctx.fillRect(0, y, w, bh);
  }

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createSaturnBumpTexture() {
  const w = 1024;
  const h = 512;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, w, h);

  for (let y = 0; y < h; y++) {
    const t = y / h;
    const v =
      Math.sin(t * 40 * Math.PI) * 0.025 +
      Math.sin(t * 15 * Math.PI + 0.5) * 0.04 +
      Math.sin(t * 80 * Math.PI) * 0.012;
    const val = Math.round(128 + v * 255);
    ctx.fillStyle = `rgb(${val},${val},${val})`;
    ctx.fillRect(0, y, w, 1);
  }

  return new THREE.CanvasTexture(canvas);
}

function createRingTexture() {
  const size = 1024;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');

  const imageData = ctx.createImageData(size, size);
  const px = imageData.data;
  const center = size / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const dx = x - center;
      const dy = y - center;
      const pixelDist = Math.sqrt(dx * dx + dy * dy);
      const worldR = (pixelDist * 2 * RING_OUTER_R) / size;
      const sr = worldR / SATURN_R;

      const idx = (y * size + x) * 4;
      let opacity = 0;
      let bright = 0.8;

      if (sr >= 1.11 && sr < 1.24) {
        const t = (sr - 1.11) / 0.13;
        opacity = 0.1 * smoothstep(0, 0.3, t) * smoothstep(1, 0.7, t);
        bright = 0.55;
      } else if (sr >= 1.24 && sr < 1.525) {
        const t = (sr - 1.24) / 0.285;
        opacity =
          (0.25 + Math.sin(t * 22) * 0.06) *
          smoothstep(0, 0.06, t) *
          smoothstep(1, 0.94, t);
        bright = 0.72 + Math.sin(t * 14) * 0.05;
      } else if (sr >= 1.525 && sr < 1.95) {
        const t = (sr - 1.525) / 0.425;
        opacity =
          0.88 + Math.sin(t * 32) * 0.08 + Math.sin(t * 13) * 0.04;
        opacity *= smoothstep(0, 0.04, t) * smoothstep(1, 0.96, t);
        bright = 1.0 + Math.sin(t * 20) * 0.0;
      } else if (sr >= 1.95 && sr < 2.025) {
        opacity = 0.03;
        bright = 0.3;
      } else if (sr >= 2.025 && sr < 2.27) {
        const t = (sr - 2.025) / 0.245;
        opacity = 0.65 + Math.sin(t * 28) * 0.06;
        opacity *= smoothstep(0, 0.05, t) * smoothstep(1, 0.95, t);
        bright = 0.9 + Math.sin(t * 16) * 0.04;
        const eg = Math.abs(sr - 2.214);
        if (eg < 0.01) opacity *= eg / 0.01;
      } else if (sr >= 2.31 && sr < 2.37) {
        const t = (sr - 2.31) / 0.06;
        opacity = 0.3 * Math.exp(-(((t - 0.5) * 4) ** 2));
        bright = 0.9;
      }

      opacity = Math.max(0, Math.min(1, opacity));
      bright = Math.max(0, Math.min(1, bright));

      px[idx] = Math.round(245 * bright);
      px[idx + 1] = Math.round(228 * bright);
      px[idx + 2] = Math.round(192 * bright);
      px[idx + 3] = Math.round(opacity * 255);
    }
  }

  ctx.putImageData(imageData, 0, 0);

  const tex = new THREE.CanvasTexture(canvas);
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function createStarField() {
  const positions = new Float32Array(STAR_COUNT * 3);

  for (let i = 0; i < STAR_COUNT; i++) {
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);
    const r = 60 + Math.random() * 50;
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);
  }

  const geom = new THREE.BufferGeometry();
  geom.setAttribute('position', new THREE.BufferAttribute(positions, 3));

  const mat = new THREE.PointsMaterial({
    color: 0xffffff,
    size: 0.18,
    sizeAttenuation: true,
    transparent: true,
    depthWrite: false,
  });

  return new THREE.Points(geom, mat);
}

export default function UniverseBackground({ darkMode }) {
  const canvasRef = useRef(null);
  const darkModeRef = useRef(darkMode);

  useEffect(() => {
    darkModeRef.current = darkMode;
  }, [darkMode]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return undefined;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;

    const scene = new THREE.Scene();
    const initial = darkModeRef.current ? THEMES.dark : THEMES.light;
    scene.background = initial.bg.clone();
    renderer.toneMappingExposure = initial.exposure;

    const camera = new THREE.PerspectiveCamera(
      40,
      window.innerWidth / window.innerHeight,
      0.1,
      500,
    );
    const BASE_CAM = new THREE.Vector3(0, 3.8, 7.0);
    camera.position.copy(BASE_CAM);
    camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0x8080a0, initial.ambientIntensity);
    scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfff8ee, initial.sunIntensity);
    sun.position.set(10, 5, 8);
    scene.add(sun);

    const backFill = new THREE.DirectionalLight(0x4466aa, 0.25);
    backFill.position.set(-6, -2, -5);
    scene.add(backFill);

    const saturnGeom = new THREE.SphereGeometry(SATURN_R, 128, 64);
    const saturnAlbedo = new THREE.TextureLoader().load('/textures/saturn_albedo_8k.jpg');
    saturnAlbedo.colorSpace = THREE.SRGBColorSpace;
    const saturnBump = createSaturnBumpTexture();
    const saturnMat = new THREE.MeshStandardMaterial({
      map: saturnAlbedo,
      bumpMap: saturnBump,
      bumpScale: 0.015,
      roughness: 0.88,
      metalness: 0.0,
    });
    const saturn = new THREE.Mesh(saturnGeom, saturnMat);

    const ringGeom = new THREE.RingGeometry(RING_INNER_R, RING_OUTER_R, 128, 4);
    const ringTex = createRingTexture();
    const ringMat = new THREE.MeshStandardMaterial({
      map: ringTex,
      transparent: true,
      side: THREE.DoubleSide,
      roughness: 0.6,
      metalness: 0.05,
      emissive: new THREE.Color(0x7a7060),
      emissiveIntensity: 0.3,
      depthWrite: false,
    });
    const ring = new THREE.Mesh(ringGeom, ringMat);
    ring.rotation.x = -Math.PI / 2;

    const saturnGroup = new THREE.Group();
    saturnGroup.add(saturn);
    saturnGroup.add(ring);
    saturnGroup.rotation.x = -0.22;
    saturnGroup.rotation.z = 0.04;
    scene.add(saturnGroup);

    const stars = createStarField();
    stars.material.opacity = initial.starsOpacity;
    scene.add(stars);

    let targetX = 0;
    let targetY = 0;

    const onPointerMove = (e) => {
      targetX = (e.clientX / window.innerWidth - 0.5) * 2;
      targetY = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onPointerMove);

    const onResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    };
    window.addEventListener('resize', onResize);

    let progress = darkModeRef.current ? 1 : 0;
    const clock = new THREE.Clock();
    let frameId;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      const dt = clock.getDelta();

      saturn.rotation.y -= dt * 0.05;
      ring.rotation.z -= dt * 0.05;
      stars.rotation.y += dt * 0.002;

      camera.position.x +=
        (BASE_CAM.x + targetX * 0.6 - camera.position.x) * 0.02;
      camera.position.y +=
        (BASE_CAM.y + targetY * -0.25 - camera.position.y) * 0.02;
      camera.lookAt(0, 0, 0);

      const target = darkModeRef.current ? 1 : 0;
      if (Math.abs(progress - target) > 0.001) {
        progress += (target - progress) * Math.min(dt * 3.0, 0.08);
        const l = THEMES.light;
        const d = THEMES.dark;

        scene.background.lerpColors(l.bg, d.bg, progress);
        ambient.intensity = lerp(l.ambientIntensity, d.ambientIntensity, progress);
        sun.intensity = lerp(l.sunIntensity, d.sunIntensity, progress);
        stars.material.opacity = lerp(l.starsOpacity, d.starsOpacity, progress);
        renderer.toneMappingExposure = lerp(l.exposure, d.exposure, progress);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('pointermove', onPointerMove);

      scene.traverse((obj) => {
        if (obj.geometry) obj.geometry.dispose();
        if (obj.material) {
          if (obj.material.map) obj.material.map.dispose();
          if (obj.material.bumpMap) obj.material.bumpMap.dispose();
          obj.material.dispose();
        }
      });
      renderer.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`universe-canvas${darkMode ? ' is-visible' : ''}`}
      aria-hidden="true"
    />
  );
}
