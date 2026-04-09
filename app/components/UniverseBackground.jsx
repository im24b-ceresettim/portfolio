'use client';

import { useEffect, useRef } from 'react';
import {
  ArcRotateCamera,
  Color3,
  Color4,
  DefaultRenderingPipeline,
  DirectionalLight,
  DynamicTexture,
  Engine,
  HemisphericLight,
  ImageProcessingConfiguration,
  Mesh,
  MeshBuilder,
  PBRMaterial,
  Scene,
  StandardMaterial,
  Texture,
  Vector3,
} from '@babylonjs/core';

const textureCandidates = {
  saturnAlbedo: [
    '/textures/saturn_albedo_16k.jpg',
    '/textures/saturn_albedo_8k.jpg',
    '/textures/saturn_albedo_4k.jpg',
    '/textures/saturn_albedo.jpg',
  ],
  saturnBump: [
    '/textures/saturn_bump_8k.jpg',
    '/textures/saturn_bump_4k.jpg',
    '/textures/saturn_normal_8k.jpg',
    '/textures/saturn_normal_4k.jpg',
  ],
  ringColor: [
    '/textures/saturn_ring_color_8k.png',
    '/textures/saturn_ring_color_4k.png',
  ],
  ringAlpha: [
    '/textures/saturn_ring_alpha_8k.png',
    '/textures/saturn_ring_alpha_4k.png',
    '/textures/saturn_ring_alpha.png',
  ],
  stars: [
    '/textures/stars_16k.jpg',
    '/textures/stars_8k.jpg',
  ],
};

function loadBestTexture(scene, urls, onReady, onFallback) {
  let index = 0;

  const tryNext = () => {
    if (index >= urls.length) {
      if (onFallback) onFallback();
      return;
    }

    const url = urls[index];
    index += 1;

    const texture = new Texture(
      url,
      scene,
      false,
      true,
      Texture.TRILINEAR_SAMPLINGMODE,
      () => {
        texture.anisotropicFilteringLevel = 16;
        onReady(texture);
      },
      () => {
        texture.dispose();
        tryNext();
      }
    );
  };

  tryNext();
}

function createSaturnBumpTexture(scene) {
  const texture = new DynamicTexture('saturnBump', { width: 1024, height: 512 }, scene, false);
  const ctx = texture.getContext();
  const w = 1024;
  const h = 512;

  ctx.fillStyle = '#808080';
  ctx.fillRect(0, 0, w, h);

  for (let i = 0; i < 25000; i += 1) {
    const x = Math.random() * w;
    const y = Math.random() * h;
    const delta = Math.floor((Math.random() - 0.5) * 60);
    const value = Math.max(0, Math.min(255, 128 + delta));
    ctx.fillStyle = `rgb(${value}, ${value}, ${value})`;
    ctx.fillRect(x, y, 1, 1);
  }

  texture.update(false);
  return texture;
}

function createSaturnAlbedoTexture(scene) {
  const texture = new DynamicTexture('saturnAlbedo', { width: 2048, height: 1024 }, scene, false);
  const ctx = texture.getContext();
  const w = 2048;
  const h = 1024;

  for (let y = 0; y < h; y += 1) {
    const t = y / h;
    const bandA = Math.sin((t * Math.PI * 2) * 18.0) * 0.06;
    const bandB = Math.sin((t * Math.PI * 2) * 7.2 + 0.8) * 0.08;
    const bandC = Math.sin((t * Math.PI * 2) * 36.0 + 2.2) * 0.03;
    const noise = (Math.random() - 0.5) * 0.04;
    const shade = Math.max(0, Math.min(1, 0.72 + bandA + bandB + bandC + noise));

    const r = Math.round(216 * shade);
    const g = Math.round(191 * shade);
    const b = Math.round(148 * shade);
    ctx.fillStyle = `rgb(${r}, ${g}, ${b})`;
    ctx.fillRect(0, y, w, 1);
  }

  // Add soft storm bands for more realistic large-scale variation.
  for (let i = 0; i < 18; i += 1) {
    const y = Math.floor(Math.random() * h);
    const height = Math.floor(8 + Math.random() * 28);
    const alpha = 0.03 + Math.random() * 0.06;
    ctx.fillStyle = `rgba(255, 245, 215, ${alpha.toFixed(3)})`;
    ctx.fillRect(0, y, w, height);
  }

  texture.update(false);
  return texture;
}

export default function UniverseBackground({ enabled }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!enabled || !canvasRef.current) return undefined;

    const canvas = canvasRef.current;
    const engine = new Engine(canvas, true, {
      preserveDrawingBuffer: false,
      stencil: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    const scene = new Scene(engine);
    scene.clearColor = new Color4(0, 0, 0, 1);

    const camera = new ArcRotateCamera(
      'camera',
      -Math.PI / 2,
      1.12,
      9.2,
      new Vector3(0, -0.1, 0),
      scene
    );
    const baseAlpha = -Math.PI / 2;
    const baseBeta = 1.12;
    camera.lowerBetaLimit = 0.95;
    camera.upperBetaLimit = 1.3;
    camera.lowerRadiusLimit = 8.8;
    camera.upperRadiusLimit = 9.5;
    camera.fov = 0.7;

    const hemiLight = new HemisphericLight('hemiLight', new Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.6;
    hemiLight.groundColor = new Color3(0.03, 0.03, 0.05);

    const sunLight = new DirectionalLight('sunLight', new Vector3(-1, -0.25, -0.35), scene);
    sunLight.position = new Vector3(16, 6, 12);
    sunLight.intensity = 1.2;

    const saturn = MeshBuilder.CreateSphere('saturn', { diameter: 3.6, segments: 192 }, scene);
    const saturnMaterial = new PBRMaterial('saturnMaterial', scene);
    saturnMaterial.albedoTexture = createSaturnAlbedoTexture(scene);
    saturnMaterial.roughness = 0.92;
    saturnMaterial.metallic = 0.0;
    saturnMaterial.specularIntensity = 0.08;
    saturnMaterial.bumpTexture = createSaturnBumpTexture(scene);
    saturnMaterial.bumpTexture.level = 0.28;
    saturn.material = saturnMaterial;

    loadBestTexture(scene, textureCandidates.saturnAlbedo, (texture) => {
      saturnMaterial.albedoTexture = texture;
    });

    loadBestTexture(scene, textureCandidates.saturnBump, (texture) => {
      saturnMaterial.bumpTexture = texture;
      saturnMaterial.bumpTexture.level = 0.22;
    });

    const rings = MeshBuilder.CreateDisc(
      'rings',
      { radius: 6.4, tessellation: 256, arc: 1, sideOrientation: Mesh.DOUBLESIDE },
      scene
    );
    rings.rotation.x = Math.PI / 2;

    const ringsMaterial = new StandardMaterial('ringsMaterial', scene);
    const ringAlphaTexture = new Texture('/textures/saturn_ring_alpha.png', scene);
    ringsMaterial.diffuseTexture = ringAlphaTexture;
    ringsMaterial.opacityTexture = ringAlphaTexture;
    ringsMaterial.diffuseColor = new Color3(0.86, 0.8, 0.67);
    ringsMaterial.useAlphaFromDiffuseTexture = true;
    ringsMaterial.alphaCutOff = 0.35;
    ringsMaterial.backFaceCulling = false;
    ringsMaterial.disableLighting = false;
    ringsMaterial.needDepthPrePass = true;
    ringsMaterial.forceDepthWrite = true;
    ringsMaterial.specularColor = new Color3(0.2, 0.2, 0.2);
    ringsMaterial.emissiveColor = new Color3(0.03, 0.03, 0.03);
    rings.material = ringsMaterial;

    loadBestTexture(scene, textureCandidates.ringColor, (texture) => {
      ringsMaterial.diffuseTexture = texture;
    });

    loadBestTexture(scene, textureCandidates.ringAlpha, (texture) => {
      ringsMaterial.opacityTexture = texture;
      ringsMaterial.useAlphaFromDiffuseTexture = false;
    });

    const starsFar = MeshBuilder.CreateSphere('starsFar', { diameter: 260, segments: 32 }, scene);
    const starsFarMaterial = new StandardMaterial('starsFarMaterial', scene);
    starsFarMaterial.backFaceCulling = false;
    starsFarMaterial.disableLighting = true;
    starsFarMaterial.emissiveTexture = new Texture('/textures/stars_8k.jpg', scene);
    starsFarMaterial.emissiveColor = new Color3(0.84, 0.84, 0.84);
    starsFarMaterial.alpha = 0.72;
    starsFar.material = starsFarMaterial;

    const starsNear = MeshBuilder.CreateSphere('starsNear', { diameter: 180, segments: 24 }, scene);
    const starsNearMaterial = new StandardMaterial('starsNearMaterial', scene);
    starsNearMaterial.backFaceCulling = false;
    starsNearMaterial.disableLighting = true;
    starsNearMaterial.emissiveTexture = starsFarMaterial.emissiveTexture;
    starsNearMaterial.emissiveColor = new Color3(0.62, 0.62, 0.62);
    starsNearMaterial.alpha = 0.38;
    starsNear.material = starsNearMaterial;

    loadBestTexture(scene, textureCandidates.stars, (texture) => {
      starsFarMaterial.emissiveTexture = texture;
      starsNearMaterial.emissiveTexture = texture;
    });

    const renderingPipeline = new DefaultRenderingPipeline('default', true, scene, [camera]);
    renderingPipeline.bloomEnabled = true;
    renderingPipeline.bloomThreshold = 0.72;
    renderingPipeline.bloomWeight = 0.3;
    renderingPipeline.bloomKernel = 64;
    renderingPipeline.imageProcessingEnabled = true;
    renderingPipeline.imageProcessing.toneMappingEnabled = true;
    renderingPipeline.imageProcessing.toneMappingType = ImageProcessingConfiguration.TONEMAPPING_ACES;
    renderingPipeline.imageProcessing.exposure = 0.95;
    renderingPipeline.imageProcessing.contrast = 1.15;
    renderingPipeline.vignetteEnabled = true;
    renderingPipeline.vignetteWeight = 2.1;

    let targetOffsetX = 0;
    let targetOffsetY = 0;

    const handlePointerMove = (event) => {
      const halfW = window.innerWidth * 0.5;
      const halfH = window.innerHeight * 0.5;
      targetOffsetX = ((event.clientX - halfW) / halfW) * 0.2;
      targetOffsetY = ((event.clientY - halfH) / halfH) * 0.08;
    };

    window.addEventListener('pointermove', handlePointerMove);

    const resizeHandler = () => engine.resize();
    window.addEventListener('resize', resizeHandler);

    scene.registerBeforeRender(() => {
      const delta = engine.getDeltaTime() * 0.001;
      saturn.rotation.y += delta * 0.045;
      rings.rotation.z += delta * 0.009;
      starsFar.rotation.y += delta * 0.0014;
      starsNear.rotation.y -= delta * 0.001;

      camera.alpha += (baseAlpha + targetOffsetX - camera.alpha) * 0.02;
      camera.beta += (baseBeta + targetOffsetY - camera.beta) * 0.02;
    });

    engine.runRenderLoop(() => {
      scene.render();
    });

    return () => {
      window.removeEventListener('resize', resizeHandler);
      window.removeEventListener('pointermove', handlePointerMove);
      engine.stopRenderLoop();
      scene.dispose();
      engine.dispose();
    };
  }, [enabled]);

  return (
    <canvas
      ref={canvasRef}
      className={`universe-canvas${enabled ? ' is-visible' : ''}`}
      aria-hidden="true"
    />
  );
}
