import { useRef, useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import * as THREE from 'three';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import { motion } from 'framer-motion'; // Import motion from framer-motion

// Main App component
export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  return (
    <Hero isAuthenticated={isAuthenticated} />
  );
}

const Hero = ({ isAuthenticated }) => {
  const mountRef = useRef(null);
  const animationFrameId = useRef(null);
  const isDragging = useRef(false);
  const previousMousePosition = useRef({ x: 0, y: 0 });
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  // Keywords for the sliding effect
  const keywords = ['Heat', 'Insulation', 'Furnace', 'Efficiency'];
  const [currentKeywordIndex, setCurrentKeywordIndex] = useState(0);
  const [fade, setFade] = useState(true); // State for fade effect

  // Callback to handle window resize for responsiveness
  const handleResize = useCallback((camera, renderer) => {
    if (mountRef.current && camera && renderer) {
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
  }, []);

  useEffect(() => {
    // Keyword cycling effect
    const keywordInterval = setInterval(() => {
      setFade(false); // Start fade-out
      setTimeout(() => {
        setCurrentKeywordIndex((prevIndex) => (prevIndex + 1) % keywords.length);
        setFade(true); // Start fade-in
      }, 500); // Duration of fade-out before changing keyword
    }, 3000); // Change keyword every 3 seconds

    return () => clearInterval(keywordInterval);
  }, [keywords.length]); // Depend on keywords.length to avoid issues if keywords array changes

  useEffect(() => {
    if (!mountRef.current) return;

    const scene = new THREE.Scene();
    scene.background = null;

    const camera = new THREE.PerspectiveCamera(
      75,
      mountRef.current.clientWidth / mountRef.current.clientHeight,
      0.1,
      1000
    );
    camera.position.set(0, 0, 3);
    scene.add(camera);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    mountRef.current.appendChild(renderer.domElement);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.3);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
    directionalLight.position.set(5, 5, 5).normalize();
    scene.add(directionalLight);

    const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.4);
    scene.add(hemisphereLight);

    const furnaceGeometry = new THREE.BoxGeometry(1, 1, 1, 16, 16, 16);
    const furnaceMaterial = new THREE.MeshStandardMaterial({
      color: 0xff4500,
      emissive: 0xff4500,
      emissiveIntensity: 0.8,
      metalness: 0.3,
      roughness: 0.4,
    });
    const furnace = new THREE.Mesh(furnaceGeometry, furnaceMaterial);
    scene.add(furnace);

    const furnaceLight = new THREE.PointLight(0xffa500, 1.2, 12);
    furnaceLight.position.set(0, 0, 0);
    furnace.add(furnaceLight);

    const insulationGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const insulationMaterial = new THREE.MeshStandardMaterial({
      color: 0x87ceeb,
      transparent: true,
      opacity: 0.3,
      roughness: 0.1,
      metalness: 0.1,
    });
    const insulation = new THREE.Mesh(insulationGeometry, insulationMaterial);
    scene.add(insulation);

    const particlesCount = 1000;
    const positions = new Float32Array(particlesCount * 3);
    const colors = new Float32Array(particlesCount * 3);
    const opacities = new Float32Array(particlesCount);
    const initialY = new Float32Array(particlesCount);

    const particleGeometry = new THREE.BufferGeometry();
    const particleMaterial = new THREE.PointsMaterial({
      size: 0.03,
      vertexColors: true,
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.8,
    });

    for (let i = 0; i < particlesCount; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 3.0;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 3.0;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 3.0;

      initialY[i] = positions[i * 3 + 1];

      const color = new THREE.Color();
      color.setHSL(0.0 + Math.random() * 0.15, 1.0, 0.4 + Math.random() * 0.6);
      colors[i * 3] = color.r;
      colors[i * 3 + 1] = color.g;
      colors[i * 3 + 2] = color.b;

      opacities[i] = 1.0;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('opacity', new THREE.BufferAttribute(opacities, 1));

    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    const onMouseDown = (event) => {
      isDragging.current = true;
      previousMousePosition.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const onMouseMove = (event) => {
      if (!isDragging.current) return;

      const deltaX = event.clientX - previousMousePosition.current.x;
      const deltaY = event.clientY - previousMousePosition.current.y;

      scene.rotation.y += deltaX * 0.005;
      scene.rotation.x += deltaY * 0.005;

      previousMousePosition.current = {
        x: event.clientX,
        y: event.clientY,
      };
    };

    const onMouseUp = () => {
      isDragging.current = false;
    };

    const currentMount = mountRef.current;
    currentMount.addEventListener('mousedown', onMouseDown);
    currentMount.addEventListener('mousemove', onMouseMove);
    currentMount.addEventListener('mouseup', onMouseUp);
    currentMount.addEventListener('mouseleave', onMouseUp);

    const animate = () => {
      animationFrameId.current = requestAnimationFrame(animate);

      furnace.rotation.x += 0.001;
      furnace.rotation.y += 0.002;
      insulation.rotation.x += 0.0005;
      insulation.rotation.y += 0.001;

      insulation.material.opacity = 0.3 + Math.sin(Date.now() * 0.001) * 0.1;

      const positionsArray = particleGeometry.attributes.position.array;
      const opacitiesArray = particleGeometry.attributes.opacity.array;
      for (let i = 0; i < particlesCount; i++) {
        positionsArray[i * 3 + 1] += 0.005 + Math.random() * 0.002;
        positionsArray[i * 3] += (Math.random() - 0.5) * 0.002;
        positionsArray[i * 3 + 2] += (Math.random() - 0.5) * 0.002;

        const normalizedY = (positionsArray[i * 3 + 1] + 2.0) / 4.0;
        opacitiesArray[i] = 1.0 - normalizedY;

        if (positionsArray[i * 3 + 1] > 2.0) {
          positionsArray[i * 3 + 1] = -2.0;
          positionsArray[i * 3] = (Math.random() - 0.5) * 3.0;
          positionsArray[i * 3 + 2] = (Math.random() - 0.5) * 3.0;
          opacitiesArray[i] = 1.0;
        }
      }
      particleGeometry.attributes.position.needsUpdate = true;
      particleGeometry.attributes.opacity.needsUpdate = true;
      particleMaterial.opacity = 1.0;

      renderer.render(scene, camera);
    };

    animate();

    const resizeListener = () => handleResize(camera, renderer);
    window.addEventListener('resize', resizeListener);

    return () => {
      cancelAnimationFrame(animationFrameId.current);
      window.removeEventListener('resize', resizeListener);
      currentMount.removeEventListener('mousedown', onMouseDown);
      currentMount.removeEventListener('mousemove', onMouseMove);
      currentMount.removeEventListener('mouseup', onMouseUp);
      currentMount.removeEventListener('mouseleave', onMouseUp);
      if (currentMount && renderer.domElement) {
        currentMount.removeChild(renderer.domElement);
      }
      renderer.dispose();
      furnaceMaterial.dispose();
      insulationMaterial.dispose();
      particleMaterial.dispose();
      furnaceGeometry.dispose();
      insulationGeometry.dispose();
      particleGeometry.dispose();
      furnaceLight.dispose();
    };
  }, [handleResize]);

  // Define animation variants for Framer Motion
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        delayChildren: 0.3,
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="relative bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-20 overflow-hidden min-h-[90vh] flex items-center justify-center">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-4 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute -bottom-8 -right-4 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-pulse"></div>
      </div>

      {/* Main content wrapper for side-by-side layout */}
      <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-12 z-0 relative">
        {/* Content Overlay - on the left */}
        <motion.div
          className="w-full md:w-2/3 text-center md:text-left"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          <motion.div className="mb-6" variants={itemVariants}>
            <span className="inline-block px-4 py-2 bg-blue-500/20 text-blue-300 rounded-full text-sm font-medium border border-blue-500/30 backdrop-blur-sm">
              🚀 Trusted by 50,000+ Engineers Worldwide
            </span>
          </motion.div>

          <motion.h1 className="text-5xl md:text-7xl font-extrabold text-white mb-6 leading-tight" variants={itemVariants}>
          <span className="bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">Furn</span>
          <span  className="bg-gradient-to-r from-app-blue to-blue-400 bg-clip-text text-transparent" >Xpert</span>
            <br />
            <span className="text-3xl md:text-4xl font-bold text-gray-300">
              Advanced{' '}
              <span
                className={`inline-block transition-all duration-500 ease-in-out bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent ${
                  fade ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
                }`}
              >
                {keywords[currentKeywordIndex]}
              </span>
            </span>
            <span className="text-3xl md:text-4xl font-bold text-gray-300">
              {' '} Analysis & Simulation
            </span>
          </motion.h1>

          <motion.p className="text-xl md:text-2xl text-gray-300 mb-8 max-w-2xl mx-auto md:mx-0 leading-relaxed" variants={itemVariants}>
            Revolutionize your engineering workflow with AI-powered insulation calculations,
            real-time simulations, and industry-leading precision.
          </motion.p>

          <motion.div className="flex flex-col sm:flex-row gap-4 items-center justify-center md:justify-start mb-8" variants={itemVariants}>
            <Link to={isAuthenticated ? "/dashboard" : "/auth"}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-app-blue to-app-orange hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-full shadow-2xl transition-all duration-300 ease-in-out transform hover:scale-105 hover:shadow-blue-500/25 border-0"
              >
                Get Started
                <span className="ml-2">→</span>
              </Button>
            </Link>
            <Dialog open={isVideoOpen} onOpenChange={setIsVideoOpen}>
              <DialogTrigger asChild>
                <button className="flex items-center text-white hover:text-blue-300 transition-colors duration-300 group">
                  <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center mr-3 group-hover:bg-white/20 transition-all duration-300">
                    <div className="w-0 h-0 border-l-[8px] border-l-white border-t-[6px] border-t-transparent border-b-[6px] border-b-transparent ml-1"></div>
                  </div>
                  <span className="font-medium">Watch Demo (2 min)</span>
                </button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl w-full p-0 bg-black border-0">
                <div className="relative aspect-video">
                  <video
                    controls
                    autoPlay
                    className="w-full h-full rounded-lg"
                    poster="https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=450&fit=crop"
                  >
                    <source src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4" type="video/mp4" />
                    Your browser does not support the video tag.
                  </video>
                </div>
              </DialogContent>
            </Dialog>
          </motion.div>

          <motion.div className="flex items-center space-x-6 text-gray-400" variants={itemVariants}>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              <span>No Credit Card Required</span>
            </div>
            <div className="flex items-center">
              <span className="text-green-400 mr-2">✓</span>
              <span>14-Day Free Trial</span>
            </div>
          </motion.div>
        </motion.div>

        {/* 3D Canvas Container - on the right */}
        <motion.div
          className="w-full md:w-1/2 relative"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-3xl blur-3xl"></div>
          <div
            ref={mountRef}
            className="relative w-full h-[400px] md:h-[600px] bg-black/20 backdrop-blur-sm rounded-3xl overflow-hidden cursor-grab active:cursor-grabbing border border-white/10 shadow-2xl"
          ></div>
        </motion.div>
      </div>
    </section>
  );
};