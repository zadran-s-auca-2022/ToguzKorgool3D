import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');

// ---------- SCENE ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0a07);

// ---------- CAMERA ----------
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 18, 24);

// ---------- RENDERER ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
root.appendChild(renderer.domElement);

// ---------- CONTROLS ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.enablePan = false;

// ---------- LIGHT ----------
scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(10, 20, 10);
scene.add(light);

// ---------- BOARD ----------
const board = new THREE.Mesh(
    new THREE.BoxGeometry(30, 2, 14),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
);
scene.add(board);

// ---------- PITS ----------
const pitMeshes = [];
const pitStoneGroups = [];

const stoneGeo = new THREE.SphereGeometry(0.2, 16, 16);

function createPit(x, z, index) {
    const pit = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.1, 0.6, 32),
        new THREE.MeshStandardMaterial({ color: 0xe2bf8f })
    );
    pit.rotation.x = Math.PI / 2;
    pit.position.set(x, 1.1, z);
    pit.userData.index = index;

    scene.add(pit);
    pitMeshes.push(pit);

    const group = new THREE.Group();
    scene.add(group);
    pitStoneGroups[index] = group;
}

let startX = -12.8;
let spacing = 3.2;

// top row
for (let i = 0; i < 9; i++) {
    createPit(startX + i * spacing, -3.2, 17 - i);
}

// bottom row
for (let i = 0; i < 9; i++) {
    createPit(startX + i * spacing, 3.2, i);
}

// ---------- STONES ----------
function renderPit(index, count) {
    const group = pitStoneGroups[index];
    group.clear();

    for (let i = 0; i < Math.min(count, 18); i++) {
        const stone = new THREE.Mesh(stoneGeo, new THREE.MeshStandardMaterial({ color: 0xffffff }));

        stone.position.set(
            pitMeshes[index].position.x + (i % 6 - 2.5) * 0.2,
            1.4,
            pitMeshes[index].position.z + (Math.floor(i / 6) - 1) * 0.2
        );

        group.add(stone);
    }
}

// ---------- SYNC ----------
window.sync3DBoardFromGameState = function (state) {
    for (let i = 0; i < 18; i++) {
        renderPit(i, state.pits[i]);
    }
};

// ---------- CLICK ----------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

renderer.domElement.addEventListener('click', (e) => {
    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(pitMeshes);

    if (hits.length && window.handlePitClick) {
        window.handlePitClick(hits[0].object.userData.index);
    }
});

// ---------- LOOP ----------
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}
animate();