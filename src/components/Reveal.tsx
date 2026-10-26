import { ReactNode } from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import Animated, { FadeIn, ReduceMotion } from 'react-native-reanimated'

interface RevealProps {
  index?: number
  children: ReactNode
  style?: StyleProp<ViewStyle>
}

export default function Reveal({ index = 0, children, style }: RevealProps) {
  return (
    <Animated.View
      entering={FadeIn.delay(Math.min(index, 8) * 20)
        .duration(180)
        .reduceMotion(ReduceMotion.System)}
      style={style}
    >
      {children}
    </Animated.View>
  )
}
