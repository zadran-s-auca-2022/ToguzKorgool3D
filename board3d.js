import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');

// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x100704);

// CAMERA
const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 15.5, 23);

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
root.appendChild(renderer.domElement);

// CONTROLS
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.2, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 34;
controls.maxPolarAngle = Math.PI / 2.08;

// LIGHTS
scene.add(new THREE.AmbientLight(0xffffff, 1.25));

const keyLight = new THREE.DirectionalLight(0xfff1dc, 1.55);
keyLight.position.set(14, 22, 10);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffd7a8, 0.45);
fillLight.position.set(-12, 10, -8);
scene.add(fillLight);

// MATERIALS
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
    color: 0xd4b184,
    roughness: 0.72,
    metalness: 0.01
});

const pitInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0xa36b34,
    roughness: 0.84,
    metalness: 0.01
});

const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xf3e7cf,
    roughness: 0.35,
    metalness: 0.02
});

// BOARD
const boardGroup = new THREE.Group();
scene.add(boardGroup);

const boardBase = new THREE.Mesh(
    new THREE.BoxGeometry(24.2, 2.7, 12.8),
    boardMaterial
);
boardBase.position.set(0, 0, 0);
boardGroup.add(boardBase);

const boardTop = new THREE.Mesh(
    new THREE.BoxGeometry(22.0, 0.48, 10.9),
    boardTopMaterial
);
boardTop.position.set(0, 1.36, 0);
boardGroup.add(boardTop);

// KAZANS
const storeStoneGroups = {
    A: new THREE.Group(),
    B: new THREE.Group()
};
scene.add(storeStoneGroups.A);
scene.add(storeStoneGroups.B);

function createTray(xCenter) {
    const trayGroup = new THREE.Group();

    const outer = new THREE.Mesh(
        new THREE.BoxGeometry(5.0, 2.2, 8.5),
        trayMaterial
    );
    outer.position.set(xCenter, 0.1, 0);
    trayGroup.add(outer);

    const inner = new THREE.Mesh(
        new THREE.BoxGeometry(4.12, 1.08, 7.0),
        trayInnerMaterial
    );
    inner.position.set(xCenter, 0.84, 0);
    trayGroup.add(inner);

    scene.add(trayGroup);
}

createTray(-14.2);
createTray(14.2);

// PITS
const pitMeshes = [];
const pitMeshByIndex = new Array(18);
const pitStoneGroups = new Array(18);
const pitStoneBase = new Array(18);

const pitSpacing = 2.34;
const startX = -9.36;
const topRowZ = -2.55;
const bottomRowZ = 2.55;

function createPit(x, z, index) {
    const group = new THREE.Group();

    // wider pit rim
    const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(1.28, 1.34, 0.28, 40),
        pitRimMaterial
    );
    rim.position.set(x, 1.48, z);
    rim.scale.set(1.34, 1, 1.04);
    group.add(rim);

    // wider bowl, not deeper
    const inner = new THREE.Mesh(
        new THREE.SphereGeometry(1.05, 36, 24),
        pitInnerMaterial.clone()
    );
    inner.scale.set(1.34, 0.22, 0.96);
    inner.position.set(x, 1.45, z);
    inner.userData.index = index;
    group.add(inner);

    // larger lip
    const lip = new THREE.Mesh(
        new THREE.TorusGeometry(1.00, 0.07, 14, 40),
        new THREE.MeshStandardMaterial({
            color: 0xc59761,
            roughness: 0.78,
            metalness: 0.01
        })
    );
    lip.rotation.x = Math.PI / 2;
    lip.scale.set(1.24, 1, 0.94);
    lip.position.set(x, 1.54, z);
    group.add(lip);

    scene.add(group);

    pitMeshes.push(inner);
    pitMeshByIndex[index] = inner;

    const stonesGroup = new THREE.Group();
    scene.add(stonesGroup);
    pitStoneGroups[index] = stonesGroup;

    pitStoneBase[index] = { x, y: 1.61, z };
}

// top row 17..9
for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, topRowZ, 17 - i);
}

// bottom row 0..8
for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, bottomRowZ, i);
}

// STONES
const stoneGeometry = new THREE.SphereGeometry(0.14, 18, 18);

function clearGroup(group) {
    while (group.children.length > 0) {
        group.remove(group.children[0]);
    }
}

// up to 30 stones in pits
function renderPitStones(index, count) {
    const group = pitStoneGroups[index];
    const base = pitStoneBase[index];
    if (!group || !base) return;

    clearGroup(group);

    const maxVisual = Math.min(count, 30);

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
        stone.scale.set(1.0, 0.88, 0.95);

        const col = i % 5;
        const row = Math.floor(i / 5);

        stone.position.set(
            base.x + (col - 2) * 0.24,
            base.y + row * 0.02,
            base.z + (row - 2.5) * 0.12
        );

        group.add(stone);
    }
}

// up to 120 stones in kazans
function renderStoreStones(side, count) {
    const group = storeStoneGroups[side];
    clearGroup(group);

    const maxVisual = Math.min(count, 120);
    const baseX = side === 'A' ? 14.2 : -14.2;

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
        stone.scale.set(1.08, 0.95, 1.0);

        const col = i % 6;
        const row = Math.floor(i / 6);

        stone.position.set(
            baseX + (col - 2.5) * 0.33,
            1.18 + (row % 2) * 0.02,
            (row - 8) * 0.19
        );

        group.add(stone);
    }
}

// SYNC
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

// CLICK
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

// RESIZE
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// LOOP
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();