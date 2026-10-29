import { useState } from 'react'
import {
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from 'react-native'
import { useRouter } from 'expo-router'
import type { Release } from '../lib/types'
import { imageUrl } from '../lib/api'
import { titleHref } from '../lib/links'
import { colors, font, radius, spacing } from '../lib/theme'
import AnimatedPressable from './AnimatedPressable'
import Backdrop from './Backdrop'
import Solid from './Solid'

const CARD_HEIGHT = 236
const GAP = spacing(3)

function FeaturedCard({ release, width }: { release: Release; width: number }) {
  const router = useRouter()
  const poster = imageUrl(release.poster?.optimized?.preview || release.poster?.preview)
  const meta = [
    release.year,
    release.type?.description,
    release.episodes_total ? `${release.episodes_total} эп.` : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <AnimatedPressable onPress={() => router.push(titleHref(release))} style={[styles.card, { width }]}>
      <Backdrop uri={poster} height={CARD_HEIGHT} dim={0.5} fadeFrom={0.7} />
      <View style={styles.cardBody}>
        <View style={styles.textCol}>
          <View style={styles.labelRow}>
            <View style={styles.badge}>
              {release.is_ongoing && <View style={styles.dot} />}
              <Text style={styles.badgeText}>{release.is_ongoing ? 'Онгоинг' : 'Новинка'}</Text>
            </View>
          </View>
          <Text numberOfLines={3} style={styles.title}>
            {release.name.main}
          </Text>
          <Text numberOfLines={1} style={styles.meta}>
            {meta}
          </Text>
          <Solid style={styles.button}>
            <Text style={styles.buttonText}>Смотреть</Text>
          </Solid>
        </View>
        {poster && <Image source={{ uri: poster }} style={styles.poster} resizeMode="cover" />}
      </View>
    </AnimatedPressable>
  )
}

export default function Featured({ releases }: { releases: Release[] }) {
  const { width } = useWindowDimensions()
  const [index, setIndex] = useState(0)
  const items = releases.slice(0, 5)
  const cardWidth = width - spacing(4) * 2
  const interval = cardWidth + GAP

  if (items.length === 0) return null

  function onScroll(e: NativeSyntheticEvent<NativeScrollEvent>) {
    const next = Math.round(e.nativeEvent.contentOffset.x / interval)
    if (next !== index && next >= 0 && next < items.length) setIndex(next)
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        snapToInterval={interval}
        decelerationRate="fast"
        disableIntervalMomentum
        scrollEventThrottle={32}
        onScroll={onScroll}
        contentContainerStyle={styles.list}
      >
        {items.map((release) => (
          <FeaturedCard key={release.id} release={release} width={cardWidth} />
        ))}
      </ScrollView>
      {items.length > 1 && (
        <View style={styles.dots}>
          {items.map((release, i) => (
            <View key={release.id} style={[styles.bar, i === index && styles.barOn]} />
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: spacing(5),
  },
  list: {
    gap: GAP,
    paddingHorizontal: spacing(4),
  },
  card: {
    height: CARD_HEIGHT,
    borderRadius: radius.lg,
    overflow: 'hidden',
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  cardBody: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(4),
    padding: spacing(4),
  },
  textCol: {
    flex: 1,
    minWidth: 0,
    gap: spacing(2),
  },
  labelRow: {
    flexDirection: 'row',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    paddingHorizontal: spacing(2),
    paddingVertical: spacing(0.5),
    borderRadius: radius.sm,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.round,
    backgroundColor: colors.text,
  },
  badgeText: {
    color: colors.text,
    fontFamily: font.heading,
    fontSize: 10.5,
  },
  title: {
    color: colors.text,
    fontFamily: font.display,
    fontSize: 19,
    lineHeight: 23,
  },
  meta: {
    color: colors.textDim,
    fontFamily: font.mono,
    fontSize: 10.5,
  },
  button: {
    alignSelf: 'flex-start',
    marginTop: spacing(1),
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.md,
  },
  buttonText: {
    color: colors.onAccent,
    fontFamily: font.heading,
    fontSize: 12.5,
  },
  poster: {
    width: 108,
    aspectRatio: 2 / 3,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing(1.5),
    marginTop: spacing(3),
  },
  bar: {
    width: 16,
    height: 3,
    borderRadius: 2,
    backgroundColor: colors.borderStrong,
  },
  barOn: {
    width: 24,
    backgroundColor: colors.text,
  },
})
