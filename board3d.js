import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');

// ---------- SCENE ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0a07);

// ---------- CAMERA ----------
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 18, 24);

// ---------- RENDERER ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
root.appendChild(renderer.domElement);

// ---------- CONTROLS ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.5, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 40;
controls.maxPolarAngle = Math.PI / 2.05;

// ---------- LIGHT ----------
scene.add(new THREE.AmbientLight(0xffffff, 1.2));

const light = new THREE.DirectionalLight(0xffffff, 1.5);
light.position.set(10, 20, 10);
scene.add(light);

// ---------- MATERIALS ----------
const boardMaterial = new THREE.MeshStandardMaterial({ color: 0x8b5a2b });
const pitMaterial = new THREE.MeshStandardMaterial({ color: 0xe2bf8f });
const storeMaterial = new THREE.MeshStandardMaterial({ color: 0xc89b63 });
const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0xf2f2f2 });

// ---------- BOARD ----------
const board = new THREE.Mesh(
    new THREE.BoxGeometry(30, 2, 14),
    boardMaterial
);
scene.add(board);

// ---------- KAZANS ----------
const leftStore = new THREE.Mesh(
    new THREE.CylinderGeometry(2.1, 2.1, 6.5, 32),
    storeMaterial
);
leftStore.rotation.z = Math.PI / 2;
leftStore.position.set(-18, 0.5, 0);
scene.add(leftStore);

const rightStore = new THREE.Mesh(
    new THREE.CylinderGeometry(2.1, 2.1, 6.5, 32),
    storeMaterial
);
rightStore.rotation.z = Math.PI / 2;
rightStore.position.set(18, 0.5, 0);
scene.add(rightStore);

// ---------- PITS ----------
const pitMeshes = [];
const pitMeshByIndex = new Array(18);
const pitStoneGroups = new Array(18);
const pitBasePositions = new Array(18);

const pitSpacing = 3.2;
const startX = -12.8;
const topZ = -3.2;
const bottomZ = 3.2;

function createPit(x, z, index) {
    const pit = new THREE.Mesh(
        new THREE.CylinderGeometry(1.1, 1.1, 0.6, 32),
        pitMaterial.clone()
    );

    pit.rotation.x = Math.PI / 2;
    pit.position.set(x, 1.1, z);
    pit.userData.index = index;

    scene.add(pit);
    pitMeshes.push(pit);
    pitMeshByIndex[index] = pit;

    const group = new THREE.Group();
    scene.add(group);
    pitStoneGroups[index] = group;

    pitBasePositions[index] = { x, y: 1.45, z };
}

// top row visually left -> right = 17..9
for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, topZ, 17 - i);
}

// bottom row visually left -> right = 0..8
for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, bottomZ, i);
}

// ---------- STONES ----------
const stoneGeometry = new THREE.SphereGeometry(0.18, 16, 16);

function clearGroup(group) {
    if (!group) return;
    while (group.children.length > 0) {
        group.remove(group.children[0]);
    }
}

function renderPitStones(index, count) {
    const group = pitStoneGroups[index];
    const base = pitBasePositions[index];
    if (!group || !base) return;

    clearGroup(group);

    const maxVisual = Math.min(count, 18);

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);

        const col = i % 6;
        const row = Math.floor(i / 6);

        stone.position.set(
            base.x + (col - 2.5) * 0.2,
            base.y,
            base.z + (row - 1) * 0.2
        );

        group.add(stone);
    }
}

// ---------- STORE STONES ----------
const storeStoneGroups = {
    A: new THREE.Group(),
    B: new THREE.Group()
};
scene.add(storeStoneGroups.A);
scene.add(storeStoneGroups.B);

function renderStoreStones(side, count) {
    const group = storeStoneGroups[side];
    clearGroup(group);

    const maxVisual = Math.min(count, 30);
    const baseX = side === 'A' ? 18 : -18;

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);

        const col = i % 4;
        const row = Math.floor(i / 4);

        stone.position.set(
            baseX,
            -0.6 + col * 0.35,
            (row - 3) * 0.35
        );

        group.add(stone);
    }
}

// ---------- SYNC ----------
function sync3DBoardFromGameState(state) {
    if (!state || !state.pits) return;

    for (let i = 0; i < 18; i++) {
        renderPitStones(i, state.pits[i]);

        const pit = pitMeshByIndex[i];
        if (!pit) continue;

        pit.material.emissive.setHex(0x000000);

        if (i === state.tuzA || i === state.tuzB) {
            pit.material.emissive.setHex(0x665500);
        }
    }

    renderStoreStones('A', state.storeA || 0);
    renderStoreStones('B', state.storeB || 0);
}

window.sync3DBoardFromGameState = sync3DBoardFromGameState;

// draw initial setup
for (let i = 0; i < 18; i++) {
    renderPitStones(i, 9);
}
renderStoreStones('A', 0);
renderStoreStones('B', 0);

// sync immediately if available
function tryInitialSync() {
    if (typeof window.getCurrentGameState === 'function') {
        sync3DBoardFromGameState(window.getCurrentGameState());
    }
}
setTimeout(tryInitialSync, 0);
setTimeout(tryInitialSync, 200);

// ---------- CLICK ----------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let pointerDownX = 0;
let pointerDownY = 0;

renderer.domElement.addEventListener('pointerdown', (e) => {
    pointerDownX = e.clientX;
    pointerDownY = e.clientY;
});

renderer.domElement.addEventListener('pointerup', (e) => {
    const dx = e.clientX - pointerDownX;
    const dy = e.clientY - pointerDownY;
    const moved = Math.hypot(dx, dy) > 6;
    if (moved) return;

    const splash = document.getElementById('splash');
    const settingsOverlay = document.getElementById('settingsOverlay');

    if (splash && splash.style.display !== 'none') return;
    if (settingsOverlay && !settingsOverlay.classList.contains('hidden')) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(pitMeshes);

    if (hits.length > 0 && typeof window.handlePitClick === 'function') {
        window.handlePitClick(hits[0].object.userData.index);
    }
});

// ---------- RESIZE ----------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------- LOOP ----------
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();