import { ReactNode } from 'react'
import { StyleProp, View, ViewStyle } from 'react-native'
import { colors } from '../lib/theme'

interface SolidProps {
  children?: ReactNode
  style?: StyleProp<ViewStyle>
}

export default function Solid({ children, style }: SolidProps) {
  return <View style={[{ backgroundColor: colors.accent }, style]}>{children}</View>
}
