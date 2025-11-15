import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { STLLoader } from "three/addons/loaders/STLLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import Stats from "three/addons/libs/stats.module.js";

// ----------------------------------------------------------------
createStlRender(
  "LiDAR-mount-render",
  400,
  [-2, -2, 0],
  [0.03, 0.03, 0.03],
  [0, Math.PI / 2, 0],
  false,
  "../assets/lidar_mount.stl",
);

createGltfBasicRender(
  "render2",
  800,
  [0, -1, 0],
  [0.05, 0.05, 0.05],
  [-Math.PI / 2, 0, 0],
  false,
  "../assets/dpack_hc_fov/dpack_hc_fov.gltf"
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
) {
  const element = document.getElementById(id);
  element.style.border = "1px solid black";
  let width = element.clientWidth;

  if (width > window.innerWidth) {
    width = window.innerWidth * 0.7;
    height = (height * width) / 600;
    console.log(width, height);
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  if (enableAxes) scene.add(new THREE.AxesHelper(5));
  scene.add(new THREE.HemisphereLight(0x8d7c7c, 0x494966, 3));
  addShadowedLight(1, 1, 1, 0xffffff, 3.5);

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 2;
  camera.position.x = 2;
  camera.position.y = 2;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  element.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const stats = new Stats();
  document.body.appendChild(stats.dom);

  function addShadowedLight(x, y, z, color, intensity) {
    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);

    directionalLight.castShadow = true;

    const d = 1;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;

    directionalLight.shadow.bias = -0.002;
  }

  const loader = new STLLoader();
  loader.load(
    stlFilePath,
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        specular: 0x111111,
        shininess: 20,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.rotation.set(...rotation);

      scene.add(mesh);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) + "% loaded");
    },
    (error) => {
      console.log(error);
    },
  );

  window.addEventListener("resize", onWindowResize, false);
  function onWindowResize() {
    render();
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
    stats.update();
  }

  function render() {
    renderer.render(scene, camera);
  }

  animate();
}

function createGltfRender(
  id,
  height,
  position,
  scale,
  rotation,
  enableAxes,
  gltfFilePath,
) {
  const element = document.getElementById(id);
  element.style.border = "1px solid black";
  let width = element.clientWidth;

  if (width > window.innerWidth) {
    width = window.innerWidth * 0.7;
    height = (height * width) / 600;
    console.log(width, height);
  }

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0xffffff);
  if (enableAxes) scene.add(new THREE.AxesHelper(5));
  scene.add(new THREE.HemisphereLight(0x8d7c7c, 0x494966, 3));
  addShadowedLight(1, 1, 1, 0xffffff, 3.5);

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.z = 2;
  camera.position.x = 2;
  camera.position.y = 2;

  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  element.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const stats = new Stats();
  document.body.appendChild(stats.dom);

  function addShadowedLight(x, y, z, color, intensity) {
    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);

    directionalLight.castShadow = true;

    const d = 1;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;

    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;

    directionalLight.shadow.bias = -0.002;
  }

  const loader = new GLTFLoader();
  loader.load(
    gltfFilePath,
    function (geometry) {
      const material = new THREE.MeshPhongMaterial({
        color: 0xaaaaaa,
        specular: 0x111111,
        shininess: 20,
      });
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.set(...position);
      mesh.scale.set(...scale);
      mesh.rotation.set(...rotation);

      scene.add(mesh);
    },
    (xhr) => {
      console.log((xhr.loaded / xhr.total) + "% loaded");
    },
    (error) => {
      console.log(error);
    },
  );

  window.addEventListener("resize", onWindowResize, false);
  function onWindowResize() {
    render();
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
    stats.update();
  }

  function render() {
    renderer.render(scene, camera);
  }

  animate();
}

// ----------------------------------------------------------------
// New: GLTF render with optional auto-orbit camera and single-axis mouse control
// axis: 'horizontal' (lock vertical) or 'vertical' (lock horizontal)
// autoRotate: boolean to enable continuous orbit
// autoRotateSpeed: speed factor for auto rotation (default 2)
function createGltfOrbitRender(
  id,
  height,
  position,
  scale,
  rotation,
  enableAxes,
  gltfFilePath,
  axis = "horizontal",
  autoRotate = true,
  autoRotateSpeed = 2,
  hdrPath = null,              // new: folder path for HDR
  hdrFile = null               // new: hdr filename
) {
  const element = document.getElementById(id);
  if (!element) {
    console.warn("Element not found:", id);
    return;
  }
  element.style.border = "1px solid black";
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

  const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
  camera.position.set(2, 2, 2);

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setSize(width, height);
  element.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;
  controls.autoRotate = autoRotate;
  controls.autoRotateSpeed = autoRotateSpeed; // positive = CCW

  // Restrict to single axis
  if (axis === "horizontal") {
    // lock polar angle so only azimuth (left/right) changes
    controls.minPolarAngle = Math.PI / 2;
    controls.maxPolarAngle = Math.PI / 2;
  } else if (axis === "vertical") {
    // lock azimuth angle so only elevation changes
    controls.minAzimuthAngle = 0;
    controls.maxAzimuthAngle = 0;
  }

  const stats = new Stats();
  document.body.appendChild(stats.dom);

  function addShadowedLight(x, y, z, color, intensity) {
    const directionalLight = new THREE.DirectionalLight(color, intensity);
    directionalLight.position.set(x, y, z);
    scene.add(directionalLight);
    directionalLight.castShadow = true;
    const d = 1;
    directionalLight.shadow.camera.left = -d;
    directionalLight.shadow.camera.right = d;
    directionalLight.shadow.camera.top = d;
    directionalLight.shadow.camera.bottom = -d;
    directionalLight.shadow.camera.near = 1;
    directionalLight.shadow.camera.far = 4;
    directionalLight.shadow.bias = -0.002;
  }

  // Optional HDR environment
  if (hdrPath && hdrFile) {
    const rgbeLoader = new THREE.RGBELoader().setPath(hdrPath);
    rgbeLoader.load(hdrFile, (texture) => {
      texture.mapping = THREE.EquirectangularReflectionMapping;
      scene.background = texture;
      scene.environment = texture;
    });
  }

  const loader = new GLTFLoader();
  loader.load(
    gltfFilePath,
    async (gltf) => {
      const model = gltf.scene;
      // Remove forced Phong material, keep original PBR:
      // model.traverse((c)=>{ if(c.isMesh){ c.material = new THREE.MeshStandardMaterial(); } });
      await renderer.compileAsync(model, camera, scene);
      scene.add(model);

      // Frame controls target to model center
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      controls.target.copy(center);
      controls.update();
    },
    (xhr) => {
      if (xhr.total) {
        console.log(((xhr.loaded / xhr.total) * 100).toFixed(1) + "% loaded");
      }
    },
    (error) => {
      console.error("GLTF load error:", error);
    },
  );

  window.addEventListener("resize", onWindowResize, false);
  function onWindowResize() {
    const newWidth = element.clientWidth;
    camera.aspect = newWidth / height;
    camera.updateProjectionMatrix();
    renderer.setSize(newWidth, height);
    render();
  }

  function animate() {
    requestAnimationFrame(animate);
    controls.update();
    render();
    stats.update();
  }

  function render() {
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
  gltfFilePath = "../assets/assem1.glb"
) {
  const element = document.getElementById(id);
  if (!element) return;
  element.style.border = "1px solid black";
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

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  element.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  function addShadowedLight(x, y, z, color, intensity) {
    const dir = new THREE.DirectionalLight(color, intensity);
    dir.position.set(x, y, z);
    scene.add(dir);
  }

  const loader = new GLTFLoader();
  loader.load(
    gltfFilePath,
    async (gltf) => {
      const model = gltf.scene;
      model.position.set(...position);
      model.scale.set(...scale);
      model.rotation.set(...rotation);
      scene.add(model);

      // Center controls target
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      controls.target.copy(center);
      controls.update();
    },
    (xhr) => {
      if (xhr.total) console.log(((xhr.loaded / xhr.total) * 100).toFixed(1) + "% loaded");
    },
    (err) => console.error("GLTF load error:", err)
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