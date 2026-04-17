import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0a07);

const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0, 18, 24);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
root.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 40;
controls.maxPolarAngle = Math.PI / 2.05;

const ambient = new THREE.AmbientLight(0xffffff, 1.2);
scene.add(ambient);

const dir = new THREE.DirectionalLight(0xffffff, 1.5);
dir.position.set(10, 20, 10);
scene.add(dir);

const board = new THREE.Mesh(
  new THREE.BoxGeometry(30, 2, 14),
  new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
);
scene.add(board);

const leftStore = new THREE.Mesh(
  new THREE.CylinderGeometry(2, 2, 6, 32),
  new THREE.MeshStandardMaterial({ color: 0xc89b63 })
);
leftStore.rotation.z = Math.PI / 2;
leftStore.position.set(-18, 0.5, 0);
scene.add(leftStore);

const rightStore = new THREE.Mesh(
  new THREE.CylinderGeometry(2, 2, 6, 32),
  new THREE.MeshStandardMaterial({ color: 0xc89b63 })
);
rightStore.rotation.z = Math.PI / 2;
rightStore.position.set(18, 0.5, 0);
scene.add(rightStore);

const pitMeshes = [];
const pitSpacing = 3.2;
const startX = -12.8;

function makePit(x, z, index) {
  const pit = new THREE.Mesh(
    new THREE.CylinderGeometry(1.15, 1.15, 0.7, 32),
    new THREE.MeshStandardMaterial({ color: 0xe2bf8f })
  );
  pit.rotation.x = Math.PI / 2;
  pit.position.set(x, 1.1, z);
  pit.userData.pitIndex = index;
  scene.add(pit);
  pitMeshes.push(pit);
}

for (let i = 0; i < 9; i++) {
  makePit(startX + i * pitSpacing, -3.2, 17 - i);
}
for (let i = 0; i < 9; i++) {
  makePit(startX + i * pitSpacing, 3.2, i);
}

window.sync3DBoardFromGameState = function () {};

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(pitMeshes);

  if (hits.length > 0 && typeof window.handlePitClick === 'function') {
    window.handlePitClick(hits[0].object.userData.pitIndex);
  }
});

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
  requestAnimationFrame(animate);
  controls.update();
  renderer.render(scene, camera);
}
animate();