/**
 * Step Data Entity
 *
 * Represents a collection of step-related measurements for a specific time period.
 * This is the core business entity for step counting.
 */

export interface StepData {
  /**
   * Unique identifier for this step data record
   */
  id: string;

  /**
   * Total number of steps for this time period
   */
  steps: number;

  /**
   * Distance traveled in kilometers
   * Calculated based on step count and average stride length
   */
  distance: number;

  /**
   * Calories burned during this activity
   * Calculated based on steps, user weight, and activity intensity
   */
  calories: number;

  /**
   * Total active minutes
   * Calculated based on step count and pace
   */
  activeMinutes: number;

  /**
   * Start timestamp of the measurement period
   */
  startDate: Date;

  /**
   * End timestamp of the measurement period
   */
  endDate: Date;

  /**
   * Source of the data (pedometer, healthkit, googlefit, mock)
   */
  source: 'pedometer' | 'healthkit' | 'googlefit' | 'mock';
}

/**
 * Hourly step breakdown
 */
export interface HourlyStepData {
  /**
   * Hour of the day (0-23)
   */
  hour: number;

  /**
   * Steps taken during this hour
   */
  steps: number;

  /**
   * Timestamp of this hour
   */
  timestamp: Date;
}

/**
 * Daily step summary with hourly breakdown
 */
export interface DailyStepData extends StepData {
  /**
   * Hourly breakdown of steps throughout the day
   */
  hourlyData: HourlyStepData[];

  /**
   * Whether the daily goal was met
   */
  goalMet: boolean;

  /**
   * Daily goal target (for comparison)
   */
  goalTarget: number;
}
