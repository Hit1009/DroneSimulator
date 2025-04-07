import { addKeyInput, getInputValue } from "./inputManager.js";

export class DroneController {
    constructor(drone) {
        this.drone = drone;
        this.setupInputs();
    }

    setupInputs() {
        // Throttle control (Up/Down arrows)
        addKeyInput('droneThrottle', 'ArrowUp', 1, 0);
        addKeyInput('droneThrottle', 'ArrowDown', -1, 0);

        // Roll control (A/D keys)
        addKeyInput('droneRoll', 'KeyA', -1, 0);
        addKeyInput('droneRoll', 'KeyD', 1, 0);

        // Pitch control (W/S keys)
        addKeyInput('dronePitch', 'KeyW', -1, 0);
        addKeyInput('dronePitch', 'KeyS', 1, 0);

        // Yaw control (Q/E keys)
        addKeyInput('droneYaw', 'KeyQ', -1, 0);
        addKeyInput('droneYaw', 'KeyE', 1, 0);
    }

    update() {
        // Get input values
        const throttleInput = getInputValue('droneThrottle');
        const rollInput = getInputValue('droneRoll');
        const pitchInput = getInputValue('dronePitch');
        const yawInput = getInputValue('droneYaw');

        // Apply inputs to drone
        this.drone.setEngineInput(throttleInput * 0.5 + 0.5); // Map -1,1 to 0,1 with better control range
        this.drone.setRollInput(rollInput);
        this.drone.setPitchInput(pitchInput);
        this.drone.setYawInput(yawInput);
    }
}