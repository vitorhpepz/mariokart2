import * as THREE from 'three';

export class RoadBuilder {
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

    buildTrack() {
        // Create a complete circuit with smooth curves
        // Start straight (longer for better approach to first turn)
        this.createStraightSegment(
            new THREE.Vector3(0, 0, -20),
            new THREE.Vector3(0, 0, 20)
        );

        // First curve (right turn)
        this.createCurvedSegment(
            new THREE.Vector3(0, 0, 20),
            new THREE.Vector3(20, 0, 20),
            true
        );

        // Second straight
        this.createStraightSegment(
            new THREE.Vector3(20, 0, 20),
            new THREE.Vector3(20, 0, -10)
        );

        // Second curve (right turn)
        this.createCurvedSegment(
            new THREE.Vector3(20, 0, -10),
            new THREE.Vector3(40, 0, -10),
            true
        );

        // Back straight
        this.createStraightSegment(
            new THREE.Vector3(40, 0, -10),
            new THREE.Vector3(40, 0, -30)
        );

        // Third curve (right turn)
        this.createCurvedSegment(
            new THREE.Vector3(40, 0, -30),
            new THREE.Vector3(20, 0, -30),
            true
        );

        // Fourth straight
        this.createStraightSegment(
            new THREE.Vector3(20, 0, -30),
            new THREE.Vector3(20, 0, -20)
        );

        // Final curve (right turn back to start)
        this.createCurvedSegment(
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
        this.scene.add(startLine);
    }
} 