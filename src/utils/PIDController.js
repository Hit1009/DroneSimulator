export class PIDController {
    constructor(kp, ki, kd, setpoint = 0) {
        this.kp = kp; // Proportional gain
        this.ki = ki; // Integral gain
        this.kd = kd; // Derivative gain

        this.setpoint = setpoint; // Desired value

        this.lastError = 0;
        this.integral = 0;
        this.lastTime = null;
    }

    setTarget(setpoint) {
        this.setpoint = setpoint;
        // Optional: Reset integral and derivative terms when setpoint changes significantly
        // this.reset(); 
    }

    update(currentValue, dt) {
        const error = this.setpoint - currentValue;

        // Proportional term
        const p = this.kp * error;

        // Integral term (with anti-windup)
        this.integral += error * dt;
        // Basic anti-windup: Clamp integral term if needed (adjust limits as necessary)
        const maxIntegral = 1.0; // Example limit
        this.integral = Math.max(-maxIntegral, Math.min(maxIntegral, this.integral));
        const i = this.ki * this.integral;

        // Derivative term
        const derivative = (error - this.lastError) / dt;
        const d = this.kd * derivative;

        // Update state for next iteration
        this.lastError = error;

        // Calculate output
        const output = p + i + d;

        // Clamp output if necessary (e.g., throttle between 0 and 1)
        // output = Math.max(0, Math.min(1, output));

        return output;
    }

    reset() {
        this.lastError = 0;
        this.integral = 0;
        this.lastTime = null;
    }
}