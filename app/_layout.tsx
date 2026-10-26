import { useEffect, useState } from 'react'
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { GestureHandlerRootView } from 'react-native-gesture-handler'
import * as SplashScreen from 'expo-splash-screen'
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  useFonts as useInterFonts,
} from '@expo-google-fonts/inter'
import {
  JetBrainsMono_400Regular,
  JetBrainsMono_500Medium,
  useFonts as useMonoFonts,
} from '@expo-google-fonts/jetbrains-mono'
import { AuthProvider } from '../src/lib/AuthContext'
import { loadGateway } from '../src/lib/gateway'
import { colors } from '../src/lib/theme'

SplashScreen.preventAutoHideAsync().catch(() => {})

export default function RootLayout() {
  const [interLoaded] = useInterFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  })
  const [monoLoaded] = useMonoFonts({ JetBrainsMono_400Regular, JetBrainsMono_500Medium })
  const [gatewayReady, setGatewayReady] = useState(false)
  const fontsReady = interLoaded && monoLoaded && gatewayReady

  useEffect(() => {
    loadGateway().then(() => setGatewayReady(true))
  }, [])

  useEffect(() => {
    if (fontsReady) SplashScreen.hideAsync().catch(() => {})
  }, [fontsReady])

  if (!fontsReady) return null

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: colors.background }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
            <Stack.Screen name="(tabs)" />
            <Stack.Screen
              name="title/[id]"
              options={{
                presentation: 'card',
                headerShown: true,
                headerTitle: '',
                headerBackTitle: '',
                headerStyle: { backgroundColor: colors.background },
                headerTintColor: colors.text,
                headerShadowVisible: false,
              }}
            />
            <Stack.Screen name="login" options={{ presentation: 'modal' }} />
          </Stack>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  )
}
