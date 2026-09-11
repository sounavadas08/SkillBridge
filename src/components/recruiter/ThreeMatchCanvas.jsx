import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { Sparkles, Compass, Eye, RotateCcw } from 'lucide-react';

const DEFAULT_CANDIDATES = [
  {
    id: 1,
    name: 'Alex Chen',
    school: 'Stanford University',
    degree: 'B.S. CS (Senior)',
    matchScore: 98,
    vectorPos: [4.2, 1.4, -2.2],
    color: '#FF8100',
    topSkill: 'React.js & Distributed Systems'
  },
  {
    id: 2,
    name: 'Sarah Jenkins',
    school: 'MIT',
    degree: 'M.S. EECS',
    matchScore: 94,
    vectorPos: [-5.2, 2.6, 3.1],
    color: '#FF8100',
    topSkill: 'Python & Database Engine'
  },
  {
    id: 3,
    name: 'Marcus Vance',
    school: 'UC Berkeley',
    degree: 'B.S. EECS',
    matchScore: 89,
    vectorPos: [5.8, -3.2, 5.0],
    color: '#FF8100',
    topSkill: 'React Native & UI Engineering'
  }
];

export function ThreeMatchCanvas({ 
  activeMatchId = 1, 
  candidates = [], 
  selectedCandidate = null, 
  onSelectCandidate = () => {},
  searchQuery = ''
}) {
  const mountRef = useRef(null);
  const controlsRef = useRef(null);
  const [hoveredCandidate, setHoveredCandidate] = useState(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0, visible: false });

  // Merge candidates with 3D vector coordinates
  const candidateNodes = useMemo(() => {
    const list = (candidates && candidates.length > 0) ? candidates : DEFAULT_CANDIDATES;
    return list.map((c, i) => {
      const fallback = DEFAULT_CANDIDATES[i % DEFAULT_CANDIDATES.length];
      return {
        ...fallback,
        ...c,
        vectorPos: fallback.vectorPos
      };
    });
  }, [candidates]);

  const currentActiveId = selectedCandidate?.id || activeMatchId || 1;
  const currentActiveCandidate = useMemo(() => {
    return candidateNodes.find(c => c.id === currentActiveId) || candidateNodes[0];
  }, [candidateNodes, currentActiveId]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    // 1. Scene & Camera Setup
    const scene = new THREE.Scene();
    // Atmospheric dark fog for subtle depth fade
    scene.fog = new THREE.FogExp2(0x090A0F, 0.022);

    const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 1000);
    camera.position.set(0, 16, 26);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    
    // Explicitly style canvas to fill container 100%
    const canvas = renderer.domElement;
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.display = 'block';
    container.appendChild(canvas);

    // 2. Smooth OrbitControls
    const controls = new OrbitControls(camera, canvas);
    controlsRef.current = controls;
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;
    controls.enablePan = false;
    controls.minDistance = 14;
    controls.maxDistance = 45;
    controls.maxPolarAngle = Math.PI / 2 + 0.25; // Don't go completely under floor
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.45;
    controls.target.set(0, 0, 0);

    // Stop auto-rotate briefly when user interacts
    canvas.addEventListener('pointerdown', () => {
      controls.autoRotate = false;
    });

    // 3. Texture generator for soft circular glow particles
    const createSoftParticleTexture = () => {
      const texCanvas = document.createElement('canvas');
      texCanvas.width = 64;
      texCanvas.height = 64;
      const ctx = texCanvas.getContext('2d');
      const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
      grad.addColorStop(0.3, 'rgba(255, 255, 255, 0.85)');
      grad.addColorStop(0.65, 'rgba(255, 150, 50, 0.35)');
      grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(texCanvas);
    };

    const particleTexture = createSoftParticleTexture();

    // 4. Latent Talent Vector Field (160 background candidate points)
    const latentCount = 160;
    const latentGeo = new THREE.BufferGeometry();
    const latentPositions = new Float32Array(latentCount * 3);
    const latentColors = new Float32Array(latentCount * 3);
    const latentVelocities = [];

    const colorWarmGray = new THREE.Color(0x8C8477);
    const colorAmberGlow = new THREE.Color(0xFF8100);
    const colorCrimson = new THREE.Color(0xDC143C);

    for (let i = 0; i < latentCount; i++) {
      const r = 3 + Math.random() * 15;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      const px = r * Math.cos(theta) * Math.cos(phi);
      const py = (Math.random() - 0.5) * 10;
      const pz = r * Math.sin(theta) * Math.cos(phi);

      latentPositions[i * 3] = px;
      latentPositions[i * 3 + 1] = py;
      latentPositions[i * 3 + 2] = pz;

      // Subtle hue mix for latent embeddings
      const mixedCol = Math.random() > 0.85 ? colorAmberGlow : (Math.random() > 0.7 ? colorCrimson : colorWarmGray);
      latentColors[i * 3] = mixedCol.r;
      latentColors[i * 3 + 1] = mixedCol.g;
      latentColors[i * 3 + 2] = mixedCol.b;

      latentVelocities.push({
        x: (Math.random() - 0.5) * 0.008,
        y: (Math.random() - 0.5) * 0.008,
        z: (Math.random() - 0.5) * 0.008
      });
    }

    latentGeo.setAttribute('position', new THREE.BufferAttribute(latentPositions, 3));
    latentGeo.setAttribute('color', new THREE.BufferAttribute(latentColors, 3));

    const latentMaterial = new THREE.PointsMaterial({
      size: 0.65,
      map: particleTexture,
      vertexColors: true,
      transparent: true,
      opacity: 0.7,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });

    const latentPoints = new THREE.Points(latentGeo, latentMaterial);
    scene.add(latentPoints);

    // 5. Constellation Lines between nearby latent vectors (Semantic cluster graph)
    const linePairs = [];
    for (let i = 0; i < 40; i++) {
      const p1 = new THREE.Vector3(
        latentPositions[i * 3],
        latentPositions[i * 3 + 1],
        latentPositions[i * 3 + 2]
      );
      for (let j = i + 1; j < Math.min(i + 8, latentCount); j++) {
        const p2 = new THREE.Vector3(
          latentPositions[j * 3],
          latentPositions[j * 3 + 1],
          latentPositions[j * 3 + 2]
        );
        if (p1.distanceTo(p2) < 4.8) {
          linePairs.push(p1.x, p1.y, p1.z, p2.x, p2.y, p2.z);
        }
      }
    }

    const constGeo = new THREE.BufferGeometry();
    constGeo.setAttribute('position', new THREE.Float32BufferAttribute(linePairs, 3));
    const constMat = new THREE.LineBasicMaterial({
      color: 0x6B6459,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending
    });
    const constellationLines = new THREE.LineSegments(constGeo, constMat);
    scene.add(constellationLines);

    // 6. Vector Similarity Distance Threshold Rings (Iso-similarity circles on floor)
    const createSimilarityRing = (radius, labelText, opacity = 0.25) => {
      const ringGroup = new THREE.Group();
      const ringGeo = new THREE.RingGeometry(radius - 0.03, radius + 0.03, 64);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0xFF8100,
        transparent: true,
        opacity: opacity,
        side: THREE.DoubleSide
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.rotation.x = Math.PI / 2;
      ringMesh.position.y = -4;
      ringGroup.add(ringMesh);
      return ringGroup;
    };

    const ring95 = createSimilarityRing(4.5, '0.95', 0.28);
    const ring90 = createSimilarityRing(7.2, '0.90', 0.18);
    const ring85 = createSimilarityRing(10.5, '0.85', 0.12);
    scene.add(ring95);
    scene.add(ring90);
    scene.add(ring85);

    // Faint grid floor on the bottom
    const gridHelper = new THREE.GridHelper(28, 20, 0xDC143C, 0x241C13);
    gridHelper.position.y = -4;
    gridHelper.material.opacity = 0.35;
    gridHelper.material.transparent = true;
    scene.add(gridHelper);

    // 7. Center Target Vector Node: Job Requirement Vector Q (0, 0, 0)
    const targetGroup = new THREE.Group();

    // Central pulsing core
    const targetCoreGeo = new THREE.SphereGeometry(0.85, 32, 32);
    const targetCoreMat = new THREE.MeshBasicMaterial({ color: 0xFF8100 });
    const targetCore = new THREE.Mesh(targetCoreGeo, targetCoreMat);
    targetGroup.add(targetCore);

    // Glowing shell
    const targetGlowGeo = new THREE.SphereGeometry(1.2, 32, 32);
    const targetGlowMat = new THREE.MeshBasicMaterial({
      color: 0xDC143C,
      transparent: true,
      opacity: 0.25,
      blending: THREE.AdditiveBlending
    });
    const targetGlow = new THREE.Mesh(targetGlowGeo, targetGlowMat);
    targetGroup.add(targetGlow);

    // Rotating Radar Reticle Ring
    const reticleGeo = new THREE.RingGeometry(1.5, 1.65, 48);
    const reticleMat = new THREE.MeshBasicMaterial({
      color: 0xFF8100,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide
    });
    const reticle = new THREE.Mesh(reticleGeo, reticleMat);
    targetGroup.add(reticle);

    // Outer expanding ripple ring
    const rippleGeo = new THREE.RingGeometry(1.9, 2.05, 48);
    const rippleMat = new THREE.MeshBasicMaterial({
      color: 0xFF8100,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const ripple = new THREE.Mesh(rippleGeo, rippleMat);
    targetGroup.add(ripple);

    scene.add(targetGroup);

    // 8. Candidate Nodes & Interactive Raycast Meshes
    const candidateMeshes = [];
    const candidateGroup = new THREE.Group();

    candidateNodes.forEach((cand) => {
      const isSelected = cand.id === currentActiveId;
      const [cx, cy, cz] = cand.vectorPos;

      const cGroup = new THREE.Group();
      cGroup.position.set(cx, cy, cz);
      cGroup.userData = { candidate: cand };

      // Core sphere
      const sphereGeo = new THREE.SphereGeometry(isSelected ? 0.7 : 0.5, 24, 24);
      const sphereMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xFF8100 : 0xE7E2D8
      });
      const sphere = new THREE.Mesh(sphereGeo, sphereMat);
      sphere.userData = { candidate: cand };
      cGroup.add(sphere);

      // Outer Selection Halo
      const haloGeo = new THREE.RingGeometry(0.9, 1.05, 32);
      const haloMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xFF8100 : 0x8C8477,
        transparent: true,
        opacity: isSelected ? 0.8 : 0.3,
        side: THREE.DoubleSide
      });
      const halo = new THREE.Mesh(haloGeo, haloMat);
      cGroup.add(halo);

      // Invisible hit sphere for generous raycast clicking & hovering
      const hitGeo = new THREE.SphereGeometry(1.2, 16, 16);
      const hitMat = new THREE.MeshBasicMaterial({ visible: false });
      const hitMesh = new THREE.Mesh(hitGeo, hitMat);
      hitMesh.userData = { candidate: cand };
      cGroup.add(hitMesh);

      candidateMeshes.push(hitMesh);
      candidateGroup.add(cGroup);
    });

    scene.add(candidateGroup);

    // 9. Active Vector Connection Beam & Photon Pulses
    const activeCand = currentActiveCandidate;
    const [ax, ay, az] = activeCand.vectorPos;
    const beamTarget = new THREE.Vector3(ax, ay, az);

    // Main vector beam line
    const beamGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      beamTarget
    ]);
    const beamMat = new THREE.LineBasicMaterial({
      color: 0xFF8100,
      transparent: true,
      opacity: 0.9,
      linewidth: 2
    });
    const vectorBeam = new THREE.Line(beamGeo, beamMat);
    scene.add(vectorBeam);

    // Travelling Photons along the active match vector line
    const photonCount = 4;
    const photonGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const photonMat = new THREE.MeshBasicMaterial({
      color: 0xFFFFFF,
      blending: THREE.AdditiveBlending
    });
    const photons = [];
    for (let i = 0; i < photonCount; i++) {
      const p = new THREE.Mesh(photonGeo, photonMat);
      scene.add(p);
      photons.push({
        mesh: p,
        progress: i / photonCount
      });
    }

    // 10. Interactive Raycasting (Hover & Selection)
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2(-999, -999);

    const handlePointerMove = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(candidateMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object.userData.candidate;
        container.style.cursor = 'pointer';
        setHoveredCandidate(hit);
        setTooltipPos({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          visible: true
        });
      } else {
        container.style.cursor = 'default';
        setTooltipPos(prev => ({ ...prev, visible: false }));
        setHoveredCandidate(null);
      }
    };

    const handlePointerClick = (e) => {
      const rect = container.getBoundingClientRect();
      mouse.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouse.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects(candidateMeshes);

      if (intersects.length > 0) {
        const hit = intersects[0].object.userData.candidate;
        if (hit && onSelectCandidate) {
          onSelectCandidate(hit);
        }
      }
    };

    container.addEventListener('pointermove', handlePointerMove);
    container.addEventListener('click', handlePointerClick);

    // 11. Responsive Dynamic Resize Observer (Solves the squished canvas issue!)
    const updateSize = () => {
      if (!container) return;
      const rect = container.getBoundingClientRect();
      const w = rect.width || container.clientWidth || 600;
      const h = rect.height || container.clientHeight || 380;
      if (w > 0 && h > 0) {
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false); // false keeps canvas style width/height 100% intact!
      }
    };

    const resizeObserver = new ResizeObserver(() => {
      updateSize();
    });
    resizeObserver.observe(container);

    // Run immediate updates to guard against early layout states
    requestAnimationFrame(updateSize);
    const delayedTimer = setTimeout(updateSize, 120);

    // 12. Animation Loop
    let animId;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const elapsed = clock.getElapsedTime();

      // Slow drift of background latent points
      const posArray = latentPoints.geometry.attributes.position.array;
      for (let i = 0; i < latentCount; i++) {
        posArray[i * 3] += latentVelocities[i].x;
        posArray[i * 3 + 1] += latentVelocities[i].y;
        posArray[i * 3 + 2] += latentVelocities[i].z;

        if (Math.abs(posArray[i * 3]) > 17) latentVelocities[i].x *= -1;
        if (Math.abs(posArray[i * 3 + 1]) > 8) latentVelocities[i].y *= -1;
        if (Math.abs(posArray[i * 3 + 2]) > 17) latentVelocities[i].z *= -1;
      }
      latentPoints.geometry.attributes.position.needsUpdate = true;

      // Pulse and rotate target center node
      reticle.rotation.z = elapsed * 0.45;
      ripple.rotation.z = -elapsed * 0.3;

      const rippleScale = 1 + (elapsed % 2.5) * 0.45;
      ripple.scale.set(rippleScale, rippleScale, 1);
      rippleMat.opacity = Math.max(0, 0.45 - (elapsed % 2.5) * 0.18);

      const targetPulse = 1 + Math.sin(elapsed * 3) * 0.05;
      targetCore.scale.set(targetPulse, targetPulse, targetPulse);

      // Billboarding for halos: make candidate halos always face camera
      candidateGroup.children.forEach(cGroup => {
        cGroup.children.forEach(child => {
          if (child.geometry instanceof THREE.RingGeometry) {
            child.lookAt(camera.position);
          }
        });
      });

      // Animate travelling photons along the vector match line
      photons.forEach(pt => {
        pt.progress = (pt.progress + 0.008) % 1;
        pt.mesh.position.lerpVectors(new THREE.Vector3(0, 0, 0), beamTarget, pt.progress);
        const scale = Math.sin(pt.progress * Math.PI) * 1.3;
        pt.mesh.scale.set(scale, scale, scale);
      });

      controls.update();
      renderer.render(scene, camera);
    };

    animate();

    // Cleanup
    return () => {
      cancelAnimationFrame(animId);
      clearTimeout(delayedTimer);
      resizeObserver.disconnect();
      container.removeEventListener('pointermove', handlePointerMove);
      container.removeEventListener('click', handlePointerClick);
      if (controls) controls.dispose();
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [currentActiveId, candidateNodes, onSelectCandidate]);

  const handleResetCamera = () => {
    if (controlsRef.current) {
      controlsRef.current.reset();
      controlsRef.current.autoRotate = true;
    }
  };

  return (
    <div 
      ref={mountRef} 
      className="w-full relative overflow-hidden rounded-xl bg-[#090A0F] border border-border/60 shadow-2xl select-none"
      style={{ height: '390px' }}
    >
      {/* Top Header Overlay */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-2 pointer-events-none">
        <div className="inline-flex items-center gap-1.5 text-[11px] font-mono tracking-wider text-primary uppercase bg-black/75 backdrop-blur-md px-3 py-1 rounded-md border border-primary/30 shadow-sm">
          <span className="size-1.5 rounded-full bg-primary animate-pulse" />
          Semantic Vector Embedding Field
        </div>
        <div className="hidden sm:inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-md border border-border/30">
          <span>768-D → 3D PCA</span>
        </div>
      </div>

      {/* Top Right Active Candidate Indicator */}
      <div className="absolute top-3 right-3 z-10 pointer-events-none">
        <div className="text-[11px] font-mono font-medium text-foreground bg-black/75 backdrop-blur-md px-3 py-1 rounded-md border border-border/40 shadow-sm">
          Target: <span className="text-primary font-bold">{currentActiveCandidate.name}</span> ({currentActiveCandidate.matchScore}%)
        </div>
      </div>

      {/* Floating Interactive Hover Tooltip */}
      {tooltipPos.visible && hoveredCandidate && (
        <div 
          className="absolute z-30 pointer-events-none transform -translate-x-1/2 -translate-y-full mb-3 bg-card/95 border border-primary/50 backdrop-blur-md px-3 py-2 rounded-lg shadow-xl text-xs w-48 transition-all"
          style={{ 
            left: `${tooltipPos.x}px`, 
            top: `${tooltipPos.y}px` 
          }}
        >
          <div className="flex items-center justify-between gap-1 border-b border-border/60 pb-1 mb-1">
            <span className="font-bold text-foreground truncate">{hoveredCandidate.name}</span>
            <span className="font-mono text-primary font-bold text-[11px]">{hoveredCandidate.matchScore}%</span>
          </div>
          <p className="text-[10px] text-muted-foreground truncate">{hoveredCandidate.school}</p>
          <p className="text-[10px] text-primary/90 font-medium mt-0.5 truncate">★ {hoveredCandidate.topSkill}</p>
          <p className="text-[9px] text-muted-foreground/75 mt-1 text-center font-mono">Click node to inspect dossier</p>
        </div>
      )}

      {/* Bottom Footer Overlay */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between pointer-events-none">
        <div className="text-[11px] text-muted-foreground/90 font-mono bg-black/70 backdrop-blur-md px-2.5 py-1 rounded border border-border/30">
          Cosine Distance: <span className="text-foreground font-semibold">{(1 - currentActiveCandidate.matchScore / 100).toFixed(3)}</span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <span className="hidden md:inline-block text-[10px] text-muted-foreground/80 font-mono">
            Drag to rotate • Click node to select
          </span>
          <button
            onClick={handleResetCamera}
            className="inline-flex items-center gap-1 text-[10px] font-mono text-muted-foreground hover:text-foreground bg-black/70 hover:bg-black/90 px-2 py-1 rounded border border-border/40 transition-colors shadow-sm cursor-pointer"
            title="Reset Camera Orientation"
          >
            <RotateCcw size={11} />
            Reset View
          </button>
        </div>
      </div>
    </div>
  );
}
