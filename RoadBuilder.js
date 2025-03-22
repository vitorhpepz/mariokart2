import * as THREE from 'three';

export class RoadBuilder {
    constructor(scene) {
        this.scene = scene;
        this.trackWidth = 8;
        this.trackHeight = 0.1;
        this.curveSegments = 64;
        this.controlPoints = [];
    }

    addControlPoint(x, y, z) {
        this.controlPoints.push(new THREE.Vector3(x, y, z));
    }

    createSpline() {
        const curve = new THREE.CatmullRomCurve3(this.controlPoints);
        curve.closed = true;
        return curve;
    }

    createTrack() {
        const curve = this.createSpline();
        
        // Create points along the curve for the road surface
        const points = curve.getPoints(this.curveSegments);
        
        // Create vertices for the road surface
        const vertices = [];
        const uvs = [];
        const indices = [];
        
        // For each point along the curve, create two vertices for the road width
        for (let i = 0; i < points.length; i++) {
            const point = points[i];
            const tangent = curve.getTangent(i / (points.length - 1));
            const normal = new THREE.Vector3(-tangent.z, 0, tangent.x).normalize();
            
            // Left and right vertices
            const leftPoint = point.clone().add(normal.clone().multiplyScalar(this.trackWidth / 2));
            const rightPoint = point.clone().add(normal.clone().multiplyScalar(-this.trackWidth / 2));
            
            vertices.push(
                leftPoint.x, this.trackHeight, leftPoint.z,
                rightPoint.x, this.trackHeight, rightPoint.z
            );
            
            // UV coordinates for potential texturing
            uvs.push(0, i / (points.length - 1), 1, i / (points.length - 1));
            
            // Create triangles (except for the last segment)
            if (i < points.length - 1) {
                const baseIndex = i * 2;
                indices.push(
                    baseIndex, baseIndex + 1, baseIndex + 2,
                    baseIndex + 1, baseIndex + 3, baseIndex + 2
                );
            }
        }
        
        // Create the last segment connecting back to the start
        const lastIndex = (points.length - 1) * 2;
        indices.push(
            lastIndex, lastIndex + 1, 0,
            lastIndex + 1, 1, 0
        );
        
        // Create road geometry
        const roadGeometry = new THREE.BufferGeometry();
        roadGeometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        roadGeometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        roadGeometry.setIndex(indices);
        roadGeometry.computeVertexNormals();
        
        const roadMaterial = new THREE.MeshStandardMaterial({
            color: 0x666666,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        
        const road = new THREE.Mesh(roadGeometry, roadMaterial);
        road.receiveShadow = true;
        road.castShadow = true;
        
        this.scene.add(road);
    }

    buildTrack() {
        this.controlPoints = [];
        
        // Create a more interesting track layout
        this.addControlPoint(0, 0, 0);       // Start
        this.addControlPoint(20, 0, -10);    // First curve
        this.addControlPoint(40, 0, 0);      // Second curve
        this.addControlPoint(40, 0, 20);     // Third curve
        this.addControlPoint(20, 0, 30);     // Fourth curve
        this.addControlPoint(-10, 0, 20);    // Fifth curve
        this.addControlPoint(-20, 0, 0);     // Back to start area
        this.addControlPoint(-10, 0, -10);   // Final curve
        
        this.createTrack();
    }
} 