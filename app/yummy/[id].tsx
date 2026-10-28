import { useEffect, useMemo, useState } from 'react'
import { Image, Linking, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useLocalSearchParams } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import { imageUrl } from '../../src/lib/api'
import type { Release, YummyVideo } from '../../src/lib/types'
import { yummyTitle, yummyVideos } from '../../src/lib/yummy'
import { isInWishlist, toggleWishlist } from '../../src/lib/wishlist'
import { colors, font, radius, spacing } from '../../src/lib/theme'
import Loader from '../../src/components/Loader'
import Chip from '../../src/components/Chip'
import YummyPlayer from '../../src/components/YummyPlayer'
import AnimatedPressable from '../../src/components/AnimatedPressable'
import Solid from '../../src/components/Solid'

function unique(list: string[]) {
  return list.filter((v, i) => list.indexOf(v) === i)
}

function byNumber(a: YummyVideo, b: YummyVideo) {
  const x = parseFloat(a.number)
  const y = parseFloat(b.number)
  if (Number.isNaN(x) || Number.isNaN(y)) return a.number.localeCompare(b.number)
  return x - y
}

export default function YummyTitleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const yid = Number(id)
  const insets = useSafeAreaInsets()

  const [release, setRelease] = useState<Release | null>(null)
  const [videos, setVideos] = useState<YummyVideo[] | null>(null)
  const [error, setError] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dubbing, setDubbing] = useState('')
  const [player, setPlayer] = useState('')
  const [number, setNumber] = useState('')

  useEffect(() => {
    if (!yid) return
    setRelease(null)
    setVideos(null)
    setError(false)
    yummyTitle(yid)
      .then(setRelease)
      .catch(() => setError(true))
    yummyVideos(yid)
      .then(setVideos)
      .catch(() => setVideos([]))
  }, [yid])

  useEffect(() => {
    if (!release) return
    isInWishlist(release.id).then(setSaved)
  }, [release])

  const dubbings = useMemo(() => {
    if (!videos) return []
    const count = (n: string) => videos.filter((v) => v.dubbing === n).length
    return unique(videos.map((v) => v.dubbing)).sort((a, b) => count(b) - count(a))
  }, [videos])

  const activeDub = dubbings.includes(dubbing) ? dubbing : dubbings[0]

  const players = useMemo(
    () => unique((videos ?? []).filter((v) => v.dubbing === activeDub).map((v) => v.player)),
    [videos, activeDub]
  )
  const activePlayer = players.includes(player) ? player : players[0]

  const episodes = useMemo(
    () => (videos ?? []).filter((v) => v.dubbing === activeDub && v.player === activePlayer).sort(byNumber),
    [videos, activeDub, activePlayer]
  )
  const active = episodes.find((v) => v.number === number) ?? episodes[0]
  const isLast = !!active && episodes[episodes.length - 1]?.id === active.id

  function goToNext() {
    const idx = episodes.findIndex((v) => v.id === active?.id)
    const next = episodes[idx + 1]
    if (next) setNumber(next.number)
  }

  async function handleToggleWishlist() {
    if (!release) return
    setSaved(await toggleWishlist(release))
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>Тайтл не найден</Text>
      </View>
    )
  }

  if (!release) return <Loader label="Загружаем..." />

  const poster = imageUrl(release.poster?.optimized?.preview || release.poster?.preview)
  const blockedInRu = release.blocked_in?.includes('RU')

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing(10) }}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        {poster && <Image source={{ uri: poster }} style={styles.poster} resizeMode="cover" />}
        <View style={styles.headerInfo}>
          <Text style={styles.title}>{release.name.main}</Text>
          {release.name.english && <Text style={styles.englishTitle}>{release.name.english}</Text>}

          <View style={styles.chipRow}>
            <Chip accent>Yummy</Chip>
            {!!release.type?.description && <Chip>{release.type.description}</Chip>}
            {release.year > 0 && <Chip mono>{release.year}</Chip>}
            {!!release.season?.description && <Chip>{release.season.description}</Chip>}
            {!!release.age_rating?.label && <Chip mono>{release.age_rating.label}</Chip>}
            {release.is_ongoing && <Chip mono>Онгоинг</Chip>}
            {!!release.episodes_total && <Chip mono>{release.episodes_total} эп.</Chip>}
          </View>

          <View style={styles.actionsRow}>
            <AnimatedPressable haptic onPress={handleToggleWishlist} style={styles.iconButton}>
              <Ionicons
                name={saved ? 'star' : 'star-outline'}
                size={18}
                color={saved ? colors.accent2 : colors.textDim}
              />
            </AnimatedPressable>
            <AnimatedPressable
              onPress={() => Linking.openURL(`https://yummyani.me/catalog/item/${release.alias}`)}
              style={styles.siteButton}
            >
              <Text style={styles.siteButtonText}>Открыть на Yummy</Text>
            </AnimatedPressable>
          </View>
        </View>
      </View>

      {!!release.genres?.length && (
        <View style={styles.genreRow}>
          {release.genres.map((g) => (
            <Chip key={g.id}>{g.name}</Chip>
          ))}
        </View>
      )}

      {release.description && <Text style={styles.description}>{release.description}</Text>}

      {!videos && <View style={styles.skeleton} />}

      {videos && videos.length === 0 && <Text style={styles.noVideos}>Для этого тайтла нет доступных серий</Text>}

      {active && (
        <View style={styles.playerWrap}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipsScroll}>
            {dubbings.map((d) => (
              <Pressable key={d} onPress={() => setDubbing(d)}>
                <Chip accent={d === activeDub}>{d}</Chip>
              </Pressable>
            ))}
          </ScrollView>

          <View style={styles.controlsRow}>
            {players.length > 1 ? (
              <View style={styles.playersRow}>
                {players.map((p) => (
                  <Pressable key={p} onPress={() => setPlayer(p)}>
                    <Chip accent={p === activePlayer} mono>
                      {p}
                    </Chip>
                  </Pressable>
                ))}
              </View>
            ) : (
              <View />
            )}
            <View style={styles.nextRow}>
              <Text style={styles.episodeNow}>Серия {active.number}</Text>
              <AnimatedPressable haptic onPress={goToNext} disabled={isLast} style={isLast ? styles.nextOff : undefined}>
                <Solid style={styles.nextButton}>
                  <Text style={styles.nextText}>Следующая</Text>
                </Solid>
              </AnimatedPressable>
            </View>
          </View>

          <YummyPlayer key={active.id} url={active.url} />

          {blockedInRu && (
            <Text style={styles.note}>
              Правообладатель закрыл этот тайтл в России, плеер может не открыться без VPN.
            </Text>
          )}
        </View>
      )}

      {episodes.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Серии</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.episodeList}>
            {episodes.map((ep) => {
              const isSelected = active?.id === ep.id
              return (
                <AnimatedPressable
                  key={ep.id}
                  onPress={() => setNumber(ep.number)}
                  style={isSelected ? undefined : styles.episodeButton}
                >
                  {isSelected ? (
                    <Solid style={styles.episodeButton}>
                      <Text style={[styles.episodeLabel, styles.episodeLabelActive]}>Серия {ep.number}</Text>
                    </Solid>
                  ) : (
                    <Text style={styles.episodeLabel}>Серия {ep.number}</Text>
                  )}
                </AnimatedPressable>
              )
            })}
          </ScrollView>
        </View>
      )}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  errorText: {
    color: colors.textFaint,
    fontFamily: font.regular,
    fontSize: 14,
  },
  header: {
    flexDirection: 'row',
    gap: spacing(3),
    paddingHorizontal: spacing(4),
    paddingTop: spacing(2),
  },
  poster: {
    width: 110,
    aspectRatio: 2 / 3,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  headerInfo: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    color: colors.text,
    fontFamily: font.display,
    fontSize: 20,
  },
  englishTitle: {
    color: colors.textFaint,
    fontFamily: font.mono,
    fontSize: 11,
    marginTop: spacing(0.5),
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1.5),
    marginTop: spacing(2.5),
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(2),
    marginTop: spacing(3),
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  siteButton: {
    paddingHorizontal: spacing(3),
    height: 32,
    justifyContent: 'center',
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  siteButtonText: {
    color: colors.text,
    fontFamily: font.heading,
    fontSize: 12,
  },
  genreRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(1.5),
    paddingHorizontal: spacing(4),
    marginTop: spacing(3.5),
  },
  description: {
    color: colors.textDim,
    fontFamily: font.regular,
    fontSize: 13,
    lineHeight: 19,
    paddingHorizontal: spacing(4),
    marginTop: spacing(3.5),
  },
  skeleton: {
    height: 200,
    marginTop: spacing(5),
    marginHorizontal: spacing(4),
    borderRadius: radius.md,
    backgroundColor: colors.surfaceRaised,
  },
  noVideos: {
    color: colors.textFaint,
    fontFamily: font.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing(8),
  },
  playerWrap: {
    paddingHorizontal: spacing(4),
    marginTop: spacing(5),
    gap: spacing(3),
  },
  chipsScroll: {
    gap: spacing(2),
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playersRow: {
    flexDirection: 'row',
    gap: spacing(2),
  },
  nextRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  episodeNow: {
    color: colors.textFaint,
    fontFamily: font.mono,
    fontSize: 11,
  },
  nextButton: {
    paddingHorizontal: spacing(3),
    paddingVertical: spacing(1.5),
    borderRadius: radius.md,
  },
  nextOff: {
    opacity: 0.35,
  },
  nextText: {
    color: colors.onAccent,
    fontFamily: font.heading,
    fontSize: 12,
  },
  note: {
    color: colors.textFaint,
    fontFamily: font.regular,
    fontSize: 11.5,
  },
  section: {
    marginTop: spacing(5),
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: font.heading,
    fontSize: 14,
    marginBottom: spacing(3),
    paddingHorizontal: spacing(4),
  },
  episodeList: {
    paddingHorizontal: spacing(4),
    gap: spacing(2),
  },
  episodeButton: {
    minWidth: 96,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
    borderRadius: radius.md,
    padding: spacing(3),
  },
  episodeLabel: {
    color: colors.text,
    fontFamily: font.heading,
    fontSize: 13,
  },
  episodeLabelActive: {
    color: colors.onAccent,
  },
})
