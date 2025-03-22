import * as THREE from 'three';

export class Scene {
    constructor() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x87CEEB); // Sky blue background
        
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        document.body.appendChild(this.renderer.domElement);

        this.setupEnvironment();
        this.setupLighting();
        this.setupCamera();
        this.setupResizeHandler();

        // Camera settings
        this.cameraOffset = new THREE.Vector3(0, 5, 10);
        this.cameraLerpFactor = 0.1;
    }

    setupEnvironment() {
        // Create ground with grass texture
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({ 
            color: 0x3a7e3a,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.scene.add(ground);

        // Create obstacles and decorations
        this.createDecorations();
    }

    createDecorations() {
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

        this.scene.add(obstacles);
    }

    setupLighting() {
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 5, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 1024;
        directionalLight.shadow.mapSize.height = 1024;
        this.scene.add(directionalLight);
    }

    setupCamera() {
        this.camera.position.set(0, 5, 10);
    }

    setupResizeHandler() {
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        }, false);
    }

    updateCamera(kartPosition, kartRotation) {
        const idealOffset = new THREE.Vector3();
        idealOffset.copy(this.cameraOffset);
        idealOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), kartRotation.y);
        idealOffset.add(kartPosition);
        this.camera.position.lerp(idealOffset, this.cameraLerpFactor);
        this.camera.lookAt(kartPosition);
    }

    render() {
        this.renderer.render(this.scene, this.camera);
    }
} 