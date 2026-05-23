import * as THREE from 'https://esm.sh/three@0.160.0';
import { OrbitControls } from 'https://esm.sh/three@0.160.0/examples/jsm/controls/OrbitControls.js';

const root = document.getElementById('three-root');
root.innerHTML = '';

/* SCENE */
const scene = new THREE.Scene();

const loader = new THREE.TextureLoader();

scene.background = new THREE.Color(0x050202);

/* CAMERA */
const camera = new THREE.PerspectiveCamera(
    42,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(0, 18, 18);

/* RENDERER */
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
root.appendChild(renderer.domElement);

/* CONTROLS */
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.1, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 9;
controls.maxDistance = 34;
controls.maxPolarAngle = Math.PI / 2.05;

/* LIGHTS */
scene.add(new THREE.AmbientLight(0xffc38a, 0.52));

const keyLight = new THREE.DirectionalLight(0xffd18a, 3.8);
keyLight.position.set(-6, 14, 10);
keyLight.castShadow = true;
scene.add(keyLight);

const warmLight = new THREE.PointLight(0xff9b35, 1.25, 40);
warmLight.position.set(-8, 6, 8);
scene.add(warmLight);

const goldStoneLight = new THREE.PointLight(0xffd36a, 1.7, 28);
goldStoneLight.position.set(0, 6.5, 3.5);
scene.add(goldStoneLight);

const rimLight = new THREE.DirectionalLight(0xffb15a, 1.8);
rimLight.position.set(-12, 10, -10);
scene.add(rimLight);

/* TEXTURE */
function createWoodTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1600;

    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 1600, 1600);
    gradient.addColorStop(0, '#120502');
    gradient.addColorStop(0.18, '#2a0d04');
    gradient.addColorStop(0.38, '#5a230c');
    gradient.addColorStop(0.58, '#2b0c03');
    gradient.addColorStop(0.78, '#7a3210');
    gradient.addColorStop(1, '#130501');

    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1600, 1600);

    // dark walnut grain lines
    for (let i = 0; i < 520; i++) {
        const y = Math.random() * 1600;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(8, 3, 1, ${0.18 + Math.random() * 0.34})`;
        ctx.lineWidth = 0.8 + Math.random() * 3.2;
        ctx.moveTo(-150, y);

        for (let x = -150; x <= 1750; x += 45) {
            ctx.lineTo(
                x,
                y +
                Math.sin(x * 0.015 + i * 0.55) * 24 +
                Math.sin(x * 0.038 + i) * 8
            );
        }

        ctx.stroke();
    }

    // golden walnut highlights
    for (let i = 0; i < 180; i++) {
        const y = Math.random() * 1600;

        ctx.beginPath();
        ctx.strokeStyle = `rgba(190, 105, 38, ${0.04 + Math.random() * 0.08})`;
        ctx.lineWidth = 0.6 + Math.random() * 1.7;
        ctx.moveTo(-150, y);

        for (let x = -150; x <= 1750; x += 55) {
            ctx.lineTo(
                x,
                y + Math.sin(x * 0.017 + i) * 18
            );
        }

        ctx.stroke();
    }

    // knots
    for (let i = 0; i < 45; i++) {
        ctx.save();

        ctx.translate(Math.random() * 1600, Math.random() * 1600);
        ctx.rotate((Math.random() - 0.5) * 0.75);

        for (let r = 0; r < 7; r++) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(10, 4, 1, ${0.26 - r * 0.025})`;
            ctx.lineWidth = 1.4;
            ctx.ellipse(0, 0, 42 + r * 15, 10 + r * 4, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    // dark vignette
    const vignette = ctx.createRadialGradient(
        800, 800, 120,
        800, 800, 900
    );

    vignette.addColorStop(0, 'rgba(255, 150, 55, 0.06)');
    vignette.addColorStop(1, 'rgba(0, 0, 0, 0.38)');

    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, 1600, 1600);

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2.8, 1.35);
    texture.anisotropy = renderer.capabilities.getMaxAnisotropy();
    texture.needsUpdate = true;

    return texture;
}

const woodTexture = createWoodTexture();

/* MATERIALS */
const boardMaterial = new THREE.MeshStandardMaterial({
    color: 0xa14d22,
    map: woodTexture,
    roughness: 0.62,
    metalness: 0.02
});

const boardSideMaterial = new THREE.MeshStandardMaterial({
    color: 0x2a0d04,
    map: woodTexture,
    roughness: 0.9,
    metalness: 0.0
});

const pitRimMaterial = new THREE.MeshStandardMaterial({
    color: 0x8a3a14,
    map: woodTexture,
    roughness: 0.78,
    metalness: 0.01
});

const pitInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0x1a0803,
    roughness: 0.95,
    metalness: 0.0
});

const kazanInnerMaterial = new THREE.MeshStandardMaterial({
    color: 0x140602,
    roughness: 0.95,
    metalness: 0.0
});

const stoneMaterial = new THREE.MeshStandardMaterial({
    color: 0xffc94a,
    emissive: 0x5a2e00,
    emissiveIntensity: 0.18,
    roughness: 0.16,
    metalness: 0.72
});

/* BOARD GROUP */
const boardGroup = new THREE.Group();
scene.add(boardGroup);

scene.background = null;

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

    const deepShadow = new THREE.Mesh(
        new THREE.CircleGeometry(1.04, 140),
        new THREE.MeshBasicMaterial({
            color: 0x3a1205,
            transparent: true,
            opacity: 0.28,
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

/* ENGRAVED BOARD DECORATIONS - integrated into wood, not floating */
const engravingMaterial = new THREE.MeshStandardMaterial({
    color: 0x1b0702,
    roughness: 0.92,
    metalness: 0.0
});

function addEngravedLine(x, z, width, depth) {
    const line = new THREE.Mesh(
        new THREE.BoxGeometry(width, 0.018, depth),
        engravingMaterial
    );

    line.position.set(x, 1.465, z);
    line.receiveShadow = true;
    boardGroup.add(line);
}

function addEngravedDiamond(x, z, size = 0.22) {
    const diamond = new THREE.Mesh(
        new THREE.BoxGeometry(size, 0.018, size),
        engravingMaterial
    );

    diamond.position.set(x, 1.47, z);
    diamond.rotation.y = Math.PI / 4;
    diamond.receiveShadow = true;
    boardGroup.add(diamond);
}

/* subtle carved center ornaments */
addEngravedLine(0, 0, 1.9, 0.045);
addEngravedLine(0, 0, 0.045, 1.0);

addEngravedDiamond(0, 0, 0.28);
addEngravedDiamond(-0.55, 0, 0.18);
addEngravedDiamond(0.55, 0, 0.18);

/* carved side identity marks, part of board surface */
addEngravedLine(0, 4.95, 3.4, 0.05);
addEngravedDiamond(-1.9, 4.95, 0.18);
addEngravedDiamond(1.9, 4.95, 0.18);

addEngravedLine(0, -4.95, 3.4, 0.05);
addEngravedDiamond(-1.9, -4.95, 0.18);
addEngravedDiamond(1.9, -4.95, 0.18);

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

    const deepShadow = new THREE.Mesh(
        new THREE.CircleGeometry(0.52, 120),
        new THREE.MeshBasicMaterial({
            color: 0x3a1205,
            transparent: true,
            opacity: 0.28,
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
    pitMeshByIndex[index] = clickSurface;

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
    color: 0x050505,
    roughness: 0.22,
    metalness: 0.35
});

const tuzMarkerMaterialB = new THREE.MeshStandardMaterial({
    color: 0x050505,
    roughness: 0.22,
    metalness: 0.35
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

/* ENGRAVED / FLAT BOARD TEXT - visible but not floating */

function makeSurfaceTextTexture(text, options = {}) {
    const fontSize = options.fontSize || 72;
    const textColor = options.textColor || '#ffe8a6';
    const strokeColor = options.strokeColor || 'rgba(45, 18, 2, 0.95)';
    const padding = options.padding || 26;
    const fontFamily = options.fontFamily || 'Cinzel';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    ctx.font = `900 ${fontSize}px ${fontFamily}, serif`;
    const textWidth = Math.ceil(ctx.measureText(text).width);

    const textureScale = 3;

    canvas.width = (textWidth + padding * 2) * textureScale;
    canvas.height = (fontSize + padding * 2) * textureScale;

    ctx.scale(textureScale, textureScale);

    const ctx2 = canvas.getContext('2d');
    ctx2.scale(textureScale, textureScale);

    ctx2.clearRect(0, 0, canvas.width, canvas.height);

    ctx2.font = `900 ${fontSize}px ${fontFamily}, serif`;
    ctx2.textAlign = 'center';
    ctx2.textBaseline = 'middle';

    const lines = String(text).split('\n');
    const lineHeight = fontSize * 0.9;
    const startY = canvas.height / 2 - ((lines.length - 1) * lineHeight) / 2;

lines.forEach((line, index) => {
    const y = startY + index * lineHeight;

    ctx2.lineWidth = 9;
    ctx2.strokeStyle = strokeColor;
    ctx2.strokeText(line, canvas.width / 2 + 2, y + 3);
    
    const goldGradient = ctx2.createLinearGradient(
    0,
    y - fontSize / 2,
    0,
    y + fontSize / 2
);

    goldGradient.addColorStop(0, '#fff8c6');
    goldGradient.addColorStop(0.22, '#ffe36e');
    goldGradient.addColorStop(0.48, '#ffbf18');
    goldGradient.addColorStop(0.72, '#c98500');
    goldGradient.addColorStop(1, '#6e3b00');

    ctx2.fillStyle = goldGradient;
    ctx2.fillText(line, canvas.width / 2, y);

    ctx2.lineWidth = 4;
    ctx2.strokeStyle = 'rgba(255, 255, 210, 1)';
    ctx2.strokeText(line, canvas.width / 2 - 1, y - 1);
});

    const texture = new THREE.CanvasTexture(canvas);
    texture.needsUpdate = true;

    texture.minFilter = THREE.LinearFilter;
    texture.magFilter = THREE.LinearFilter;
    texture.generateMipmaps = false;

        return {
        texture,
        width: canvas.width / textureScale,
        height: canvas.height / textureScale
    };
}

function createSurfaceText(text, options = {}) {
    const { texture, width, height } = makeSurfaceTextTexture(text, options);

    const material = new THREE.MeshBasicMaterial({
        map: texture,
        transparent: true,
        depthWrite: false,
        depthTest: false,
        side: THREE.DoubleSide,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4
    });

    const scaleFactor = options.scaleFactor || 0.006;

    const mesh = new THREE.Mesh(
        new THREE.PlaneGeometry(width * scaleFactor, height * scaleFactor),
        material
    );

    mesh.rotation.x = -Math.PI / 2;
    mesh.renderOrder = 20;
    mesh.userData.options = options;

    return mesh;
}

function updateSurfaceText(mesh, text) {
    const { texture, width, height } = makeSurfaceTextTexture(text, mesh.userData.options || {});

    if (mesh.material.map) mesh.material.map.dispose();

    mesh.material.map = texture;
    mesh.material.needsUpdate = true;

    const scaleFactor = mesh.userData.options?.scaleFactor || 0.006;
    mesh.geometry.dispose();
    mesh.geometry = new THREE.PlaneGeometry(width * scaleFactor, height * scaleFactor);
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

    const numText = createSurfaceText(String(pitNumberForIndex(i)), {
        fontSize: 58,
        textColor: '#ffd987',
        strokeColor: 'rgba(35, 12, 2, 0.95)',
        scaleFactor: 0.0043,
        padding: 18
    });

    numText.position.set(
        base.x,
        1.565,
        isTopRow ? base.z + 1.05 : base.z - 1.05
    );

    boardGroup.add(numText);
    pitNumberSprites[i] = numText;

    const countText = createSurfaceText('9', {
        fontSize: 74,
        textColor: '#fff1c4',
        strokeColor: 'rgba(45, 16, 2, 0.98)',
        scaleFactor: 0.0048,
        padding: 22
    });

    countText.position.set(
        base.x,
        1.565,
        isTopRow ? base.z - 1.0 : base.z + 1.0
    );

    boardGroup.add(countText);
    pitCountSprites[i] = countText;
}

const storeCountSpriteA = createSurfaceText('YOU 0', {
    fontSize: 65,
    textColor: 'hsl(39, 86%, 55%)',
    strokeColor: 'rgba(90, 40, 6, 1)',
    scaleFactor: 0.0044,
    padding: 28
});

storeCountSpriteA.position.set(5.1, 1.565, -0.95);
boardGroup.add(storeCountSpriteA);

const storeCountSpriteB = createSurfaceText('OPPONENT 0', {
    fontSize: 65,
    textColor: 'hsl(39, 86%, 55%)',
    strokeColor: 'rgb(234, 151, 34)',
    scaleFactor: 0.0044,
    padding: 28
});

storeCountSpriteB.position.set(-5.1, 1.565, -0.95);
boardGroup.add(storeCountSpriteB);

/* SYNC */
function sync3DBoardFromGameState(state) {
    if (!state || !state.pits) return;

    for (let i = 0; i < 18; i++) {
        renderPitStones(i, state.pits[i]);

        const pit = pitMeshByIndex[i];
        if (!pit) continue;

        pit.material.color.setHex(0x090201);

        updateSurfaceText(pitCountSprites[i], String(state.pits[i]));
    }

    renderTuzMarkers(state);

    renderStoreStones('A', state.storeA || 0);
    renderStoreStones('B', state.storeB || 0);

    updateSurfaceText(storeCountSpriteA, `YOU ${state.storeA || 0}`);
    updateSurfaceText(storeCountSpriteB, `OPPONENT ${state.storeB || 0}`);
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