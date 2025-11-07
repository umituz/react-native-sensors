/**
 * Expo Pedometer Adapter
 *
 * Implementation of ISensorService using Expo's Pedometer API.
 * Works on iOS and Android devices with pedometer hardware.
 */

import { Pedometer } from 'expo-sensors';
import type { ISensorService } from '../../domain/interfaces/ISensorService';
import type { StepData, DailyStepData } from '../../domain/entities/StepData';
import type { StepUpdate, SensorAvailability, SensorPermission } from '../../domain/entities/SensorReading';
import { stepCalculator } from '../../domain/utils/StepCalculator';

export class ExpoPedometerAdapter implements ISensorService {
  private subscription: { remove: () => void } | null = null;
  private lastStepCount: number = 0;

  /**
   * Check if pedometer is available on this device
   */
  async isAvailable(): Promise<SensorAvailability> {
    try {
      const available = await Pedometer.isAvailableAsync();
      return {
        isAvailable: available,
        sensorType: available ? 'pedometer' : undefined,
        error: available ? undefined : 'Pedometer not available on this device',
      };
    } catch (error) {
      return {
        isAvailable: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Request permissions for pedometer access
   * Note: Expo Pedometer doesn't require explicit permissions on most devices
   */
  async requestPermissions(): Promise<SensorPermission> {
    const availability = await this.isAvailable();

    if (!availability.isAvailable) {
      return {
        granted: false,
        canAskAgain: false,
        status: 'denied',
      };
    }

    return {
      granted: true,
      canAskAgain: true,
      status: 'granted',
    };
  }

  /**
   * Start listening to real-time step updates
   */
  async startStepCounting(callback: (update: StepUpdate) => void): Promise<() => void> {
    // Stop any existing subscription
    if (this.subscription) {
      this.subscription.remove();
    }

    // Start new subscription
    this.subscription = Pedometer.watchStepCount((result) => {
      const steps = result.steps;
      const stepsSinceLastUpdate = steps - this.lastStepCount;
      this.lastStepCount = steps;

      callback({
        steps,
        timestamp: new Date(),
        stepsSinceLastUpdate: stepsSinceLastUpdate > 0 ? stepsSinceLastUpdate : undefined,
      });
    });

    // Return cleanup function
    return () => {
      if (this.subscription) {
        this.subscription.remove();
        this.subscription = null;
      }
    };
  }

  /**
   * Stop listening to step updates
   */
  async stopStepCounting(): Promise<void> {
    if (this.subscription) {
      this.subscription.remove();
      this.subscription = null;
    }
    this.lastStepCount = 0;
  }

  /**
   * Get step count for a specific time range
   */
  async getStepCount(startDate: Date, endDate: Date): Promise<StepData> {
    try {
      const result = await Pedometer.getStepCountAsync(startDate, endDate);
      const steps = result?.steps ?? 0;

      return {
        id: `${startDate.getTime()}-${endDate.getTime()}`,
        steps,
        distance: stepCalculator.calculateDistance(steps),
        calories: stepCalculator.calculateCalories(steps),
        activeMinutes: stepCalculator.calculateActiveMinutes(steps),
        startDate,
        endDate,
        source: 'pedometer',
      };
    } catch (error) {
      return {
        id: `${startDate.getTime()}-${endDate.getTime()}`,
        steps: 0,
        distance: 0,
        calories: 0,
        activeMinutes: 0,
        startDate,
        endDate,
        source: 'pedometer',
      };
    }
  }

  /**
   * Get today's step data
   */
  async getTodaySteps(): Promise<StepData> {
    const today = new Date();
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 0, 0, 0);
    const now = new Date();

    return this.getStepCount(startOfDay, now);
  }

  /**
   * Get step data for the past N days
   */
  async getHistoricalSteps(days: number): Promise<DailyStepData[]> {
    const historicalData: DailyStepData[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      const dayData = await this.getStepCount(startOfDay, endOfDay);
      const goalTarget = 10000; // Default goal, could be configurable

      // Get hourly breakdown for this day
      const hourlyData = await this.getHourlyBreakdown(startOfDay, endOfDay);

      historicalData.push({
        ...dayData,
        hourlyData,
        goalMet: dayData.steps >= goalTarget,
        goalTarget,
      });
    }

    return historicalData.reverse(); // Return oldest to newest
  }

  /**
   * Get hourly breakdown for a specific day
   * Note: Expo Pedometer doesn't provide hourly data directly,
   * so we need to query hour by hour
   */
  private async getHourlyBreakdown(startOfDay: Date, endOfDay: Date): Promise<Array<{ hour: number; steps: number; timestamp: Date }>> {
    const hourlyData: Array<{ hour: number; steps: number; timestamp: Date }> = [];

    for (let hour = 0; hour < 24; hour++) {
      const hourStart = new Date(startOfDay);
      hourStart.setHours(hour, 0, 0, 0);

      const hourEnd = new Date(startOfDay);
      hourEnd.setHours(hour, 59, 59, 999);

      try {
        const result = await Pedometer.getStepCountAsync(hourStart, hourEnd);
        hourlyData.push({
          hour,
          steps: result?.steps ?? 0,
          timestamp: hourStart,
        });
      } catch {
        hourlyData.push({
          hour,
          steps: 0,
          timestamp: hourStart,
        });
      }
    }

    return hourlyData;
  }
}
