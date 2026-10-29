import { Image, StyleSheet, View } from 'react-native'

const BANDS = 28
const BLUR = 42

interface BackdropProps {
  uri?: string
  height?: number
  dim?: number
  fadeFrom?: number
}

export default function Backdrop({ uri, height = 320, dim = 0.6, fadeFrom = 0.25 }: BackdropProps) {
  if (!uri) return null

  const fadeTop = height * fadeFrom
  const bandHeight = (height - fadeTop) / BANDS
  const edge = (i: number) => Math.round(fadeTop + i * bandHeight)

  return (
    <View pointerEvents="none" style={[styles.wrap, { height }]}>
      <Image source={{ uri }} style={StyleSheet.absoluteFill} blurRadius={BLUR} resizeMode="cover" />
      <View style={[StyleSheet.absoluteFill, { backgroundColor: `rgba(0,0,0,${dim})` }]} />
      {Array.from({ length: BANDS }, (_, i) => (
        <View
          key={i}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            top: edge(i),
            height: edge(i + 1) - edge(i),
            backgroundColor: `rgba(0,0,0,${((i + 1) / BANDS).toFixed(3)})`,
          }}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    overflow: 'hidden',
  },
})
