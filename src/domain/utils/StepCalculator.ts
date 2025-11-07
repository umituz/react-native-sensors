/**
 * Step Calculator Utility
 *
 * Converts raw step counts into meaningful metrics like distance and calories.
 * Uses standard formulas and configurable parameters.
 */

import type { IStepCalculator } from '../interfaces/ISensorService';

export class StepCalculator implements IStepCalculator {
  /**
   * Default stride length in meters (average adult)
   */
  private static readonly DEFAULT_STRIDE_LENGTH = 0.76;

  /**
   * Default weight in kilograms (average adult)
   */
  private static readonly DEFAULT_WEIGHT_KG = 70;

  /**
   * Default walking pace in steps per minute
   */
  private static readonly DEFAULT_STEPS_PER_MINUTE = 120;

  /**
   * Calories burned per 1000 steps (average)
   */
  private static readonly CALORIES_PER_1000_STEPS = 45;

  /**
   * Calculate distance from steps
   * Formula: steps × stride_length / 1000 (to get km)
   */
  calculateDistance(steps: number, strideLength: number = StepCalculator.DEFAULT_STRIDE_LENGTH): number {
    const distanceMeters = steps * strideLength;
    const distanceKm = distanceMeters / 1000;
    return parseFloat(distanceKm.toFixed(2));
  }

  /**
   * Calculate calories burned from steps
   * Formula: (steps / 1000) × calories_per_1000_steps × weight_factor
   */
  calculateCalories(steps: number, weightKg: number = StepCalculator.DEFAULT_WEIGHT_KG): number {
    // Weight factor: adjust calories based on user weight
    const weightFactor = weightKg / StepCalculator.DEFAULT_WEIGHT_KG;
    const baseCalories = (steps / 1000) * StepCalculator.CALORIES_PER_1000_STEPS;
    const adjustedCalories = baseCalories * weightFactor;
    return Math.floor(adjustedCalories);
  }

  /**
   * Calculate active minutes from steps
   * Formula: steps / steps_per_minute
   */
  calculateActiveMinutes(steps: number, stepsPerMinute: number = StepCalculator.DEFAULT_STEPS_PER_MINUTE): number {
    return Math.floor(steps / stepsPerMinute);
  }

  /**
   * Calculate steps needed to reach a distance goal
   */
  static stepsForDistance(distanceKm: number, strideLength: number = StepCalculator.DEFAULT_STRIDE_LENGTH): number {
    const distanceMeters = distanceKm * 1000;
    return Math.ceil(distanceMeters / strideLength);
  }

  /**
   * Calculate steps needed to burn calorie goal
   */
  static stepsForCalories(calories: number, weightKg: number = StepCalculator.DEFAULT_WEIGHT_KG): number {
    const weightFactor = weightKg / StepCalculator.DEFAULT_WEIGHT_KG;
    const steps = (calories / StepCalculator.CALORIES_PER_1000_STEPS / weightFactor) * 1000;
    return Math.ceil(steps);
  }

  /**
   * Estimate average pace from steps and time
   * Returns steps per minute
   */
  static calculatePace(steps: number, minutes: number): number {
    if (minutes === 0) return 0;
    return Math.floor(steps / minutes);
  }
}

// Singleton instance
export const stepCalculator = new StepCalculator();
