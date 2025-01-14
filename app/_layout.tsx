import { Stack } from "expo-router";
import "../global.css"

export default function _layout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Stack.Screen name="(tabs)" options={{
        headerShown: false,
      }} />
      <Stack.Screen name="+not-found" />
    </Stack>
  )
}

