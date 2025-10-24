// Main App component with navigation
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import { Provider as PaperProvider } from 'react-native-paper';

// Screens
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import AddMealScreen from './src/screens/AddMealScreen';
import MealDetailScreen from './src/screens/MealDetailScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import ExportScreen from './src/screens/ExportScreen';

const Stack = createNativeStackNavigator();

/**
 * Main application component
 * Uses React Navigation for screen management
 */
export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <StatusBar style="dark" />
        <Stack.Navigator
          initialRouteName="Home"
          screenOptions={{
            headerShown: false, // Custom headers in each screen
            animation: 'slide_from_right',
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen
            name="Camera"
            component={CameraScreen}
            options={{
              animation: 'slide_from_bottom',
            }}
          />
          <Stack.Screen name="AddMeal" component={AddMealScreen} />
          <Stack.Screen name="MealDetail" component={MealDetailScreen} />
          <Stack.Screen name="History" component={HistoryScreen} />
          <Stack.Screen name="Export" component={ExportScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
