import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');

/* SCENE */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x090403);

/* CAMERA */
const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 13.5, 22);

/* RENDERER */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
root.appendChild(renderer.domElement);

/* CONTROLS */
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.2, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 9;
controls.maxDistance = 34;
controls.maxPolarAngle = Math.PI / 2.05;

/* LIGHTS */
scene.add(new THREE.AmbientLight(0xffd9b0, 0.55));

const keyLight = new THREE.DirectionalLight(0xffe0aa, 2.4);
keyLight.position.set(10, 18, 12);
keyLight.castShadow = true;
scene.add(keyLight);

const warmLight = new THREE.PointLight(0xff9b35, 1.25, 40);
warmLight.position.set(-8, 6, 8);
scene.add(warmLight);

const rimLight = new THREE.DirectionalLight(0xffc47a, 0.75);
rimLight.position.set(-12, 10, -10);
scene.add(rimLight);

/* TEXTURE */
function createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 1024, 1024);
    gradient.addColorStop(0, '#8a4b1f');
    gradient.addColorStop(0.35, '#b56d32');
    gradient.addColorStop(0.65, '#6d3514');
    gradient.addColorStop(1, '#3a1908');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 95; i++) {
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 210, 145, ${0.035 + Math.random() * 0.045})`;
        ctx.lineWidth = 2 + Math.random() * 5;

        const y = Math.random() * 1024;
        ctx.moveTo(-100, y);

        for (let x = 0; x <= 1120; x += 80) {
            ctx.lineTo(x, y + Math.sin(x * 0.015 + i) * 22 + Math.random() * 16);
        }

        ctx.stroke();
    }

    for (let i = 0; i < 18; i++) {
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(50, 20, 5, 0.16)';
        ctx.lineWidth = 4;
        ctx.ellipse(
            Math.random() * 1024,
            Math.random() * 1024,
            70 + Math.random() * 120,
            18 + Math.random() * 45,
            Math.random() * Math.PI,
            0,
            Math.PI * 2
        );
        ctx.stroke();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.3, 1.15);
    texture.anisotropy = 8;
    return texture;
}

const woodTexture = createWoodTexture();

/* MATERIALS */
const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a4d22,
    map: woodTexture,
    roughness: 0.72,
    metalness: 0.03
});

const boardSideMaterial = new THREE.MeshStandardMaterial({
    color: 0x522408,
    roughness: 0.84,
    metalness: 0.02
});

const pitRimMaterial = new THREE.MeshStandardMaterial({
    color: 0xc48745,
    map: woodTexture,
    roughness: 0.72,
    metalness: 0.02
});

const pitInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0x2b1205,
    roughness: 0.92,
    metalness: 0.01
});

const kazanInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a1807,
    roughness: 0.9,
    metalness: 0.01
});

const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8c7aa,
    roughness: 0.42,
    metalness: 0.02
});

/* BOARD GROUP */
const boardGroup = new THREE.Group();
scene.add(boardGroup);

/* MAIN WOODEN BOARD */
const base = new THREE.Mesh(
    new THREE.BoxGeometry(27.5, 1.45, 12.8),
    boardSideMaterial
);
base.position.set(0, 0.15, 0);
base.castShadow = true;
base.receiveShadow = true;
boardGroup.add(base);

const top = new THREE.Mesh(
    new THREE.BoxGeometry(26.4, 0.55, 11.9),
    boardMaterial
);
top.position.set(0, 1.18, 0);
top.castShadow = true;
top.receiveShadow = true;
boardGroup.add(top);

/* SOFT ROUNDED CORNERS VISUAL */
function cornerCap(x, z) {
    const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(1.35, 1.35, 0.58, 36),
        boardMaterial
    );
    cap.scale.set(1.35, 1, 1.1);
    cap.rotation.y = Math.PI / 2;
    cap.position.set(x, 1.19, z);
    cap.castShadow = true;
    cap.receiveShadow = true;
    boardGroup.add(cap);
}

cornerCap(-12.9, -5.55);
cornerCap(12.9, -5.55);
cornerCap(-12.9, 5.55);
cornerCap(12.9, 5.55);

/* KAZANS */
const storeStoneGroups = {
    A: new THREE.Group(),
    B: new THREE.Group()
};
scene.add(storeStoneGroups.A);
scene.add(storeStoneGroups.B);

function createKazan(x, z) {
    const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(1.45, 1.55, 0.34, 48),
        pitRimMaterial
    );
    rim.scale.set(1.95, 1, 0.82);
    rim.position.set(x, 1.52, z);
    rim.castShadow = true;
    rim.receiveShadow = true;
    boardGroup.add(rim);

    const inner = new THREE.Mesh(
        new THREE.CylinderGeometry(1.12, 1.24, 0.24, 48),
        kazanInnerMaterial
    );
    inner.scale.set(1.95, 1, 0.78);
    inner.position.set(x, 1.62, z);
    inner.receiveShadow = true;
    boardGroup.add(inner);
}

createKazan(-5.1, 0);
createKazan(5.1, 0);

/* PITS */
const pitMeshes = [];
const pitMeshByIndex = new Array(18);
const pitStoneGroups = new Array(18);
const pitStoneBase = new Array(18);

const pitSpacing = 2.25;
const startX = -9.0;
const topRowZ = -3.25;
const bottomRowZ = 3.25;

function createPit(x, z, index) {
    const rim = new THREE.Mesh(
        new THREE.CylinderGeometry(0.78, 0.88, 0.32, 44),
        pitRimMaterial
    );
    rim.scale.set(1.25, 1, 0.78);
    rim.position.set(x, 1.52, z);
    rim.castShadow = true;
    rim.receiveShadow = true;
    boardGroup.add(rim);

    const inner = new THREE.Mesh(
        new THREE.CylinderGeometry(0.58, 0.69, 0.28, 44),
        pitInnerMaterial.clone()
    );
    inner.scale.set(1.25, 1, 0.78);
    inner.position.set(x, 1.63, z);
    inner.userData.index = index;
    inner.receiveShadow = true;
    boardGroup.add(inner);

    pitMeshes.push(inner);
    pitMeshByIndex[index] = inner;

    const stonesGroup = new THREE.Group();
    scene.add(stonesGroup);
    pitStoneGroups[index] = stonesGroup;

    pitStoneBase[index] = { x, y: 1.82, z };
}

/* Top row: indexes 17..9 */
for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, topRowZ, 17 - i);
}

/* Bottom row: indexes 0..8 */
for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, bottomRowZ, i);
}

/* DECORATIVE CARVED BORDER */
const borderMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a1605,
    roughness: 0.86
});

const borderFront = new THREE.Mesh(
    new THREE.BoxGeometry(25.3, 0.16, 0.12),
    borderMaterial
);
borderFront.position.set(0, 1.55, 5.3);
boardGroup.add(borderFront);

const borderBack = borderFront.clone();
borderBack.position.z = -5.3;
boardGroup.add(borderBack);

const borderLeft = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.16, 10.1),
    borderMaterial
);
borderLeft.position.set(-12.2, 1.55, 0);
boardGroup.add(borderLeft);

const borderRight = borderLeft.clone();
borderRight.position.x = 12.2;
boardGroup.add(borderRight);

/* STONES */
const stoneGeometry = new THREE.SphereGeometry(0.145, 20, 20);

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

    const maxVisual = Math.min(count, 30);

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
        stone.castShadow = true;
        stone.receiveShadow = true;

        const col = i % 5;
        const row = Math.floor(i / 5);

        stone.position.set(
            base.x + (col - 2) * 0.17,
            base.y + row * 0.018,
            base.z + (row - 2.3) * 0.13
        );

        stone.scale.set(0.86, 0.76, 0.82);
        group.add(stone);
    }
}

function renderStoreStones(side, count) {
    const group = storeStoneGroups[side];
    clearGroup(group);

    const maxVisual = Math.min(count, 98);
    const baseX = side === 'A' ? 5.1 : -5.1;
    const baseZ = 0;

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
        stone.castShadow = true;
        stone.receiveShadow = true;

        const col = i % 8;
        const row = Math.floor(i / 8);

        stone.position.set(
            baseX + (col - 3.5) * 0.25,
            1.84 + (row % 2) * 0.035,
            baseZ + (row - 3) * 0.27
        );

        stone.scale.set(1.05, 0.9, 1.0);
        group.add(stone);
    }
}

/* TEXT SPRITES */
function makeTextTexture(text, options = {}) {
    const fontSize = options.fontSize || 64;
    const textColor = options.textColor || '#fff4dc';
    const padding = options.padding || 18;
    const fontFamily = options.fontFamily || 'Outfit, Arial';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const metrics = ctx.measureText(text);
    const textWidth = Math.ceil(metrics.width);

    canvas.width = textWidth + padding * 2;
    canvas.height = fontSize + padding * 2;

    const ctx2 = canvas.getContext('2d');
    ctx2.clearRect(0, 0, canvas.width, canvas.height);

    ctx2.font = `bold ${fontSize}px ${fontFamily}`;
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';
    ctx2.lineWidth = 8;
    ctx2.strokeStyle = 'rgba(0,0,0,0.75)';
    ctx2.strokeText(text, canvas.width / 2, canvas.height / 2 + 2);
    ctx2.fillStyle = textColor;
    ctx2.fillText(text, canvas.width / 2, canvas.height / 2 + 2);

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;
    return { texture, width: canvas.width, height: canvas.height };
}

function createTextSprite(text, options = {}) {
    const { texture, width, height } = makeTextTexture(text, options);

    const material = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false
    });

    const sprite = new THREE.Sprite(material);
    const scaleFactor = options.scaleFactor || 0.006;
    sprite.scale.set(width * scaleFactor, height * scaleFactor, 1);
    sprite.userData.options = options;
    sprite.renderOrder = 10;
    return sprite;
}

function updateTextSprite(sprite, text) {
    const { texture, width, height } = makeTextTexture(text, sprite.userData.options || {});
    sprite.material.map.dispose();
    sprite.material.map = texture;
    sprite.material.needsUpdate = true;

    const scaleFactor = sprite.userData.options?.scaleFactor || 0.006;
    sprite.scale.set(width * scaleFactor, height * scaleFactor, 1);
}

const pitNumberSprites = new Array(18);
const pitCountSprites = new Array(18);

function pitNumberForIndex(index) {
    if (index < 9) return index + 1;
    return index - 8;
}

for (let i = 0; i < 18; i++) {
    const base = pitStoneBase[i];
    const isTopRow = i >= 9;

    const numSprite = createTextSprite(String(pitNumberForIndex(i)), {
        fontSize: 52,
        textColor: '#1a0d04',
        scaleFactor: 0.0042
    });

    numSprite.position.set(
        base.x,
        1.86,
        isTopRow ? base.z - 0.68 : base.z + 0.68
    );
    scene.add(numSprite);
    pitNumberSprites[i] = numSprite;

    const countSprite = createTextSprite('9', {
        fontSize: 64,
        textColor: '#fff0d0',
        scaleFactor: 0.0045
    });

    countSprite.position.set(
        base.x,
        1.96,
        isTopRow ? base.z + 0.75 : base.z - 0.75
    );
    scene.add(countSprite);
    pitCountSprites[i] = countSprite;
}

const storeCountSpriteA = createTextSprite('0', {
    fontSize: 82,
    textColor: '#fff4dc',
    scaleFactor: 0.0055
});
storeCountSpriteA.position.set(5.1, 2.05, -1.35);
scene.add(storeCountSpriteA);

const storeCountSpriteB = createTextSprite('0', {
    fontSize: 82,
    textColor: '#fff4dc',
    scaleFactor: 0.0055
});
storeCountSpriteB.position.set(-5.1, 2.05, -1.35);
scene.add(storeCountSpriteB);

/* SYNC */
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

        updateTextSprite(pitCountSprites[i], String(state.pits[i]));
    }

    renderStoreStones('A', state.storeA || 0);
    renderStoreStones('B', state.storeB || 0);

    updateTextSprite(storeCountSpriteA, String(state.storeA || 0));
    updateTextSprite(storeCountSpriteB, String(state.storeB || 0));
}

window.sync3DBoardFromGameState = sync3DBoardFromGameState;

/* INITIAL DRAW */
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

/* CLICK */
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
    const rulesOverlay = document.getElementById('rulesOverlay');

    if (splash && splash.style.display !== 'none') return;
    if (settingsOverlay && !settingsOverlay.classList.contains('hidden')) return;
    if (rulesOverlay && !rulesOverlay.classList.contains('hidden')) return;

    mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const hits = raycaster.intersectObjects(pitMeshes);

    if (hits.length > 0 && typeof window.handlePitClick === 'function') {
        window.handlePitClick(hits[0].object.userData.index);
    }
});

/* RESIZE */
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* LOOP */
function animate() {
    requestAnimationFrame(animate);
    controls.update();
    renderer.render(scene, camera);
}

animate();