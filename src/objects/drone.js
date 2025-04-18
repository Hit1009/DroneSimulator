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
    
    // Enhanced Materials
    const bodyMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x303030, 
        specular: 0x111111, 
        shininess: 100,
        flatShading: true
    });
    const frameMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x505050, 
        specular: 0x222222, 
        shininess: 30,
        flatShading: true
    });
    const rotorMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x222222, 
        transparent: true, 
        opacity: 0.7, 
        side: THREE.DoubleSide,
        flatShading: true
    });
    const accentMaterial = new THREE.MeshPhongMaterial({ 
        color: 0x0088ff, 
        specular: 0x8888ff, 
        shininess: 100,
        flatShading: true
    });
    const carbonFiberMaterial = new THREE.MeshPhongMaterial({
        color: 0x1a1a1a,
        specular: 0x333333,
        shininess: 150,
        flatShading: true
    });
    const wiringMaterial = new THREE.MeshPhongMaterial({
        color: 0xcc0000,
        emissive: 0x440000,
        emissiveIntensity: 0.3,
        shininess: 50
    });
    const rubberMaterial = new THREE.MeshPhongMaterial({
        color: 0x222222,
        shininess: 10,
        roughness: 0.8
    });
    
    // Main body - central hub with detailed components
    const bodyGeometry = new THREE.CylinderGeometry(1.5, 1.5, 0.8, 16);
    const body = new THREE.Mesh(bodyGeometry, bodyMaterial);
    body.rotation.x = Math.PI / 2;
    droneGroup.add(body);
    
    // Add detailed components to the body
    const detailGeometry = new THREE.BoxGeometry(1.2, 0.4, 1.2, 4, 2, 4);
    const detail = new THREE.Mesh(detailGeometry, accentMaterial);
    detail.position.set(0, 0, 0.1);
    droneGroup.add(detail);
    
    // Add cooling vents
    for(let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const ventGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.4, 2, 1, 2);
        const vent = new THREE.Mesh(ventGeometry, carbonFiberMaterial);
        vent.position.set(Math.cos(angle) * 1.2, Math.sin(angle) * 1.2, 0.2);
        vent.rotation.z = angle;
        droneGroup.add(vent);
    }
    
    // Add body panel lines
    const panelLineGeometry = new THREE.CylinderGeometry(1.55, 1.55, 0.02, 32);
    const panelLine = new THREE.Mesh(panelLineGeometry, carbonFiberMaterial);
    panelLine.rotation.x = Math.PI / 2;
    panelLine.position.z = 0.3;
    droneGroup.add(panelLine);
    
    const panelLine2 = panelLine.clone();
    panelLine2.position.z = -0.3;
    droneGroup.add(panelLine2);
    
    // Camera/sensor array at front
    const cameraGeometry = new THREE.SphereGeometry(0.3, 16, 16);
    const camera = new THREE.Mesh(cameraGeometry, new THREE.MeshPhongMaterial({ 
        color: 0x111111, 
        specular: 0xffffff, 
        shininess: 200 
    }));
    camera.position.set(0.8, 0, 0);
    droneGroup.add(camera);
    
    // Detailed Arms with reinforced structure
    const armLength = 4;
    const armPositions = [
        { x: 1, y: 1, z: 0 },   // Front-right
        { x: 1, y: -1, z: 0 },  // Front-left
        { x: -1, y: 1, z: 0 },  // Back-right
        { x: -1, y: -1, z: 0 }  // Back-left
    ];
    
    armPositions.forEach((pos, index) => {
        // Create reinforced arm structure with connector to body
        const armGeometry = new THREE.BoxGeometry(0.4, armLength * 0.7, 0.2, 4, 8, 2);
        const arm = new THREE.Mesh(armGeometry, frameMaterial);
        
        // Position and rotate arm
        const angle = Math.atan2(pos.y, pos.x);
        arm.position.set(pos.x * 1.2, pos.y * 1.2, 0);
        arm.rotation.z = angle;
        droneGroup.add(arm);
        
        // Add reinforced arm connector to body
        const connectorGeometry = new THREE.CylinderGeometry(0.25, 0.25, 0.8, 8);
        const connector = new THREE.Mesh(connectorGeometry, carbonFiberMaterial);
        connector.position.set(pos.x * 0.6, pos.y * 0.6, 0);
        connector.rotation.z = angle;
        
        // Add mounting flange to body
        const flangeGeometry = new THREE.RingGeometry(0.2, 0.3, 16);
        const flange = new THREE.Mesh(flangeGeometry, carbonFiberMaterial);
        flange.position.set(pos.x * 0.6, pos.y * 0.6, 0);
        flange.rotation.x = Math.PI / 2;
        flange.rotation.z = angle;
        
        droneGroup.add(connector);
        droneGroup.add(flange);
        
        // Add arm reinforcement ribs
        for(let i = 0; i < 3; i++) {
            const ribGeometry = new THREE.BoxGeometry(0.5, 0.1, 0.3);
            const rib = new THREE.Mesh(ribGeometry, carbonFiberMaterial);
            rib.position.set(
                pos.x * (1.5 + i * 0.7),
                pos.y * (1.5 + i * 0.7),
                0
            );
            rib.rotation.z = angle;
            droneGroup.add(rib);
        }
        
        // Create detailed motor housing with cooling fins
        const motorHousingGeometry = new THREE.CylinderGeometry(0.4, 0.4, 0.5, 16);
        const motorHousing = new THREE.Mesh(motorHousingGeometry, bodyMaterial);
        motorHousing.rotation.x = Math.PI / 2;
        motorHousing.position.set(pos.x * 3, pos.y * 3, 0);
        droneGroup.add(motorHousing);
        
        // Add cooling fins to motor housing
        for(let i = 0; i < 8; i++) {
            const finAngle = (i / 8) * Math.PI * 2;
            const finGeometry = new THREE.BoxGeometry(0.5, 0.05, 0.2);
            const fin = new THREE.Mesh(finGeometry, carbonFiberMaterial);
            fin.position.set(
                pos.x * 3 + Math.cos(finAngle) * 0.5,
                pos.y * 3 + Math.sin(finAngle) * 0.5,
                0
            );
            fin.rotation.z = finAngle;
            droneGroup.add(fin);
        }
        
        // Add motor wiring
        const wireGeometry = new THREE.TorusGeometry(0.15, 0.03, 8, 16);
        const wire = new THREE.Mesh(wireGeometry, wiringMaterial);
        wire.position.set(pos.x * 2.5, pos.y * 2.5, 0.1);
        wire.rotation.x = Math.PI / 2;
        droneGroup.add(wire);
        
        // Create detailed rotor with blade markings
        const rotorGeometry = new THREE.CircleGeometry(1.2, 32);
        const rotor = new THREE.Mesh(rotorGeometry, rotorMaterial);
        rotor.position.set(pos.x * 3, pos.y * 3, 0.3);
        // Keep rotors horizontal by not rotating them on X axis
        rotor.userData = { isRotor: true, rotationSpeed: (index % 2 === 0) ? 0.2 : -0.2 };
        droneGroup.add(rotor);
        
        // Add rotor center hub
        const hubGeometry = new THREE.CylinderGeometry(0.2, 0.2, 0.1, 12);
        const hub = new THREE.Mesh(hubGeometry, carbonFiberMaterial);
        hub.position.set(pos.x * 3, pos.y * 3, 0.35);
        hub.rotation.x = Math.PI / 2;
        droneGroup.add(hub);
        
        // Add rotor blade markings
        for(let i = 0; i < 4; i++) {
            const angle = (i / 4) * Math.PI * 2;
            const markGeometry = new THREE.BoxGeometry(0.8, 0.02, 0.01);
            const mark = new THREE.Mesh(markGeometry, carbonFiberMaterial);
            mark.position.set(
                pos.x * 3 + Math.cos(angle) * 0.6,
                pos.y * 3 + Math.sin(angle) * 0.6,
                0.31
            );
            mark.rotation.z = angle;
            droneGroup.add(mark);
        }
        
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
    
    // Detailed articulated landing gear
    const legPositions = [
        { x: 1, y: 1 },   // Front-right
        { x: 1, y: -1 },  // Front-left
        { x: -1, y: 1 },  // Back-right
        { x: -1, y: -1 }  // Back-left
    ];
    
    legPositions.forEach(pos => {
        // Main leg strut with shock absorber and connector to arm
        const legGeometry = new THREE.CylinderGeometry(0.1, 0.08, 1.2, 12);
        const leg = new THREE.Mesh(legGeometry, frameMaterial);
        leg.position.set(pos.x * 2, pos.y * 2, -0.6);
        leg.rotation.x = Math.PI / 2;
        droneGroup.add(leg);
        
        // Add leg-to-arm connector
        const legConnectorGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.4, 8);
        const legConnector = new THREE.Mesh(legConnectorGeometry, carbonFiberMaterial);
        legConnector.position.set(pos.x * 2, pos.y * 2, -0.2);
        legConnector.rotation.x = Math.PI / 2;
        droneGroup.add(legConnector);
        
        // Shock absorber cylinder
        const shockGeometry = new THREE.CylinderGeometry(0.12, 0.12, 0.3, 12);
        const shock = new THREE.Mesh(shockGeometry, carbonFiberMaterial);
        shock.position.set(pos.x * 2, pos.y * 2, -0.8);
        droneGroup.add(shock);
        
        // Shock absorber piston
        const pistonGeometry = new THREE.CylinderGeometry(0.08, 0.08, 0.4, 12);
        const piston = new THREE.Mesh(pistonGeometry, frameMaterial);
        piston.position.set(pos.x * 2, pos.y * 2, -1.0);
        droneGroup.add(piston);
        
        // Foot with rubber pad
        const footGeometry = new THREE.CylinderGeometry(0.15, 0.15, 0.1, 12);
        const foot = new THREE.Mesh(footGeometry, rubberMaterial);
        foot.position.set(pos.x * 2, pos.y * 2, -1.3);
        foot.rotation.x = Math.PI / 2;
        droneGroup.add(foot);
        
        // Foot support struts
        for(let i = 0; i < 3; i++) {
            const angle = (i / 3) * Math.PI * 2;
            const strutGeometry = new THREE.CylinderGeometry(0.03, 0.03, 0.4, 8);
            const strut = new THREE.Mesh(strutGeometry, frameMaterial);
            strut.position.set(
                pos.x * 2 + Math.cos(angle) * 0.1,
                pos.y * 2 + Math.sin(angle) * 0.1,
                -1.1
            );
            strut.rotation.set(
                Math.PI / 2 - angle * 0.2,
                angle,
                0
            );
            droneGroup.add(strut);
        }
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
        this.dragCoefficient = 0.02; // Drastically increased drag
        this.upLiftCoefficient = 0.001;  // Increased lift to counteract gravity
        this.rightLiftCoefficient = 0.0001;
        this.rotorTorque = 1.2;         // Higher torque for more responsive rotation
        this.rotorThrust = 150;         // Reduced base thrust
        this.rotorResponse = 25;        // Faster control response speed
        this.forwardThrustMultiplier = 0.8; // Forward movement scaling
        
        // Drone-specific properties
        this.rotorSpeed = 0;
        this.maxRotorSpeed = 5;
        this.rotorAcceleration = 5;
        this.hoverThreshold = 0.45; // Lower threshold for more responsive altitude control
        
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
        // Calculate total thrust magnitude
        const totalThrustMagnitude = Math.max(0, this.engineInput) * this.rotorThrust;

        // Calculate the primary thrust direction vector based on tilting
        // Start with the up vector, then tilt it based on pitch/roll inputs
        let thrustDirection = new THREE.Vector3().copy(this.upVector);
        // Note: Negative pitchInput (stick back) tilts drone back, positive (stick forward) tilts forward.
        // We want positive pitchInput to add a *forward* thrust component.
        let forwardComponent = new THREE.Vector3().copy(this.forwardVector).multiplyScalar(-this.pitchInput * 0.6); // Adjust multiplier as needed
        let rightComponent = new THREE.Vector3().copy(this.rightVector).multiplyScalar(this.rollInput * 0.6);   // Adjust multiplier as needed
        thrustDirection.add(forwardComponent).add(rightComponent).normalize(); // Combine and normalize

        // Calculate net force vector
        const netForce = new THREE.Vector3();

        // 1. Calculate Thrust Force
        const thrustForce = new THREE.Vector3().copy(thrustDirection).multiplyScalar(totalThrustMagnitude);
        netForce.add(thrustForce);

        // 2. Calculate Gravity Force
        const gravityMultiplier = 5; // Keep adjusted gravity
        const gravityForce = new THREE.Vector3(0, 0, -9.81 * gravityMultiplier); // Force is constant
        netForce.add(gravityForce);

        // 3. Calculate Drag Force
        const velocityMagnitude = this.velocity.length();
        if (velocityMagnitude > 0) {
            const dragForceMagnitude = this.dragCoefficient * velocityMagnitude * velocityMagnitude; // Quadratic drag
            const dragForceVector = new THREE.Vector3().copy(this.velocity).normalize().multiplyScalar(-dragForceMagnitude);
            netForce.add(dragForceVector);
        }

        // 4. Apply Net Force to Velocity ( F = ma -> a = F/m -> dv = a*dt = (F/m)*dt )
        // Assuming mass m = 1 for simplicity
        this.velocity.addScaledVector(netForce, deltaTime);

        // Update relative velocity for debug
        this.relativeVelocity.copy(this.velocity);

        // Keep track of lift values for debug (more accurate)
        this.upLift = thrustForce.dot(this.upVector); // Vertical component of thrust
        this.rightLift = thrustForce.dot(this.rightVector); // Rightward component of thrust
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