/**
 * Mock Sensor Adapter
 *
 * Implementation of ISensorService using mock data.
 * Useful for development, testing, and when real sensors are not available.
 * Simulates realistic step counting behavior.
 */

import type { ISensorService } from '../../domain/interfaces/ISensorService';
import type { StepData, DailyStepData } from '../../domain/entities/StepData';
import type { StepUpdate, SensorAvailability, SensorPermission } from '../../domain/entities/SensorReading';
import { stepCalculator } from '../../domain/utils/StepCalculator';

export class MockSensorAdapter implements ISensorService {
  private intervalId: NodeJS.Timeout | null = null;
  private currentSteps: number = 0;
  private isRunning: boolean = false;

  /**
   * Mock sensor is always available
   */
  async isAvailable(): Promise<SensorAvailability> {
    return {
      isAvailable: true,
      sensorType: 'pedometer',
    };
  }

  /**
   * Mock permissions are always granted
   */
  async requestPermissions(): Promise<SensorPermission> {
    return {
      granted: true,
      canAskAgain: true,
      status: 'granted',
    };
  }

  /**
   * Start simulating step counting
   * Adds 1-5 steps every 3 seconds to simulate walking
   */
  async startStepCounting(callback: (update: StepUpdate) => void): Promise<() => void> {
    if (this.isRunning) {
      await this.stopStepCounting();
    }

    this.isRunning = true;
    this.currentSteps = 0;

    this.intervalId = setInterval(() => {
      // Simulate random steps (1-5 steps every 3 seconds)
      const newSteps = Math.floor(Math.random() * 5) + 1;
      this.currentSteps += newSteps;

      callback({
        steps: this.currentSteps,
        timestamp: new Date(),
        stepsSinceLastUpdate: newSteps,
      });
    }, 3000);

    // Return cleanup function
    return () => this.stopStepCounting();
  }

  /**
   * Stop simulating step counting
   */
  async stopStepCounting(): Promise<void> {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    this.currentSteps = 0;
  }

  /**
   * Get mock step count for a time range
   */
  async getStepCount(startDate: Date, endDate: Date): Promise<StepData> {
    // Generate realistic mock steps based on time range
    const hours = Math.abs(endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60);
    const baseSteps = Math.floor(hours * 400); // ~400 steps per hour (light activity)
    const variation = Math.floor(Math.random() * 200) - 100; // ±100 steps variation
    const steps = Math.max(0, baseSteps + variation);

    return {
      id: `mock-${startDate.getTime()}-${endDate.getTime()}`,
      steps,
      distance: stepCalculator.calculateDistance(steps),
      calories: stepCalculator.calculateCalories(steps),
      activeMinutes: stepCalculator.calculateActiveMinutes(steps),
      startDate,
      endDate,
      source: 'mock',
    };
  }

  /**
   * Get mock today's steps
   */
  async getTodaySteps(): Promise<StepData> {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);

    // Generate realistic steps for current time of day
    const hour = now.getHours();
    const steps = this.generateRealisticDailySteps(hour);

    return {
      id: `mock-today-${now.getTime()}`,
      steps,
      distance: stepCalculator.calculateDistance(steps),
      calories: stepCalculator.calculateCalories(steps),
      activeMinutes: stepCalculator.calculateActiveMinutes(steps),
      startDate: startOfDay,
      endDate: now,
      source: 'mock',
    };
  }

  /**
   * Get mock historical steps
   */
  async getHistoricalSteps(days: number): Promise<DailyStepData[]> {
    const historicalData: DailyStepData[] = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);

      const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
      const endOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      // Generate realistic daily steps
      const isWeekend = date.getDay() === 0 || date.getDay() === 6;
      const baseSteps = isWeekend
        ? Math.floor(Math.random() * 11000) + 4000  // 4k-15k weekend
        : Math.floor(Math.random() * 5000) + 7000;  // 7k-12k weekday

      const steps = baseSteps;
      const goalTarget = 10000;

      historicalData.push({
        id: `mock-${date.getTime()}`,
        steps,
        distance: stepCalculator.calculateDistance(steps),
        calories: stepCalculator.calculateCalories(steps),
        activeMinutes: stepCalculator.calculateActiveMinutes(steps),
        startDate: startOfDay,
        endDate: endOfDay,
        source: 'mock',
        hourlyData: this.generateHourlyData(steps),
        goalMet: steps >= goalTarget,
        goalTarget,
      });
    }

    return historicalData.reverse(); // Return oldest to newest
  }

  /**
   * Generate realistic daily steps based on current hour
   */
  private generateRealisticDailySteps(currentHour: number): number {
    // Simulate realistic accumulation throughout the day
    const stepsPerHour = [
      100, 100, 50, 50, 50, 200,    // 0-5 AM (sleep + wake up)
      800, 1200,                     // 6-7 AM (morning routine)
      1500, 1200, 800, 600,          // 8-11 AM (commute, work)
      1000,                          // 12 PM (lunch)
      500, 400, 400, 500,            // 1-4 PM (work)
      1200, 1500,                    // 5-6 PM (commute, gym)
      800, 600, 400, 200,            // 7-10 PM (evening)
      100, 100,                      // 11 PM-12 AM
    ];

    let totalSteps = 0;
    for (let hour = 0; hour <= currentHour && hour < 24; hour++) {
      totalSteps += stepsPerHour[hour] || 0;
    }

    return totalSteps;
  }

  /**
   * Generate hourly breakdown data
   */
  private generateHourlyData(totalSteps: number): Array<{ hour: number; steps: number; timestamp: Date }> {
    const distribution = [
      0.01, 0.01, 0.01, 0.01, 0.01, 0.02, // 0-5 AM (sleep)
      0.08, 0.12,                         // 6-7 AM (wake up)
      0.15, 0.12, 0.08, 0.06,             // 8-11 AM (commute, work)
      0.10,                               // 12 PM (lunch)
      0.05, 0.04, 0.04, 0.05,             // 1-4 PM (work)
      0.12, 0.15,                         // 5-6 PM (commute, gym)
      0.08, 0.06, 0.04, 0.02,             // 7-10 PM (evening)
      0.01, 0.01,                         // 11 PM-12 AM
    ];

    return distribution.map((percentage, hour) => ({
      hour,
      steps: Math.floor(totalSteps * percentage),
      timestamp: new Date(new Date().setHours(hour, 0, 0, 0)),
    }));
  }
}
