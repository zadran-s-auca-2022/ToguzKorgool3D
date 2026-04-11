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
renderer.domElement.style.zIndex = "0";
renderer.domElement.style.width = "100%";
renderer.domElement.style.height = "100%";
document.body.appendChild(renderer.domElement);

const light = new THREE.DirectionalLight(0xffffff, 1.2);
light.position.set(8, 12, 8);
scene.add(light);

const ambient = new THREE.AmbientLight(0xffffff, 0.55);
scene.add(ambient);

// board
const board = new THREE.Mesh(
    new THREE.BoxGeometry(18, 1.2, 8),
    new THREE.MeshStandardMaterial({ color: 0x8b5a2b })
);
board.position.set(0, 0, 0);
scene.add(board);

const pitMaterial = new THREE.MeshStandardMaterial({ color: 0x5c3517 });
const pitGeometry = new THREE.CylinderGeometry(0.7, 0.7, 0.35, 32);

const pitMeshes = [];

// top row = B side = indices 17..9 visually left to right
for (let i = 0; i < 9; i++) {
    const pitTop = new THREE.Mesh(pitGeometry, pitMaterial);
    pitTop.rotation.x = Math.PI / 2;
    pitTop.position.set(-7.2 + i * 1.8, 0.55, -1.8);
    pitTop.userData.pitIndex = 17 - i;
    scene.add(pitTop);
    pitMeshes.push(pitTop);
}

// bottom row = A side = indices 0..8 left to right
for (let i = 0; i < 9; i++) {
    const pitBottom = new THREE.Mesh(pitGeometry, pitMaterial);
    pitBottom.rotation.x = Math.PI / 2;
    pitBottom.position.set(-7.2 + i * 1.8, 0.55, 1.8);
    pitBottom.userData.pitIndex = i;
    scene.add(pitBottom);
    pitMeshes.push(pitBottom);
}

// stores
const leftStore = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x6f421f })
);
leftStore.rotation.x = Math.PI / 2;
leftStore.position.set(-9.8, 0.55, 0);
scene.add(leftStore);

const rightStore = new THREE.Mesh(
    new THREE.CylinderGeometry(1.2, 1.2, 0.5, 32),
    new THREE.MeshStandardMaterial({ color: 0x6f421f })
);
rightStore.rotation.x = Math.PI / 2;
rightStore.position.set(9.8, 0.55, 0);
scene.add(rightStore);

// raycaster
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener('click', (event) => {
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

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
}

animate();