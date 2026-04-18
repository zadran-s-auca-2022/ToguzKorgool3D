import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');

// ---------------- SCENE ----------------
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x100704);

// ---------------- CAMERA ----------------
const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 15.5, 23);

// ---------------- RENDERER ----------------
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
root.appendChild(renderer.domElement);

// ---------------- CONTROLS ----------------
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.25, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 34;
controls.maxPolarAngle = Math.PI / 2.08;

// ---------------- LIGHTS ----------------
scene.add(new THREE.AmbientLight(0xffffff, 1.25));

const keyLight = new THREE.DirectionalLight(0xfff1dc, 1.55);
keyLight.position.set(14, 22, 10);
scene.add(keyLight);

const fillLight = new THREE.DirectionalLight(0xffd7a8, 0.45);
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
    color: 0xd4b184,
    roughness: 0.72,
    metalness: 0.01
});

const pitInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0xa36b34,
    roughness: 0.84,
    metalness: 0.01
});

// previous light stone color
const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xf3e7cf,
    roughness: 0.35,
    metalness: 0.02
});

// ---------------- BOARD ----------------
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

// ---------------- KAZANS ----------------
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

// ---------------- PITS ----------------
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

    // BIGGER / WIDER PIT RIM, NOT DEEPER
    const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(1.3, 1.35, 0.28, 40),
        pitRimMaterial
    );
    rim.position.set(x, 1.48, z);
    rim.scale.set(1.45, 1, 1.05);
    group.add(rim);

    // BIGGER INNER BOWL, BUT NOT DEEPER
    const inner = new THREE.Mesh(
        new THREE.SphereGeometry(1.1, 36, 24),
        pitInnerMaterial.clone()
    );
    inner.scale.set(1.35, 0.26, 0.95);
    inner.position.set(x, 1.44, z);
    inner.userData.index = index;
    group.add(inner);

    // LARGER LIP TO MATCH BIGGER PIT
    const lip = new THREE.Mesh(
        new THREE.TorusGeometry(1.05, 0.07, 14, 40),
        new THREE.MeshStandardMaterial({
            color: 0xc59761,
            roughness: 0.78,
            metalness: 0.01
        })
    );
    lip.rotation.x = Math.PI / 2;
    lip.scale.set(1.22, 1, 0.88);
    lip.position.set(x, 1.54, z);
    group.add(lip);

    scene.add(group);

    pitMeshes.push(inner);
    pitMeshByIndex[index] = inner;

    const stonesGroup = new THREE.Group();
    scene.add(stonesGroup);
    pitStoneGroups[index] = stonesGroup;

    // keep stone base at similar depth, not deeper
    pitStoneBase[index] = { x, y: 1.60, z };
}

// top row 17..9
for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, topRowZ, 17 - i);
}

// bottom row 0..8
for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, bottomRowZ, i);
}

// ---------------- STONES ----------------
const stoneGeometry = new THREE.SphereGeometry(0.12, 18, 18);

function clearGroup(group) {
    while (group.children.length > 0) {
        group.remove(group.children[0]);
    }
}

// up to 30 stones per pit
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
            base.x + (col - 2) * 0.26,
            base.y + row * 0.018,
            base.z + (row - 2.5) * 0.12
        );

        group.add(stone);
    }
}

// up to 120 stones per kazan
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

// ---------------- LABELS ----------------
const oldLayer = document.querySelector('.three-label-layer');
if (oldLayer) oldLayer.remove();

const labelLayer = document.createElement('div');
labelLayer.className = 'three-label-layer';
document.body.appendChild(labelLayer);

const pitNumberLabels = new Array(18);
const pitCountLabels = new Array(18);

function createLabel(className, text = '') {
    const el = document.createElement('div');
    el.className = className;
    el.textContent = text;
    labelLayer.appendChild(el);
    return el;
}

function pitNumberForIndex(index) {
    if (index < 9) return index + 1;
    return index - 8;
}

for (let i = 0; i < 18; i++) {
    pitNumberLabels[i] = createLabel('pit-number-label', String(pitNumberForIndex(i)));
    pitCountLabels[i] = createLabel('pit-count-label', '9');
}

const storeCountLabelA = createLabel('store-count-label', '0');
const storeCountLabelB = createLabel('store-count-label', '0');

function worldToScreen(x, y, z) {
    const v = new THREE.Vector3(x, y, z);
    v.project(camera);

    return {
        x: (v.x * 0.5 + 0.5) * window.innerWidth,
        y: (-v.y * 0.5 + 0.5) * window.innerHeight,
        visible: v.z < 1
    };
}

function updateLabels(state) {
    if (!state || !state.pits) return;

    for (let i = 0; i < 18; i++) {
        const base = pitStoneBase[i];
        if (!base) continue;

        const isTopRow = i >= 9;

        const numberPos = worldToScreen(
            base.x,
            2.02,
            isTopRow ? base.z - 0.62 : base.z + 0.62
        );

        const countPos = worldToScreen(
            base.x,
            1.42,
            isTopRow ? base.z - 0.12 : base.z + 0.12
        );

        const numEl = pitNumberLabels[i];
        const countEl = pitCountLabels[i];

        numEl.textContent = String(pitNumberForIndex(i));
        countEl.textContent = String(state.pits[i]);

        numEl.style.left = `${numberPos.x}px`;
        numEl.style.top = `${numberPos.y}px`;

        countEl.style.left = `${countPos.x}px`;
        countEl.style.top = `${countPos.y}px`;

        numEl.style.display = numberPos.visible ? 'block' : 'none';
        countEl.style.display = countPos.visible ? 'block' : 'none';
    }

    const aPos = worldToScreen(14.2, 2.08, 0);
    const bPos = worldToScreen(-14.2, 2.08, 0);

    storeCountLabelA.textContent = String(state.storeA || 0);
    storeCountLabelB.textContent = String(state.storeB || 0);

    storeCountLabelA.style.left = `${aPos.x}px`;
    storeCountLabelA.style.top = `${aPos.y}px`;

    storeCountLabelB.style.left = `${bPos.x}px`;
    storeCountLabelB.style.top = `${bPos.y}px`;

    storeCountLabelA.style.display = aPos.visible ? 'block' : 'none';
    storeCountLabelB.style.display = bPos.visible ? 'block' : 'none';
}

// ---------------- SYNC ----------------
let latestState = {
    pits: new Array(18).fill(9),
    storeA: 0,
    storeB: 0,
    tuzA: -1,
    tuzB: -1
};

function sync3DBoardFromGameState(state) {
    if (!state || !state.pits) return;

    latestState = state;

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
    updateLabels(state);
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
    } else {
        updateLabels(latestState);
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
    updateLabels(latestState);
});

// ---------------- LOOP ----------------
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
    updateLabels(latestState);
}

animate();