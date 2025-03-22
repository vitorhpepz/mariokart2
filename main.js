import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB); // Sky blue background
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Create ground with grass texture
const groundGeometry = new THREE.PlaneGeometry(100, 100);
const groundMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x3a7e3a,
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2;
ground.receiveShadow = true;
scene.add(ground);

// Create track
const trackWidth = 4;
const trackLength = 30;

// Create first straight segment (along Z axis)
const straightGeometry = new THREE.BoxGeometry(trackWidth, 0.2, trackLength);
const trackMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x333333, // Dark gray for tarmac
    side: THREE.DoubleSide
});
const straightTrack = new THREE.Mesh(straightGeometry, trackMaterial);
straightTrack.rotation.y = Math.PI / 2;
straightTrack.position.y = 0.1;
straightTrack.receiveShadow = true;
scene.add(straightTrack);

// Create turn segment (along X axis)
const turnLength = 20; // Shorter segment for the turn
const turnGeometry = new THREE.BoxGeometry(trackWidth, 0.2, turnLength);
const turnTrack = new THREE.Mesh(turnGeometry, trackMaterial);
turnTrack.position.set(turnLength/2, 0.1, trackLength/2); // Position at the end of straight segment
turnTrack.receiveShadow = true;
scene.add(turnTrack);

// Create borders for straight segment
const borderHeight = 0.3;
const borderWidth = 0.2;

// Straight segment borders
const createStraightBorder = (xOffset) => {
    const border = new THREE.Mesh(
        new THREE.BoxGeometry(borderWidth, borderHeight, trackLength),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    border.position.set(xOffset, 0.15, 0);
    border.rotation.y = Math.PI / 2;
    border.castShadow = true;
    border.receiveShadow = true;
    scene.add(border);
};

// Left and right borders for straight segment
createStraightBorder(-trackWidth/2);
createStraightBorder(trackWidth/2);

// Turn segment borders
const createTurnBorder = (zOffset) => {
    const border = new THREE.Mesh(
        new THREE.BoxGeometry(borderWidth, borderHeight, turnLength),
        new THREE.MeshStandardMaterial({ color: 0xffffff })
    );
    border.position.set(turnLength/2, 0.15, trackLength/2 + zOffset);
    border.castShadow = true;
    border.receiveShadow = true;
    scene.add(border);
};

// Left and right borders for turn segment
createTurnBorder(-trackWidth/2);
createTurnBorder(trackWidth/2);

// Create center lines
// Straight segment center line
const straightCenterLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.01, trackLength),
    new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
);
straightCenterLine.rotation.y = Math.PI / 2;
straightCenterLine.position.y = 0.11;
scene.add(straightCenterLine);

// Turn segment center line
const turnCenterLine = new THREE.Mesh(
    new THREE.BoxGeometry(0.1, 0.01, turnLength),
    new THREE.MeshStandardMaterial({ color: 0xffffff, side: THREE.DoubleSide })
);
turnCenterLine.position.set(turnLength/2, 0.11, trackLength/2);
scene.add(turnCenterLine);

// Create obstacles and decorations
const obstacles = new THREE.Group();

// Create trees
const treeGeometry = new THREE.CylinderGeometry(0.2, 0.4, 2, 8);
const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });
const treeTopGeometry = new THREE.ConeGeometry(1, 2, 8);
const treeTopMaterial = new THREE.MeshStandardMaterial({ color: 0x2d5a27 });

for (let i = 0; i < 20; i++) {
    const tree = new THREE.Group();
    const trunk = new THREE.Mesh(treeGeometry, treeMaterial);
    const top = new THREE.Mesh(treeTopGeometry, treeTopMaterial);
    top.position.y = 1.5;
    
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 10;
    tree.position.x = Math.cos(angle) * radius;
    tree.position.z = Math.sin(angle) * radius;
    
    tree.add(trunk);
    tree.add(top);
    obstacles.add(tree);
}

// Create rocks
const rockGeometry = new THREE.DodecahedronGeometry(0.5);
const rockMaterial = new THREE.MeshStandardMaterial({ color: 0x808080 });

for (let i = 0; i < 15; i++) {
    const rock = new THREE.Mesh(rockGeometry, rockMaterial);
    const angle = Math.random() * Math.PI * 2;
    const radius = 10 + Math.random() * 15;
    rock.position.x = Math.cos(angle) * radius;
    rock.position.z = Math.sin(angle) * radius;
    rock.position.y = 0.25;
    obstacles.add(rock);
}

scene.add(obstacles);

// Create kart model
const kart = new THREE.Group();

// Kart body
const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.25;
body.castShadow = true;
kart.add(body);

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 16);
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

// Front wheels
const frontLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
frontLeftWheel.rotation.z = Math.PI / 2;
frontLeftWheel.position.set(-1, 0.2, 0.6);
frontLeftWheel.castShadow = true;
kart.add(frontLeftWheel);

const frontRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
frontRightWheel.rotation.z = Math.PI / 2;
frontRightWheel.position.set(-1, 0.2, -0.6);
frontRightWheel.castShadow = true;
kart.add(frontRightWheel);

// Back wheels
const backLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
backLeftWheel.rotation.z = Math.PI / 2;
backLeftWheel.position.set(1, 0.2, 0.6);
backLeftWheel.castShadow = true;
kart.add(backLeftWheel);

const backRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
backRightWheel.rotation.z = Math.PI / 2;
backRightWheel.position.set(1, 0.2, -0.6);
backRightWheel.castShadow = true;
kart.add(backRightWheel);

// Driver
const driverGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16);
const driverMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const driver = new THREE.Mesh(driverGeometry, driverMaterial);
driver.position.set(0, 0.8, 0);
driver.castShadow = true;
kart.add(driver);

// Add kart to scene
kart.position.y = 0.5;
scene.add(kart);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
directionalLight.castShadow = true;
directionalLight.shadow.mapSize.width = 1024;
directionalLight.shadow.mapSize.height = 1024;
scene.add(directionalLight);

// Camera position
camera.position.set(0, 5, 10);
camera.lookAt(kart.position);

// Movement variables
const moveSpeed = 0.2;
const rotationSpeed = 0.1;
let moveForward = false;
let moveBackward = false;
let moveLeft = false;
let moveRight = false;

// Camera offset
const cameraOffset = new THREE.Vector3(0, 5, 10);
const cameraLerpFactor = 0.1; // Smooth camera movement

// Handle keyboard input
document.addEventListener('keydown', (event) => {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            moveForward = true;
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveBackward = true;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveLeft = true;
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveRight = true;
            break;
    }
});

document.addEventListener('keyup', (event) => {
    switch (event.code) {
        case 'KeyW':
        case 'ArrowUp':
            moveForward = false;
            break;
        case 'KeyS':
        case 'ArrowDown':
            moveBackward = false;
            break;
        case 'KeyA':
        case 'ArrowLeft':
            moveLeft = false;
            break;
        case 'KeyD':
        case 'ArrowRight':
            moveRight = false;
            break;
    }
});

// Handle window resize
window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

// Update function for movement
function update() {
    // Only rotate when moving forward or backward
    if (moveLeft && (moveForward || moveBackward)) {
        kart.rotation.y += rotationSpeed;
        // Rotate wheels
        frontLeftWheel.rotation.x = -0.5;
        frontRightWheel.rotation.x = -0.5;
    }
    if (moveRight && (moveForward || moveBackward)) {
        kart.rotation.y -= rotationSpeed;
        // Rotate wheels
        frontLeftWheel.rotation.x = 0.5;
        frontRightWheel.rotation.x = 0.5;
    }

    // Forward/Backward movement
    if (moveForward) {
        kart.position.x -= Math.sin(kart.rotation.y) * moveSpeed;
        kart.position.z -= Math.cos(kart.rotation.y) * moveSpeed;
        kart.rotation.x = -0.1; // Tilt forward
        // Rotate wheels
        frontLeftWheel.rotation.z = Math.PI / 2 + 0.2;
        frontRightWheel.rotation.z = Math.PI / 2 + 0.2;
        backLeftWheel.rotation.z = Math.PI / 2 + 0.2;
        backRightWheel.rotation.z = Math.PI / 2 + 0.2;
    } else if (moveBackward) {
        kart.position.x += Math.sin(kart.rotation.y) * moveSpeed;
        kart.position.z += Math.cos(kart.rotation.y) * moveSpeed;
        kart.rotation.x = 0.1; // Tilt backward
        // Rotate wheels
        frontLeftWheel.rotation.z = Math.PI / 2 - 0.2;
        frontRightWheel.rotation.z = Math.PI / 2 - 0.2;
        backLeftWheel.rotation.z = Math.PI / 2 - 0.2;
        backRightWheel.rotation.z = Math.PI / 2 - 0.2;
    } else {
        kart.rotation.x = 0; // Reset forward/backward tilt
        // Reset wheel rotations
        frontLeftWheel.rotation.z = Math.PI / 2;
        frontRightWheel.rotation.z = Math.PI / 2;
        backLeftWheel.rotation.z = Math.PI / 2;
        backRightWheel.rotation.z = Math.PI / 2;
    }

    // Side tilt during rotation
    if (moveLeft && (moveForward || moveBackward)) {
        kart.rotation.z = 0.1;
    } else if (moveRight && (moveForward || moveBackward)) {
        kart.rotation.z = -0.1;
    } else if (!moveLeft && !moveRight) {
        kart.rotation.z = 0;
    }

    // Update camera position to follow the kart
    const idealOffset = new THREE.Vector3();
    idealOffset.copy(cameraOffset);
    
    // Rotate camera offset based on kart's rotation
    idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), kart.rotation.y);
    
    // Add kart position to get final camera position
    idealOffset.add(kart.position);
    
    // Smoothly move camera to ideal position
    camera.position.lerp(idealOffset, cameraLerpFactor);
    
    // Make camera look at kart
    camera.lookAt(kart.position);
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    update();
    renderer.render(scene, camera);
}

animate(); 