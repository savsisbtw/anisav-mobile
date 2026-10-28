import { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, FlatList, Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import type { Release } from '../../src/lib/types'
import { YUMMY_SORT, onlyOnYummy, yummyCatalog } from '../../src/lib/yummy'
import { titleHref } from '../../src/lib/links'
import { colors, font, radius, spacing } from '../../src/lib/theme'
import AnimeCard from '../../src/components/AnimeCard'
import Chip from '../../src/components/Chip'
import Reveal from '../../src/components/Reveal'
import { GridSkeleton } from '../../src/components/Skeleton'

const PAGE = 36
const MIN_NEW = 18
const MAX_REQUESTS = 4

export default function YummyScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const { width } = useWindowDimensions()
  const columns = Math.max(3, Math.floor((width - spacing(4) * 2) / 120))

  const [sort, setSort] = useState('views')
  const [items, setItems] = useState<Release[]>([])
  const [loading, setLoading] = useState(true)
  const [hasMore, setHasMore] = useState(true)
  const [error, setError] = useState(false)
  const offset = useRef(0)
  const token = useRef(0)

  async function load(reset: boolean) {
    const mine = ++token.current
    if (reset) {
      offset.current = 0
      setItems([])
      setHasMore(true)
    }
    setLoading(true)
    setError(false)
    let found: Release[] = []
    let more = true
    try {
      for (let i = 0; i < MAX_REQUESTS && found.length < MIN_NEW && more; i++) {
        const page = await yummyCatalog(sort, offset.current, PAGE)
        if (mine !== token.current) return
        offset.current += page.rawCount
        more = page.rawCount === PAGE
        found = found.concat(await onlyOnYummy(page.items))
      }
    } catch {
      if (mine === token.current) setError(true)
    }
    if (mine !== token.current) return
    setItems((prev) => {
      const seen = new Set(prev.map((r) => r.id))
      return prev.concat(found.filter((r) => !seen.has(r.id)))
    })
    setHasMore(more)
    setLoading(false)
  }

  useEffect(() => {
    load(true)
  }, [sort])

  function loadMore() {
    if (loading || !hasMore || error) return
    load(false)
  }

  const padded = useMemo(() => {
    const remainder = items.length % columns
    if (remainder === 0) return items
    return [...items, ...Array(columns - remainder).fill(null)]
  }, [items, columns])

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + spacing(2) }]}>
        <Pressable onPress={() => router.back()} hitSlop={10} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Yummy</Text>
          <Text style={styles.headerSubtitle}>Тайтлы, которых нет на AniLiberty</Text>
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.sortScroll}
        contentContainerStyle={styles.sortRow}
      >
        {YUMMY_SORT.map((s) => (
          <Pressable key={s.value} onPress={() => setSort(s.value)}>
            <Chip accent={sort === s.value}>{s.label}</Chip>
          </Pressable>
        ))}
      </ScrollView>

      {items.length === 0 && loading && <GridSkeleton columns={columns} count={columns * 3} />}

      {items.length === 0 && !loading && (
        <View style={styles.empty}>
          <Text style={styles.emptyText}>{error ? 'Yummy сейчас не отвечает' : 'Ничего не найдено'}</Text>
          {error && (
            <Pressable onPress={() => load(true)} style={styles.retry}>
              <Text style={styles.retryText}>Повторить</Text>
            </Pressable>
          )}
        </View>
      )}

      {items.length > 0 && (
        <FlatList
          key={`grid-${columns}`}
          data={padded}
          numColumns={columns}
          keyExtractor={(item, index) => (item ? String(item.id) : `filler-${index}`)}
          columnWrapperStyle={styles.row}
          contentContainerStyle={[styles.grid, { paddingBottom: insets.bottom + spacing(6) }]}
          showsVerticalScrollIndicator={false}
          onEndReachedThreshold={0.4}
          onEndReached={loadMore}
          renderItem={({ item, index }) => (
            <View style={styles.gridItem}>
              {item && (
                <Reveal index={index % (columns * 3)}>
                  <AnimeCard release={item} onPress={() => router.push(titleHref(item))} />
                </Reveal>
              )}
            </View>
          )}
          ListFooterComponent={
            loading ? (
              <View style={styles.footer}>
                <ActivityIndicator color={colors.accent} />
              </View>
            ) : error ? (
              <Pressable onPress={() => load(false)} style={styles.footer}>
                <Text style={styles.retryText}>Повторить</Text>
              </Pressable>
            ) : (
              <View style={{ height: spacing(4) }} />
            )
          }
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(3),
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surfaceRaised,
  },
  headerTitle: {
    color: colors.text,
    fontFamily: font.heading,
    fontSize: 19,
  },
  headerSubtitle: {
    color: colors.textFaint,
    fontFamily: font.mono,
    fontSize: 10,
    marginTop: spacing(0.5),
  },
  sortScroll: {
    flexGrow: 0,
  },
  sortRow: {
    gap: spacing(2),
    paddingHorizontal: spacing(4),
    paddingBottom: spacing(3),
  },
  empty: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing(3),
    paddingBottom: spacing(24),
  },
  emptyText: {
    color: colors.textFaint,
    fontFamily: font.regular,
    fontSize: 14,
  },
  retry: {
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(2),
    borderRadius: radius.md,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  retryText: {
    color: colors.text,
    fontFamily: font.heading,
    fontSize: 13,
  },
  grid: {
    padding: spacing(4),
    gap: spacing(3),
  },
  row: {
    gap: spacing(3),
  },
  gridItem: {
    flex: 1,
  },
  footer: {
    paddingVertical: spacing(6),
    alignItems: 'center',
  },
})
