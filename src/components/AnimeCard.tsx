import { useEffect, useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import Ionicons from '@expo/vector-icons/Ionicons'
import type { Release } from '../lib/types'
import { imageUrl } from '../lib/api'
import { colors, font, radius, spacing } from '../lib/theme'
import { isInWishlist, onWishlistChange, toggleWishlist } from '../lib/wishlist'
import AnimatedPressable from './AnimatedPressable'

interface AnimeCardProps {
  release: Release
  onPress?: () => void
}

export default function AnimeCard({ release, onPress }: AnimeCardProps) {
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    let mounted = true
    isInWishlist(release.id).then((v) => mounted && setSaved(v))
    const unsubscribe = onWishlistChange(() => {
      isInWishlist(release.id).then((v) => mounted && setSaved(v))
    })
    return () => {
      mounted = false
      unsubscribe()
    }
  }, [release.id])

  async function handleToggleWishlist() {
    const nowSaved = await toggleWishlist(release)
    setSaved(nowSaved)
  }

  const poster = imageUrl(release.poster?.optimized?.preview || release.poster?.preview)
  const meta = [
    release.year,
    release.type?.description,
    release.episodes_total ? `${release.episodes_total} эп.` : null,
    release.source === 'yummy' ? 'Yummy' : null,
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <AnimatedPressable onPress={onPress} style={styles.container}>
      <View style={styles.posterWrap}>
        {poster && <Image source={{ uri: poster }} style={styles.poster} resizeMode="cover" />}

        <View style={styles.starButtonWrap}>
          <AnimatedPressable hitSlop={10} onPress={handleToggleWishlist} haptic style={[styles.starButton, saved && styles.starButtonOn]}>
            <Ionicons
              name={saved ? 'star' : 'star-outline'}
              size={13}
              color={saved ? colors.onAccent : colors.text}
            />
          </AnimatedPressable>
        </View>
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {release.name.main}
      </Text>
      <View style={styles.metaRow}>
        {release.is_ongoing && <View style={styles.dot} />}
        <Text numberOfLines={1} style={styles.meta}>
          {meta}
        </Text>
      </View>
    </AnimatedPressable>
  )
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  posterWrap: {
    width: '100%',
    aspectRatio: 2 / 3,
    borderRadius: radius.md,
    overflow: 'hidden',
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  poster: {
    width: '100%',
    height: '100%',
  },
  starButtonWrap: {
    position: 'absolute',
    top: spacing(1.5),
    right: spacing(1.5),
  },
  starButton: {
    width: 26,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: colors.overlay,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  starButtonOn: {
    backgroundColor: colors.accent,
    borderColor: colors.accent,
  },
  title: {
    marginTop: spacing(2),
    color: colors.text,
    fontFamily: font.medium,
    fontSize: 13,
    lineHeight: 16,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(1.5),
    marginTop: spacing(1),
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: radius.round,
    backgroundColor: colors.text,
  },
  meta: {
    flexShrink: 1,
    color: colors.textDim,
    fontFamily: font.regular,
    fontSize: 11,
  },
})
