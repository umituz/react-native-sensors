/**
 * Sensors Domain - Barrel Export
 *
 * Public API for the sensors domain.
 * Provides step counting, sensor management, and historical data access.
 *
 * Usage:
 * ```typescript
 * import { useStepCounter, StepData } from '@umituz/react-native-sensors';
 *
 * const { steps, distance, calories, todaySteps } = useStepCounter();
 * ```
 */

// ===================================================================
// PRESENTATION LAYER - React Hooks
// ===================================================================
export { useStepCounter } from './presentation/hooks/useStepCounter';
export type { UseStepCounterReturn } from './presentation/hooks/useStepCounter';

// ===================================================================
// DOMAIN LAYER - Entities
// ===================================================================
export type {
  StepData,
  DailyStepData,
  HourlyStepData,
} from './domain/entities/StepData';

export type {
  SensorReading,
  StepUpdate,
  SensorAvailability,
  SensorPermission,
} from './domain/entities/SensorReading';

// ===================================================================
// DOMAIN LAYER - Interfaces
// ===================================================================
export type {
  ISensorService,
  IStepCalculator,
} from './domain/interfaces/ISensorService';

// ===================================================================
// INFRASTRUCTURE LAYER - Adapters
// ===================================================================
export { MockSensorAdapter } from './infrastructure/adapters/MockSensorAdapter';
export { ExpoPedometerAdapter } from './infrastructure/adapters/ExpoPedometerAdapter';

// ===================================================================
// DOMAIN LAYER - Utils
// ===================================================================
export { StepCalculator, stepCalculator } from './domain/utils/StepCalculator';
