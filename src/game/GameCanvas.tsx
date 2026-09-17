import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Sparkles } from 'lucide-react';
import { GameLevel, HiddenItem } from '../types';
import { build3DLevelScene, SceneBuildResult } from './sceneBuilder';
import { sound } from '../utils/audio';

// Procedural 4-pointed Diamond Star Sparkle Texture
function createSparkleTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    // Soft golden radial halo
    const radial = ctx.createRadialGradient(32, 32, 0, 32, 32, 30);
    radial.addColorStop(0, 'rgba(255, 255, 255, 1)');
    radial.addColorStop(0.25, 'rgba(254, 240, 138, 0.9)');
    radial.addColorStop(0.6, 'rgba(245, 158, 11, 0.35)');
    radial.addColorStop(1, 'rgba(245, 158, 11, 0)');
    ctx.fillStyle = radial;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fill();

    // 4-pointed crisp diamond star sparkle
    ctx.fillStyle = 'rgba(255, 255, 255, 0.98)';
    ctx.beginPath();
    ctx.moveTo(32, 4);
    ctx.quadraticCurveTo(32, 32, 60, 32);
    ctx.quadraticCurveTo(32, 32, 32, 60);
    ctx.quadraticCurveTo(32, 32, 4, 32);
    ctx.quadraticCurveTo(32, 32, 32, 4);
    ctx.fill();

    // Inner bright glint cross
    ctx.fillStyle = 'rgba(254, 240, 138, 0.8)';
    ctx.beginPath();
    ctx.moveTo(32, 16);
    ctx.lineTo(35, 29);
    ctx.lineTo(48, 32);
    ctx.lineTo(35, 35);
    ctx.lineTo(32, 48);
    ctx.lineTo(29, 35);
    ctx.lineTo(16, 32);
    ctx.lineTo(29, 29);
    ctx.closePath();
    ctx.fill();
  }
  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

interface FoundCelebration {
  item: HiddenItem;
  mesh: THREE.Object3D;
  startTime: number;
  duration: number;
  startPos: THREE.Vector3;
  startScale: THREE.Vector3;
  startRotY: number;
  glowMaterials: {
    mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
    origEmissive: THREE.Color;
    origIntensity: number;
  }[];
  haloAura: THREE.Mesh;
  shockwaveRing: THREE.Mesh;
  glowLight: THREE.PointLight;
  particlePoints: THREE.Points;
  particleCount: number;
  particlePositions: Float32Array;
  particleVelocities: THREE.Vector3[];
}

interface GameCanvasProps {
  level: GameLevel;
  foundItemIds: string[];
  activeHintItemId: string | null;
  flashlightMode: boolean;
  onItemFound: (item: HiddenItem) => void;
  onMisclick: () => void;
  onContainerToggled?: (containerName: string, isOpen: boolean) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  level,
  foundItemIds,
  activeHintItemId,
  flashlightMode,
  onItemFound,
  onMisclick,
  onContainerToggled,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneDataRef = useRef<SceneBuildResult | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const flashlightRef = useRef<THREE.SpotLight | null>(null);
  const hintMarkerRef = useRef<THREE.Mesh | null>(null);

  // Camera Orbit State
  const cameraControlRef = useRef({
    isDragging: false,
    prevMouseX: 0,
    prevMouseY: 0,
    spherical: {
      radius: 8.5,
      theta: 0.75, // Horizontal angle (around Y)
      phi: 1.05,   // Vertical angle from top (elevation)
    },
    targetSpherical: {
      radius: 8.5,
      theta: 0.75,
      phi: 1.05,
    },
    lookAtTarget: new THREE.Vector3(0, 1.2, 0),
  });

  const [hoveredName, setHoveredName] = useState<string | null>(null);
  const [cursorPos, setCursorPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [floatingSparkles, setFloatingSparkles] = useState<
    Array<{ id: string; name: string; x: number; y: number }>
  >([]);

  const celebrationsRef = useRef<FoundCelebration[]>([]);
  const sparkleTextureRef = useRef<THREE.CanvasTexture | null>(null);
  if (!sparkleTextureRef.current) {
    sparkleTextureRef.current = createSparkleTexture();
  }

  // Reset Camera View helper
  const resetCamera = () => {
    cameraControlRef.current.targetSpherical = {
      radius: 8.5,
      theta: 0.75,
      phi: 1.05,
    };
    cameraControlRef.current.lookAtTarget.set(0, 1.2, 0);
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || window.innerWidth;
    const height = container.clientHeight || window.innerHeight;

    // 1. Scene & Renderer
    const sceneResult = build3DLevelScene(level);
    sceneDataRef.current = sceneResult;
    const { scene } = sceneResult;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.1;

    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 2. Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 50);
    cameraRef.current = camera;

    // 3. Flashlight (Detective Lantern)
    const flashlight = new THREE.SpotLight(0xfffbeb, flashlightMode ? 2.5 : 0, 12, Math.PI / 6, 0.4, 1);
    flashlight.position.set(0, 0, 0);
    scene.add(flashlight);
    scene.add(flashlight.target);
    flashlightRef.current = flashlight;

    // 4. Hint Pulse Beacon Marker
    const hintRingGeo = new THREE.RingGeometry(0.2, 0.38, 32);
    const hintRingMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
    });
    const hintMarker = new THREE.Mesh(hintRingGeo, hintRingMat);
    hintMarker.rotation.x = -Math.PI / 2;
    hintMarker.visible = false;
    scene.add(hintMarker);
    hintMarkerRef.current = hintMarker;

    // Raycaster
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // 5. Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const elapsedTime = clock.getElapsedTime();

      // Smooth camera interpolation
      const ctrl = cameraControlRef.current;
      ctrl.spherical.theta += (ctrl.targetSpherical.theta - ctrl.spherical.theta) * 0.1;
      ctrl.spherical.phi += (ctrl.targetSpherical.phi - ctrl.spherical.phi) * 0.1;
      ctrl.spherical.radius += (ctrl.targetSpherical.radius - ctrl.spherical.radius) * 0.1;

      // Clamp vertical angle
      ctrl.spherical.phi = Math.max(0.2, Math.min(Math.PI / 2 - 0.05, ctrl.spherical.phi));
      ctrl.spherical.radius = Math.max(4.0, Math.min(14.0, ctrl.spherical.radius));

      const x = ctrl.spherical.radius * Math.sin(ctrl.spherical.phi) * Math.sin(ctrl.spherical.theta);
      const y = ctrl.spherical.radius * Math.cos(ctrl.spherical.phi);
      const z = ctrl.spherical.radius * Math.sin(ctrl.spherical.phi) * Math.cos(ctrl.spherical.theta);

      camera.position.set(x, y + 0.8, z);
      camera.lookAt(ctrl.lookAtTarget);

      // Flashlight follows camera
      if (flashlightRef.current) {
        flashlightRef.current.position.copy(camera.position);
        flashlightRef.current.target.position.copy(ctrl.lookAtTarget);
      }

      // Gentle subtle hover bobbing on uncollected items
      sceneResult.itemMeshMap.forEach((mesh) => {
        if (mesh.userData.isTargetItem && !mesh.userData.isCollected) {
          const basePos = mesh.userData.itemData.position;
          mesh.position.y = basePos[1] + Math.sin(elapsedTime * 2.5 + basePos[0] * 2) * 0.02;
          mesh.rotation.y += 0.005;
        }
      });

      // Animate hint marker pulse
      if (hintMarkerRef.current && hintMarkerRef.current.visible) {
        const pulse = 1 + Math.sin(elapsedTime * 6) * 0.25;
        hintMarkerRef.current.scale.set(pulse, pulse, pulse);
        (hintMarkerRef.current.material as THREE.MeshBasicMaterial).opacity = 0.5 + Math.sin(elapsedTime * 6) * 0.35;
      }

      // Update active celebrations (item glow & sparkle particle effect for ~1 second)
      const now = performance.now();
      for (let i = celebrationsRef.current.length - 1; i >= 0; i--) {
        const c = celebrationsRef.current[i];
        const elapsed = (now - c.startTime) / 1000;
        const progress = Math.min(1.0, elapsed / c.duration);

        if (progress < 1.0) {
          // 1. Elevate item position smoothly
          c.mesh.position.y = c.startPos.y + Math.sin(progress * Math.PI * 0.5) * 0.28;
          // 2. Joyful celebratory spin
          c.mesh.rotation.y = c.startRotY + progress * 7.5;
          c.mesh.rotation.x += delta * 1.5;

          // 3. Pop & shrink curve:
          // 0.0 -> 0.35: Pop scale up from 1.0x to 1.25x
          // 0.35 -> 0.70: Float radiantly with subtle breathe
          // 0.70 -> 1.0: Shrink down smoothly to 0 before disappearing
          let scaleMultiplier = 1.0;
          if (progress < 0.35) {
            const t = progress / 0.35;
            scaleMultiplier = 1.0 + 0.25 * Math.sin(t * Math.PI * 0.5);
          } else if (progress < 0.70) {
            scaleMultiplier = 1.25 + Math.sin((progress - 0.35) * 16) * 0.04;
          } else {
            const shrinkT = (progress - 0.70) / 0.30;
            scaleMultiplier = Math.max(0, 1.25 * (1 - shrinkT * shrinkT));
          }
          c.mesh.scale.copy(c.startScale).multiplyScalar(scaleMultiplier);

          // 4. Emissive glow pulse on item mesh materials
          const glowPulse = 2.0 + Math.sin(progress * 24) * 0.6;
          c.glowMaterials.forEach(({ mat }) => {
            mat.emissive.setHex(0xfbbf24);
            mat.emissiveIntensity = glowPulse * (1.0 - progress * 0.25);
          });

          // 5. Halo Aura follows mesh and pulses
          c.haloAura.position.copy(c.mesh.position);
          c.haloAura.scale.setScalar(scaleMultiplier * (1.1 + Math.sin(progress * 20) * 0.15));
          (c.haloAura.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.65 * (1.0 - progress));

          // 6. Expanding Shockwave Ring on floor/surface
          const ringT = Math.min(1.0, progress / 0.55);
          const ringScale = 1.0 + ringT * 4.0;
          c.shockwaveRing.scale.set(ringScale, ringScale, ringScale);
          (c.shockwaveRing.material as THREE.MeshBasicMaterial).opacity = Math.max(0, 0.95 * (1.0 - ringT));

          // 7. Dynamic Point Light follows item
          c.glowLight.position.copy(c.mesh.position);
          c.glowLight.intensity = Math.max(0, 3.2 * (1.0 - progress));
        } else {
          // Exactly at progress = 1.0 (~1 second): item disappears from the scene!
          c.mesh.visible = false;
          c.mesh.userData.isAnimatingFound = false;
          c.glowMaterials.forEach(({ mat, origEmissive, origIntensity }) => {
            mat.emissive.copy(origEmissive);
            mat.emissiveIntensity = origIntensity;
          });
          c.haloAura.visible = false;
          c.shockwaveRing.visible = false;
          c.glowLight.intensity = 0;
        }

        // 8. Sparkle Particles Motion and Twinkle
        const posAttr = c.particlePoints.geometry.getAttribute('position') as THREE.BufferAttribute;
        const positions = c.particlePositions;
        const particleAlpha = Math.max(0, 1.0 - Math.pow(progress, 1.6));

        for (let p = 0; p < c.particleCount; p++) {
          const idx = p * 3;
          const vel = c.particleVelocities[p];

          // Gravity and subtle air resistance
          vel.y -= 0.35 * delta;
          vel.x *= 0.985;
          vel.z *= 0.985;

          positions[idx] += vel.x * delta;
          positions[idx + 1] += vel.y * delta;
          positions[idx + 2] += vel.z * delta;
        }
        posAttr.needsUpdate = true;

        // Twinkling sparkle opacity
        const pointsMat = c.particlePoints.material as THREE.PointsMaterial;
        const twinkle = 0.75 + 0.25 * Math.sin(elapsed * 28 + i * 2);
        pointsMat.opacity = particleAlpha * twinkle;
        pointsMat.size = 0.22 * (1.0 - progress * 0.35);

        // When full celebration duration completes (~1.05s), clean up
        if (elapsed >= c.duration) {
          scene.remove(c.haloAura);
          scene.remove(c.shockwaveRing);
          scene.remove(c.glowLight);
          scene.remove(c.particlePoints);

          c.haloAura.geometry.dispose();
          (c.haloAura.material as THREE.Material).dispose();
          c.shockwaveRing.geometry.dispose();
          (c.shockwaveRing.material as THREE.Material).dispose();
          c.glowLight.dispose();
          c.particlePoints.geometry.dispose();
          (c.particlePoints.material as THREE.Material).dispose();

          celebrationsRef.current.splice(i, 1);
        }
      }

      renderer.render(scene, camera);
    };

    animate();

    // 6. Event Handlers (Mouse & Touch Orbiting)
    const onMouseDown = (e: MouseEvent) => {
      // Left click or middle click
      if (e.button === 0 || e.button === 1) {
        cameraControlRef.current.isDragging = true;
        cameraControlRef.current.prevMouseX = e.clientX;
        cameraControlRef.current.prevMouseY = e.clientY;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setCursorPos({ x, y });

      if (cameraControlRef.current.isDragging) {
        const deltaX = e.clientX - cameraControlRef.current.prevMouseX;
        const deltaY = e.clientY - cameraControlRef.current.prevMouseY;

        cameraControlRef.current.targetSpherical.theta -= deltaX * 0.007;
        cameraControlRef.current.targetSpherical.phi -= deltaY * 0.007;

        cameraControlRef.current.prevMouseX = e.clientX;
        cameraControlRef.current.prevMouseY = e.clientY;
      } else {
        // Raycast hover check
        mouse.x = (x / rect.width) * 2 - 1;
        mouse.y = -(y / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(sceneResult.clickableObjects, true);

        if (intersects.length > 0) {
          let topObj: THREE.Object3D | null = intersects[0].object;
          while (topObj && !topObj.userData.isTargetItem && !topObj.userData.isContainer && topObj.parent) {
            topObj = topObj.parent;
          }

          if (topObj && topObj.userData.isTargetItem && !topObj.userData.isCollected) {
            setHoveredName(topObj.userData.itemData.indonesianName);
            container.style.cursor = 'pointer';
          } else if (topObj && topObj.userData.isContainer) {
            setHoveredName(`${topObj.userData.name} (${topObj.userData.isOpen ? 'Klik untuk Menutup' : 'Klik untuk Membuka'})`);
            container.style.cursor = 'pointer';
          } else {
            setHoveredName(null);
            container.style.cursor = 'grab';
          }
        } else {
          setHoveredName(null);
          container.style.cursor = 'grab';
        }
      }
    };

    const onMouseUp = () => {
      cameraControlRef.current.isDragging = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      cameraControlRef.current.targetSpherical.radius += e.deltaY * 0.006;
    };

    // Click Detection (Interactable or Item)
    const onClick = (e: MouseEvent) => {
      // Ignore if was dragging camera
      const rect = container.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      mouse.x = (x / rect.width) * 2 - 1;
      mouse.y = -(y / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(sceneResult.clickableObjects, true);

      if (intersects.length > 0) {
        let topObj: THREE.Object3D | null = intersects[0].object;
        while (topObj && !topObj.userData.isTargetItem && !topObj.userData.isContainer && topObj.parent) {
          topObj = topObj.parent;
        }

        if (topObj && topObj.userData.isTargetItem && !topObj.userData.isCollected && !topObj.userData.isAnimatingFound) {
          const item: HiddenItem = topObj.userData.itemData;
          topObj.userData.isCollected = true;
          topObj.userData.isAnimatingFound = true;

          const targetMesh = topObj;
          const startPos = targetMesh.position.clone();
          const startScale = (targetMesh.userData.originalScale || targetMesh.scale).clone();
          const startRotY = targetMesh.rotation.y;

          // 1. Highlight materials on item mesh with bright warm emissive glow
          const glowMaterials: {
            mat: THREE.MeshStandardMaterial | THREE.MeshPhysicalMaterial;
            origEmissive: THREE.Color;
            origIntensity: number;
          }[] = [];

          targetMesh.traverse((child) => {
            if ((child as THREE.Mesh).isMesh) {
              const m = child as THREE.Mesh;
              if (m.material) {
                const mats = Array.isArray(m.material) ? m.material : [m.material];
                mats.forEach((mat) => {
                  if (mat instanceof THREE.MeshStandardMaterial || mat instanceof THREE.MeshPhysicalMaterial) {
                    glowMaterials.push({
                      mat,
                      origEmissive: mat.emissive.clone(),
                      origIntensity: mat.emissiveIntensity ?? 0,
                    });
                    mat.emissive.setHex(0xfbbf24);
                    mat.emissiveIntensity = 2.2;
                  }
                });
              }
            }
          });

          // 2. Glowing Halo Aura sphere around the item
          const auraGeo = new THREE.SphereGeometry(0.24, 16, 16);
          const auraMat = new THREE.MeshBasicMaterial({
            color: 0xfef08a,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending,
            side: THREE.BackSide,
          });
          const haloAura = new THREE.Mesh(auraGeo, auraMat);
          haloAura.position.copy(startPos);
          scene.add(haloAura);

          // 3. Shockwave Ring expanding outward from base
          const ringGeo = new THREE.RingGeometry(0.04, 0.12, 32);
          const ringMat = new THREE.MeshBasicMaterial({
            color: 0xfbbf24,
            transparent: true,
            opacity: 0.95,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
          });
          const shockwaveRing = new THREE.Mesh(ringGeo, ringMat);
          shockwaveRing.rotation.x = -Math.PI / 2;
          shockwaveRing.position.set(startPos.x, Math.max(0.01, startPos.y - 0.12), startPos.z);
          scene.add(shockwaveRing);

          // 4. Dynamic Point Light flash illuminating surroundings
          const glowLight = new THREE.PointLight(0xfde047, 3.2, 3.0);
          glowLight.position.copy(startPos);
          scene.add(glowLight);

          // 5. Sparkle Particles System (45 particles bursting at item location)
          const particleCount = 45;
          const particlePositions = new Float32Array(particleCount * 3);
          const particleColors = new Float32Array(particleCount * 3);
          const particleVelocities: THREE.Vector3[] = [];

          const colorPalette = [
            new THREE.Color(0xffffff), // pure starlight
            new THREE.Color(0xfef08a), // bright yellow
            new THREE.Color(0xfbbf24), // amber gold
            new THREE.Color(0xf59e0b), // deep gold
            new THREE.Color(0xa5f3fc), // starlight cyan
          ];

          for (let p = 0; p < particleCount; p++) {
            particlePositions[p * 3] = startPos.x + (Math.random() - 0.5) * 0.08;
            particlePositions[p * 3 + 1] = startPos.y + (Math.random() - 0.5) * 0.08;
            particlePositions[p * 3 + 2] = startPos.z + (Math.random() - 0.5) * 0.08;

            const col = colorPalette[Math.floor(Math.random() * colorPalette.length)];
            particleColors[p * 3] = col.r;
            particleColors[p * 3 + 1] = col.g;
            particleColors[p * 3 + 2] = col.b;

            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);
            const speed = 0.38 + Math.random() * 0.82;
            const vx = Math.sin(phi) * Math.cos(theta) * speed;
            const vy = Math.abs(Math.cos(phi)) * speed * 0.85 + 0.35; // upward fountain draft
            const vz = Math.sin(phi) * Math.sin(theta) * speed;
            particleVelocities.push(new THREE.Vector3(vx, vy, vz));
          }

          const particleGeo = new THREE.BufferGeometry();
          particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
          particleGeo.setAttribute('color', new THREE.BufferAttribute(particleColors, 3));

          const pointsMat = new THREE.PointsMaterial({
            size: 0.22,
            map: sparkleTextureRef.current,
            transparent: true,
            opacity: 1.0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: true,
          });

          const particlePoints = new THREE.Points(particleGeo, pointsMat);
          scene.add(particlePoints);

          celebrationsRef.current.push({
            item,
            mesh: targetMesh,
            startTime: performance.now(),
            duration: 1.05,
            startPos,
            startScale,
            startRotY,
            glowMaterials,
            haloAura,
            shockwaveRing,
            glowLight,
            particlePoints,
            particleCount,
            particlePositions,
            particleVelocities,
          });

          // 2D Floating Sparkle Badge over screen coordinates
          if (cameraRef.current && container) {
            const worldPos = new THREE.Vector3();
            targetMesh.getWorldPosition(worldPos);
            const proj = worldPos.clone().project(cameraRef.current);
            const screenX = ((proj.x + 1) * container.clientWidth) / 2;
            const screenY = ((-proj.y + 1) * container.clientHeight) / 2;

            const sparkleId = `${item.id}-${Date.now()}`;
            setFloatingSparkles((prev) => [
              ...prev,
              {
                id: sparkleId,
                name: item.indonesianName,
                x: screenX,
                y: screenY,
              },
            ]);

            setTimeout(() => {
              setFloatingSparkles((prev) => prev.filter((s) => s.id !== sparkleId));
            }, 1100);
          }

          sound.playFound();
          onItemFound(item);
          return;
        }

        if (topObj && topObj.userData.isContainer) {
          const containerId = topObj.userData.containerId;
          const containerInfo = sceneResult.containerMeshMap.get(containerId);
          if (containerInfo) {
            const willOpen = !containerInfo.isOpen;
            containerInfo.isOpen = willOpen;
            topObj.userData.isOpen = willOpen;

            // Animate container moving part
            if (containerInfo.type === 'drawer') {
              // Slide in/out
              containerInfo.movingPart.position.z = willOpen ? 0.35 : 0;
            } else if (containerInfo.type === 'chest') {
              // Hinge rotation
              containerInfo.movingPart.rotation.x = willOpen ? -Math.PI / 2.2 : 0;
            } else {
              // Cupboard door rotate
              containerInfo.movingPart.rotation.y = willOpen ? -Math.PI / 1.8 : 0;
            }

            sound.playContainerOpen();

            // Reveal hidden items inside
            level.items.forEach((lvlItem) => {
              if (lvlItem.hiddenInside === containerId && !lvlItem.found) {
                const mesh = sceneResult.itemMeshMap.get(lvlItem.id);
                if (mesh) {
                  mesh.visible = willOpen;
                }
              }
            });

            if (onContainerToggled) {
              onContainerToggled(topObj.userData.name, willOpen);
            }
          }
          return;
        }
      }

      // If clicked on room background or empty space
      sound.playMisclick();
      onMisclick();
    };

    // Touch Support for mobile / touchpads
    let touchStartX = 0;
    let touchStartY = 0;
    let initialPinchDist = 0;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - touchStartX;
        const deltaY = e.touches[0].clientY - touchStartY;
        cameraControlRef.current.targetSpherical.theta -= deltaX * 0.007;
        cameraControlRef.current.targetSpherical.phi -= deltaY * 0.007;
        touchStartX = e.touches[0].clientX;
        touchStartY = e.touches[0].clientY;
      } else if (e.touches.length === 2) {
        const dist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        const factor = (initialPinchDist - dist) * 0.02;
        cameraControlRef.current.targetSpherical.radius += factor;
        initialPinchDist = dist;
      }
    };

    const domElem = renderer.domElement;
    domElem.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    domElem.addEventListener('wheel', onWheel, { passive: false });
    domElem.addEventListener('click', onClick);
    domElem.addEventListener('touchstart', onTouchStart, { passive: true });
    domElem.addEventListener('touchmove', onTouchMove, { passive: true });

    // 7. Resize Observer
    const resizeObserver = new ResizeObserver(() => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const newW = container.clientWidth;
      const newH = container.clientHeight;
      cameraRef.current.aspect = newW / newH;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(newW, newH);
    });
    resizeObserver.observe(container);

    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
      domElem.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      domElem.removeEventListener('wheel', onWheel);
      domElem.removeEventListener('click', onClick);
      domElem.removeEventListener('touchstart', onTouchStart);
      domElem.removeEventListener('touchmove', onTouchMove);
      resizeObserver.disconnect();
      if (container.contains(domElem)) {
        container.removeChild(domElem);
      }

      // Clean up any remaining celebrations
      celebrationsRef.current.forEach((c) => {
        scene.remove(c.haloAura);
        scene.remove(c.shockwaveRing);
        scene.remove(c.glowLight);
        scene.remove(c.particlePoints);
        c.haloAura.geometry.dispose();
        (c.haloAura.material as THREE.Material).dispose();
        c.shockwaveRing.geometry.dispose();
        (c.shockwaveRing.material as THREE.Material).dispose();
        c.glowLight.dispose();
        c.particlePoints.geometry.dispose();
        (c.particlePoints.material as THREE.Material).dispose();
      });
      celebrationsRef.current = [];

      renderer.dispose();
    };
  }, [level]);

  // Flashlight toggle effect
  useEffect(() => {
    if (flashlightRef.current) {
      flashlightRef.current.intensity = flashlightMode ? 3.0 : 0;
    }
  }, [flashlightMode]);

  // Update item visibility when found outside canvas (e.g. loaded state)
  useEffect(() => {
    const sceneData = sceneDataRef.current;
    if (!sceneData) return;
    foundItemIds.forEach((id) => {
      const mesh = sceneData.itemMeshMap.get(id);
      if (mesh && !mesh.userData.isAnimatingFound) {
        mesh.userData.isCollected = true;
        mesh.visible = false;
      }
    });
  }, [foundItemIds]);

  // Handle active Hint
  useEffect(() => {
    const sceneData = sceneDataRef.current;
    const marker = hintMarkerRef.current;
    if (!sceneData || !marker) return;

    if (activeHintItemId) {
      const itemMesh = sceneData.itemMeshMap.get(activeHintItemId);
      if (itemMesh) {
        const pos = itemMesh.position;
        marker.position.set(pos.x, Math.max(0.02, pos.y - 0.25), pos.z);
        marker.visible = true;

        // Also smoothly rotate camera towards hint direction
        const angle = Math.atan2(pos.x, pos.z);
        cameraControlRef.current.targetSpherical.theta = angle;
      }
    } else {
      marker.visible = false;
    }
  }, [activeHintItemId]);

  return (
    <div id="game-canvas-container" className="relative w-full h-full select-none overflow-hidden bg-stone-950">
      <div ref={mountRef} className="w-full h-full" />

      {/* 2D Floating Sparkle Celebration Badges */}
      {floatingSparkles.map((spk) => (
        <div
          key={spk.id}
          className="pointer-events-none absolute z-30 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 text-stone-950 font-bold text-xs shadow-lg shadow-amber-500/40 backdrop-blur-sm -translate-x-1/2 -translate-y-1/2 animate-float-sparkle border border-amber-200/60"
          style={{
            left: `${spk.x}px`,
            top: `${spk.y}px`,
          }}
        >
          <Sparkles className="w-3.5 h-3.5 fill-current text-stone-900 animate-spin" />
          <span>{spk.name} Ditemukan!</span>
          <span className="text-[10px] bg-stone-900/20 px-1.5 py-0.5 rounded-full">+150</span>
        </div>
      ))}

      {/* Floating Hover Tooltip */}
      {hoveredName && (
        <div
          className="pointer-events-none absolute z-20 px-3 py-1.5 rounded-lg bg-stone-900/90 text-amber-200 text-xs font-medium border border-amber-500/40 shadow-xl backdrop-blur-sm transform -translate-x-1/2 -translate-y-full tracking-wide transition-all"
          style={{
            left: `${cursorPos.x}px`,
            top: `${cursorPos.y - 14}px`,
          }}
        >
          🔍 {hoveredName}
        </div>
      )}

      {/* Quick Camera Reset Pill in corner */}
      <button
        id="btn-reset-view"
        onClick={resetCamera}
        className="absolute bottom-4 right-4 z-10 flex items-center gap-1.5 px-3 py-2 rounded-xl bg-stone-900/80 hover:bg-stone-800 text-stone-300 hover:text-amber-300 text-xs font-medium border border-stone-700/80 shadow-lg backdrop-blur-md transition-all active:scale-95"
        title="Kembalikan sudut pandang kamera awal"
      >
        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
          <path d="M3 3v5h5" />
        </svg>
        Reset Kamera 3D
      </button>
    </div>
  );
};
