/**
 * Sensor Reading Entity
 *
 * Represents a raw reading from the device's pedometer sensor.
 * This is the low-level data structure received from sensor APIs.
 */

export interface SensorReading {
  /**
   * Number of steps detected
   */
  steps: number;

  /**
   * Timestamp when this reading was taken
   */
  timestamp: Date;

  /**
   * Source sensor type
   */
  sensorType: 'pedometer' | 'accelerometer' | 'healthkit' | 'googlefit';
}

/**
 * Real-time step update
 */
export interface StepUpdate {
  /**
   * Current step count
   */
  steps: number;

  /**
   * Timestamp of the update
   */
  timestamp: Date;

  /**
   * Steps since last update (delta)
   */
  stepsSinceLastUpdate?: number;
}

/**
 * Sensor availability status
 */
export interface SensorAvailability {
  /**
   * Whether the sensor is available on this device
   */
  isAvailable: boolean;

  /**
   * Sensor type that is available
   */
  sensorType?: 'pedometer' | 'accelerometer' | 'healthkit' | 'googlefit';

  /**
   * Error message if sensor is not available
   */
  error?: string;
}

/**
 * Sensor permission status
 */
export interface SensorPermission {
  /**
   * Whether permission is granted
   */
  granted: boolean;

  /**
   * Whether permission can be requested
   */
  canAskAgain: boolean;

  /**
   * Permission status
   */
  status: 'granted' | 'denied' | 'undetermined';
}
