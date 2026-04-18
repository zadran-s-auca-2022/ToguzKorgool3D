import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');

// ---------------- SCENE ----------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x100704);

// ---------------- CAMERA ----------------
const camera = new THREE.PerspectiveCamera(
    40,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 13.5, 24);

// ---------------- RENDERER ----------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
root.appendChild(renderer.domElement);

// ---------------- CONTROLS ----------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.8, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 12;
controls.maxDistance = 34;
controls.maxPolarAngle = Math.PI / 2.12;

// ---------------- LIGHTS ----------------
scene.add(new THREE.AmbientLight(0xffffff, 1.15));

const keyLight = new THREE.DirectionalLight(0xfff1dc, 1.45);
keyLight.position.set(14, 22, 10);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffd7a8, 0.5);
fillLight.position.set(-12, 10, -8);
scene.add(fillLight);

// ---------------- MATERIALS ----------------
const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0x8b582a,
    roughness: 0.62,
    metalness: 0.02
});

const boardTopMaterial = new THREE.MeshStandardMaterial({
    color: 0x9b6633,
    roughness: 0.52,
    metalness: 0.02
});

const trayMaterial = new THREE.MeshStandardMaterial({
    color: 0x895728,
    roughness: 0.62,
    metalness: 0.02
});

const trayInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8b98e,
    roughness: 0.72,
    metalness: 0.01
});

const pitRimMaterial = new THREE.MeshStandardMaterial({
    color: 0x8c5a2d,
    roughness: 0.55,
    metalness: 0.02
});

const pitInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0x4f2e17,
    roughness: 0.88,
    metalness: 0.01
});

const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xf3e7cf,
    roughness: 0.35,
    metalness: 0.02
});

// ---------------- BOARD ----------------
const boardGroup = new THREE.Group();
scene.add(boardGroup);

const boardBase = new THREE.Mesh(
    new THREE.BoxGeometry(23.6, 2.6, 11.8),
    boardMaterial
);
boardBase.position.set(0, 0, 0);
boardGroup.add(boardBase);

const boardTop = new THREE.Mesh(
    new THREE.BoxGeometry(21.8, 0.45, 10.2),
    boardTopMaterial
);
boardTop.position.set(0, 1.32, 0);
boardGroup.add(boardTop);

// ---------------- SIDE KAZANS ----------------
const storeStoneGroups = {
    A: new THREE.Group(),
    B: new THREE.Group()
};
scene.add(storeStoneGroups.A);
scene.add(storeStoneGroups.B);

function createTray(xCenter) {
    const trayGroup = new THREE.Group();

    const outer = new THREE.Mesh(
        new THREE.BoxGeometry(4.9, 2.2, 8.4),
        trayMaterial
    );
    outer.position.set(xCenter, 0.12, 0);
    trayGroup.add(outer);

    const inner = new THREE.Mesh(
        new THREE.BoxGeometry(4.05, 1.15, 7.1),
        trayInnerMaterial
    );
    inner.position.set(xCenter, 0.82, 0);
    trayGroup.add(inner);

    scene.add(trayGroup);
}

createTray(-14.0);
createTray(14.0);

// ---------------- PITS ----------------
const pitMeshes = [];
const pitMeshByIndex = new Array(18);
const pitStoneGroups = new Array(18);
const pitStoneBase = new Array(18);

const pitSpacing = 2.3;
const startX = -9.2;
const topRowZ = -2.45;
const bottomRowZ = 2.45;

function createOvalPit(x, z, index) {
    const group = new THREE.Group();

    // oval wooden rim
    const rim = new THREE.Mesh(
        new THREE.SphereGeometry(0.95, 36, 22),
        pitRimMaterial
    );
    rim.scale.set(1.28, 0.42, 1.0);
    rim.position.set(x, 1.48, z);
    group.add(rim);

    // dark inner cavity
    const inner = new THREE.Mesh(
        new THREE.SphereGeometry(0.72, 36, 22),
        pitInnerMaterial.clone()
    );
    inner.scale.set(1.18, 0.28, 0.92);
    inner.position.set(x, 1.52, z);
    inner.userData.index = index;
    group.add(inner);

    scene.add(group);

    pitMeshes.push(inner);
    pitMeshByIndex[index] = inner;

    const stonesGroup = new THREE.Group();
    scene.add(stonesGroup);
    pitStoneGroups[index] = stonesGroup;

    pitStoneBase[index] = { x, y: 1.70, z };
}

// top row visually left -> right = 17..9
for (let i = 0; i < 9; i++) {
    createOvalPit(startX + i * pitSpacing, topRowZ, 17 - i);
}

// bottom row visually left -> right = 0..8
for (let i = 0; i < 9; i++) {
    createOvalPit(startX + i * pitSpacing, bottomRowZ, i);
}

// ---------------- STONES ----------------
const stoneGeometry = new THREE.SphereGeometry(0.23, 18, 18);

function clearGroup(group) {
    while (group.children.length > 0) {
        group.remove(group.children[0]);
    }
}

function renderPitStones(index, count) {
    const group = pitStoneGroups[index];
    const base = pitStoneBase[index];
    if (!group || !base) return;

    clearGroup(group);

    const maxVisual = Math.min(count, 12);

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);

        const col = i % 4;
        const row = Math.floor(i / 4);

        stone.scale.set(1.0, 0.82, 0.92);
        stone.position.set(
            base.x + (col - 1.5) * 0.42,
            base.y + row * 0.03,
            base.z + (row - 1) * 0.34
        );

        group.add(stone);
    }
}

function renderStoreStones(side, count) {
    const group = storeStoneGroups[side];
    clearGroup(group);

    const maxVisual = Math.min(count, 42);
    const baseX = side === 'A' ? 14.0 : -14.0;

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);

        const col = i % 4;
        const row = Math.floor(i / 4);

        stone.scale.set(1.0, 0.82, 0.92);
        stone.position.set(
            baseX + (col - 1.5) * 0.52,
            1.2 + (row % 2) * 0.03,
            (row - 4) * 0.45
        );

        group.add(stone);
    }
}

// ---------------- SYNC ----------------
function sync3DBoardFromGameState(state) {
    if (!state || !state.pits) return;

    for (let i = 0; i < 18; i++) {
        renderPitStones(i, state.pits[i]);

        const pit = pitMeshByIndex[i];
        if (!pit) continue;

        pit.material.emissive.setHex(0x000000);

        if (i === state.tuzA || i === state.tuzB) {
            pit.material.emissive.setHex(0x7a6408);
        }
    }

    renderStoreStones('A', state.storeA || 0);
    renderStoreStones('B', state.storeB || 0);
}

window.sync3DBoardFromGameState = sync3DBoardFromGameState;

// initial draw
for (let i = 0; i < 18; i++) {
    renderPitStones(i, 9);
}
renderStoreStones('A', 0);
renderStoreStones('B', 0);

function tryInitialSync() {
    if (typeof window.getCurrentGameState === 'function') {
        sync3DBoardFromGameState(window.getCurrentGameState());
    }
}
setTimeout(tryInitialSync, 0);
setTimeout(tryInitialSync, 200);

// ---------------- CLICK ----------------
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
    if (Math.hypot(dx, dy) > 6) return;

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

// ---------------- RESIZE ----------------
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ---------------- LOOP ----------------
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();