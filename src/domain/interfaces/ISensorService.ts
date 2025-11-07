/**
 * Sensor Service Interface
 *
 * Defines the contract for sensor implementations.
 * Different platforms (iOS, Android, Web) can have different adapters
 * that implement this interface.
 */

import type { StepData, DailyStepData } from '../entities/StepData';
import type { StepUpdate, SensorAvailability, SensorPermission } from '../entities/SensorReading';

export interface ISensorService {
  /**
   * Check if the sensor is available on this device
   */
  isAvailable(): Promise<SensorAvailability>;

  /**
   * Request necessary permissions for sensor access
   */
  requestPermissions(): Promise<SensorPermission>;

  /**
   * Start listening to real-time step updates
   * @param callback Function called when steps update
   * @returns Cleanup function to stop listening
   */
  startStepCounting(callback: (update: StepUpdate) => void): Promise<() => void>;

  /**
   * Stop listening to step updates
   */
  stopStepCounting(): Promise<void>;

  /**
   * Get step count for a specific time range
   * @param startDate Start of the time range
   * @param endDate End of the time range
   */
  getStepCount(startDate: Date, endDate: Date): Promise<StepData>;

  /**
   * Get today's step data
   */
  getTodaySteps(): Promise<StepData>;

  /**
   * Get step data for the past N days
   * @param days Number of days to retrieve
   */
  getHistoricalSteps(days: number): Promise<DailyStepData[]>;
}

/**
 * Step calculator utility
 * Converts raw step counts into distance, calories, etc.
 */
export interface IStepCalculator {
  /**
   * Calculate distance from steps
   * @param steps Number of steps
   * @param strideLength Average stride length in meters (default: 0.76m)
   */
  calculateDistance(steps: number, strideLength?: number): number;

  /**
   * Calculate calories burned from steps
   * @param steps Number of steps
   * @param weightKg User weight in kilograms (default: 70kg)
   */
  calculateCalories(steps: number, weightKg?: number): number;

  /**
   * Calculate active minutes from steps
   * @param steps Number of steps
   * @param stepsPerMinute Average walking pace (default: 120 steps/min)
   */
  calculateActiveMinutes(steps: number, stepsPerMinute?: number): number;
}
