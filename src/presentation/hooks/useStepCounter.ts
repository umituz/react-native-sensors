/**
 * useStepCounter Hook
 *
 * Main hook for accessing step counting functionality.
 * Provides real-time step updates and historical data.
 *
 * Usage:
 * ```typescript
 * const { todaySteps, isCountingSteps, startCounting, stopCounting } = useStepCounter();
 * ```
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { StepData } from '../../domain/entities/StepData';
import type { StepUpdate } from '../../domain/entities/SensorReading';
import { ExpoPedometerAdapter } from '../../infrastructure/adapters/ExpoPedometerAdapter';

export interface UseStepCounterReturn {
  /**
   * Current step count for today
   */
  steps: number;

  /**
   * Distance walked today (km)
   */
  distance: number;

  /**
   * Calories burned today
   */
  calories: number;

  /**
   * Active minutes today
   */
  activeMinutes: number;

  /**
   * Whether step counting is currently active
   */
  isCountingSteps: boolean;

  /**
   * Whether sensor is available on device
   */
  isAvailable: boolean;

  /**
   * Whether permissions are granted
   */
  hasPermission: boolean;

  /**
   * Complete today's step data
   */
  todaySteps: StepData | null;

  /**
   * Error message if any
   */
  error: string | null;

  /**
   * Start real-time step counting
   */
  startCounting: () => Promise<void>;

  /**
   * Stop real-time step counting
   */
  stopCounting: () => Promise<void>;

  /**
   * Refresh today's step data
   */
  refreshData: () => Promise<void>;

  /**
   * Request sensor permissions
   */
  requestPermissions: () => Promise<boolean>;
}

export const useStepCounter = (autoStart: boolean = true): UseStepCounterReturn => {
  // State
  const [steps, setSteps] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [calories, setCalories] = useState<number>(0);
  const [activeMinutes, setActiveMinutes] = useState<number>(0);
  const [isCountingSteps, setIsCountingSteps] = useState<boolean>(false);
  const [isAvailable, setIsAvailable] = useState<boolean>(false);
  const [hasPermission, setHasPermission] = useState<boolean>(false);
  const [todaySteps, setTodaySteps] = useState<StepData | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Refs
  const sensorService = useRef(new ExpoPedometerAdapter());
  const cleanupFn = useRef<(() => void) | null>(null);

  /**
   * Check sensor availability and permissions on mount
   */
  useEffect(() => {
    const checkAvailability = async () => {
      try {
        const availability = await sensorService.current.isAvailable();
        setIsAvailable(availability.isAvailable);

        if (!availability.isAvailable) {
          setError(availability.error || 'Sensor not available');
          return;
        }

        const permission = await sensorService.current.requestPermissions();
        setHasPermission(permission.granted);

        if (!permission.granted) {
          setError('Permission not granted');
          return;
        }

        // Get today's initial data
        await refreshData();

        // Auto-start if enabled
        if (autoStart) {
          await startCounting();
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      }
    };

    checkAvailability();

    // Cleanup on unmount
    return () => {
      if (cleanupFn.current) {
        cleanupFn.current();
      }
    };
  }, []);

  /**
   * Start real-time step counting
   */
  const startCounting = useCallback(async () => {
    if (!isAvailable || !hasPermission) {
      setError('Sensor not available or permission not granted');
      return;
    }

    if (isCountingSteps) {
      return; // Already counting
    }

    try {
      cleanupFn.current = await sensorService.current.startStepCounting((update: StepUpdate) => {
        setSteps(update.steps);
        // Note: Real-time updates don't include distance/calories
        // Those are calculated when getting full step data
      });

      setIsCountingSteps(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start counting');
    }
  }, [isAvailable, hasPermission, isCountingSteps]);

  /**
   * Stop real-time step counting
   */
  const stopCounting = useCallback(async () => {
    try {
      await sensorService.current.stopStepCounting();
      if (cleanupFn.current) {
        cleanupFn.current();
        cleanupFn.current = null;
      }
      setIsCountingSteps(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop counting');
    }
  }, []);

  /**
   * Refresh today's step data
   */
  const refreshData = useCallback(async () => {
    try {
      const data = await sensorService.current.getTodaySteps();
      setTodaySteps(data);
      setSteps(data.steps);
      setDistance(data.distance);
      setCalories(data.calories);
      setActiveMinutes(data.activeMinutes);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh data');
    }
  }, []);

  /**
   * Request sensor permissions
   */
  const requestPermissions = useCallback(async (): Promise<boolean> => {
    try {
      const permission = await sensorService.current.requestPermissions();
      setHasPermission(permission.granted);
      return permission.granted;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to request permissions');
      return false;
    }
  }, []);

  return {
    steps,
    distance,
    calories,
    activeMinutes,
    isCountingSteps,
    isAvailable,
    hasPermission,
    todaySteps,
    error,
    startCounting,
    stopCounting,
    refreshData,
    requestPermissions,
  };
};
