import React, { useRef, useEffect } from 'react';
import * as THREE from 'three';

export function ThreeMatchCanvas({ activeMatchId = 1, width = '100%', height = '100%' }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 600;
    const height = container.clientHeight || 450;

    // 1. Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.z = 25;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 2. Candidate Nodes (Particle Field)
    const nodeCount = 120;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(nodeCount * 3);
    const velocities = [];

    for (let i = 0; i < nodeCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 30;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 20;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 15;

      velocities.push({
        x: (Math.random() - 0.5) * 0.015,
        y: (Math.random() - 0.5) * 0.015,
        z: (Math.random() - 0.5) * 0.01
      });
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
      color: 0x8C8477,
      size: 0.45,
      transparent: true,
      opacity: 0.75
    });

    const particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // 3. Target Job Requirement Node (Glowing Amber Center)
    const targetGeo = new THREE.SphereGeometry(0.8, 32, 32);
    const targetMat = new THREE.MeshBasicMaterial({ color: 0xFF8100 });
    const targetMesh = new THREE.Mesh(targetGeo, targetMat);
    targetMesh.position.set(0, 0, 0);
    scene.add(targetMesh);

    // Outer Glow Ring for Target Node
    const ringGeo = new THREE.RingGeometry(1.2, 1.35, 32);
    const ringMat = new THREE.MeshBasicMaterial({ color: 0xFF8100, side: THREE.DoubleSide, transparent: true, opacity: 0.4 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    scene.add(ringMesh);

    // 4. Match Connection Line
    const lineMat = new THREE.LineBasicMaterial({ color: 0xFF8100, linewidth: 2, transparent: true, opacity: 0.85 });
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(6, 4, -2)
    ]);
    const connectionLine = new THREE.Line(lineGeo, lineMat);
    scene.add(connectionLine);

    // Highlighted Candidate Node
    const candGeo = new THREE.SphereGeometry(0.55, 24, 24);
    const candMat = new THREE.MeshBasicMaterial({ color: 0xFF8100 });
    const candidateMesh = new THREE.Mesh(candGeo, candMat);
    candidateMesh.position.set(6, 4, -2);
    scene.add(candidateMesh);

    // 5. Subtle Mouse Parallax
    let mouseX = 0;
    let mouseY = 0;
    const handleMouseMove = (event) => {
      const rect = container.getBoundingClientRect();
      mouseX = ((event.clientX - rect.left) / container.clientWidth - 0.5) * 2;
      mouseY = -((event.clientY - rect.top) / container.clientHeight - 0.5) * 2;
    };

    container.addEventListener('mousemove', handleMouseMove);

    // 6. Animation Loop
    let animationFrameId;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const elapsedTime = clock.getElapsedTime();

      // Slow drift for node points
      const posArr = particles.geometry.attributes.position.array;
      for (let i = 0; i < nodeCount; i++) {
        posArr[i * 3] += velocities[i].x;
        posArr[i * 3 + 1] += velocities[i].y;
        posArr[i * 3 + 2] += velocities[i].z;

        // Bounce within bounds
        if (Math.abs(posArr[i * 3]) > 16) velocities[i].x *= -1;
        if (Math.abs(posArr[i * 3 + 1]) > 12) velocities[i].y *= -1;
        if (Math.abs(posArr[i * 3 + 2]) > 10) velocities[i].z *= -1;
      }
      particles.geometry.attributes.position.needsUpdate = true;

      // Pulse ring & rotate ring
      ringMesh.rotation.z = elapsedTime * 0.5;
      const pulseScale = 1 + Math.sin(elapsedTime * 3) * 0.08;
      ringMesh.scale.set(pulseScale, pulseScale, 1);

      // Smooth camera parallax
      camera.position.x += (mouseX * 3 - camera.position.x) * 0.05;
      camera.position.y += (mouseY * 2 - camera.position.y) * 0.05;
      camera.lookAt(scene.position);

      renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [activeMatchId]);

  return (
    <div 
      ref={mountRef} 
      className="w-full h-full min-h-[360px] relative overflow-hidden rounded-xl bg-black/5 dark:bg-white/5 border border-border/30"
    >
      <div className="absolute top-4 left-4 z-10 text-[11px] font-mono tracking-wider text-muted-foreground uppercase bg-background/80 backdrop-blur-md px-3 py-1.5 rounded-md border border-border/40">
        • Semantic Vector Embedding Field
      </div>
    </div>
  );
}
