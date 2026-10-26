import { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { colors, font, radius, spacing } from '../lib/theme'

interface ChipProps {
  children: ReactNode
  accent?: boolean
  mono?: boolean
}

export default function Chip({ children, accent, mono }: ChipProps) {
  return (
    <View style={[styles.chip, accent && styles.chipAccent]}>
      <Text style={[styles.text, mono && styles.textMono, accent && styles.textAccent]}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: spacing(2.5),
    paddingVertical: spacing(1),
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  chipAccent: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  text: {
    fontFamily: font.body,
    color: colors.textDim,
    fontSize: 11.5,
  },
  textMono: {
    fontFamily: font.mono,
    fontSize: 11,
  },
  textAccent: {
    color: colors.onAccent,
  },
})
