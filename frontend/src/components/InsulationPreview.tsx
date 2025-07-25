// InsulationPreview.tsx
import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { ZoomIn, ZoomOut, ScanSearch, RefreshCcw, Box, Circle } from "lucide-react";

// Assuming these are available from your project's UI library (shadcn/ui or similar)
// If not, these would need to be replaced with standard HTML elements or custom components.
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// Assuming InsulationContext is correctly defined and provides 'layers'
import { useInsulation } from "@/contexts/InsulationContext"; // Adjust path as per your project structure

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

// Define the type for view modes
type ViewMode = 'flat' | 'cylindrical';

const InsulationPreview: React.FC<InsulationPreviewProps> = ({
  modelHeight, // Received as prop: overall height of the model
  modelWidth,  // Received as prop: overall width of the model (influences base radius in cylindrical)
  modelDepth,  // Received as prop: overall depth of the model (influences base radius in cylindrical)
  zoomLevel,   // Received as prop: current zoom level for the camera
  onUpdate,    // Received as prop: callback to update parent state
}) => {
  // Access insulation layers from context
  const { layers } = useInsulation();
  // Internal state to manage the current view mode (flat or cylindrical)
  const [viewMode, setViewMode] = useState<ViewMode>('flat');

  // Refs to hold Three.js objects, preventing re-creation on re-renders
  const mountRef = useRef<HTMLDivElement>(null); // Ref for the DOM element to mount the renderer
  const sceneRef = useRef<THREE.Scene>();
  const cameraRef = useRef<THREE.PerspectiveCamera>();
  const rendererRef = useRef<THREE.WebGLRenderer>();
  const controlsRef = useRef<OrbitControls>();
  const meshesRef = useRef<THREE.Mesh[]>([]); // To keep track of created meshes for potential interactions/cleanup

  // Helper function to construct the payload for onUpdate callback
  const createUpdatePayload = (
    updatedFields: Partial<{
      modelHeight: number;
      modelWidth: number;
      modelDepth: number;
      zoomLevel: number;
    }>
  ) => {
    // Merge current props with the updated fields to ensure a complete payload is sent
    const payload = {
      modelHeight: updatedFields.modelHeight ?? modelHeight,
      modelWidth: updatedFields.modelWidth ?? modelWidth,
      modelDepth: updatedFields.modelDepth ?? modelDepth,
      zoomLevel: updatedFields.zoomLevel ?? zoomLevel,
    };
    onUpdate(payload); // Call the parent's update function
  };

  // Zoom control functions
  const increaseZoom = () => {
    if (zoomLevel < 200) { // Max zoom limit
      createUpdatePayload({ zoomLevel: zoomLevel + 25 });
    }
  };
  const decreaseZoom = () => {
    if (zoomLevel > 50) { // Min zoom limit
      createUpdatePayload({ zoomLevel: zoomLevel - 25 });
    }
  };
  const resetZoom = () => {
    createUpdatePayload({ zoomLevel: 100 }); // Reset zoom to default
  };

  // 1. Initialize Three.js Scene, Camera, Renderer, and Controls (runs once on mount)
  useEffect(() => {
    if (!mountRef.current) return; // Ensure the DOM element is available

    const width = mountRef.current.clientWidth;
    const height = mountRef.current.clientHeight;

    // Scene: The container for all 3D objects
    const scene = new THREE.Scene();
    // Camera: Defines the view frustum (what the user sees)
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0, 200); // Initial camera position

    // Renderer: Renders the scene using WebGL
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    mountRef.current.innerHTML = ""; // Clear any existing content in the mount div
    mountRef.current.appendChild(renderer.domElement); // Add the renderer's canvas to the DOM
    renderer.shadowMap.enabled = true; // Enable shadows
    renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Use softer shadows

    // OrbitControls: Allows user to rotate, pan, and zoom the camera
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Adds a smooth deceleration to camera movement

    // Add lighting to the scene
    scene.add(new THREE.AmbientLight(0xffffff, 0.3)); // Soft ambient light for overall illumination
    const dirLight = new THREE.DirectionalLight(0xffffff, 0.7); // Directional light for shadows and highlights
    dirLight.name = "MainLight";
    dirLight.position.set(100, 200, 150); // Position of the light source
    dirLight.castShadow = true; // Light casts shadows
    // Configure shadow camera for better shadow quality
    dirLight.shadow.mapSize.set(1024, 1024);
    dirLight.shadow.camera.near = 1;
    dirLight.shadow.camera.far = 500;
    dirLight.shadow.camera.left = -100;
    dirLight.shadow.camera.right = 100;
    dirLight.shadow.camera.top = 100;
    dirLight.shadow.camera.bottom = -100;
    scene.add(dirLight);

    // Store Three.js objects in refs for persistence across renders
    sceneRef.current = scene;
    cameraRef.current = camera;
    rendererRef.current = renderer;
    controlsRef.current = controls;

    // Animation loop
    const animate = () => {
      requestAnimationFrame(animate); // Request next frame
      controls.update(); // Update controls (required for damping)
      renderer.render(scene, camera); // Render the scene
    };
    animate(); // Start the animation loop

    // Cleanup function: runs when the component unmounts
    return () => {
      controls.dispose(); // Dispose controls to remove event listeners
      renderer.dispose(); // Dispose renderer to free up WebGL context
      mountRef.current?.removeChild(renderer.domElement); // Remove canvas from DOM
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  // 2. Handle Window/Container Resizes (runs on mount and window resize)
  useEffect(() => {
    const handleResize = () => {
      if (mountRef.current && cameraRef.current && rendererRef.current) {
        const width = mountRef.current.clientWidth;
        const height = mountRef.current.clientHeight;
        rendererRef.current.setSize(width, height); // Update renderer size
        cameraRef.current.aspect = width / height; // Update camera aspect ratio
        cameraRef.current.updateProjectionMatrix(); // Recalculate projection matrix
      }
    };

    window.addEventListener('resize', handleResize); // Add resize listener
    handleResize(); // Call once initially to set correct size

    // Cleanup function: remove event listener on unmount
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures this effect runs once and cleans up

  // 3. Render Layers (runs when layers, dimensions, zoom, or viewMode change)
  useEffect(() => {
    const scene = sceneRef.current;
    const renderer = rendererRef.current;
    const camera = cameraRef.current;
    const controls = controlsRef.current;

    if (!scene || !renderer || !camera || !controls) return; // Ensure all refs are available

    // Clean up previous layers to prevent memory leaks and visual artifacts
    const oldGroup = scene.getObjectByName("LayerGroup");
    if (oldGroup) {
      oldGroup.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          object.geometry.dispose(); // Dispose geometry
          if (Array.isArray(object.material)) {
            object.material.forEach(m => m.dispose()); // Dispose array of materials
          } else if (object.material instanceof THREE.Material) {
            object.material.dispose(); // Dispose single material
          }
        } else if (object instanceof THREE.Sprite) {
          // Dispose sprite's texture and material
          if (object.material.map instanceof THREE.CanvasTexture) {
            object.material.map.dispose();
          }
          object.material.dispose();
        }
      });
      scene.remove(oldGroup); // Remove the old group from the scene
    }

    const group = new THREE.Group(); // Create a new group to hold all layers
    group.name = "LayerGroup"; // Assign a name for easy retrieval later

    if (viewMode === 'flat') {
      // --- Flat View Logic ---
      const totalThickness = layers.reduce((sum, l) => sum + (parseFloat(l.thickness) || 20), 0);
      let xOffset = 0; // Starting X position for the first layer

      layers.forEach((layer) => {
        const thickness = parseFloat(layer.thickness) || 20;
        // Calculate width of each layer proportional to its thickness relative to total thickness
        const width = (thickness / totalThickness) * modelWidth;

        // Create box geometry for the flat layer
        const geometry = new THREE.BoxGeometry(width, modelHeight, modelDepth);
        // Use MeshPhysicalMaterial for realistic rendering with light interaction
        const material = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(layer.color), // Convert hex color string to Three.js Color object
          metalness: 0.2,
          roughness: 0.5,
          reflectivity: 0.4,
          clearcoat: 0.2,
        });

        const mesh = new THREE.Mesh(geometry, material);
        mesh.position.set(xOffset + width / 2, modelHeight / 2, 0); // Position the layer
        mesh.castShadow = true; // Layer casts shadows
        mesh.receiveShadow = true; // Layer receives shadows
        group.add(mesh);

        // Add black edges to the box for better definition
        const edgeGeometry = new THREE.EdgesGeometry(geometry);
        const edgeMaterial = new THREE.LineBasicMaterial({ color: 0x000000 });
        const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
        edges.position.copy(mesh.position); // Position edges same as mesh
        group.add(edges);

        // Create labels using CanvasTexture for text sprites
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
        sprite.scale.set(40, 10, 1); // Scale sprite for visibility
        sprite.position.set(xOffset + width / 2, modelHeight + 10, 0); // Position label above layer
        group.add(sprite);

        xOffset += width; // Move offset for the next layer
      });

      // Center the entire group in the scene
      const box = new THREE.Box3().setFromObject(group);
      const center = new THREE.Vector3();
      box.getCenter(center);
      group.position.x -= center.x;
      group.position.y -= center.y;
      group.position.z -= center.z;

      // Adjust camera position and target for flat view
      camera.position.set(0, 0, box.max.z + 100); // Look from front
      controls.target.set(0, 0, 0); // Target the center of the scene

    } else { // Cylindrical view - **UPDATED LOGIC FOR JITTERING AND OVERLAPPING**
      // Calculate the total thickness of all insulation layers
      const totalInsulationThickness = layers.reduce((sum, l) => sum + (parseFloat(l.thickness) || 20), 0);
      // modelWidth now controls the overall outer diameter of the entire insulated pipe
      const finalOuterRadius = modelWidth / 2;

      // Calculate the radius of the innermost core/pipe before any insulation
      // Ensure a minimum non-negative radius for the core (e.g., 1 unit)
      let currentInnerRadius = Math.max(finalOuterRadius - totalInsulationThickness, 1);

      const baseHeight = modelHeight; // Height of the cylinders
      const epsilon = 0.01; // A very small offset to prevent co-planar faces from Z-fighting

      layers.forEach((layer, index) => {
        const thickness = parseFloat(layer.thickness) || 20;
        const normalizedThickness = Math.max(thickness / 2, 3); // Ensure a minimum visual thickness for very thin layers

        const layerOuterRadius = currentInnerRadius + normalizedThickness; // Outer radius of the current layer

        // Material for all parts of the current layer (wall, top face, bottom face)
        const layerMaterial = new THREE.MeshPhysicalMaterial({
          color: new THREE.Color(layer.color), // Convert hex color string to Three.js Color object
          metalness: 0.05,
          roughness: 0.4,
          transparent: true,
          opacity: 0.7, // Consistent opacity for all transparent layers for better blending
          side: THREE.DoubleSide, // Render both inner and outer sides of the cylinder wall
          depthWrite: false, // CRITICAL: Disable depth writing for all transparent meshes.
                              // This prevents transparent objects from interfering with the depth buffer,
                              // which is a common cause of Z-fighting and incorrect blending.
          depthTest: true, // Keep depth testing enabled so transparent objects still respect opaque objects' depth
        });

        // --- Create the Cylindrical Wall (side) ---
        // Use openEnded: true because we'll add separate caps (faces) to control their depth.
        const cylinderGeometry = new THREE.CylinderGeometry(
          layerOuterRadius,      // radiusTop
          layerOuterRadius,      // radiusBottom
          baseHeight,       // height
          64,               // radialSegments: Increased for a smoother cylinder appearance
          1,                // heightSegments
          true              // openEnded: The cylinder will have no top or bottom faces by default
        );
        const cylinderMesh = new THREE.Mesh(cylinderGeometry, layerMaterial);
        cylinderMesh.castShadow = true;
        cylinderMesh.receiveShadow = true;
        // Render order: lower values are rendered first.
        // `index` ensures inner layers are rendered before outer layers (back-to-front sorting for outside view).
        cylinderMesh.renderOrder = index;
        group.add(cylinderMesh);

        // --- Create Top Face (as a flat ring) ---
        // RingGeometry is perfect for the top/bottom of a hollow cylinder.
        const topFaceGeometry = new THREE.RingGeometry(currentInnerRadius, layerOuterRadius, 64);
        const topFaceMesh = new THREE.Mesh(topFaceGeometry, layerMaterial);
        topFaceMesh.rotation.x = -Math.PI / 2; // Rotate 90 degrees around X-axis to make it horizontal
        // Apply a small, cumulative Y-offset to prevent Z-fighting between co-planar faces.
        // Each layer's top face will be slightly higher than the previous one.
        topFaceMesh.position.y = baseHeight / 2 + (index * epsilon);
        topFaceMesh.castShadow = true;
        topFaceMesh.receiveShadow = true;
        topFaceMesh.renderOrder = index; // Same render order as the wall
        group.add(topFaceMesh);

        // --- Create Bottom Face (as a flat ring) ---
        const bottomFaceGeometry = new THREE.RingGeometry(currentInnerRadius, layerOuterRadius, 64);
        const bottomFaceMesh = new THREE.Mesh(bottomFaceGeometry, layerMaterial);
        bottomFaceMesh.rotation.x = -Math.PI / 2; // Rotate to be horizontal
        // Apply a small, cumulative Y-offset for bottom faces as well.
        // Each layer's bottom face will be slightly lower than the previous one.
        bottomFaceMesh.position.y = -baseHeight / 2 - (index * epsilon);
        bottomFaceMesh.castShadow = true;
        bottomFaceMesh.receiveShadow = true;
        bottomFaceMesh.renderOrder = index; // Same render order as the wall
        group.add(bottomFaceMesh);

        // Add edges only to the outermost layer for overall model clarity
        if (index === layers.length - 1) {
          // Create a closed cylinder geometry just for the edges of the outermost layer
          const overallOuterGeometry = new THREE.CylinderGeometry(
            layerOuterRadius, layerOuterRadius, baseHeight, 64, 1, false
          );
          const edgeGeometry = new THREE.EdgesGeometry(overallOuterGeometry);
          const edgeMaterial = new THREE.LineBasicMaterial({
            color: 0x222222,
            transparent: true,
            opacity: 0.6,
          });
          const edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
          edges.position.copy(cylinderMesh.position); // Position edges at the main cylinder's center
          edges.renderOrder = layers.length + 1; // Ensure edges are drawn on top of all layers
          group.add(edges);
        }

        // Create labels for cylindrical view using CanvasTexture
        const canvas = document.createElement("canvas");
        canvas.width = 280;
        canvas.height = 70;
        const ctx = canvas.getContext("2d")!;

        // Draw label background and border
        ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.strokeStyle = layer.color;
        ctx.lineWidth = 4;
        ctx.strokeRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = layer.color;
        ctx.fillRect(8, 8, 20, canvas.height - 16);

        // Draw label text
        ctx.fillStyle = "#000";
        ctx.font = "bold 16px sans-serif";
        ctx.fillText(layer.name, 35, 22);
        ctx.font = "12px sans-serif";
        ctx.fillText(layer.type, 35, 38);
        ctx.fillText(`${thickness}mm thick`, 35, 54);

        const texture = new THREE.CanvasTexture(canvas);
        const spriteMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(35, 10, 1); // Scale sprite for desired label size

        // Position labels around the cylinder
        const angle = (index * Math.PI * 2) / layers.length; // Distribute labels evenly around the circumference
        const labelRadius = layerOuterRadius + 25; // Distance of the label from the cylinder's center
        sprite.position.set(
          Math.cos(angle) * labelRadius,
          baseHeight / 2, // Vertically centered with the cylinder
          Math.sin(angle) * labelRadius
        );
        sprite.renderOrder = 2000; // Render labels on top of everything else
        group.add(sprite);

        // Update the inner radius for the next layer, adding a small visual gap.
        // This gap helps prevent Z-fighting on the cylindrical walls.
        currentInnerRadius = layerOuterRadius + 1.5; // Experiment with this value (e.g., 0.5, 1, 2)
      });

      // Center the entire cylindrical group in the scene
      const box = new THREE.Box3().setFromObject(group);
      const center = new THREE.Vector3();
      box.getCenter(center);
      group.position.y -= center.y; // Center vertically on the origin
      group.position.x -= center.x; // Center horizontally
      group.position.z -= center.z; // Center depthwise

      // Adjust camera position and target for cylindrical view
      // Position camera to see the full cylinder, slightly above and to the side, based on the final outer radius.
      camera.position.set(finalOuterRadius * 2, baseHeight * 0.75, finalOuterRadius * 2);
      controls.target.set(0, baseHeight / 2, 0); // Target the center of the cylinder's height
    }

    // Update controls and camera after changing target/position or zoom
    controls.update();
    camera.zoom = zoomLevel / 100; // Apply zoom level from prop
    camera.updateProjectionMatrix(); // Recalculate projection matrix after zoom change

    // Store references to the created meshes (if needed for external interactions)
    meshesRef.current = group.children.filter(child => child instanceof THREE.Mesh) as THREE.Mesh[];
    scene.add(group); // Add the complete group of layers to the scene

  }, [layers, zoomLevel, modelHeight, modelWidth, modelDepth, viewMode]); // Dependencies for this effect

  return (
    <div className="insulation-card">
      <div className="insulation-card-header flex items-center justify-between">
        <h2>Insulation Preview</h2>
        <div className="flex items-center gap-2">
          {/* View Mode Toggle Buttons */}
          <div className="flex items-center gap-1 mr-2">
            <Button
              variant={viewMode === 'flat' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('flat')}
              className="h-8 px-2"
              aria-label="Switch to flat view"
            >
              <Box className="h-4 w-4" /> {/* Icon for flat view */}
            </Button>
            <Button
              variant={viewMode === 'cylindrical' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('cylindrical')}
              className="h-8 px-2"
              aria-label="Switch to cylindrical view"
            >
              <Circle className="h-4 w-4" /> {/* Icon for cylindrical view */}
            </Button>
          </div>

          {/* Reset Camera Position Button */}
          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => controlsRef.current?.reset()} aria-label="Reset camera position">
            <RefreshCcw className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
      </div>

      {/* Input fields for model dimensions */}
      <div className="mb-4 flex flex-col gap-2">
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              {viewMode === 'cylindrical' ? 'Overall Diameter (mm)' : 'Model Width (mm)'}
            </label>
            <Input
              type="number"
              value={modelWidth}
              onChange={(e) => createUpdatePayload({ modelWidth: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              {viewMode === 'cylindrical' ? 'Cylinder Height (mm)' : 'Model Height (mm)'}
            </label>
            <Input
              type="number"
              value={modelHeight}
              onChange={(e) => createUpdatePayload({ modelHeight: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">
              {viewMode === 'cylindrical' ? 'Base Depth (mm)' : 'Model Depth (mm)'}
            </label>
            <Input
              type="number"
              value={modelDepth}
              onChange={(e) => createUpdatePayload({ modelDepth: parseFloat(e.target.value) })}
              className="w-full"
            />
          </div>
        </div>
      </div>

      {/* Three.js Canvas Container */}
      <div className="flex flex-col items-center">
        <div ref={mountRef} className="w-full max-w-md h-96 rounded-lg border bg-gray-100 relative" />
        <div className="text-xs text-gray-500 mt-2 mb-2 w-full max-w-md flex justify-center">
          <div>{viewMode === 'cylindrical' ? 'Cylindrical Layers' : 'Boundary'}</div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="flex justify-center items-center mt-4">
        <div className="flex items-center gap-2">
          <span className="text-sm">{zoomLevel}%</span>
          <Button onClick={increaseZoom} variant="outline" size="icon" className="rounded-full h-8 w-8 p-0 bg-app-blue text-white hover:bg-app-blue-dark border-none" aria-label="Zoom in">
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button onClick={decreaseZoom} variant="outline" size="icon" className="rounded-full h-8 w-8 p-0 bg-app-blue text-white hover:bg-app-blue-dark border-none" aria-label="Zoom out">
            <ZoomOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default InsulationPreview;
