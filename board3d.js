import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');
root.innerHTML = '';

/* SCENE */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050201);

/* CAMERA */
const camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 10.8, 19.5);

/* RENDERER */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
root.appendChild(renderer.domElement);

/* CONTROLS */
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.1, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 10;
controls.maxDistance = 30;
controls.maxPolarAngle = Math.PI / 2.15;

/* LIGHTS */
scene.add(new THREE.AmbientLight(0xffc58a, 0.28));

const keyLight = new THREE.DirectionalLight(0xffcf8a, 3.2);
keyLight.position.set(-7, 14, 10);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.near = 1;
keyLight.shadow.camera.far = 45;
keyLight.shadow.camera.left = -18;
keyLight.shadow.camera.right = 18;
keyLight.shadow.camera.top = 14;
keyLight.shadow.camera.bottom = -14;
scene.add(keyLight);

const warmPitLight = new THREE.PointLight(0xff8a25, 1.5, 32);
warmPitLight.position.set(0, 4.5, 4);
scene.add(warmPitLight);

const rimLight = new THREE.DirectionalLight(0xffa24a, 1.25);
rimLight.position.set(8, 9, -10);
scene.add(rimLight);

/* DARK TABLE */
const tableMaterial = new THREE.MeshStandardMaterial({
    color: 0x130804,
    roughness: 0.92,
    metalness: 0.0
});

const table = new THREE.Mesh(new THREE.PlaneGeometry(70, 45), tableMaterial);
table.rotation.x = -Math.PI / 2;
table.position.y = -0.66;
table.receiveShadow = true;
scene.add(table);

/* TEXTURE */
function createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 1400, 900);
    gradient.addColorStop(0, '#1b0702');
    gradient.addColorStop(0.18, '#4c1705');
    gradient.addColorStop(0.42, '#8b3b12');
    gradient.addColorStop(0.62, '#5b2109');
    gradient.addColorStop(0.82, '#2a0c03');
    gradient.addColorStop(1, '#120402');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 280; i++) {
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(8, 2, 0, ${0.10 + Math.random() * 0.24})`;
        ctx.lineWidth = 1 + Math.random() * 4;
        ctx.moveTo(-80, y);

        for (let x = -80; x <= canvas.width + 80; x += 55) {
            ctx.lineTo(
                x,
                y + Math.sin(x * 0.018 + i * 0.7) * 18 + Math.sin(x * 0.045 + i) * 6
            );
        }
        ctx.stroke();
    }

    for (let i = 0; i < 120; i++) {
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 165, 65, ${0.035 + Math.random() * 0.07})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.moveTo(-80, y);

        for (let x = -80; x <= canvas.width + 80; x += 65) {
            ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 13);
        }
        ctx.stroke();
    }

    for (let i = 0; i < 32; i++) {
        ctx.save();
        ctx.translate(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.rotate((Math.random() - 0.5) * 0.6);

        for (let r = 0; r < 5; r++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(12, 3, 0, ${0.20 - r * 0.03})`;
            ctx.lineWidth = 2;
            ctx.ellipse(0, 0, 36 + r * 14, 9 + r * 4, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.8, 1.2);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
    return texture;
}

const woodTexture = createWoodTexture();

/* MATERIALS */
const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0x7b2e0c,
    map: woodTexture,
    roughness: 0.58,
    metalness: 0.02
});

const sideMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a0b02,
    map: woodTexture,
    roughness: 0.82,
    metalness: 0.0
});

const darkCarveMaterial = new THREE.MeshStandardMaterial({
    color: 0x090201,
    roughness: 1.0,
    metalness: 0.0
});

const innerWoodMaterial = new THREE.MeshStandardMaterial({
    color: 0x3a1004,
    map: woodTexture,
    roughness: 0.92,
    metalness: 0.0
});

const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0x9b4214,
    map: woodTexture,
    roughness: 0.54,
    metalness: 0.015
});

const borderMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b0602,
    roughness: 0.88,
    metalness: 0.0
});

const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8c49a,
    roughness: 0.38,
    metalness: 0.08
});

const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd5a948,
    roughness: 0.28,
    metalness: 0.45
});

/* BOARD GROUP */
const boardGroup = new THREE.Group();
scene.add(boardGroup);

/* MAIN HEAVY BOARD */
const base = new THREE.Mesh(new THREE.BoxGeometry(27.8, 1.35, 12.7), sideMaterial);
base.position.set(0, 0.05, 0);
base.castShadow = true;
base.receiveShadow = true;
boardGroup.add(base);

const top = new THREE.Mesh(new THREE.BoxGeometry(26.6, 0.46, 11.55), boardMaterial);
top.position.set(0, 0.98, 0);
top.castShadow = true;
top.receiveShadow = true;
boardGroup.add(top);

/* EXTRA LOWER SHADOW BODY */
const lowerBody = new THREE.Mesh(new THREE.BoxGeometry(26.8, 0.55, 11.7), sideMaterial);
lowerBody.position.set(0, -0.45, 0);
lowerBody.castShadow = true;
lowerBody.receiveShadow = true;
boardGroup.add(lowerBody);

/* ROUNDED CORNER CAPS */
function cornerCap(x, z) {
    const cap = new THREE.Mesh(new THREE.CylinderGeometry(1.55, 1.55, 0.50, 64), boardMaterial);
    cap.rotation.x = Math.PI / 2;
    cap.scale.set(1.25, 1.0, 1.0);
    cap.position.set(x, 1.04, z);
    cap.castShadow = true;
    cap.receiveShadow = true;
    boardGroup.add(cap);

    const lower = new THREE.Mesh(new THREE.CylinderGeometry(1.6, 1.6, 0.65, 64), sideMaterial);
    lower.rotation.x = Math.PI / 2;
    lower.scale.set(1.25, 1.0, 1.0);
    lower.position.set(x, 0.35, z);
    lower.castShadow = true;
    lower.receiveShadow = true;
    boardGroup.add(lower);
}

cornerCap(-12.9, -5.45);
cornerCap(12.9, -5.45);
cornerCap(-12.9, 5.45);
cornerCap(12.9, 5.45);

/* DECORATIVE DARK BORDER */
function addBorder() {
    const front = new THREE.Mesh(new THREE.BoxGeometry(24.9, 0.16, 0.13), borderMaterial);
    front.position.set(0, 1.34, 5.05);
    front.castShadow = true;
    boardGroup.add(front);

    const back = front.clone();
    back.position.z = -5.05;
    boardGroup.add(back);

    const left = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 9.7), borderMaterial);
    left.position.set(-12.1, 1.34, 0);
    left.castShadow = true;
    boardGroup.add(left);

    const right = left.clone();
    right.position.x = 12.1;
    boardGroup.add(right);
}
addBorder();

/* TEXTURE SPRITE */
function makeTextTexture(text, options = {}) {
    const fontSize = options.fontSize || 64;
    const textColor = options.textColor || '#fff4dc';
    const padding = options.padding || 18;
    const fontFamily = options.fontFamily || 'Arial';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    ctx.font = `bold ${fontSize}px ${fontFamily}`;
    const textWidth = Math.ceil(ctx.measureText(text).width);

    canvas.width = textWidth + padding * 2;
    canvas.height = fontSize + padding * 2;

    const ctx2 = canvas.getContext('2d');
    ctx2.clearRect(0, 0, canvas.width, canvas.height);

    ctx2.font = `bold ${fontSize}px ${fontFamily}`;
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';

    if (options.stroke !== false) {
        ctx2.lineWidth = options.strokeWidth || 8;
        ctx2.strokeStyle = options.strokeColor || 'rgba(0,0,0,0.75)';
        ctx2.strokeText(text, canvas.width / 2, canvas.height / 2 + 2);
    }

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
        depthTest: true
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

/* ENGRAVED TITLE EFFECT */
function addEngravedTitle() {
    const title1 = createTextSprite('TOGUZ', {
        fontSize: 90,
        textColor: '#1a0702',
        stroke: false,
        scaleFactor: 0.0058
    });
    title1.position.set(0, 1.38, -0.35);
    title1.rotation.x = -Math.PI / 2;
    scene.add(title1);

    const title2 = createTextSprite('KORGOOL', {
        fontSize: 90,
        textColor: '#1a0702',
        stroke: false,
        scaleFactor: 0.0058
    });
    title2.position.set(0, 1.38, 0.42);
    title2.rotation.x = -Math.PI / 2;
    scene.add(title2);
}
addEngravedTitle();

/* STORE / KAZAN GROUPS */
const storeStoneGroups = {
    A: new THREE.Group(),
    B: new THREE.Group()
};
scene.add(storeStoneGroups.A);
scene.add(storeStoneGroups.B);

/* DEEP CARVED OVAL */
function createCarvedOval(x, z, options = {}) {
    const length = options.length || 1.9;
    const width = options.width || 0.82;
    const depth = options.depth || 0.62;
    const topY = options.topY || 1.35;
    const innerScale = options.innerScale || 1.0;

    const group = new THREE.Group();
    group.position.set(x, 0, z);
    boardGroup.add(group);

    const shadow = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 0.72, width * 0.82, 0.035, 72),
        darkCarveMaterial
    );
    shadow.rotation.x = Math.PI / 2;
    shadow.scale.set(1.0, length / width, 1);
    shadow.position.y = topY - depth - 0.035;
    shadow.receiveShadow = true;
    group.add(shadow);

    for (let i = 0; i < 7; i++) {
        const t = i / 6;
        const ringW = width * (1.02 - t * 0.34) * innerScale;
        const ringL = length * (1.02 - t * 0.25) * innerScale;
        const y = topY - t * depth;

        const ring = new THREE.Mesh(
            new THREE.TorusGeometry(ringW, 0.038 - t * 0.002, 72, 10),
            i < 2 ? rimMaterial : innerWoodMaterial
        );
        ring.rotation.x = Math.PI / 2;
        ring.scale.set(1.0, ringL / ringW, 1.0);
        ring.position.y = y;
        ring.castShadow = true;
        ring.receiveShadow = true;
        group.add(ring);
    }

    const innerWall = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 0.78, width * 0.52, depth, 72, 1, true),
        innerWoodMaterial
    );
    innerWall.rotation.x = Math.PI / 2;
    innerWall.scale.set(1, length / width, 1);
    innerWall.position.y = topY - depth / 2;
    innerWall.castShadow = true;
    innerWall.receiveShadow = true;
    group.add(innerWall);

    const darkCore = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 0.52, width * 0.60, 0.12, 72),
        darkCarveMaterial
    );
    darkCore.rotation.x = Math.PI / 2;
    darkCore.scale.set(1, length / width, 1);
    darkCore.position.y = topY - depth + 0.015;
    darkCore.receiveShadow = true;
    group.add(darkCore);

    return group;
}

/* KAZANS */
function createKazan(x, z) {
    createCarvedOval(x, z, {
        length: 2.85,
        width: 1.05,
        depth: 0.72,
        topY: 1.36,
        innerScale: 1.08
    });

    const clickVisual = new THREE.Mesh(
        new THREE.CylinderGeometry(1.0, 1.0, 0.04, 72),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    clickVisual.rotation.x = Math.PI / 2;
    clickVisual.scale.set(1.05, 2.85, 1);
    clickVisual.position.set(x, 1.38, z);
    boardGroup.add(clickVisual);
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
const topRowZ = -3.05;
const bottomRowZ = 3.05;

function createPit(x, z, index) {
    const carved = createCarvedOval(x, z, {
        length: 1.34,
        width: 0.58,
        depth: 0.66,
        topY: 1.36,
        innerScale: 1.0
    });

    pitMeshByIndex[index] = carved.children[carved.children.length - 1];

    const clickSurface = new THREE.Mesh(
        new THREE.CylinderGeometry(0.58, 0.58, 0.08, 72),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    clickSurface.rotation.x = Math.PI / 2;
    clickSurface.scale.set(1.0, 2.3, 1.0);
    clickSurface.position.set(x, 1.38, z);
    clickSurface.userData.index = index;
    boardGroup.add(clickSurface);

    pitMeshes.push(clickSurface);

    const stonesGroup = new THREE.Group();
    scene.add(stonesGroup);
    pitStoneGroups[index] = stonesGroup;

    pitStoneBase[index] = { x, y: 0.88, z };
}

for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, topRowZ, 17 - i);
}

for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, bottomRowZ, i);
}

/* GOLD DECORATIVE BUTTONS */
function addGoldButton(x, z) {
    const button = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 18), goldMaterial);
    button.scale.set(1, 0.32, 1);
    button.position.set(x, 1.47, z);
    button.castShadow = true;
    button.receiveShadow = true;
    boardGroup.add(button);
}
addGoldButton(-11.2, 0);
addGoldButton(11.2, 0);

/* STONES */
const stoneGeometry = new THREE.SphereGeometry(0.15, 24, 18);

function clearGroup(group) {
    while (group.children.length > 0) {
        const child = group.children[0];
        group.remove(child);
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

        const col = i % 3;
        const row = Math.floor(i / 3);
        const layer = Math.floor(i / 12);

        stone.position.set(
            base.x + (col - 1) * 0.18 + (row % 2) * 0.04,
            base.y + layer * 0.09,
            base.z + (row - 1.6) * 0.20
        );

        stone.scale.set(0.95, 0.82, 0.95);
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

        const col = i % 7;
        const row = Math.floor(i / 7);
        const layer = Math.floor(i / 35);

        stone.position.set(
            baseX + (col - 3) * 0.22,
            0.83 + layer * 0.09,
            baseZ + (row - 3.1) * 0.22
        );

        stone.scale.set(1.02, 0.85, 1.02);
        group.add(stone);
    }
}

/* NUMBERS AND COUNTS */
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
        fontSize: 54,
        textColor: '#120501',
        stroke: false,
        scaleFactor: 0.0042
    });
    numSprite.position.set(base.x, 1.58, isTopRow ? base.z - 0.92 : base.z + 0.92);
    scene.add(numSprite);
    pitNumberSprites[i] = numSprite;

    const countSprite = createTextSprite('9', {
        fontSize: 64,
        textColor: '#fff2d4',
        scaleFactor: 0.0045
    });
    countSprite.position.set(base.x, 1.62, isTopRow ? base.z + 0.92 : base.z - 0.92);
    scene.add(countSprite);
    pitCountSprites[i] = countSprite;
}

const storeCountSpriteA = createTextSprite('0', {
    fontSize: 82,
    textColor: '#fff4dc',
    scaleFactor: 0.0055
});
storeCountSpriteA.position.set(5.1, 1.66, -1.55);
scene.add(storeCountSpriteA);

const storeCountSpriteB = createTextSprite('0', {
    fontSize: 82,
    textColor: '#fff4dc',
    scaleFactor: 0.0055
});
storeCountSpriteB.position.set(-5.1, 1.66, -1.55);
scene.add(storeCountSpriteB);

/* SYNC */
function sync3DBoardFromGameState(state) {
    if (!state || !state.pits) return;

    for (let i = 0; i < 18; i++) {
        renderPitStones(i, state.pits[i]);

        const pit = pitMeshByIndex[i];
        if (pit && pit.material && pit.material.emissive) {
            pit.material.emissive.setHex(0x000000);

            if (i === state.tuzA || i === state.tuzB) {
                pit.material.emissive.setHex(0x6d5608);
            }
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