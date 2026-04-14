import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 14, 20);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.domElement.style.position = "fixed";
renderer.domElement.style.top = "0";
renderer.domElement.style.left = "0";
renderer.domElement.style.zIndex = "-1";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(8, 12, 8);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambient);

// BOARD
const board = new THREE.Mesh(
    new THREE.BoxGeometry(18, 1.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
);
board.position.set(0, 0, 0);
scene.add(board);

const pitMaterial = new THREE.MeshStandardMaterial({
    color: 0x5c3517,
    emissive: 0x000000
});
const storeMaterial = new THREE.MeshStandardMaterial({ color: 0x6f421f });

const pitGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.35, 32);

const pitMeshes = [];
const pitStoneGroups = [];
const pitBasePositions = [];

// TOP ROW = B side = indices 17..9 visually left -> right
for (let i = 0; i < 9; i++) {
    const pitTop = new THREE.Mesh(pitGeometry, pitMaterial.clone());
    pitTop.rotation.x = Math.PI / 2;
    pitTop.position.set(-7.2 + i * 1.8, 0.55, -1.8);
    pitTop.userData.pitIndex = 17 - i;
    scene.add(pitTop);
    pitMeshes.push(pitTop);

    const stoneGroup = new THREE.Group();
    scene.add(stoneGroup);
    pitStoneGroups[17 - i] = stoneGroup;
    pitBasePositions[17 - i] = { x: pitTop.position.x, y: 0.85, z: pitTop.position.z };
}

// BOTTOM ROW = A side = indices 0..8 left -> right
for (let i = 0; i < 9; i++) {
    const pitBottom = new THREE.Mesh(pitGeometry, pitMaterial.clone());
    pitBottom.rotation.x = Math.PI / 2;
    pitBottom.position.set(-7.2 + i * 1.8, 0.55, 1.8);
    pitBottom.userData.pitIndex = i;
    scene.add(pitBottom);
    pitMeshes.push(pitBottom);

    const stoneGroup = new THREE.Group();
    scene.add(stoneGroup);
    pitStoneGroups[i] = stoneGroup;
    pitBasePositions[i] = { x: pitBottom.position.x, y: 0.85, z: pitBottom.position.z };
}

// STORES
const leftStore = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32),
    storeMaterial
);
leftStore.rotation.x = Math.PI / 2;
leftStore.position.set(-9.8, 0.55, 0);
scene.add(leftStore);

const rightStore = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32),
    storeMaterial.clone()
);
rightStore.rotation.x = Math.PI / 2;
rightStore.position.set(9.8, 0.55, 0);
scene.add(rightStore);

const storeAGroup = new THREE.Group();
const storeBGroup = new THREE.Group();
scene.add(storeAGroup);
scene.add(storeBGroup);

// STONE GEOMETRY
const stoneGeometry = new THREE.SphereGeometry(0.16, 12, 12);
const stoneMaterial = new THREE.MeshStandardMaterial({ color: 0xf0e0b0 });

// HELPERS
function clearGroup(group) {
    while (group.children.length > 0) {
        const child = group.children.pop();
        group.remove(child);
        if (child.geometry) child.geometry.dispose?.();
        if (child.material) child.material.dispose?.();
    }
}

function addStoneToGroup(group, x, y, z) {
    const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
    stone.position.set(x, y, z);
    group.add(stone);
}

function renderPitStones(index, count) {
    const group = pitStoneGroups[index];
    const base = pitBasePositions[index];
    clearGroup(group);

    const maxVisual = Math.min(count, 12);

    for (let i = 0; i < maxVisual; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);
        const x = base.x + (col - 1.5) * 0.22;
        const y = base.y;
        const z = base.z + (row - 1) * 0.22;
        addStoneToGroup(group, x, y, z);
    }
}

function renderStoreStones(group, count, side) {
    clearGroup(group);
    const maxVisual = Math.min(count, 20);

    for (let i = 0; i < maxVisual; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);

        const x = side === 'A'
            ? 9.8 + (col - 1.5) * 0.18
            : -9.8 + (col - 1.5) * 0.18;

        const y = 0.85;
        const z = (row - 2) * 0.22;

        addStoneToGroup(group, x, y, z);
    }
}

function sync3DBoardFromGameState(state) {
    for (let i = 0; i < 18; i++) {
        renderPitStones(i, state.pits[i]);

        const mesh = pitMeshes.find(p => p.userData.pitIndex === i);
        if (!mesh) continue;

        mesh.material.emissive.setHex(0x000000);

        if (i === state.tuzA || i === state.tuzB) {
            mesh.material.emissive.setHex(0x665500);
        }
    }

    renderStoreStones(storeAGroup, state.storeA, 'A');
    renderStoreStones(storeBGroup, state.storeB, 'B');
}

window.sync3DBoardFromGameState = sync3DBoardFromGameState;

// CLICK
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    const splash = document.getElementById('splash');
    const settingsOverlay = document.getElementById('settingsOverlay');

    if (splash && splash.style.display !== 'none') return;
    if (settingsOverlay && !settingsOverlay.classList.contains('hidden')) return;

    if (
        event.target.closest('button') ||
        event.target.closest('#splash') ||
        event.target.closest('#settingsOverlay') ||
        event.target.closest('.history-container')
    ) {
        return;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(pitMeshes);

    if (hits.length > 0) {
        const pitIndex = hits[0].object.userData.pitIndex;
        console.log("Clicked pit:", pitIndex);

        if (typeof window.handlePitClick === "function") {
            window.handlePitClick(pitIndex);
        }
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
    renderer.render(scene, camera);
}

animate();