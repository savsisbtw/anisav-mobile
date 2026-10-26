import { ReactNode, useCallback } from 'react'
import { GestureResponderEvent, Pressable, PressableProps, StyleProp, ViewStyle } from 'react-native'
import Animated, { ReduceMotion, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

interface AnimatedPressableProps extends Omit<PressableProps, 'style'> {
  children: ReactNode
  style?: StyleProp<ViewStyle>
  haptic?: boolean
}

const PRESSED_OPACITY = 0.55
const TIMING = { duration: 90, reduceMotion: ReduceMotion.System }

export default function AnimatedPressable({
  children,
  style,
  haptic = false,
  onPressIn,
  onPressOut,
  onPress,
  ...rest
}: AnimatedPressableProps) {
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }))

  const handlePressIn = useCallback(
    (e: GestureResponderEvent) => {
      opacity.value = withTiming(PRESSED_OPACITY, TIMING)
      onPressIn?.(e)
    },
    [onPressIn, opacity]
  )

  const handlePressOut = useCallback(
    (e: GestureResponderEvent) => {
      opacity.value = withTiming(1, TIMING)
      onPressOut?.(e)
    },
    [onPressOut, opacity]
  )

  const handlePress = useCallback(
    (e: GestureResponderEvent) => {
      if (haptic) Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
      onPress?.(e)
    },
    [onPress, haptic]
  )

  return (
    <Pressable onPressIn={handlePressIn} onPressOut={handlePressOut} onPress={handlePress} {...rest}>
      <Animated.View style={[animatedStyle, style]}>{children}</Animated.View>
    </Pressable>
  )
}
