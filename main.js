import * as THREE from 'three';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create floor
const floorGeometry = new THREE.PlaneGeometry(100, 100);
const floorMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x808080,
    side: THREE.DoubleSide
});
const floor = new THREE.Mesh(floorGeometry, floorMaterial);
floor.rotation.x = -Math.PI / 2;
scene.add(floor);

// Create kart model
const kart = new THREE.Group();

// Kart body
const bodyGeometry = new THREE.BoxGeometry(2, 0.5, 1);
const bodyMaterial = new THREE.MeshStandardMaterial({ color: 0xff0000 });
const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
body.position.y = 0.25;
kart.add(body);

// Wheels
const wheelGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.2, 16);
const wheelMaterial = new THREE.MeshStandardMaterial({ color: 0x000000 });

// Front wheels
const frontLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
frontLeftWheel.rotation.z = Math.PI / 2;
frontLeftWheel.position.set(-1, 0.2, 0.6);
kart.add(frontLeftWheel);

const frontRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
frontRightWheel.rotation.z = Math.PI / 2;
frontRightWheel.position.set(-1, 0.2, -0.6);
kart.add(frontRightWheel);

// Back wheels
const backLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
backLeftWheel.rotation.z = Math.PI / 2;
backLeftWheel.position.set(1, 0.2, 0.6);
kart.add(backLeftWheel);

const backRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
backRightWheel.rotation.z = Math.PI / 2;
backRightWheel.position.set(1, 0.2, -0.6);
kart.add(backRightWheel);

// Driver
const driverGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16);
const driverMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
const driver = new THREE.Mesh(driverGeometry, driverMaterial);
driver.position.set(0, 0.8, 0);
kart.add(driver);

// Add kart to scene
kart.position.y = 0.5;
scene.add(kart);

// Add lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
directionalLight.position.set(5, 5, 5);
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