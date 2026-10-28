import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import type { Release } from '../lib/types'
import { colors, font, spacing } from '../lib/theme'
import { titleHref } from '../lib/links'
import AnimeCard from './AnimeCard'
import AnimatedPressable from './AnimatedPressable'
import Reveal from './Reveal'

interface RowProps {
  title: string
  releases: Release[]
  href?: string
}

const CARD_WIDTH = 132

export default function Row({ title, releases, href }: RowProps) {
  const router = useRouter()

  if (!releases.length) return null

  return (
    <View style={styles.section}>
      <View style={styles.headingRow}>
        <Text style={styles.heading}>{title}</Text>
        {href && (
          <AnimatedPressable hitSlop={8} onPress={() => router.push(href)}>
            <Text style={styles.all}>Все</Text>
          </AnimatedPressable>
        )}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {releases.map((item, i) => (
          <Reveal key={item.id} index={i} style={styles.item}>
            <AnimeCard release={item} onPress={() => router.push(titleHref(item))} />
          </Reveal>
        ))}
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing(4),
  },
  headingRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: spacing(3),
    paddingHorizontal: spacing(4),
  },
  heading: {
    color: colors.text,
    fontFamily: font.heading,
    fontSize: 14,
  },
  all: {
    color: colors.textDim,
    fontFamily: font.regular,
    fontSize: 12,
  },
  list: {
    gap: spacing(3),
    paddingHorizontal: spacing(4),
  },
  item: {
    width: CARD_WIDTH,
  },
})
