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
        this.trackWidth = 8;
        this.trackHeight = 0.2;
        this.borderHeight = 0.3;
        this.borderWidth = 0.3;
        this.curveSegments = 32;
        this.curveRadius = 12;
    }

    createCurvedSegment(startPoint, endPoint, isRightTurn) {
        // Calculate curve control points
        const direction = new THREE.Vector3().subVectors(endPoint, startPoint);
        const length = direction.length();
        const midPoint = new THREE.Vector3().addVectors(startPoint, endPoint).multiplyScalar(0.5);
        
        // Calculate control point based on turn direction
        const perpendicular = new THREE.Vector3(-direction.z, 0, direction.x).normalize();
        const controlPoint = midPoint.clone().add(
            perpendicular.multiplyScalar(isRightTurn ? this.curveRadius : -this.curveRadius)
        );

        // Create a quadratic curve
        const curve = new THREE.QuadraticBezierCurve3(
            startPoint,
            controlPoint,
            endPoint
        );

        // Create points along the curve
        const points = curve.getPoints(this.curveSegments);
        
        // Create track segments along the curve
        for (let i = 0; i < points.length - 1; i++) {
            const start = points[i];
            const end = points[i + 1];
            this.createStraightSegment(start, end);
        }
    }

    createStraightSegment(startPoint, endPoint) {
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
        
        // Add everything to scene
        this.scene.add(road);
        this.scene.add(leftBorder);
        this.scene.add(rightBorder);
        
        // Store segment data
        this.segments.push({
            start: startPoint.clone(),
            end: endPoint.clone(),
            road,
            leftBorder,
            rightBorder
        });
    }
    
    createBorder(length) {
        const borderGeometry = new THREE.BoxGeometry(this.borderWidth, this.borderHeight, length);
        const borderMaterial = new THREE.MeshStandardMaterial({ color: 0xffffff });
        const border = new THREE.Mesh(borderGeometry, borderMaterial);
        border.castShadow = true;
        border.receiveShadow = true;
        return border;
    }
}

// Create road builder and build track
const roadBuilder = new RoadBuilder(scene);

// Create a complete circuit with smooth curves
// Start straight (longer for better approach to first turn)
roadBuilder.createStraightSegment(
    new THREE.Vector3(0, 0, -20),
    new THREE.Vector3(0, 0, 20)
);

// First curve (right turn)
roadBuilder.createCurvedSegment(
    new THREE.Vector3(0, 0, 20),
    new THREE.Vector3(20, 0, 20),
    true
);

// Second straight
roadBuilder.createStraightSegment(
    new THREE.Vector3(20, 0, 20),
    new THREE.Vector3(20, 0, -10)
);

// Second curve (right turn)
roadBuilder.createCurvedSegment(
    new THREE.Vector3(20, 0, -10),
    new THREE.Vector3(40, 0, -10),
    true
);

// Back straight
roadBuilder.createStraightSegment(
    new THREE.Vector3(40, 0, -10),
    new THREE.Vector3(40, 0, -30)
);

// Third curve (right turn)
roadBuilder.createCurvedSegment(
    new THREE.Vector3(40, 0, -30),
    new THREE.Vector3(20, 0, -30),
    true
);

// Fourth straight
roadBuilder.createStraightSegment(
    new THREE.Vector3(20, 0, -30),
    new THREE.Vector3(20, 0, -20)
);

// Final curve (right turn back to start)
roadBuilder.createCurvedSegment(
    new THREE.Vector3(20, 0, -20),
    new THREE.Vector3(0, 0, -20),
    true
);

// Add start/finish line
const startLineGeometry = new THREE.BoxGeometry(8, 0.01, 1);
const startLineMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff,
    side: THREE.DoubleSide
});
const startLine = new THREE.Mesh(startLineGeometry, startLineMaterial);
startLine.position.set(0, 0.11, -19);
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
let joystickMoving = false;
let joystickAngle = 0;
let joystickForce = 0;

// Camera offset
const cameraOffset = new THREE.Vector3(0, 5, 10);
const cameraLerpFactor = 0.1; // Smooth camera movement

let joystick; // Declare joystick variable in wider scope

// Function to initialize joystick
function initializeJoystick() {
    // Add touch joystick
    const joystickContainer = document.createElement('div');
    joystickContainer.style.position = 'absolute';
    joystickContainer.style.bottom = '75px';
    joystickContainer.style.left = '75px';
    joystickContainer.style.width = '150px';
    joystickContainer.style.height = '150px';
    document.body.appendChild(joystickContainer);

    const joystickOptions = {
        zone: joystickContainer,
        mode: 'static',
        position: { left: '50%', top: '50%' },
        color: 'white',
        size: 150,
        restOpacity: 0.5,
    };

    joystick = nipplejs.create(joystickOptions);

    joystick.on('start move', (evt, data) => {
        if (data.force > 0) {
            joystickMoving = true;
            joystickAngle = data.angle.radian;
            joystickForce = Math.min(data.force / 50, 1); // Normalize force
        }
    });

    joystick.on('end', () => {
        joystickMoving = false;
        joystickForce = 0;
    });
}

// Wait for both DOM and nipplejs to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.nippleJsReady) {
            initializeJoystick();
        } else {
            window.addEventListener('nippleJsReady', initializeJoystick);
        }
    });
} else {
    if (window.nippleJsReady) {
        initializeJoystick();
    } else {
        window.addEventListener('nippleJsReady', initializeJoystick);
    }
}

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
    // Handle joystick input
    if (joystickMoving) {
        // Convert joystick angle to movement
        const angleRelativeToKart = joystickAngle - kart.rotation.y - Math.PI/2;
        
        // Calculate forward/backward and left/right components
        const forwardAmount = -Math.cos(angleRelativeToKart) * joystickForce;
        const rightAmount = -Math.sin(angleRelativeToKart) * joystickForce;

        // Apply movement
        kart.position.x -= Math.sin(kart.rotation.y) * moveSpeed * forwardAmount;
        kart.position.z -= Math.cos(kart.rotation.y) * moveSpeed * forwardAmount;

        // Handle rotation
        if (Math.abs(rightAmount) > 0.1) {
            kart.rotation.y -= rotationSpeed * rightAmount;
        }

        // Tilt effects
        kart.rotation.x = -0.1 * forwardAmount;
        kart.rotation.z = 0.1 * rightAmount;

        // Wheel rotation
        const wheelRotation = 0.2 * forwardAmount;
        frontLeftWheel.rotation.z = Math.PI / 2 + wheelRotation;
        frontRightWheel.rotation.z = Math.PI / 2 + wheelRotation;
        backLeftWheel.rotation.z = Math.PI / 2 + wheelRotation;
        backRightWheel.rotation.z = Math.PI / 2 + wheelRotation;

        if (Math.abs(rightAmount) > 0.1) {
            frontLeftWheel.rotation.x = rightAmount * 0.5;
            frontRightWheel.rotation.x = rightAmount * 0.5;
        }
    } else {
        // Existing keyboard controls
        if (moveLeft && (moveForward || moveBackward)) {
            kart.rotation.y += rotationSpeed;
            frontLeftWheel.rotation.x = -0.5;
            frontRightWheel.rotation.x = -0.5;
        }
        if (moveRight && (moveForward || moveBackward)) {
            kart.rotation.y -= rotationSpeed;
            frontLeftWheel.rotation.x = 0.5;
            frontRightWheel.rotation.x = 0.5;
        }

        if (moveForward) {
            kart.position.x -= Math.sin(kart.rotation.y) * moveSpeed;
            kart.position.z -= Math.cos(kart.rotation.y) * moveSpeed;
            kart.rotation.x = -0.1;
            frontLeftWheel.rotation.z = Math.PI / 2 + 0.2;
            frontRightWheel.rotation.z = Math.PI / 2 + 0.2;
            backLeftWheel.rotation.z = Math.PI / 2 + 0.2;
            backRightWheel.rotation.z = Math.PI / 2 + 0.2;
        } else if (moveBackward) {
            kart.position.x += Math.sin(kart.rotation.y) * moveSpeed;
            kart.position.z += Math.cos(kart.rotation.y) * moveSpeed;
            kart.rotation.x = 0.1;
            frontLeftWheel.rotation.z = Math.PI / 2 - 0.2;
            frontRightWheel.rotation.z = Math.PI / 2 - 0.2;
            backLeftWheel.rotation.z = Math.PI / 2 - 0.2;
            backRightWheel.rotation.z = Math.PI / 2 - 0.2;
        } else {
            kart.rotation.x = 0;
            frontLeftWheel.rotation.z = Math.PI / 2;
            frontRightWheel.rotation.z = Math.PI / 2;
            backLeftWheel.rotation.z = Math.PI / 2;
            backRightWheel.rotation.z = Math.PI / 2;
        }

        if (moveLeft && (moveForward || moveBackward)) {
            kart.rotation.z = 0.1;
        } else if (moveRight && (moveForward || moveBackward)) {
            kart.rotation.z = -0.1;
        } else {
            kart.rotation.z = 0;
        }
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