import * as THREE from 'three';

export class Kart {
    constructor() {
        this.moveSpeed = 0.2;
        this.rotationSpeed = 0.1;
        this.moveForward = false;
        this.moveBackward = false;
        this.moveLeft = false;
        this.moveRight = false;
        this.joystickMoving = false;
        this.joystickAngle = 0;
        this.joystickForce = 0;
        
        this.object = this.createKartModel();
        this.setupControls();
    }

    createKartModel() {
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
        this.frontLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.frontLeftWheel.rotation.z = Math.PI / 2;
        this.frontLeftWheel.position.set(-1, 0.2, 0.6);
        this.frontLeftWheel.castShadow = true;
        kart.add(this.frontLeftWheel);

        this.frontRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.frontRightWheel.rotation.z = Math.PI / 2;
        this.frontRightWheel.position.set(-1, 0.2, -0.6);
        this.frontRightWheel.castShadow = true;
        kart.add(this.frontRightWheel);

        // Back wheels
        this.backLeftWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.backLeftWheel.rotation.z = Math.PI / 2;
        this.backLeftWheel.position.set(1, 0.2, 0.6);
        this.backLeftWheel.castShadow = true;
        kart.add(this.backLeftWheel);

        this.backRightWheel = new THREE.Mesh(wheelGeometry, wheelMaterial);
        this.backRightWheel.rotation.z = Math.PI / 2;
        this.backRightWheel.position.set(1, 0.2, -0.6);
        this.backRightWheel.castShadow = true;
        kart.add(this.backRightWheel);

        // Driver
        const driverGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.8, 16);
        const driverMaterial = new THREE.MeshStandardMaterial({ color: 0x0000ff });
        const driver = new THREE.Mesh(driverGeometry, driverMaterial);
        driver.position.set(0, 0.8, 0);
        driver.castShadow = true;
        kart.add(driver);

        kart.position.y = 0.5;
        return kart;
    }

    setupControls() {
        // Keyboard controls
        document.addEventListener('keydown', (event) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.moveForward = true;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.moveBackward = true;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.moveLeft = true;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.moveRight = true;
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.code) {
                case 'KeyW':
                case 'ArrowUp':
                    this.moveForward = false;
                    break;
                case 'KeyS':
                case 'ArrowDown':
                    this.moveBackward = false;
                    break;
                case 'KeyA':
                case 'ArrowLeft':
                    this.moveLeft = false;
                    break;
                case 'KeyD':
                case 'ArrowRight':
                    this.moveRight = false;
                    break;
            }
        });
    }

    initJoystick() {
        try {
            console.log('Initializing joystick...');
            this.joystick = nipplejs.create({
                zone: document.getElementById('joystickZone'),
                mode: 'static',
                position: { left: '50%', top: '50%' },
                color: 'white',
                size: 150,
                restOpacity: 0.9
            });

            this.joystick.on('start', () => {
                console.log('Joystick start');
                this.joystickMoving = true;
            });

            this.joystick.on('move', (evt, data) => {
                if (data && data.direction) {
                    this.joystickMoving = true;
                    this.joystickForce = Math.min(data.force / 100, 1);
                    
                    // Reset all movement flags
                    this.moveForward = false;
                    this.moveBackward = false;
                    this.moveLeft = false;
                    this.moveRight = false;

                    // Set forward/backward movement based on primary direction
                    if (data.direction.y === 'up') {
                        this.moveForward = true;
                    } else if (data.direction.y === 'down') {
                        this.moveBackward = true;
                    }

                    // Only set left/right if the angle is significant enough
                    // data.angle.degree ranges from 0 to 360
                    const degree = data.angle.degree;
                    const turnThreshold = 30; // Degrees from pure vertical to start turning

                    if (this.moveForward || this.moveBackward) {
                        if (degree > 270 + turnThreshold || degree < 90 - turnThreshold) {
                            this.moveRight = true;
                        } else if (degree > 90 + turnThreshold && degree < 270 - turnThreshold) {
                            this.moveLeft = true;
                        }
                    }

                    console.log('Joystick move:', {
                        force: this.joystickForce,
                        angle: degree,
                        directions: data.direction,
                        moving: {
                            forward: this.moveForward,
                            backward: this.moveBackward,
                            left: this.moveLeft,
                            right: this.moveRight
                        }
                    });
                }
            });

            this.joystick.on('end', () => {
                console.log('Joystick end');
                this.joystickMoving = false;
                this.joystickForce = 0;
                this.moveForward = false;
                this.moveBackward = false;
                this.moveLeft = false;
                this.moveRight = false;
            });

            console.log('Joystick initialized successfully');
        } catch (error) {
            console.error('Error initializing joystick:', error);
        }
    }

    update() {
        // Common speed multiplier based on input type
        const speedMultiplier = this.joystickMoving ? 0.8 : 1.0;

        // Handle turning with reduced rotation speed for joystick
        const currentRotationSpeed = this.joystickMoving ? this.rotationSpeed * 0.5 : this.rotationSpeed;

        if (this.moveLeft && (this.moveForward || this.moveBackward)) {
            this.object.rotation.y += currentRotationSpeed;
            this.frontLeftWheel.rotation.x = -0.5;
            this.frontRightWheel.rotation.x = -0.5;
        }
        if (this.moveRight && (this.moveForward || this.moveBackward)) {
            this.object.rotation.y -= currentRotationSpeed;
            this.frontLeftWheel.rotation.x = 0.5;
            this.frontRightWheel.rotation.x = 0.5;
        }

        // Handle forward/backward movement
        if (this.moveForward) {
            this.object.position.x -= Math.sin(this.object.rotation.y) * this.moveSpeed * speedMultiplier;
            this.object.position.z -= Math.cos(this.object.rotation.y) * this.moveSpeed * speedMultiplier;
            this.object.rotation.x = -0.1;
            this.frontLeftWheel.rotation.z = Math.PI / 2 + 0.2;
            this.frontRightWheel.rotation.z = Math.PI / 2 + 0.2;
            this.backLeftWheel.rotation.z = Math.PI / 2 + 0.2;
            this.backRightWheel.rotation.z = Math.PI / 2 + 0.2;
        } else if (this.moveBackward) {
            this.object.position.x += Math.sin(this.object.rotation.y) * this.moveSpeed * speedMultiplier;
            this.object.position.z += Math.cos(this.object.rotation.y) * this.moveSpeed * speedMultiplier;
            this.object.rotation.x = 0.1;
            this.frontLeftWheel.rotation.z = Math.PI / 2 - 0.2;
            this.frontRightWheel.rotation.z = Math.PI / 2 - 0.2;
            this.backLeftWheel.rotation.z = Math.PI / 2 - 0.2;
            this.backRightWheel.rotation.z = Math.PI / 2 - 0.2;
        } else {
            this.object.rotation.x = 0;
            this.frontLeftWheel.rotation.z = Math.PI / 2;
            this.frontRightWheel.rotation.z = Math.PI / 2;
            this.backLeftWheel.rotation.z = Math.PI / 2;
            this.backRightWheel.rotation.z = Math.PI / 2;
        }

        // Handle tilt effect
        if (this.moveLeft && (this.moveForward || this.moveBackward)) {
            this.object.rotation.z = 0.1;
        } else if (this.moveRight && (this.moveForward || this.moveBackward)) {
            this.object.rotation.z = -0.1;
        } else {
            this.object.rotation.z = 0;
        }
    }
} 