import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0f0a07);

// Camera
const camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 13, 20);
camera.lookAt(0, 1.6, 0);

// Renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.domElement.style.position = 'fixed';
renderer.domElement.style.top = '0';
renderer.domElement.style.left = '0';
renderer.domElement.style.zIndex = '0';
document.body.appendChild(renderer.domElement);

// ---------- LIGHTING ----------
const ambient = new THREE.AmbientLight(0xfff1d6, 0.45);
scene.add(ambient);

const mainLight = new THREE.DirectionalLight(0xffe2b8, 1.4);
mainLight.position.set(12, 20, 10);
mainLight.castShadow = true;
mainLight.shadow.mapSize.width = 4096;
mainLight.shadow.mapSize.height = 4096;
mainLight.shadow.camera.left = -30;
mainLight.shadow.camera.right = 30;
mainLight.shadow.camera.top = 30;
mainLight.shadow.camera.bottom = -30;
scene.add(mainLight);

const fillLight = new THREE.DirectionalLight(0xd9c2a3, 0.6);
fillLight.position.set(-10, 10, -8);
scene.add(fillLight);

const pointGlow = new THREE.PointLight(0xffcc88, 1.4, 80);
pointGlow.position.set(0, 10, 0);
scene.add(pointGlow);

// ---------- FLOOR ----------
const floor = new THREE.Mesh(
    new THREE.CircleGeometry(60, 80),
    new THREE.MeshStandardMaterial({
        color: 0x0a0604,
        roughness: 0.95,
        metalness: 0.05
    })
);
floor.rotation.x = -Math.PI / 2;
floor.position.y = -1.8;
floor.receiveShadow = true;
scene.add(floor);

// ---------- MATERIALS ----------
const woodMaterial = new THREE.MeshStandardMaterial({
    color: 0x7a4422,
    roughness: 0.4,
    metalness: 0.12
});

const darkWoodMaterial = new THREE.MeshStandardMaterial({
    color: 0x3b1f0f,
    roughness: 0.7,
    metalness: 0.05
});

const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.2,
    metalness: 0.85
});

const pitMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5e7c8,
    roughness: 0.88,
    metalness: 0.03
});

const ivoryMaterial = new THREE.MeshStandardMaterial({
    color: 0xf5e7c8,
    roughness: 0.15,
    metalness: 0.4
});

// ---------- BOARD BASE ----------
const boardGroup = new THREE.Group();
scene.add(boardGroup);
boardGroup.rotation.x = -0.08;

const boardBase = new THREE.Mesh(
    new THREE.BoxGeometry(30, 2.2, 14),
    woodMaterial
);
boardBase.castShadow = true;
boardBase.receiveShadow = true;
boardGroup.add(boardBase);

// top decorative panel
const boardTop = new THREE.Mesh(
    new THREE.BoxGeometry(28.2, 0.5, 12.6),
    new THREE.MeshStandardMaterial({
        color: 0x8b572c,
        roughness: 0.45,
        metalness: 0.08
    })
);
boardTop.position.y = 0.9;
boardTop.castShadow = true;
boardTop.receiveShadow = true;
boardGroup.add(boardTop);

// gold trim
const trimOuter = new THREE.Mesh(
    new THREE.BoxGeometry(23.4, 0.22, 10.3),
    goldMaterial
);
trimOuter.position.y = 1.12;
trimOuter.castShadow = true;
boardGroup.add(trimOuter);

const trimInner = new THREE.Mesh(
    new THREE.BoxGeometry(22.2, 0.18, 9.1),
    darkWoodMaterial
);
trimInner.position.y = 1.21;
trimInner.castShadow = true;
boardGroup.add(trimInner);

// corner decorations
function addCornerOrnament(x, z) {
    const ornament = new THREE.Mesh(
        new THREE.CylinderGeometry(0.34, 0.34, 0.22, 18),
        goldMaterial
    );
    ornament.rotation.x = Math.PI / 2;
    ornament.position.set(x, 1.25, z);
    ornament.castShadow = true;
    boardGroup.add(ornament);
}
addCornerOrnament(-11, -4.9);
addCornerOrnament(11, -4.9);
addCornerOrnament(-11, 4.9);
addCornerOrnament(11, 4.9);

// ---------- KAZANS ----------
const kazanMeshes = [];

function createLuxuryKazan(x) {
    const group = new THREE.Group();

    const outer = new THREE.Mesh(
        new THREE.CylinderGeometry(1.9, 1.9, 1.0, 40),
        woodMaterial
    );
    outer.rotation.x = Math.PI / 2;
    outer.position.set(x, 1.15, 0);
    outer.castShadow = true;
    outer.receiveShadow = true;
    group.add(outer);

    const goldRing = new THREE.Mesh(
        new THREE.CylinderGeometry(1.95, 1.95, 0.12, 40),
        goldMaterial
    );
    goldRing.rotation.x = Math.PI / 2;
    goldRing.position.set(x, 1.52, 0);
    goldRing.castShadow = true;
    group.add(goldRing);

    const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(1.45, 1.2, 0.65, 40),
        pitMaterial
    );
    bowl.rotation.x = Math.PI / 2;
    bowl.position.set(x, 1.18, 0);
    bowl.castShadow = true;
    bowl.receiveShadow = true;
    group.add(bowl);

    return group;
}

const leftKazan = createLuxuryKazan(-11.2);
const rightKazan = createLuxuryKazan(11.2);
boardGroup.add(leftKazan);
boardGroup.add(rightKazan);
kazanMeshes.push(leftKazan, rightKazan);

// ---------- PITS ----------
const pitMeshes = [];
const pitStoneGroups = [];
const pitBasePositions = [];

const pitSpacing = 3.1;
const startX = -10.4;
const topRowZ = -2.8;
const bottomRowZ = 2.8;

function createPit(x, z, pitIndex) {
    const pitGroup = new THREE.Group();

    const goldFrame = new THREE.Mesh(
        new THREE.CylinderGeometry(1.25, 1.05, 0.6, 40),
        goldMaterial
    );
    goldFrame.rotation.x = Math.PI / 2;
    goldFrame.position.set(x, 1.24, z);
    goldFrame.castShadow = true;
    pitGroup.add(goldFrame);

    const bowl = new THREE.Mesh(
        new THREE.CylinderGeometry(1.15, 0.9, 0.6, 32),
        pitMaterial
    );
    bowl.rotation.x = Math.PI / 2;
    bowl.position.set(x, 1.15, z);
    bowl.castShadow = true;
    bowl.receiveShadow = true;
    bowl.userData.pitIndex = pitIndex;
    pitGroup.add(bowl);

    const innerHighlight = new THREE.Mesh(
        new THREE.RingGeometry(0.38, 0.98, 32),
        new THREE.MeshStandardMaterial({
            color: 0x5d3218,
            roughness: 0.7,
            metalness: 0.05,
            side: THREE.DoubleSide
        })
    );
    innerHighlight.rotation.x = -Math.PI / 2;
    innerHighlight.position.set(x, 1.01, z);
    pitGroup.add(innerHighlight);

    boardGroup.add(pitGroup);
    pitMeshes.push(bowl);

    const stoneGroup = new THREE.Group();
    boardGroup.add(stoneGroup);
    pitStoneGroups[pitIndex] = stoneGroup;
    pitBasePositions[pitIndex] = { x, y: 1.52, z };
}

// top row visually left->right = indices 17..9
for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, topRowZ, 17 - i);
}

// bottom row visually left->right = indices 0..8
for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, bottomRowZ, i);
}

// ---------- STONES ----------
const stoneGeometry = new THREE.SphereGeometry(0.19, 28, 28);

function clearGroup(group) {
    while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
    }
}

function addStone(group, x, y, z) {
    const stone = new THREE.Mesh(stoneGeometry, ivoryMaterial);
    stone.position.set(x, y, z);
    stone.castShadow = true;
    group.add(stone);
}

function renderPitStones(index, count) {
    const group = pitStoneGroups[index];
    const base = pitBasePositions[index];
    clearGroup(group);

    const maxVisual = Math.min(count, 18);

    for (let i = 0; i < maxVisual; i++) {
        const col = i % 6;
        const row = Math.floor(i / 6);

        const x = base.x + (col - 2.5) * 0.18;
        const y = base.y + 0.02;
        const z = base.z + (row - 1) * 0.15;

        addStone(group, x, y, z);
    }
}

function renderKazanStones(count, side) {
    const targetGroup = side === 'A' ? rightKazan : leftKazan;

    let stonesGroup = targetGroup.userData.stonesGroup;
    if (!stonesGroup) {
        stonesGroup = new THREE.Group();
        targetGroup.userData.stonesGroup = stonesGroup;
        boardGroup.add(stonesGroup);
    }

    clearGroup(stonesGroup);

    const maxVisual = Math.min(count, 30);
    const centerX = side === 'A' ? 11.2 : -11.2;

    for (let i = 0; i < maxVisual; i++) {
        const col = i % 4;
        const row = Math.floor(i / 4);

        const x = centerX + (col - 1.5) * 0.24;
        const y = 1.3;
        const z = (row - 3) * 0.24;

        addStone(stonesGroup, x, y, z);
    }
}

// ---------- INITIAL VISUAL STATE ----------
for (let i = 0; i < 18; i++) {
    renderPitStones(i, 9);
}
renderKazanStones(0, 'A');
renderKazanStones(0, 'B');

// ---------- SYNC FUNCTION ----------
function sync3DBoardFromGameState(state) {
    for (let i = 0; i < 18; i++) {
        renderPitStones(i, state.pits[i]);

        const mesh = pitMeshes.find((p) => p.userData.pitIndex === i);
        if (!mesh) continue;

        mesh.material.emissive = new THREE.Color(0x000000);

        if (i === state.tuzA || i === state.tuzB) {
            mesh.material.emissive = new THREE.Color(0x7a5a12);
        }
    }

    renderKazanStones(state.storeA, 'A');
    renderKazanStones(state.storeB, 'B');
}

window.sync3DBoardFromGameState = sync3DBoardFromGameState;

// ---------- CLICK / RAYCAST ----------
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
    const splash = document.getElementById('splash');
    const settingsOverlay = document.getElementById('settingsOverlay');

    if (splash && splash.style.display !== 'none') return;
    if (settingsOverlay && !settingsOverlay.classList.contains('hidden')) return;

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(pitMeshes);

    if (hits.length > 0) {
        const pitIndex = hits[0].object.userData.pitIndex;

        if (typeof window.handlePitClick === 'function') {
            window.handlePitClick(pitIndex);
        }
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
    renderer.render(scene, camera);
}

animate();