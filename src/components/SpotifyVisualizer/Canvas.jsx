import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import Planes from './Planes';

export default function Canvas() {
  const canvasRef = useRef(null);
  const sceneRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const element = canvasRef.current;
    let scene, camera, renderer, planes, clock, time = 0;
    let sizes, dimensions;

    // Initialize Three.js
    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      100
    );
    scene.add(camera);
    camera.position.z = 10;

    dimensions = {
      width: window.innerWidth,
      height: window.innerHeight,
      pixelRatio: Math.min(2, window.devicePixelRatio),
    };

    renderer = new THREE.WebGLRenderer({
      canvas: element,
      alpha: true,
    });
    renderer.setSize(dimensions.width, dimensions.height);
    renderer.setPixelRatio(dimensions.pixelRatio);

    // Calculate sizes
    let fov = camera.fov * (Math.PI / 180);
    let height = camera.position.z * Math.tan(fov / 2) * 2;
    let width = height * camera.aspect;

    sizes = {
      width: width,
      height: height,
    };

    // Create planes
    planes = new Planes({ scene, sizes });
    planes.bindDrag(element);

    clock = new THREE.Clock();

    // Handle resize
    const onResize = () => {
      dimensions = {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: Math.min(2, window.devicePixelRatio),
      };

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      fov = camera.fov * (Math.PI / 180);
      height = camera.position.z * Math.tan(fov / 2) * 2;
      width = height * camera.aspect;

      sizes = {
        width: width,
        height: height,
      };

      if (planes) {
        planes.shaderParameters = {
          maxX: sizes.width * 2,
          maxY: sizes.height * 2,
        };
        if (planes.material) {
          planes.material.uniforms.uMaxXdisplacement.value.set(
            sizes.width * 2,
            sizes.height * 2
          );
        }
      }

      renderer.setPixelRatio(dimensions.pixelRatio);
      renderer.setSize(dimensions.width, dimensions.height);
    };

    window.addEventListener('resize', onResize);

    // Render loop
    const render = () => {
      const now = clock.getElapsedTime();
      const delta = now - time;
      time = now;

      const normalizedDelta = delta / (1 / 60);

      if (planes) {
        planes.render(normalizedDelta);
      }

      renderer.render(scene, camera);
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    // Cleanup
    return () => {
      window.removeEventListener('resize', onResize);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (planes) {
        planes.destroy();
      }
      if (renderer) {
        renderer.dispose();
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="webgl"
      style={{
        position: 'fixed',
        inset: 0,
        top: 0,
        left: 0,
        zIndex: 1,
        height: '100vh',
        width: '100%',
        display: 'block',
      }}
    />
  );
}

