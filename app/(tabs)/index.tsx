import { useCallback, useEffect, useState } from 'react'
import { Image, RefreshControl, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api, imageUrl } from '../../src/lib/api'
import { onlyOnYummy, yummyCatalog } from '../../src/lib/yummy'
import { getContinueWatching, ContinueWatchingItem } from '../../src/lib/continueWatching'
import type { Release, ScheduleDay } from '../../src/lib/types'
import { colors, font, radius, spacing } from '../../src/lib/theme'
import Row from '../../src/components/Row'
import Footer from '../../src/components/Footer'
import { HomeSkeleton } from '../../src/components/Skeleton'
import Reveal from '../../src/components/Reveal'
import AnimatedPressable from '../../src/components/AnimatedPressable'

export default function HomeScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [latest, setLatest] = useState<Release[] | null>(null)
  const [recommended, setRecommended] = useState<Release[]>([])
  const [today, setToday] = useState<ScheduleDay[]>([])
  const [continueWatching, setContinueWatching] = useState<ContinueWatchingItem[]>([])
  const [yummyOnly, setYummyOnly] = useState<Release[]>([])
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    const [latestRes, recommendedRes, scheduleRes, continueRes] = await Promise.all([
      api.latest(21).catch(() => [] as Release[]),
      api.recommended(14).catch(() => [] as Release[]),
      api.scheduleNow().catch(() => null),
      getContinueWatching().catch(() => [] as ContinueWatchingItem[]),
    ])
    setLatest(latestRes)
    setRecommended(recommendedRes)
    setToday(scheduleRes?.today?.filter((s) => s.release) ?? [])
    setContinueWatching(continueRes)
    yummyCatalog('views', 0, 60)
      .then((page) => onlyOnYummy(page.items))
      .then((items) => setYummyOnly(items.slice(0, 14)))
      .catch(() => {})
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  if (!latest) return <HomeSkeleton />

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingTop: insets.top + spacing(4),
        paddingBottom: insets.bottom + spacing(24),
      }}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.textDim} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>Главная</Text>
        <Text style={styles.subtitle}>Свежие релизы и то, что ты смотришь</Text>
      </View>

      {continueWatching.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Продолжить просмотр</Text>
          <View style={styles.continueRow}>
            {continueWatching.map((item, i) => (
              <Reveal key={item.episode.id} index={i} style={styles.continueCard}>
                <AnimatedPressable
                  onPress={() => router.push(`/title/${item.release.alias || item.release.id}`)}
                >
                  <Image
                    source={{
                      uri: imageUrl(item.release.poster?.optimized?.preview || item.release.poster?.preview),
                    }}
                    style={styles.continueImage}
                    resizeMode="cover"
                  />
                  {!!item.episode.duration && (
                    <View style={styles.continueBarTrack}>
                      <View
                        style={[
                          styles.continueBarFill,
                          { width: `${Math.min(100, (item.time / item.episode.duration) * 100)}%` },
                        ]}
                      />
                    </View>
                  )}
                  <Text style={styles.continueEpisode}>Серия {item.episode.ordinal}</Text>
                </AnimatedPressable>
              </Reveal>
            ))}
          </View>
        </View>
      )}

      <Row title="Онгоинги сегодня" releases={today.map((s) => s.release)} />
      <Row title="Последние обновления" releases={latest} />
      <Row title="Рекомендуем" releases={recommended} />
      <Row title="Только на Yummy" releases={yummyOnly} href="/yummy" />

      <Footer />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing(4),
  },
  title: {
    color: colors.text,
    fontFamily: font.display,
    fontSize: 22,
  },
  subtitle: {
    color: colors.textDim,
    fontFamily: font.regular,
    fontSize: 13,
    marginTop: spacing(1),
  },
  section: {
    marginTop: spacing(6),
  },
  sectionTitle: {
    color: colors.text,
    fontFamily: font.heading,
    fontSize: 14,
    marginBottom: spacing(3),
    paddingHorizontal: spacing(4),
  },
  continueRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing(3),
    paddingHorizontal: spacing(4),
  },
  continueCard: {
    width: 110,
  },
  continueImage: {
    width: 110,
    height: 165,
    borderRadius: radius.md,
    backgroundColor: colors.surfaceCard,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  continueBarTrack: {
    height: 2,
    marginTop: spacing(2),
    backgroundColor: colors.borderStrong,
    overflow: 'hidden',
  },
  continueBarFill: {
    height: '100%',
    backgroundColor: colors.text,
  },
  continueEpisode: {
    color: colors.textDim,
    fontFamily: font.regular,
    fontSize: 11,
    marginTop: spacing(1.5),
  },
})
