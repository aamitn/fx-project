// InsulationPreview.tsx
import { useEffect, useRef } from "react"; // Removed useState as props will control
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ZoomIn, ZoomOut, ScanSearch, RefreshCcw } from "lucide-react";
import { useInsulation } from "@/contexts/InsulationContext";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { Input } from "@/components/ui/input";

// Define the props interface for InsulationPreview
interface InsulationPreviewProps {
  modelHeight: number;
  modelWidth: number;
  modelDepth: number;
  zoomLevel: number;
  // Callback to inform the parent (Dashboard) about changes
  onUpdate: (newPreview: {
    modelHeight: number;
    modelWidth: number;
    modelDepth: number;
    zoomLevel: number;
  }) => void;
}

const InsulationPreview: React.FC<InsulationPreviewProps> = ({
  modelHeight, // Received as prop
  modelWidth,  // Received as prop
  modelDepth,  // Received as prop
  zoomLevel,   // Received as prop
  onUpdate,    // Received as prop
}) => {
  const { layers } = useInsulation();

  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();
  const meshesRef = useRef<THREE.Mesh[]>([]);

  // Helper to construct the full update payload and call onUpdate
  const createUpdatePayload = (
    updatedFields: Partial<{
      modelHeight: number;
      modelWidth: number;
      modelDepth: number;
      zoomLevel: number;
    }>
  ) => {
    // Merge current props with updated fields to create a complete payload
    const payload = {
      modelHeight: updatedFields.modelHeight ?? modelHeight,
      modelWidth: updatedFields.modelWidth ?? modelWidth,
      modelDepth: updatedFields.modelDepth ?? modelDepth,
      zoomLevel: updatedFields.zoomLevel ?? zoomLevel,
    };
    onUpdate(payload); // Call the onUpdate prop
  };

  const increaseZoom = () => {
    if (zoomLevel < 200) {
      createUpdatePayload({ zoomLevel: zoomLevel + 25 });
    }
  };
  const decreaseZoom = () => {
    if (zoomLevel > 50) {
      createUpdatePayload({ zoomLevel: zoomLevel - 25 });
    }
  };
  const resetZoom = () => {
    createUpdatePayload({ zoomLevel: 100 });
  };

  // Initialize Scene (runs once on mount)
  useEffect(() => {
    if (!mountRef.current) return;

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 200);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.innerHTML = ""; // Clear existing content
    mountRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    scene.add(new THREE.AmbientLight(0xffffff, 1)); // Add ambient light

    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      controls.dispose();
      renderer.dispose();
      mountRef.current?.removeChild(renderer.domElement);
    };
  }, []); // Empty dependency array means it runs only once

  // Render Layers - This effect now depends on props and will re-render when they change
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    
    if (!scene || !renderer || !camera) return;
    
    // Clean up previous layers
    const oldGroup = scene.getObjectByName("LayerGroup");
    if (oldGroup) {
      oldGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose();
          if (object.material instanceof THREE.Material) {
            object.material.dispose();
          }
        }
      });
      scene.remove(oldGroup);
    }
    
    // Add lighting if not already present
    if (!scene.getObjectByName("MainLight")) {
      const dirLight = new THREE.DirectionalLight(0xffffff, 0.7);
      dirLight.name = "MainLight";
      dirLight.position.set(100, 200, 150);
      dirLight.castShadow = true;
      dirLight.shadow.mapSize.set(1024, 1024);
      dirLight.shadow.camera.near = 1;
      dirLight.shadow.camera.far = 500;
      dirLight.shadow.camera.left = -100;
      dirLight.shadow.camera.right = 100;
      dirLight.shadow.camera.top = 100;
      dirLight.shadow.camera.bottom = -100;
      scene.add(dirLight);
      
      const ambient = new THREE.AmbientLight(0xffffff, 0.3);
      scene.add(ambient);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    }
    
    const group = new THREE.Group();
    group.name = "LayerGroup";
    
    const totalThickness = layers.reduce((sum, l) => sum + (parseFloat(l.thickness) || 20), 0);
    let xOffset = 0;
    
    layers.forEach((layer) => {
      
      const thickness = parseFloat(layer.thickness) || 20;
      const width = (thickness / totalThickness) * modelWidth; // Use prop modelWidth
      
      const geometry = new THREE.BoxGeometry(width, modelHeight, modelDepth); // Use props modelHeight, modelDepth
      const material = new THREE.MeshPhysicalMaterial({
        color: layer.color,
        metalness: 0.2,
        roughness: 0.5,
        reflectivity: 0.4,
        clearcoat: 0.2,
      });
      
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(xOffset + width / 2, modelHeight / 2, 0);
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      group.add(mesh);
      
      const edgeGeometry = new THREE.EdgesGeometry(geometry);
      const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
      const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
      edges.position.copy(mesh.position);
      group.add(edges);
      
      const canvas = document.createElement("canvas");
      canvas.width = 256;
      canvas.height = 64;
      const ctx = canvas.getContext("2d")!;
      ctx.fillStyle = "#fff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#000";
      ctx.font = "bold 20px sans-serif";
      ctx.fillText(layer.name, 10, 25);
      ctx.font = "14px sans-serif";
      ctx.fillText(layer.type, 10, 50);
      
      const texture = new THREE.CanvasTexture(canvas);
      const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
      const sprite = new THREE.Sprite(spriteMaterial);
      sprite.scale.set(40, 10, 1);
      sprite.position.set(xOffset + width / 2, modelHeight + 10, 0);
      group.add(sprite);
      
      xOffset += width;
    });
    
    const box = new THREE.Box3().setFromObject(group);
    const center = new THREE.Vector3();
    box.getCenter(center);
    group.position.x -= center.x;
    
    meshesRef.current = group.children.filter(child => child instanceof THREE.Mesh) as THREE.Mesh[];
    
    scene.add(group);
    
    camera.zoom = zoomLevel / 100; // Use prop zoomLevel
    camera.updateProjectionMatrix();
  }, [layers, zoomLevel, modelHeight, modelWidth, modelDepth]); // Now correctly depends on all relevant props

  return (
    <div className="insulation-card">
      <div className="insulation-card-header flex items-center justify-between">
        <h2>Insulation Preview</h2>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={resetZoom}>
            <ScanSearch className="h-5 w-5 text-gray-400" />
          </Button>
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => controlsRef.current?.reset()}>
            <RefreshCcw className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
      </div>

      <div className="mb-4 flex flex-col gap-2">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Model Width</label>
            <Input 
              type="number" 
              value={modelWidth} // Controlled by prop
              onChange={(e) => createUpdatePayload({ modelWidth: parseFloat(e.target.value) })} 
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Model Height</label>
            <Input 
              type="number" 
              value={modelHeight} // Controlled by prop
              onChange={(e) => createUpdatePayload({ modelHeight: parseFloat(e.target.value) })} 
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Model Depth</label>
            <Input 
              type="number" 
              value={modelDepth} // Controlled by prop
              onChange={(e) => createUpdatePayload({ modelDepth: parseFloat(e.target.value) })} 
              className="w-full"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center">
        <div ref={mountRef} className="w-full max-w-md h-96 rounded-lg border bg-gray-100 relative" />
        <div className="text-xs text-gray-500 mt-2 mb-2 w-full max-w-md flex justify-center">
          <div>Boundary</div>
        </div>
      </div>

      <div className="flex justify-center items-center mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">{zoomLevel}%</span>
          <Button onClick={increaseZoom} variant="outline" size="icon" className="rounded-full h-8 w-8 p-0 bg-app-blue text-white hover:bg-app-blue-dark border-none">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={decreaseZoom} variant="outline" size="icon" className="rounded-full h-8 w-8 p-0 bg-app-blue text-white hover:bg-app-blue-dark border-none">
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InsulationPreview;