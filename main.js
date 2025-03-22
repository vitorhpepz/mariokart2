import * as THREE from 'three';
import { Scene } from './Scene.js';
import { RoadBuilder } from './RoadBuilder.js';
import { Kart } from './Kart.js';

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

// Prevent default touch actions
document.addEventListener('touchstart', function(e) {
    e.preventDefault();
}, { passive: false });

document.addEventListener('touchmove', function(e) {
    e.preventDefault();
}, { passive: false });

// Function to check if nipplejs is loaded
function checkNippleJs() {
    if (typeof nipplejs !== 'undefined') {
        console.log('nipplejs found, initializing...');
        kart.initJoystick();
    } else {
        console.log('waiting for nipplejs...');
        setTimeout(checkNippleJs, 100);
    }
}

// Initialize scene
const gameScene = new Scene();

// Create road builder and build track
const roadBuilder = new RoadBuilder(gameScene.scene);
roadBuilder.buildTrack();

// Create kart
const kart = new Kart();
gameScene.scene.add(kart.object);

// Start checking for nipplejs when the document is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkNippleJs);
} else {
    checkNippleJs();
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    kart.update();
    gameScene.updateCamera(kart.object.position, kart.object.rotation);
    gameScene.render();
}

animate(); 