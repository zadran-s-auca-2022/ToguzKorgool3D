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
const sideMaterial = new THREE.MeshStandardMaterial({ color: 0x9a6a38 });
const pitMaterial = new THREE.MeshStandardMaterial({ color: 0xe2bf8f });
const storeInnerMaterial = new THREE.MeshStandardMaterial({ color: 0xc89b63 });
const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0xf2f2f2 });

// ---------- MAIN BOARD ----------
const board = new THREE.Mesh(
    new THREE.BoxGeometry(24, 2, 14),
    boardMaterial
);
board.position.set(0, 0, 0);
scene.add(board);

// ---------- RECTANGULAR KAZANS ----------
const leftStoreGroup = new THREE.Group();
const rightStoreGroup = new THREE.Group();
scene.add(leftStoreGroup);
scene.add(rightStoreGroup);

function createRectangularStore(group, xCenter) {
    // outer block
    const outer = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 2, 8.6),
        sideMaterial
    );
    outer.position.set(xCenter, 0, 0);
    group.add(outer);

    // carved inner bowl
    const inner = new THREE.Mesh(
        new THREE.BoxGeometry(4.0, 0.9, 6.9),
        storeInnerMaterial
    );
    inner.position.set(xCenter, 0.56, 0);
    group.add(inner);

    // rim lines using thin raised borders
    const rimTop = new THREE.Mesh(
        new THREE.BoxGeometry(4.3, 0.12, 7.2),
        new THREE.MeshStandardMaterial({ color: 0xe2bf8f })
    );
    rimTop.position.set(xCenter, 1.02, 0);
    group.add(rimTop);
}

createRectangularStore(leftStoreGroup, -14.6);
createRectangularStore(rightStoreGroup, 14.6);

// ---------- PITS ----------
const pitMeshes = [];
const pitMeshByIndex = new Array(18);
const pitStoneGroups = new Array(18);
const pitBasePositions = new Array(18);

const pitSpacing = 2.55;
const startX = -10.2;
const topZ = -3.15;
const bottomZ = 3.15;

function createPit(x, z, index) {
    const pit = new THREE.Mesh(
        new THREE.CylinderGeometry(0.95, 0.95, 0.55, 32),
        pitMaterial.clone()
    );

    pit.rotation.x = Math.PI / 2;
    pit.position.set(x, 1.05, z);
    pit.userData.index = index;

    scene.add(pit);
    pitMeshes.push(pit);
    pitMeshByIndex[index] = pit;

    const group = new THREE.Group();
    scene.add(group);
    pitStoneGroups[index] = group;

    pitBasePositions[index] = { x, y: 1.32, z };
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
const stoneGeometry = new THREE.SphereGeometry(0.12, 14, 14);

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
            base.x + (col - 2.5) * 0.12,
            base.y,
            base.z + (row - 1) * 0.12
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

    const maxVisual = Math.min(count, 40);
    const baseX = side === 'A' ? 14.6 : -14.6;

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);

        const col = i % 4;
        const row = Math.floor(i / 4);

        stone.position.set(
            baseX + (col - 1.5) * 0.22,
            0.72,
            (row - 4) * 0.22
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

// initial setup
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