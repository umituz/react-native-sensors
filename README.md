# @umituz/react-native-sensors

Step counting and sensor management for React Native with expo-sensors.

## Installation

```bash
npm install @umituz/react-native-sensors
```

## Peer Dependencies

- `react` >= 18.2.0
- `react-native` >= 0.74.0
- `expo-sensors` *
- `expo-modules-core` *

## Features

- ✅ Step counting with real-time updates
- ✅ Distance and calories calculation
- ✅ Historical step data access
- ✅ Sensor availability checking
- ✅ Permission management
- ✅ Mock adapter for development/testing

## Usage

### Basic Step Counter

```typescript
import { useStepCounter } from '@umituz/react-native-sensors';

function HomeScreen() {
  const {
    steps,              // Current step count
    distance,           // Distance in km
    calories,           // Calories burned
    activeMinutes,      // Active minutes
    isCountingSteps,    // Whether counting is active
    startCounting,      // Start counting
    stopCounting,       // Stop counting
    refreshData,        // Refresh data
  } = useStepCounter();

  return (
    <View>
      <Text>Steps: {steps}</Text>
      <Text>Distance: {distance.toFixed(2)} km</Text>
      <Text>Calories: {calories}</Text>
      <Button onPress={startCounting}>Start</Button>
      <Button onPress={stopCounting}>Stop</Button>
    </View>
  );
}
```

### Using Adapters Directly

```typescript
import { ExpoPedometerAdapter, MockSensorAdapter } from '@umituz/react-native-sensors';

// Use real sensor
const sensorService = new ExpoPedometerAdapter();

// Or use mock for development
const mockService = new MockSensorAdapter();

// Check availability
const availability = await sensorService.isAvailable();

// Request permissions
const permission = await sensorService.requestPermissions();

// Get today's steps
const todaySteps = await sensorService.getTodaySteps();
```

### Step Calculator

```typescript
import { stepCalculator } from '@umituz/react-native-sensors';

// Calculate distance
const distance = stepCalculator.calculateDistance(10000, 0.8); // Custom stride

// Calculate calories
const calories = stepCalculator.calculateCalories(10000, 75); // Custom weight

// Calculate active minutes
const minutes = stepCalculator.calculateActiveMinutes(10000, 100); // Custom pace
```

## Hooks

- `useStepCounter()` - Main hook for step counting

## Adapters

- `ExpoPedometerAdapter` - Real sensor adapter using expo-sensors
- `MockSensorAdapter` - Mock adapter for development/testing

## Utilities

- `stepCalculator` - Step calculation utilities

## License

MIT

