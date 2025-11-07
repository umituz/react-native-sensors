# Sensors Domain

Comprehensive sensor integration domain for step counting and activity tracking in React Native apps using Expo Pedometer API.

## Overview

The sensors domain provides a complete DDD-architected solution for integrating device sensors (pedometer, accelerometer) into React Native apps. It includes both real sensor implementations and mock adapters for development/testing.

## Architecture

Following strict Domain-Driven Design (DDD) principles:

```
domains/sensors/
├── domain/                     # Business logic & rules
│   ├── entities/              # Data models
│   │   ├── StepData.ts        # Step count data structures
│   │   └── SensorReading.ts   # Sensor reading types
│   ├── interfaces/            # Contracts
│   │   └── ISensorService.ts  # Service interface
│   └── utils/                 # Business utilities
│       └── StepCalculator.ts  # Distance/calorie calculations
├── infrastructure/            # External integrations
│   └── adapters/              # Sensor implementations
│       ├── ExpoPedometerAdapter.ts  # Real Expo Pedometer
│       └── MockSensorAdapter.ts     # Mock for dev/testing
└── presentation/              # React components & hooks
    └── hooks/
        └── useStepCounter.ts  # Main React hook
```

## Features

### ✅ Real Sensor Integration
- **Expo Pedometer API**: iOS and Android hardware pedometer support
- **Real-time Updates**: Live step counting with callbacks
- **Historical Data**: Query step counts for specific time ranges
- **Permission Management**: Automatic permission requests
- **Availability Checking**: Device capability detection

### ✅ Mock Adapter for Development
- **Realistic Simulation**: Generates 1-5 steps every 3 seconds
- **Historical Data**: Creates realistic daily patterns
- **No Hardware Required**: Works in simulators and development
- **Easy Switching**: Toggle between real and mock via Handlebars flag

### ✅ Step Calculations
- **Distance**: Converts steps to kilometers (default stride: 0.76m)
- **Calories**: Estimates calories burned (45 per 1000 steps)
- **Active Minutes**: Calculates active time (120 steps/min pace)
- **Customizable**: Override stride length, weight, pace

### ✅ Data Management
- **Today's Steps**: Get current day step count
- **Historical Steps**: Fetch past N days with hourly breakdowns
- **Time Range Query**: Get steps between any two dates
- **Hourly Breakdown**: 24-hour step distribution

## Usage

### Basic Integration

```typescript
import { useStepCounter } from '@umituz/react-native-sensors';

function HomeScreen() {
  const {
    steps,              // Current step count
    distance,           // Distance in km
    calories,           // Calories burned
    activeMinutes,      // Active minutes
    isCountingSteps,    // Whether counting is active
    isAvailable,        // Sensor availability
    hasPermission,      // Permission status
    todaySteps,         // Complete StepData for today
    error,              // Error message if any
    startCounting,      // Start real-time counting
    stopCounting,       // Stop counting
    refreshData,        // Refresh today's data
  } = useStepCounter();

  return (
    <View>
      <Text>Steps: {steps.toLocaleString()}</Text>
      <Text>Distance: {distance.toFixed(2)} km</Text>
      <Text>Calories: {calories}</Text>
      <Text>Active: {activeMinutes} min</Text>

      <Button
        onPress={isCountingSteps ? stopCounting : startCounting}
        disabled={!isAvailable || !hasPermission}
      >
        {isCountingSteps ? 'Stop' : 'Start'} Counting
      </Button>
    </View>
  );
}
```

### Advanced Usage

```typescript
import {
  useStepCounter,
  StepData,
  DailyStepData,
  ExpoPedometerAdapter,
} from '@domains/sensors';

// Custom sensor service instance
const sensorService = new ExpoPedometerAdapter();

// Query historical data
const historicalSteps = await sensorService.getHistoricalSteps(30); // Last 30 days

// Query specific time range
const startDate = new Date('2025-01-01');
const endDate = new Date('2025-01-31');
const januarySteps = await sensorService.getStepCount(startDate, endDate);

// Custom step calculations
import { stepCalculator } from '@umituz/react-native-sensors';

const distance = stepCalculator.calculateDistance(10000, 0.8); // Custom stride
const calories = stepCalculator.calculateCalories(10000, 75); // Custom weight
const minutes = stepCalculator.calculateActiveMinutes(10000, 100); // Custom pace
```

## Configuration

### Enable/Disable Mock Sensors

Toggle between real and mock sensors via Handlebars template variable:

```typescript
// In template files (.template)
{{#if USE_MOCK_SENSORS}}
  import { MockSensorAdapter } from '@umituz/react-native-sensors';
  const sensorService = new MockSensorAdapter();
{{else}}
  import { ExpoPedometerAdapter } from '@umituz/react-native-sensors';
  const sensorService = new ExpoPedometerAdapter();
{{/if}}
```

Set `USE_MOCK_SENSORS` in your app's YAML configuration:

```yaml
# app.yaml
template_config:
  USE_MOCK_SENSORS: false  # Use real sensors
  # or
  USE_MOCK_SENSORS: true   # Use mock sensors for development
```

## Types Reference

### StepData
```typescript
interface StepData {
  id: string;
  steps: number;
  distance: number;        // km
  calories: number;
  activeMinutes: number;
  startDate: Date;
  endDate: Date;
  source: 'pedometer' | 'healthkit' | 'googlefit' | 'mock';
}
```

### DailyStepData
```typescript
interface DailyStepData extends StepData {
  hourlyData: HourlyStepData[];
  goalMet: boolean;
  goalTarget: number;
}

interface HourlyStepData {
  hour: number;        // 0-23
  steps: number;
  timestamp: Date;
}
```

### SensorReading
```typescript
interface SensorReading {
  steps: number;
  timestamp: Date;
  sensorType: 'pedometer' | 'accelerometer' | 'healthkit' | 'googlefit';
}

interface StepUpdate {
  steps: number;
  timestamp: Date;
  stepsSinceLastUpdate?: number;
}
```

### SensorAvailability
```typescript
interface SensorAvailability {
  isAvailable: boolean;
  sensorType?: 'pedometer' | 'accelerometer' | 'healthkit' | 'googlefit';
  error?: string;
}
```

### SensorPermission
```typescript
interface SensorPermission {
  granted: boolean;
  canAskAgain: boolean;
  status: 'granted' | 'denied' | 'undetermined';
}
```

## Platform Support

| Platform | Real Sensors | Mock Sensors |
|----------|-------------|--------------|
| iOS | ✅ (Pedometer) | ✅ |
| Android | ✅ (Pedometer) | ✅ |
| Web | ❌ | ✅ |

**Note**: Real sensor support requires physical device with pedometer hardware. Simulators/emulators should use mock adapter.

## Step Calculation Formulas

### Distance
```
distance (km) = steps × stride_length / 1000
Default stride: 0.76m (average adult)
```

### Calories
```
calories = (steps / 1000) × 45 × weight_factor
Default: 45 calories per 1000 steps
Weight factor: user_weight_kg / 70
```

### Active Minutes
```
active_minutes = steps / steps_per_minute
Default pace: 120 steps/minute
```

## Best Practices

### 1. Permission Handling
```typescript
const { hasPermission, requestPermissions } = useStepCounter();

useEffect(() => {
  if (!hasPermission) {
    requestPermissions();
  }
}, [hasPermission]);
```

### 2. Error Handling
```typescript
const { error, isAvailable } = useStepCounter();

if (!isAvailable) {
  return <Text>Sensor not available on this device</Text>;
}

if (error) {
  return <Text>Error: {error}</Text>;
}
```

### 3. Cleanup
```typescript
// useStepCounter automatically handles cleanup on unmount
// No manual cleanup needed!

useEffect(() => {
  // Hook manages subscription cleanup internally
}, []);
```

### 4. Auto-Start vs Manual Start
```typescript
// Auto-start (default)
const hook = useStepCounter(); // Starts counting immediately

// Manual start
const hook = useStepCounter(false); // Don't auto-start
// Later...
hook.startCounting();
```

## Mock Data Patterns

The MockSensorAdapter generates realistic step patterns:

### Daily Distribution
- **0-5 AM**: 100-200 steps (sleep + wake up)
- **6-7 AM**: 800-1200 steps (morning routine)
- **8-11 AM**: 1500-800 steps (commute, work)
- **12 PM**: 1000 steps (lunch)
- **1-4 PM**: 400-500 steps (work)
- **5-6 PM**: 1200-1500 steps (commute, gym)
- **7-10 PM**: 800-200 steps (evening)
- **11 PM-12 AM**: 100 steps

### Weekly Patterns
- **Weekday**: 7,000-12,000 steps (more active)
- **Weekend**: 4,000-15,000 steps (varied activity)

## Dependencies

```json
{
  "expo-sensors": "~14.0.0"  // For Expo Pedometer API
}
```

**Note**: Dependencies are automatically managed by Expo SDK. No manual installation required.

## Troubleshooting

### Issue: Sensor not available
- **Cause**: Device lacks pedometer hardware
- **Solution**: Use MockSensorAdapter for development

### Issue: Permission denied
- **Cause**: User denied sensor permissions
- **Solution**: Show explanation and request permissions again

### Issue: No step updates
- **Cause**: Counting not started or sensor sleeping
- **Solution**: Call `startCounting()` and ensure device motion

### Issue: Incorrect step counts
- **Cause**: Sensor calibration or stride mismatch
- **Solution**: Adjust stride length in step calculations

## Future Enhancements

- [ ] HealthKit integration (iOS)
- [ ] Google Fit integration (Android)
- [ ] Accelerometer-based step detection
- [ ] Configurable user profiles (weight, stride, pace)
- [ ] Goal management and notifications
- [ ] Weekly/monthly reports
- [ ] Export data to CSV/JSON

## License

Part of the React Native Offline App Factory.
Generated apps inherit the same license as the factory.

## Support

For issues, questions, or contributions related to the sensors domain:
1. Check this README first
2. Review CLAUDE.md for architecture standards
3. Test with MockSensorAdapter before reporting issues
4. Include device info (iOS/Android version, physical/simulator)
