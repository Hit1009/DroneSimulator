import { addKeyInput, getInputValue } from "./inputManager.js";
// Removed PIDController import as it's no longer used for throttle

export class DroneController {
    constructor(drone) {
        this.drone = drone;
        this.currentThrust = 0.7; // Start at higher throttle for faster movement
        this.thrustChangeSpeed = 0.25; // Increased speed of thrust changes for more responsive control

        this.setupInputs();
    }

    setupInputs() {
        // Roll control (A/D keys)
        addKeyInput('droneRoll', 'KeyA', -1, 0);
        addKeyInput('droneRoll', 'KeyD', 1, 0);

        // Pitch control (W/S keys)
        addKeyInput('dronePitch', 'KeyW', -1, 0);
        addKeyInput('dronePitch', 'KeyS', 1, 0);

        // Yaw control (Q/E keys)
        addKeyInput('droneYaw', 'KeyQ', -1, 0);
        addKeyInput('droneYaw', 'KeyE', 1, 0);

        // Throttle control (ArrowUp/ArrowDown keys)
        addKeyInput('Throttle', 'ArrowUp', 1, 0); // Increase throttle
        addKeyInput('Throttle', 'ArrowDown', -1, 0); // Decrease throttle
    }

    update(dt) { // Assume dt (delta time) is passed to update
        // Get input values
        const rollInput = getInputValue('droneRoll');
        const pitchInput = getInputValue('dronePitch');
        const yawInput = getInputValue('droneYaw');

        // Get throttle input (now controlled by ArrowUp/ArrowDown)
        const throttleInput = getInputValue('Throttle'); // Value is 1 for up, -1 for down, 0 otherwise

        // Gradually adjust thrust based on input
        if (throttleInput !== 0) {
            // Corrected throttle logic: Increase thrust with ArrowUp (1), decrease with ArrowDown (-1)
            this.currentThrust += throttleInput * this.thrustChangeSpeed * dt;
            this.currentThrust = Math.max(0, Math.min(1, this.currentThrust)); // Clamp thrust between 0 and 1
        }

        // Apply inputs to drone
        this.drone.setEngineInput(this.currentThrust);
        this.drone.setRollInput(rollInput);
        this.drone.setPitchInput(pitchInput);
        this.drone.setYawInput(yawInput);
    }
}