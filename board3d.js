import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');
root.innerHTML = '';

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
scene.add(new THREE.AmbientLight(0xffd9b0, 0.62));

const keyLight = new THREE.DirectionalLight(0xffe0aa, 2.35);
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
    gradient.addColorStop(0, '#4b1c06');
    gradient.addColorStop(0.25, '#8f3f12');
    gradient.addColorStop(0.5, '#bd6421');
    gradient.addColorStop(0.75, '#6c2709');
    gradient.addColorStop(1, '#230b02');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1024, 1024);

    for (let i = 0; i < 220; i++) {
        const y = Math.random() * 1024;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(22, 7, 1, ${0.12 + Math.random() * 0.22})`;
        ctx.lineWidth = 1 + Math.random() * 3;
        ctx.moveTo(-100, y);

        for (let x = -100; x <= 1124; x += 60) {
            ctx.lineTo(
                x,
                y + Math.sin(x * 0.018 + i) * 18 + Math.sin(x * 0.04 + i) * 5
            );
        }

        ctx.stroke();
    }

    for (let i = 0; i < 90; i++) {
        const y = Math.random() * 1024;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(255, 185, 90, ${0.04 + Math.random() * 0.07})`;
        ctx.lineWidth = 1 + Math.random() * 2;
        ctx.moveTo(-100, y);

        for (let x = -100; x <= 1124; x += 70) {
            ctx.lineTo(x, y + Math.sin(x * 0.02 + i) * 12);
        }

        ctx.stroke();
    }

    for (let i = 0; i < 22; i++) {
        ctx.save();
        ctx.translate(Math.random() * 1024, Math.random() * 1024);
        ctx.rotate((Math.random() - 0.5) * 0.5);

        for (let r = 0; r < 5; r++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(18, 6, 1, ${0.16 - r * 0.02})`;
            ctx.lineWidth = 2;
            ctx.ellipse(0, 0, 50 + r * 15, 14 + r * 4, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.1, 1.1);
    texture.needsUpdate = true;

    return texture;
}

const woodTexture = createWoodTexture();

/* MATERIALS */
const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0xaa5218,
    map: woodTexture,
    roughness: 0.66,
    metalness: 0.02
});

const boardSideMaterial = new THREE.MeshStandardMaterial({
    color: 0x4a1805,
    map: woodTexture,
    roughness: 0.82,
    metalness: 0.01
});

const pitRimMaterial = new THREE.MeshStandardMaterial({
    color: 0xb35a1c,
    map: woodTexture,
    roughness: 0.68,
    metalness: 0.015
});

const pitInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0x090201,
    roughness: 1.0,
    metalness: 0.0
});

const kazanInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0x090201,
    roughness: 1.0,
    metalness: 0.0
});

const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xf1dfbd,
    roughness: 0.34,
    metalness: 0.04
});

/* BOARD GROUP */
const boardGroup = new THREE.Group();
scene.add(boardGroup);

/* MAIN BOARD */
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

/* CORNERS */
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

    const outerRim = new THREE.Mesh(
        new THREE.TorusGeometry(1.48, 0.18, 24, 140),
        pitRimMaterial
    );
    outerRim.rotation.x = Math.PI / 2;
    outerRim.scale.set(1.92, 1.02, 1);
    outerRim.position.set(x, 1.74, z);
    outerRim.castShadow = true;
    outerRim.receiveShadow = true;
    boardGroup.add(outerRim);

    const innerWall = new THREE.Mesh(
        new THREE.TorusGeometry(1.18, 0.12, 20, 140),
        kazanInnerMaterial
    );
    innerWall.rotation.x = Math.PI / 2;
    innerWall.scale.set(1.82, 0.94, 1);
    innerWall.position.set(x, 1.44, z);
    innerWall.castShadow = true;
    innerWall.receiveShadow = true;
    boardGroup.add(innerWall);

    const deepShadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.04, 140),
        new THREE.MeshBasicMaterial({
            color: 0x3a1205,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false
        })
    );
    deepShadow.rotation.x = -Math.PI / 2;
    deepShadow.scale.set(1.72, 0.92, 1);
    deepShadow.position.set(x, 1.16, z);
    boardGroup.add(deepShadow);
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

    const outerRim = new THREE.Mesh(
        new THREE.TorusGeometry(0.82, 0.14, 24, 120),
        pitRimMaterial
    );
    outerRim.rotation.x = Math.PI / 2;
    outerRim.scale.set(1.08, 1.65, 1);
    outerRim.position.set(x, 1.68, z);
    outerRim.castShadow = true;
    outerRim.receiveShadow = true;
    boardGroup.add(outerRim);

    const innerWall = new THREE.Mesh(
        new THREE.TorusGeometry(0.63, 0.09, 20, 120),
        pitInnerMaterial
    );
    innerWall.rotation.x = Math.PI / 2;
    innerWall.scale.set(1.02, 1.56, 1);
    innerWall.position.set(x, 1.43, z);
    innerWall.castShadow = true;
    innerWall.receiveShadow = true;
    boardGroup.add(innerWall);

    const deepShadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.52, 120),
        new THREE.MeshBasicMaterial({
            color: 0x3a1205,
            transparent: true,
            opacity: 0.12,
            side: THREE.DoubleSide,
            depthWrite: false
        })
    );
    deepShadow.rotation.x = -Math.PI / 2;
    deepShadow.scale.set(1.0, 1.55, 1);
    deepShadow.position.set(x, 1.18, z);
    boardGroup.add(deepShadow);

    const clickSurface = new THREE.Mesh(
        new THREE.CylinderGeometry(0.92, 0.92, 0.08, 64),
        new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0
        })
    );

    clickSurface.scale.set(1.08, 1, 1.65);
    clickSurface.position.set(x, 1.80, z);
    clickSurface.userData.index = index;
    boardGroup.add(clickSurface);

    pitMeshes.push(clickSurface);
    pitMeshByIndex[index] = innerWall;

    const stonesGroup = new THREE.Group();
    scene.add(stonesGroup);
    pitStoneGroups[index] = stonesGroup;

    pitStoneBase[index] = {
        x,
        y: 1.34,
        z
    };
}

for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, topRowZ, 17 - i);
}

for (let i = 0; i < 9; i++) {
    createPit(startX + i * pitSpacing, bottomRowZ, i);
}

/* BORDER */
const borderMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a0d03,
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

const tuzMarkerGeometry = new THREE.SphereGeometry(0.19, 24, 24);

const tuzMarkerMaterialA = new THREE.MeshStandardMaterial({
    color: 0xd6a43a,
    roughness: 0.35,
    metalness: 0.22
});

const tuzMarkerMaterialB = new THREE.MeshStandardMaterial({
    color: 0x9b3b18,
    roughness: 0.4,
    metalness: 0.16
});

const tuzMarkerGroups = new Array(18);

for (let i = 0; i < 18; i++) {
    tuzMarkerGroups[i] = new THREE.Group();
    scene.add(tuzMarkerGroups[i]);
}

function clearGroup(group) {
    while (group.children.length > 0) {
        group.remove(group.children[0]);
    }
}

function renderTuzMarkers(state) {
    for (let i = 0; i < 18; i++) {
        const group = tuzMarkerGroups[i];
        const base = pitStoneBase[i];
        if (!group || !base) continue;

        clearGroup(group);

        if (i !== state.tuzA && i !== state.tuzB) continue;

        const material = i === state.tuzA ? tuzMarkerMaterialA : tuzMarkerMaterialB;

        const marker = new THREE.Mesh(tuzMarkerGeometry, material);
        marker.castShadow = true;
        marker.receiveShadow = true;

        marker.position.set(
            base.x,
            base.y + 0.23,
            base.z
        );

        marker.scale.set(1.25, 0.72, 1.25);

        group.add(marker);
    }
}

const pitStoneSeeds = new Array(18).fill(null);
const pitLastCounts = new Array(18).fill(null);

function renderPitStones(index, count) {
    const group = pitStoneGroups[index];
    const base = pitStoneBase[index];
    if (!group || !base) return;

    if (pitLastCounts[index] === count && pitStoneSeeds[index] !== null) {
        return;
    }

    pitLastCounts[index] = count;
    pitStoneSeeds[index] = Math.random() * 10000;

    clearGroup(group);

    const maxVisual = Math.min(count, 24);

    function seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
        stone.castShadow = true;
        stone.receiveShadow = true;

        const seed = pitStoneSeeds[index] + i * 43.3;

        const angle = seededRandom(seed) * Math.PI * 2;
        const radius = Math.sqrt(seededRandom(seed + 12.5)) * 0.34;

        const x = Math.cos(angle) * radius;
        const z = Math.sin(angle) * radius * 1.28;

        const layer = Math.floor(i / 13);

        stone.position.set(
            base.x + x,
            base.y + 0.13 + layer * 0.055,
            base.z + z
        );

        const size = 0.88 + seededRandom(seed + 5.2) * 0.08;
        stone.scale.set(size, size * 0.86, size);

        stone.rotation.set(
            seededRandom(seed + 1.1) * 0.35,
            seededRandom(seed + 2.2) * Math.PI,
            seededRandom(seed + 3.3) * 0.35
        );

        group.add(stone);
    }
}

const storeStoneSeeds = {
    A: null,
    B: null
};

const storeLastCounts = {
    A: null,
    B: null
};

function renderStoreStones(side, count) {
    const group = storeStoneGroups[side];
    if (!group) return;

    if (storeLastCounts[side] === count && storeStoneSeeds[side] !== null) {
        return;
    }

    storeLastCounts[side] = count;
    storeStoneSeeds[side] = Math.random() * 10000;

    clearGroup(group);

    const maxVisual = Math.min(count, 98);
    const baseX = side === 'A' ? 5.1 : -5.1;
    const baseZ = 0;

    function seededRandom(seed) {
        const x = Math.sin(seed) * 10000;
        return x - Math.floor(x);
    }

    for (let i = 0; i < maxVisual; i++) {
        const stone = new THREE.Mesh(stoneGeometry, stoneMaterial);
        stone.castShadow = true;
        stone.receiveShadow = true;

        const seed = storeStoneSeeds[side] + i * 37.8;

        const angle = seededRandom(seed) * Math.PI * 2;
        const radius = Math.sqrt(seededRandom(seed + 12.5)) * 0.95;

        const x = Math.cos(angle) * radius * 1.65;
        const z = Math.sin(angle) * radius * 0.72;

        const layer = Math.floor(i / 34);

        stone.position.set(
            baseX + x,
            1.56 + layer * 0.055,
            baseZ + z
        );

        const size = 0.92 + seededRandom(seed + 5.2) * 0.08;
        stone.scale.set(size, size * 0.80, size);

        stone.rotation.set(
            seededRandom(seed + 1.1) * 0.35,
            seededRandom(seed + 2.2) * Math.PI,
            seededRandom(seed + 3.3) * 0.35
        );

        group.add(stone);
    }
}

/* TEXT SPRITES */
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
        isTopRow ? base.z - 0.88 : base.z + 0.88
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
        2.0,
        isTopRow ? base.z + 0.92 : base.z - 0.92
    );
    scene.add(countSprite);
    pitCountSprites[i] = countSprite;
}

const storeCountSpriteA = createTextSprite('0', {
    fontSize: 82,
    textColor: '#fff4dc',
    scaleFactor: 0.0055
});
storeCountSpriteA.position.set(5.1, 1.92, -1.35);
scene.add(storeCountSpriteA);

const storeCountSpriteB = createTextSprite('0', {
    fontSize: 82,
    textColor: '#fff4dc',
    scaleFactor: 0.0055
});
storeCountSpriteB.position.set(-5.1, 1.92, -1.35);
scene.add(storeCountSpriteB);

/* SYNC */
function sync3DBoardFromGameState(state) {
    if (!state || !state.pits) return;

    for (let i = 0; i < 18; i++) {
        renderPitStones(i, state.pits[i]);

        const pit = pitMeshByIndex[i];
        if (!pit) continue;

        pit.material.color.setHex(0x090201);

        updateTextSprite(pitCountSprites[i], String(state.pits[i]));
    }

    renderTuzMarkers(state);

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