import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import { HomeScreen } from '../screens/HomeScreen';
import { AddMedicationScreen } from '../screens/AddMedicationScreen';
import { ScheduleScreen } from '../screens/ScheduleScreen';
import { HistoryScreen } from '../screens/HistoryScreen';
import { ProfileScreen } from '../screens/ProfileScreen';

export type AppStackParamList = {
  Main: undefined;
  AddMedication: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();
const Tab = createBottomTabNavigator();

function EmptyScreen() {
  return null;
}

function MainTabs() {
  const navigation = useNavigation<any>();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#2C6E49',
        tabBarInactiveTintColor: '#64748B',
        tabBarStyle: {
          backgroundColor: '#ffffff',
          borderTopColor: '#E5E7EB',
          height: 68,
          paddingBottom: 10,
        },
        tabBarIcon: ({ color, size }) => {
          let iconName: string = 'home';
          if (route.name === 'Home') iconName = 'home';
          else if (route.name === 'Schedule') iconName = 'calendar-today';
          else if (route.name === 'History') iconName = 'history';
          else if (route.name === 'Profile') iconName = 'person';
          else if (route.name === 'Add') iconName = 'add-circle';
          return <MaterialIcons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} options={{ title: 'Today' }} />
      <Tab.Screen name="Schedule" component={ScheduleScreen} options={{ title: 'Meds' }} />
      <Tab.Screen
        name="Add"
        component={EmptyScreen}
        options={{
          title: '',
          tabBarButton: props => (
            <TouchableOpacity
              {...props}
              activeOpacity={0.85}
              style={{
                position: 'absolute',
                bottom: 10,
                left: '50%',
                transform: [{ translateX: -35 }],
                width: 70,
                height: 70,
                borderRadius: 35,
                backgroundColor: '#2C6E49',
                alignItems: 'center',
                justifyContent: 'center',
                shadowColor: '#000',
                shadowOpacity: 0.18,
                shadowRadius: 12,
                shadowOffset: { width: 0, height: 6 },
                elevation: 6,
              }}
              onPress={() => navigation.getParent()?.navigate('AddMedication')}
            >
              <MaterialIcons name="add" size={32} color="#fff" />
            </TouchableOpacity>
          ),
        }}
      />
      <Tab.Screen name="History" component={HistoryScreen} options={{ title: 'History' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Main" component={MainTabs} />
      <Stack.Screen name="AddMedication" component={AddMedicationScreen} options={{ presentation: 'modal' }} />
    </Stack.Navigator>
  );
}
