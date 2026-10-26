import { StyleSheet, Text, View } from 'react-native'
import { colors, font, spacing } from '../lib/theme'

interface LoaderProps {
  label?: string
}

export default function Loader({ label }: LoaderProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label || 'Загрузка...'}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing(24),
  },
  label: {
    color: colors.textDim,
    fontFamily: font.mono,
    fontSize: 13,
  },
})
