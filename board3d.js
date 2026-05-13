import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');
root.innerHTML = '';

/* SCENE */
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x050201);

/* CAMERA */
const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 13.2, 24);

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
controls.target.set(0, 1.15, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 13;
controls.maxDistance = 34;
controls.maxPolarAngle = Math.PI / 2.08;

/* LIGHTS */
scene.add(new THREE.AmbientLight(0xffc18a, 0.38));

const keyLight = new THREE.DirectionalLight(0xffd19a, 2.6);
keyLight.position.set(8, 16, 12);
keyLight.castShadow = true;
keyLight.shadow.mapSize.set(2048, 2048);
keyLight.shadow.camera.left = -18;
keyLight.shadow.camera.right = 18;
keyLight.shadow.camera.top = 14;
keyLight.shadow.camera.bottom = -14;
scene.add(keyLight);

const warmLight = new THREE.PointLight(0xff8a24, 1.4, 38);
warmLight.position.set(-8, 6, 7);
scene.add(warmLight);

const rimLight = new THREE.DirectionalLight(0xff9f45, 0.9);
rimLight.position.set(-10, 10, -10);
scene.add(rimLight);

/* WOOD TEXTURE */
function createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1400;
    canvas.height = 900;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 1400, 900);
    gradient.addColorStop(0, '#180602');
    gradient.addColorStop(0.2, '#441505');
    gradient.addColorStop(0.45, '#8a3a12');
    gradient.addColorStop(0.65, '#5c2008');
    gradient.addColorStop(0.85, '#2b0c03');
    gradient.addColorStop(1, '#110301');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < 300; i++) {
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(10, 3, 0, ${0.12 + Math.random() * 0.22})`;
        ctx.lineWidth = 1 + Math.random() * 3;
        ctx.moveTo(-80, y);

        for (let x = -80; x <= canvas.width + 80; x += 55) {
            ctx.lineTo(
                x,
                y + Math.sin(x * 0.018 + i) * 18 + Math.sin(x * 0.045 + i) * 5
            );
        }

        ctx.stroke();
    }

    for (let i = 0; i < 110; i++) {
        const y = Math.random() * canvas.height;
        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 165, 70, ${0.03 + Math.random() * 0.06})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.moveTo(-80, y);

        for (let x = -80; x <= canvas.width + 80; x += 65) {
            ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 12);
        }

        ctx.stroke();
    }

    for (let i = 0; i < 28; i++) {
        ctx.save();
        ctx.translate(Math.random() * canvas.width, Math.random() * canvas.height);
        ctx.rotate((Math.random() - 0.5) * 0.5);

        for (let r = 0; r < 5; r++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(18, 5, 0, ${0.18 - r * 0.025})`;
            ctx.lineWidth = 2;
            ctx.ellipse(0, 0, 42 + r * 14, 10 + r * 4, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(1.8, 1.1);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;
    return texture;
}

const woodTexture = createWoodTexture();

/* MATERIALS */
const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a3510,
    map: woodTexture,
    roughness: 0.58,
    metalness: 0.02
});

const sideMaterial = new THREE.MeshStandardMaterial({
    color: 0x2b0b02,
    map: woodTexture,
    roughness: 0.86,
    metalness: 0.0
});

const rimMaterial = new THREE.MeshStandardMaterial({
    color: 0x9f4214,
    map: woodTexture,
    roughness: 0.54,
    metalness: 0.02
});

const innerWallMaterial = new THREE.MeshStandardMaterial({
    color: 0x421405,
    map: woodTexture,
    roughness: 0.9,
    metalness: 0.0,
    side: THREE.DoubleSide
});

const darkInsideMaterial = new THREE.MeshStandardMaterial({
    color: 0x070201,
    roughness: 1.0,
    metalness: 0.0
});

const borderMaterial = new THREE.MeshStandardMaterial({
    color: 0x170501,
    roughness: 0.9,
    metalness: 0.0
});

const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8c39a,
    roughness: 0.36,
    metalness: 0.06
});

const goldMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4a84d,
    roughness: 0.26,
    metalness: 0.45
});

/* BOARD GROUP */
const boardGroup = new THREE.Group();
scene.add(boardGroup);

/* MAIN BOARD */
const base = new THREE.Mesh(
    new THREE.BoxGeometry(27.8, 1.45, 12.8),
    sideMaterial
);
base.position.set(0, 0.1, 0);
base.castShadow = true;
base.receiveShadow = true;
boardGroup.add(base);

const top = new THREE.Mesh(
    new THREE.BoxGeometry(26.5, 0.52, 11.7),
    boardMaterial
);
top.position.set(0, 1.12, 0);
top.castShadow = true;
top.receiveShadow = true;
boardGroup.add(top);

const lowerShadow = new THREE.Mesh(
    new THREE.BoxGeometry(27.2, 0.42, 12.2),
    sideMaterial
);
lowerShadow.position.set(0, -0.45, 0);
lowerShadow.castShadow = true;
lowerShadow.receiveShadow = true;
boardGroup.add(lowerShadow);

/* CORNERS */
function cornerCap(x, z) {
    const cap = new THREE.Mesh(
        new THREE.CylinderGeometry(1.55, 1.55, 0.55, 64),
        boardMaterial
    );
    cap.scale.set(1.32, 1, 1.05);
    cap.position.set(x, 1.15, z);
    cap.castShadow = true;
    cap.receiveShadow = true;
    boardGroup.add(cap);

    const lower = new THREE.Mesh(
        new THREE.CylinderGeometry(1.58, 1.58, 0.62, 64),
        sideMaterial
    );
    lower.scale.set(1.32, 1, 1.05);
    lower.position.set(x, 0.35, z);
    lower.castShadow = true;
    lower.receiveShadow = true;
    boardGroup.add(lower);
}

cornerCap(-12.9, -5.5);
cornerCap(12.9, -5.5);
cornerCap(-12.9, 5.5);
cornerCap(12.9, 5.5);

/* BORDER */
function addBorder() {
    const front = new THREE.Mesh(new THREE.BoxGeometry(25.0, 0.16, 0.13), borderMaterial);
    front.position.set(0, 1.48, 5.25);
    front.castShadow = true;
    boardGroup.add(front);

    const back = front.clone();
    back.position.z = -5.25;
    boardGroup.add(back);

    const left = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.16, 10.1), borderMaterial);
    left.position.set(-12.15, 1.48, 0);
    left.castShadow = true;
    boardGroup.add(left);

    const right = left.clone();
    right.position.x = 12.15;
    boardGroup.add(right);
}
addBorder();

/* TEXT SPRITES FOR COUNTS ONLY */
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

    ctx2.lineWidth = 8;
    ctx2.strokeStyle = 'rgba(0,0,0,0.8)';
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

/* DEEP OVAL CARVING */
function createDeepOvalCarving(x, z, options = {}) {
    const width = options.width || 0.75;
    const length = options.length || 1.45;
    const depth = options.depth || 0.62;
    const topY = options.topY || 1.48;

    const group = new THREE.Group();
    group.position.set(x, 0, z);
    boardGroup.add(group);

    const outerRim = new THREE.Mesh(
        new THREE.CylinderGeometry(width, width * 0.96, 0.13, 80),
        rimMaterial
    );
    outerRim.scale.set(1, 1, length / width);
    outerRim.position.y = topY;
    outerRim.castShadow = true;
    outerRim.receiveShadow = true;
    group.add(outerRim);

    const darkOpening = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 0.78, width * 0.72, 0.15, 80),
        darkInsideMaterial
    );
    darkOpening.scale.set(1, 1, length / width);
    darkOpening.position.y = topY + 0.02;
    darkOpening.receiveShadow = true;
    group.add(darkOpening);

    const wall = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 0.72, width * 0.52, depth, 80, 1, true),
        innerWallMaterial
    );
    wall.scale.set(1, 1, length / width);
    wall.position.y = topY - depth / 2;
    wall.castShadow = true;
    wall.receiveShadow = true;
    group.add(wall);

    const bottom = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 0.52, width * 0.55, 0.08, 80),
        darkInsideMaterial
    );
    bottom.scale.set(1, 1, length / width);
    bottom.position.y = topY - depth - 0.02;
    bottom.receiveShadow = true;
    group.add(bottom);

    const highlight = new THREE.Mesh(
        new THREE.CylinderGeometry(width * 1.04, width * 1.02, 0.035, 80),
        new THREE.MeshStandardMaterial({
            color: 0xc06a25,
            map: woodTexture,
            roughness: 0.52,
            metalness: 0.02
        })
    );
    highlight.scale.set(1, 1, length / width);
    highlight.position.y = topY + 0.08;
    highlight.castShadow = true;
    highlight.receiveShadow = true;
    group.add(highlight);

    return { group, bottom };
}

/* KAZANS */
const storeStoneGroups = {
    A: new THREE.Group(),
    B: new THREE.Group()
};
scene.add(storeStoneGroups.A);
scene.add(storeStoneGroups.B);

function createKazan(x, z) {
    createDeepOvalCarving(x, z, {
        width: 1.2,
        length: 3.1,
        depth: 0.7,
        topY: 1.5
    });
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
const topRowZ = -3.15;
const bottomRowZ = 3.15;

function createPit(x, z, index) {
    const carved = createDeepOvalCarving(x, z, {
        width: 0.62,
        length: 1.35,
        depth: 0.64,
        topY: 1.5
    });

    pitMeshByIndex[index] = carved.bottom;

    const clickSurface = new THREE.Mesh(
        new THREE.CylinderGeometry(0.72, 0.72, 0.08, 64),
        new THREE.MeshBasicMaterial({ transparent: true, opacity: 0 })
    );
    clickSurface.scale.set(1, 1, 1.75);
    clickSurface.position.set(x, 1.63, z);
    clickSurface.userData.index = index;
    boardGroup.add(clickSurface);
    pitMeshes.push(clickSurface);

    const stonesGroup = new THREE.Group();
    scene.add(stonesGroup);
    pitStoneGroups[index] = stonesGroup;

    pitStoneBase[index] = { x, y: 1.08, z };
}

for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, topRowZ, 17 - i);
}

for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, bottomRowZ, i);
}

/* GOLD BUTTONS */
function addGoldButton(x, z) {
    const button = new THREE.Mesh(new THREE.SphereGeometry(0.18, 32, 20), goldMaterial);
    button.scale.set(1, 0.35, 1);
    button.position.set(x, 1.68, z);
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

        const col = i % 3;
        const row = Math.floor(i / 3);
        const layer = Math.floor(i / 12);

        stone.position.set(
            base.x + (col - 1) * 0.17 + (row % 2) * 0.035,
            base.y + layer * 0.08,
            base.z + (row - 1.55) * 0.18
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
            1.0 + layer * 0.08,
            baseZ + (row - 3.1) * 0.22
        );

        stone.scale.set(1.02, 0.85, 1.02);
        group.add(stone);
    }
}

/* COUNTS ONLY */
const pitCountSprites = new Array(18);

for (let i = 0; i < 18; i++) {
    const base = pitStoneBase[i];

    const countSprite = createTextSprite('9', {
        fontSize: 60,
        textColor: '#fff2d4',
        scaleFactor: 0.0042
    });

    countSprite.position.set(base.x, 1.82, base.z);
    scene.add(countSprite);
    pitCountSprites[i] = countSprite;
}

const storeCountSpriteA = createTextSprite('0', {
    fontSize: 78,
    textColor: '#fff4dc',
    scaleFactor: 0.0052
});
storeCountSpriteA.position.set(5.1, 1.82, -1.55);
scene.add(storeCountSpriteA);

const storeCountSpriteB = createTextSprite('0', {
    fontSize: 78,
    textColor: '#fff4dc',
    scaleFactor: 0.0052
});
storeCountSpriteB.position.set(-5.1, 1.82, -1.55);
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
                pit.material.emissive.setHex(0x5f5008);
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