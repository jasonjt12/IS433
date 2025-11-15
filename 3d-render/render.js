import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Stats from "three/addons/libs/stats.module.js";

// Helper: resolve asset URL relative to this module
const assetUrl = (p) => (/^https?:\/\//i.test(p) ? p : new URL(p, import.meta.url).href);

// ----------------------------------------------------------------
createStlRender(
  "LiDAR-mount-render",
  400,
  [-1, -1, 1],
  [0.02, 0.02, 0.02],
  [0, Math.PI / 2, 0],
  false,
  "../assets/lidar_mount.STL",
  "Render 1: Interactive LiDAR Mount Render" // subtitle
);

createGltfBasicRender(
  "render2",
  400,
  [-0.5, 0, 0],
  [2.5, 2.5, 2.5],
  [0, 0, 0],
  false,
  "../assets/revolving_lidar.glb",
  "Render 2: Interactive Mock Field of View with Spinning LiDAR Module (290° Vertical Overlapping FoV)",
  {
    cameraPose: {
      position: [2, 1, 2],
      target: [0, 0, 0],
      fov: 50,
      near: 0.1,
      far: 100,
    },
  }
);

// createRender(
//   "render2",
//   400,
//   [0, -1, 0],
//   [0.1, 0.1, 0.1],
//   [-Math.PI / 2, 0, 0],
//   false,
//   "../assets/benchy.stl",
// );

// ----------------------------------------------------------------
function createStlRender(
  id,
  height,
  position,
  scale,
  rotation,
  enableAxes,
  stlFilePath,
  subtitle = ""
) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn(`[STL] Container not found: #${id}`);
    return;
  }
  element.style.border = null;

  let width = element.clientWidth;
  if (width > window.innerWidth) {
    width = window.innerWidth * 0.7;
    height = (height * width) / 600;
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  if (enableAxes) scene.add(new THREE.AxesHelper(5));
  scene.add(new THREE.HemisphereLight(0x8d7c7c, 0x494966, 3));
  addShadowedLight(1, 1, 1, 0xffffff, 3.5);

  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.set(2, 2, 2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  element.appendChild(renderer.domElement);

  // Subtitle (optional)
  if (subtitle) {
    const caption = document.createElement("div");
    caption.textContent = subtitle;
    caption.style.textAlign = "center";
    caption.style.marginTop = "8px";
    caption.style.fontStyle = "italic";
    caption.style.color = "#000000ff";
    caption.style.fontSize = "0.9rem";
    element.appendChild(caption);
  }

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  function addShadowedLight(x, y, z, color, intensity) {
    const dir = new THREE.DirectionalLight(color, intensity);
    dir.position.set(x, y, z);
    scene.add(dir);
  }

  // Resolve asset URL same way as GLTF
  const stlUrl = assetUrl(stlFilePath);

  const loader = new STLLoader();
  loader.load(
    stlUrl,
    (geometry) => {
      const material = new THREE.MeshPhongMaterial({
        color: 0xbbbbbb,
        specular: 0x111111,
        shininess: 20,
      });
      const mesh = new THREE.Mesh(geometry, material);

      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.rotation.set(...rotation);
      scene.add(mesh);

      // Center controls on mesh
      const box = new THREE.Box3().setFromObject(mesh);
      const center = box.getCenter(new THREE.Vector3());
      controls.target.copy(center);
      controls.update();
    },
    (xhr) => {
      if (xhr.total) console.log(`[STL] ${((xhr.loaded / xhr.total) * 100).toFixed(1)}% loaded`);
    },
    (err) => console.error("[STL] Load error:", err, "URL:", stlUrl)
  );

  window.addEventListener("resize", () => {
    const newW = element.clientWidth;
    camera.aspect = newW / height;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, height);
  });

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

function createGltfBasicRender(
  id,
  height,
  position,
  scale,
  rotation,
  enableAxes,
  gltfFilePath = "../assets/revolving_lidar.glb",
  subtitle = "",
  options = {}
) {
  const element = document.getElementById(id);
  if (!element) return;
  element.style.border = null;
  let width = element.clientWidth;
  if (width > window.innerWidth) {
    width = window.innerWidth * 0.7;
    height = (height * width) / 600;
  }

  const { useGltfCamera = false, cameraPose = null } = options; // new

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);

  if (enableAxes) scene.add(new THREE.AxesHelper(5));
  scene.add(new THREE.HemisphereLight(0x8d7c7c, 0x494966, 3));
  addShadowedLight(1, 1, 1, 0xffffff, 3.5);

  const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 100);
  camera.position.set(2, 2, 2);

  // Animation support
  const clock = new THREE.Clock();
  let mixer = null;

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(width, height);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  element.appendChild(renderer.domElement);

  // Subtitle (optional)
  if (subtitle) {
    const caption = document.createElement("div");
    caption.textContent = subtitle;
    caption.style.textAlign = "center";
    caption.style.marginTop = "8px";
    caption.style.fontStyle = "italic";
    caption.style.color = "rgba(26, 26, 26, 1)";
    caption.style.fontSize = "0.9rem";
    element.appendChild(caption);
  }

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  function addShadowedLight(x, y, z, color, intensity) {
    const dir = new THREE.DirectionalLight(color, intensity);
    dir.position.set(x, y, z);
    scene.add(dir);
  }

  const url = assetUrl(gltfFilePath);

  const loader = new GLTFLoader();
  loader.load(
    url,
    async (gltf) => {
      const model = gltf.scene;

      model.position.set(...position);
      model.scale.set(...scale);
      model.rotation.set(...rotation);
      scene.add(model);

      // Play all embedded clips
      if (gltf.animations && gltf.animations.length) {
        mixer = new THREE.AnimationMixer(model);
        gltf.animations.forEach((clip) => {
          mixer.clipAction(clip).reset().play();
        });
      }

      // Compute model center for default target
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());

      // Option A: adopt camera from GLB
      if (useGltfCamera) {
        let camNode = null;
        model.traverse((o) => { if (!camNode && o.isCamera) camNode = o; });
        if (camNode) {
          model.updateMatrixWorld(true);
          camera.position.copy(camNode.getWorldPosition(new THREE.Vector3()));
          camera.quaternion.copy(camNode.getWorldQuaternion(new THREE.Quaternion()));
          if (camNode.isPerspectiveCamera) {
            camera.fov = camNode.fov;
            camera.near = camNode.near;
            camera.far = camNode.far;
          }
          camera.aspect = width / height;
          camera.updateProjectionMatrix();
        }
      }
      // Option B: explicit preset pose
      if (cameraPose && Array.isArray(cameraPose.position)) {
        camera.position.set(...cameraPose.position);
        if (cameraPose.fov) camera.fov = cameraPose.fov;
        if (cameraPose.near) camera.near = cameraPose.near;
        if (cameraPose.far) camera.far = cameraPose.far;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
      }

      // Set controls target
      if (cameraPose && Array.isArray(cameraPose.target)) {
        controls.target.set(...cameraPose.target);
      } else {
        controls.target.copy(center);
      }
      controls.update();
    },
    (xhr) => {
      if (xhr.total) console.log(((xhr.loaded / xhr.total) * 100).toFixed(1) + "% loaded");
    },
    (err) => console.error("GLB load error:", err, "URL:", url)
  );

  window.addEventListener("resize", () => {
    const newW = element.clientWidth;
    camera.aspect = newW / height;
    camera.updateProjectionMatrix();
    renderer.setSize(newW, height);
  });

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    controls.update();
    renderer.render(scene, camera);
  }
  animate();
}

// Usage example (uncomment to use):
// createGltfOrbitRender(
//   "render1", // element id
//   400,        // height
//   [0, -1, 0], // position
//   [0.05, 0.05, 0.05], // scale
//   [-Math.PI / 2, 0, 0], // rotation
//   false,      // enableAxes
//   "../assets/benchy.gltf", // path
//   "horizontal", // axis control
//   true,       // autoRotate
//   2           // autoRotateSpeed
// );