import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
  return (
    <Tabs screenOptions={{
      headerShown: false, //this will hide the top level header title
    }}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarLabel: 'Add',
          title: 'Add',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="add-circle-outline" size={size} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="view/index" 
        options={{
          tabBarLabel: 'View',
          title: 'View',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="eye-outline" size={size} color={color} />
          ),
        }}
      />
      
      <Tabs.Screen
        name="view/[id]/index" 
        options={{
          href:null,
          tabBarLabel: 'View',
          title: 'View',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="eye-outline" size={size} color={color} />
          ),
        }}
      />


    </Tabs>
  );
}
