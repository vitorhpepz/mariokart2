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

// Road Builder System
class RoadBuilder {
    constructor(scene) {
        this.scene = scene;
        this.segments = [];
        this.trackWidth = 4;
        this.trackHeight = 0.2;
        this.borderHeight = 0.3;
        this.borderWidth = 0.2;
    }

    createSegment(startPoint, endPoint) {
        const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
        const length = direction.length();
        const center = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
        
        // Create road segment
        const roadGeometry = new THREE.BoxGeometry(this.trackWidth, this.trackHeight, length);
        const roadMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x333333,
            side: THREE.DoubleSide
        });
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        
        // Position and rotate road
        road.position.copy(center);
        road.position.y = 0.1;
        road.rotation.y = Math.atan2(direction.x, direction.z);
        road.receiveShadow = true;
        
        // Create borders
        const leftBorder = this.createBorder(length);
        const rightBorder = this.createBorder(length);
        
        // Position borders
        const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
        
        leftBorder.position.copy(center);
        leftBorder.position.add(perpendicular.clone().multiplyScalar(this.trackWidth/2));
        leftBorder.position.y = 0.15;
        leftBorder.rotation.y = Math.atan2(direction.x, direction.z);
        
        rightBorder.position.copy(center);
        rightBorder.position.add(perpendicular.clone().multiplyScalar(-this.trackWidth/2));
        rightBorder.position.y = 0.15;
        rightBorder.rotation.y = Math.atan2(direction.x, direction.z);
        
        // Create center line
        const centerLine = this.createCenterLine(length);
        centerLine.position.copy(center);
        centerLine.position.y = 0.11;
        centerLine.rotation.y = Math.atan2(direction.x, direction.z);
        
        // Add everything to scene
        this.scene.add(road);
        this.scene.add(leftBorder);
        this.scene.add(rightBorder);
        this.scene.add(centerLine);
        
        // Store segment data
        this.segments.push({
            start: startPoint.clone(),
            end: endPoint.clone(),
            road,
            leftBorder,
            rightBorder,
            centerLine
        });
        
        return this;
    }
    
    createBorder(length) {
        const borderGeometry = new THREE.BoxGeometry(this.borderWidth, this.borderHeight, length);
        const borderMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.castShadow = true;
        border.receiveShadow = true;
        return border;
    }
    
    createCenterLine(length) {
        const lineGeometry = new THREE.BoxGeometry(0.1, 0.01, length);
        const lineMaterial = new THREE.MeshStandardMaterial({ 
            color: 0xffffff,
            side: THREE.DoubleSide
        });
        return new THREE.Mesh(lineGeometry, lineMaterial);
    }
}

// Create road builder and build track
const roadBuilder = new RoadBuilder(scene);

// Create a complete circuit
// Start straight
roadBuilder.createSegment(
    new THREE.Vector3(0, 0, -15),    // Start point
    new THREE.Vector3(0, 0, 15)      // First straight
);

// Right turn
roadBuilder.createSegment(
    new THREE.Vector3(0, 0, 15),     // End of first straight
    new THREE.Vector3(15, 0, 15)     // Turn right
);

// Straight section
roadBuilder.createSegment(
    new THREE.Vector3(15, 0, 15),    // After right turn
    new THREE.Vector3(15, 0, -5)     // Going back
);

// Left turn
roadBuilder.createSegment(
    new THREE.Vector3(15, 0, -5),    // Before left turn
    new THREE.Vector3(30, 0, -5)     // Turn left
);

// Back straight
roadBuilder.createSegment(
    new THREE.Vector3(30, 0, -5),    // After left turn
    new THREE.Vector3(30, 0, -25)    // Long straight
);

// Final turn (left)
roadBuilder.createSegment(
    new THREE.Vector3(30, 0, -25),   // End of back straight
    new THREE.Vector3(15, 0, -25)    // Turn left
);

// Connecting back
roadBuilder.createSegment(
    new THREE.Vector3(15, 0, -25),   // After final turn
    new THREE.Vector3(15, 0, -15)    // Heading to start
);

// Final segment connecting to start
roadBuilder.createSegment(
    new THREE.Vector3(15, 0, -15),   // Almost there
    new THREE.Vector3(0, 0, -15)     // Back to start
);

// Add start/finish line
const startLineGeometry = new THREE.BoxGeometry(4, 0.01, 1);
const startLineMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    side: THREE.DoubleSide
});
const startLine = new THREE.Mesh(startLineGeometry, startLineMaterial);
startLine.position.set(0, 0.11, -14); // Just after the start
startLine.rotation.y = Math.PI / 2;
scene.add(startLine);

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