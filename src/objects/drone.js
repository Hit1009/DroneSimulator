import * as THREE from '../../threejs/build/three.module.js';
import {Vector3, Quaternion} from "../../threejs/build/three.module.js";

export { Drone, createDroneModel };

/**
 * Creates a procedurally generated drone model using Three.js geometry primitives
 * @returns {THREE.Group} The complete drone model as a Three.js Group
 */
function createDroneModel() {
    // Create a group to hold all drone parts
    const droneGroup = new THREE.Group();
    
    // Materials
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x303030, 
        specular: 0x111111, 
        shininess: 100 
    });
    const frameMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x505050, 
        specular: 0x222222, 
        shininess: 30 
    });
    const rotorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x222222, 
        transparent: true, 
        opacity: 0.7, 
        side: THREE.DoubleSide 
    });
    const accentMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x0088ff, 
        specular: 0x8888ff, 
        shininess: 100 
    });
    
    // Main body - central hub
    const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.8, 8);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    droneGroup.add(body);
    
    // Add details to the body
    const detailGeometry = new THREE.BoxGeometry(1.2, 0.4, 1.2);
    const detail = new THREE.Mesh(detailGeometry, accentMaterial);
    detail.position.set(0, 0, 0.1);
    droneGroup.add(detail);
    
    // Camera/sensor array at front
    const cameraGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const camera = new THREE.Mesh(cameraGeometry, new THREE.MeshPhongMaterial({ 
        color: 0x111111, 
        specular: 0xffffff, 
        shininess: 200 
    }));
    camera.position.set(0.8, 0, 0);
    droneGroup.add(camera);
    
    // Arms
    const armLength = 4;
    const armPositions = [
        { x: 1, y: 1, z: 0 },   // Front-right
        { x: 1, y: -1, z: 0 },  // Front-left
        { x: -1, y: 1, z: 0 },  // Back-right
        { x: -1, y: -1, z: 0 }  // Back-left
    ];
    
    armPositions.forEach((pos, index) => {
        // Create arm
        const armGeometry = new THREE.BoxGeometry(0.4, armLength * 0.7, 0.2);
        const arm = new THREE.Mesh(armGeometry, frameMaterial);
        
        // Position and rotate arm
        const angle = Math.atan2(pos.y, pos.x);
        arm.position.set(pos.x * 1.5, pos.y * 1.5, 0);
        arm.rotation.z = angle;
        droneGroup.add(arm);
        
        // Create motor housing at end of arm
        const motorHousingGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 8);
        const motorHousing = new THREE.Mesh(motorHousingGeometry, bodyMaterial);
        motorHousing.rotation.x = Math.PI / 2;
        motorHousing.position.set(pos.x * 3, pos.y * 3, 0);
        droneGroup.add(motorHousing);
        
        // Create rotor
        const rotorGeometry = new THREE.CircleGeometry(1.2, 16);
        const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
        rotor.position.set(pos.x * 3, pos.y * 3, 0.3);
        // Keep rotors horizontal by not rotating them on X axis
        rotor.userData = { isRotor: true, rotationSpeed: (index % 2 === 0) ? 0.2 : -0.2 };
        droneGroup.add(rotor);
        
        // Add LED light at end of arm
        const ledGeometry = new THREE.SphereGeometry(0.15, 8, 8);
        const ledMaterial = new THREE.MeshPhongMaterial({ 
            color: index < 2 ? 0x00ff00 : 0xff0000, 
            emissive: index < 2 ? 0x00ff00 : 0xff0000,
            emissiveIntensity: 0.5
        });
        const led = new THREE.Mesh(ledGeometry, ledMaterial);
        led.position.set(pos.x * 3.3, pos.y * 3.3, 0);
        droneGroup.add(led);
    });
    
    // Landing gear
    const legPositions = [
        { x: 1, y: 1 },   // Front-right
        { x: 1, y: -1 },  // Front-left
        { x: -1, y: 1 },  // Back-right
        { x: -1, y: -1 }  // Back-left
    ];
    
    legPositions.forEach(pos => {
        // Leg strut
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.1, 1.5, 8);
        const leg = new THREE.Mesh(legGeometry, frameMaterial);
        leg.position.set(pos.x * 2, pos.y * 2, -0.8);
        droneGroup.add(leg);
        
        // Foot pad
        const footGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const foot = new THREE.Mesh(footGeometry, bodyMaterial);
        foot.position.set(pos.x * 2, pos.y * 2, -1.5);
        droneGroup.add(foot);
    });
    
    // Scale the entire drone to appropriate size
    droneGroup.scale.set(5, 5, 5);
    
    return droneGroup;
}

/**
 * Drone class that extends the functionality of Plane class but uses a procedurally generated drone model
 */
class Drone {
    constructor(inScene, debug = false) {
        this.scene = inScene;
        this.position = new THREE.Vector3(0, 0, 400);
        this.rotation = new THREE.Quaternion().identity();
        this.inverseRotation = new Quaternion();
        this.pause = false;
        
        // Create the drone model
        this.mesh = createDroneModel();
        this.scene.add(this.mesh);
        
        /*
        Debug
         */
        this.debug = debug;
        if (debug) {
            this.debugDirectionArrow = new THREE.ArrowHelper(this.velocity, this.position, 100, 0xffff00);
            this.debugDirectionXArrow = new THREE.ArrowHelper(this.velocity, this.position, 100, 0xff0000);
            this.debugDirectionYArrow = new THREE.ArrowHelper(this.velocity, this.position, 100, 0x00ff00);
            this.debugDirectionZArrow = new THREE.ArrowHelper(this.velocity, this.position, 100, 0x0000ff);
            this.scene.add(this.debugDirectionArrow);
            this.scene.add(this.debugDirectionXArrow);
            this.scene.add(this.debugDirectionYArrow);
            this.scene.add(this.debugDirectionZArrow);
            this.normalizedDebugForward = new Vector3();
        }
        this.relativeVelocity = new Vector3();
        this.upLift = 0;
        this.rightLift = 0;

        /*
        Relative axis
         */
        this.forwardVector = new Vector3();
        this.rightVector = new Vector3();
        this.upVector = new Vector3();

        /*
        Inputs
         */
        this.desiredEngineInput = 0.5;
        this.desiredRollInput = 0.0;
        this.desiredPitchInput = 0.0;
        this.desiredYawInput = 0.0;
        this.engineInput = 0.5;
        this.rollInput = 0.0;
        this.pitchInput = 0.0;
        this.yawInput = 0.0;

        /*
        Maths
         */
        this.rollRotationRate = 0;
        this.pitchRotationRate = 0;
        this.yawRotationRate = 0;
        this.rotationVelocity = new Quaternion().identity();
        this.velocity = new THREE.Vector3(0, 0, 0);

        this.tempVectorA = new Vector3();

        // Constants - adjusted for realistic drone physics
        this.dragCoefficient = 0.00025; // Increased drag for better stability
        this.upLiftCoefficient = 0.0008;  // Reduced lift from forward motion
        this.rightLiftCoefficient = 0.0001;
        this.rotorTorque = 1.2;         // Higher torque for more responsive rotation
        this.rotorThrust = 50;          // Balanced thrust coefficient
        this.rotorResponse = 15;        // Faster control response speed
        this.forwardThrustMultiplier = 0.8; // Forward movement scaling
        
        // Drone-specific properties
        this.rotorSpeed = 0;
        this.maxRotorSpeed = 5;
        this.rotorAcceleration = 3;
        this.hoverThreshold = 0.35; // Lower threshold to make altitude control more responsive
        
        // Animation properties
        this.rotors = [];
        this.mesh.traverse(child => {
            if (child.userData && child.userData.isRotor) {
                this.rotors.push(child);
            }
        });

        this.update(0);
    }

    updateRotations(deltaTime) {
        // More responsive drone rotation physics with improved torque application
        // Roll and pitch are more responsive than yaw (as in real quadcopters)
        this.rollRotationRate += this.rollInput * deltaTime * this.rotorTorque * 1.5;
        this.pitchRotationRate += this.pitchInput * deltaTime * this.rotorTorque * 1.5;
        this.yawRotationRate += this.yawInput * deltaTime * this.rotorTorque * 1.0;

        // Aerodynamic damping with different coefficients for each axis
        // Roll and pitch have higher damping for quicker stabilization
        this.rollRotationRate *= Math.pow(0.1, deltaTime * 2.5);  // Exponential damping
        this.pitchRotationRate *= Math.pow(0.1, deltaTime * 2.5); // Exponential damping
        this.yawRotationRate *= Math.pow(0.2, deltaTime * 2.0);   // Yaw has less damping

        // Apply rotation with quaternion math
        this.rotationVelocity.set(this.rollRotationRate * deltaTime, this.pitchRotationRate * deltaTime, this.yawRotationRate * deltaTime, 1).normalize();
        this.rotation.multiply(this.rotationVelocity);
        this.rotation.normalize(); // Prevent quaternion drift
    }

    FlerpConstant(current, desired, speed, delta) {
        // Improved interpolation with non-linear response for more natural control feel
        // Faster response when further from target, smoother when close
        const diff = Math.abs(desired - current);
        const adaptiveSpeed = speed * (1 + diff * 2); // Speed increases with distance from target
        let movement = adaptiveSpeed * delta;
        
        if (desired > current) return Math.min(desired, current + movement);
        else return Math.max(desired, current - movement);
    }

    updateInputs(deltaTime) {
        // More responsive control with different response rates for each input type
        // Throttle (engine) has the most direct response
        this.engineInput = this.FlerpConstant(this.engineInput, this.desiredEngineInput, this.rotorResponse * 1.5, deltaTime);
        
        // Roll and pitch have medium response for good control without overshooting
        this.rollInput = this.FlerpConstant(this.rollInput, this.desiredRollInput, this.rotorResponse * 1.2, deltaTime);
        this.pitchInput = this.FlerpConstant(this.pitchInput, this.desiredPitchInput, this.rotorResponse * 1.2, deltaTime);
        
        // Yaw has slightly slower response (realistic for quadcopters)
        this.yawInput = this.FlerpConstant(this.yawInput, this.desiredYawInput, this.rotorResponse * 0.9, deltaTime);
        
        // Update rotor visual speed based on engine input with faster response
        this.rotorSpeed = this.FlerpConstant(this.rotorSpeed, this.engineInput * this.maxRotorSpeed, this.rotorAcceleration * 1.5, deltaTime);
    }

    updateVelocity(deltaTime) {
        // Calculate base thrust from engine input (hover thrust)
        const baseThrust = (this.engineInput - this.hoverThreshold) * this.rotorThrust;
        
        // Calculate thrust vectors for each axis based on control inputs
        const pitchThrust = this.pitchInput * baseThrust * 0.4; // Forward/backward tilt
        const rollThrust = this.rollInput * baseThrust * 0.4;   // Left/right tilt
        
        // Calculate thrust vectors in world space
        const verticalThrust = baseThrust * Math.cos(Math.abs(this.pitchRotationRate)) * Math.cos(Math.abs(this.rollRotationRate));
        const forwardThrust = -pitchThrust * Math.cos(Math.abs(this.rollRotationRate));
        const rightThrust = rollThrust;
        
        // Apply thrusts in their respective directions
        this.tempVectorA.copy(this.upVector).multiplyScalar(verticalThrust);
        this.velocity.add(this.tempVectorA);
        
        this.tempVectorA.copy(this.forwardVector).multiplyScalar(forwardThrust);
        this.velocity.add(this.tempVectorA);
        
        this.tempVectorA.copy(this.rightVector).multiplyScalar(rightThrust);
        this.velocity.add(this.tempVectorA);
        
        // Apply gravity
        this.velocity.z -= 9.81 * deltaTime * 30;
        
        // Apply air resistance (quadratic drag)
        const velocityMagnitude = this.velocity.length();
        if (velocityMagnitude > 0) {
            const dragForce = this.dragCoefficient * velocityMagnitude * velocityMagnitude;
            this.tempVectorA.copy(this.velocity).normalize().multiplyScalar(-dragForce);
            this.velocity.add(this.tempVectorA);
        }
        
        // Update relative velocity for debug
        this.relativeVelocity.copy(this.velocity);
        
        // Keep track of lift values for debug
        this.upLift = verticalThrust;
        this.rightLift = rightThrust;
    }

    applyPosition() {
        // Move mesh
        this.mesh.position.copy(this.position);
        this.mesh.quaternion.copy(this.rotation);
        
        // Animate rotors
        for (const rotor of this.rotors) {
            rotor.rotation.z += this.rotorSpeed * rotor.userData.rotationSpeed;
        }

        // Update debug draws
        this.updateDebug();

        // Teleport drone to zero in case of physics bug
        if (this.position.length() > 5000000) {
            this.position.set(0, 0, 400);
            this.velocity.set(0, 0, 0);
        }
    }

    update(deltaTime) {
        if (this.pause) {
            this.applyPosition();
            return;
        }
        if (deltaTime > 1/30) deltaTime = 1/30;

        // Update inputs FIRST for more responsive control
        this.updateInputs(deltaTime);
        
        // Compute local unit vectors
        this.forwardVector.set(1,0,0).applyQuaternion(this.rotation);
        this.rightVector.set(0,1,0).applyQuaternion(this.rotation);
        this.upVector.set(0,0,1).applyQuaternion(this.rotation);

        // Compute rotation
        this.updateRotations(deltaTime);

        // Compute velocity
        this.updateVelocity(deltaTime);

        // Apply velocity to position with improved integration
        this.position.addScaledVector(this.velocity, deltaTime);

        // Apply position
        this.applyPosition();
    }

    updateDebug() {
        if (this.debug) {
            this.forwardVector.normalize();
            this.rightVector.normalize();
            this.upVector.normalize();

            this.normalizedDebugForward.set(this.velocity.x, this.velocity.y, this.velocity.z);
            this.normalizedDebugForward.normalize();

            this.debugDirectionArrow.position.copy(this.position);
            this.debugDirectionXArrow.position.copy(this.position);
            this.debugDirectionYArrow.position.copy(this.position);
            this.debugDirectionZArrow.position.copy(this.position);

            this.debugDirectionArrow.setDirection(this.normalizedDebugForward);
            this.debugDirectionXArrow.setDirection(this.forwardVector);
            this.debugDirectionYArrow.setDirection(this.rightVector);
            this.debugDirectionZArrow.setDirection(this.upVector);

            this.debugDirectionArrow.setLength(this.velocity.length());
            this.debugDirectionXArrow.setLength(this.relativeVelocity.x);
            this.debugDirectionYArrow.setLength(this.relativeVelocity.y);
            this.debugDirectionZArrow.setLength(this.relativeVelocity.z);
        }
    }

    setEngineInput(value) {
        if (value < 0) value = 0;
        else if (value > 1.2) value = 1.2;
        this.desiredEngineInput = value;
    }

    setRollInput(value) {
        if (value < -1) value = -1;
        else if (value > 1) value = 1;
        this.desiredRollInput = value;
    }

    setPitchInput(value) {
        if (value < -1) value = -1;
        else if (value > 1) value = 1;
        this.desiredPitchInput = value;
    }

    setYawInput(value) {
        if (value < -1) value = -1;
        else if (value > 1) value = 1;
        this.desiredYawInput = value;
    }
}