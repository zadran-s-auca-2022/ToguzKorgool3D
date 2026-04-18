import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');

// ---------- SCENE ----------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0a07);

// ---------- CAMERA ----------
const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 17, 23);

// ---------- RENDERER ----------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
root.appendChild(renderer.domElement);

// ---------- CONTROLS ----------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.3, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 36;
controls.maxPolarAngle = Math.PI / 2.08;

// ---------- LIGHTS ----------
scene.add(new THREE.AmbientLight(0xffffff, 1.35));

const keyLight = new THREE.DirectionalLight(0xffffff, 1.7);
keyLight.position.set(12, 20, 10);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffe7c4, 0.55);
fillLight.position.set(-10, 8, -8);
scene.add(fillLight);

// ---------- MATERIALS ----------
const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a5a2b,
    roughness: 0.72,
    metalness: 0.04
});

const sideStoreMaterial = new THREE.MeshStandardMaterial({
    color: 0x9e6a37,
    roughness: 0.7,
    metalness: 0.03
});

const storeInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0xd0b185,
    roughness: 0.78,
    metalness: 0.02
});

const pitOuterMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8b98d,
    roughness: 0.7,
    metalness: 0.03
});

const pitInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0xbd9668,
    roughness: 0.85,
    metalness: 0.02
});

const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xf2f2f2,
    roughness: 0.35,
    metalness: 0.05
});

// ---------- BOARD BASE ----------
const boardGroup = new THREE.Group();
scene.add(boardGroup);

const boardBase = new THREE.Mesh(
    new THREE.BoxGeometry(24, 2.3, 13.5),
    boardMaterial
);
boardBase.position.set(0, 0, 0);
boardGroup.add(boardBase);

const boardTop = new THREE.Mesh(
    new THREE.BoxGeometry(22.6, 0.35, 12.1),
    new THREE.MeshStandardMaterial({
        color: 0x9a6533,
        roughness: 0.62,
        metalness: 0.03
    })
);
boardTop.position.set(0, 1.18, 0);
boardGroup.add(boardTop);

// ---------- RECTANGULAR KAZANS ----------
const storeStoneGroups = {
    A: new THREE.Group(),
    B: new THREE.Group()
};
scene.add(storeStoneGroups.A);
scene.add(storeStoneGroups.B);

function createRectStore(xCenter) {
    const group = new THREE.Group();

    const outer = new THREE.Mesh(
        new THREE.BoxGeometry(5.2, 2.3, 8.7),
        sideStoreMaterial
    );
    outer.position.set(xCenter, 0, 0);
    group.add(outer);

    const inner = new THREE.Mesh(
        new THREE.BoxGeometry(4.3, 0.95, 7.2),
        storeInnerMaterial
    );
    inner.position.set(xCenter, 0.7, 0);
    group.add(inner);

    const rim = new THREE.Mesh(
        new THREE.BoxGeometry(4.55, 0.12, 7.45),
        pitOuterMaterial
    );
    rim.position.set(xCenter, 1.15, 0);
    group.add(rim);

    scene.add(group);
}

createRectStore(-14.6);
createRectStore(14.6);

// ---------- PITS ----------
const pitMeshes = [];
const pitMeshByIndex = new Array(18);
const pitStoneGroups = new Array(18);
const pitStoneBase = new Array(18);

const pitSpacing = 2.47;
const startX = -9.88;
const topRowZ = -3.05;
const bottomRowZ = 3.05;

// top-facing deep bowl style
function createPit(x, z, index) {
    const pitGroup = new THREE.Group();

    // outer rim
    const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.93, 1.02, 0.34, 36),
        pitOuterMaterial
    );
    rim.position.set(x, 1.37, z);
    pitGroup.add(rim);

    // inner bowl
    const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(0.73, 0.84, 0.42, 36),
        pitInnerMaterial.clone()
    );
    bowl.position.set(x, 1.24, z);
    bowl.userData.index = index;
    pitGroup.add(bowl);

    scene.add(pitGroup);

    pitMeshes.push(bowl);
    pitMeshByIndex[index] = bowl;

    const stonesGroup = new THREE.Group();
    scene.add(stonesGroup);
    pitStoneGroups[index] = stonesGroup;

    pitStoneBase[index] = { x, y: 1.49, z };
}

// top row visually left -> right = 17..9
for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, topRowZ, 17 - i);
}

// bottom row visually left -> right = 0..8
for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, bottomRowZ, i);
}

// ---------- STONES ----------
const stoneGeometry = new THREE.SphereGeometry(0.11, 18, 18);

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

    // Show more clearly inside each pit
    const maxVisual = Math.min(count, 18);

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);

        const col = i % 6;
        const row = Math.floor(i / 6);

        stone.position.set(
            base.x + (col - 2.5) * 0.12,
            base.y + row * 0.015,
            base.z + (row - 1) * 0.12
        );

        group.add(stone);
    }
}

function renderStoreStones(side, count) {
    const group = storeStoneGroups[side];
    clearGroup(group);

    const maxVisual = Math.min(count, 42);
    const baseX = side === 'A' ? 14.6 : -14.6;

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);

        const col = i % 4;
        const row = Math.floor(i / 4);

        stone.position.set(
            baseX + (col - 1.5) * 0.24,
            0.86 + (row % 2) * 0.02,
            (row - 4) * 0.24
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
            pit.material.emissive.setHex(0x6d5600);
        }
    }

    renderStoreStones('A', state.storeA || 0);
    renderStoreStones('B', state.storeB || 0);
}

window.sync3DBoardFromGameState = sync3DBoardFromGameState;

// ---------- INITIAL DRAW ----------
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