import { useCallback, useEffect, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native'
import { useRouter } from 'expo-router'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { api } from '../../src/lib/api'
import type { Genre } from '../../src/lib/types'
import { colors, font, radius, spacing } from '../../src/lib/theme'
import Loader from '../../src/components/Loader'
import Reveal from '../../src/components/Reveal'
import AnimatedPressable from '../../src/components/AnimatedPressable'

interface GenreTileProps {
  genre: Genre
  index: number
  onPress: () => void
}

function GenreTile({ genre, index, onPress }: GenreTileProps) {
  return (
    <Reveal index={index} style={styles.tileWrap}>
      <AnimatedPressable onPress={onPress} style={styles.tile}>
        <Text numberOfLines={2} style={styles.name}>
          {genre.name}
        </Text>
        {genre.total_releases != null && <Text style={styles.count}>{genre.total_releases} тайтлов</Text>}
      </AnimatedPressable>
    </Reveal>
  )
}

export default function GenresScreen() {
  const router = useRouter()
  const insets = useSafeAreaInsets()
  const [genres, setGenres] = useState<Genre[] | null>(null)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    try {
      setGenres(await api.genres())
    } catch {
      setGenres([])
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  async function onRefresh() {
    setRefreshing(true)
    await load()
    setRefreshing(false)
  }

  if (!genres) return <Loader label="Загружаем жанры..." />

  return (
    <FlatList
      style={styles.screen}
      data={genres}
      keyExtractor={(item) => String(item.id)}
      numColumns={2}
      columnWrapperStyle={styles.row}
      contentContainerStyle={[
        styles.list,
        { paddingTop: insets.top + spacing(4), paddingBottom: insets.bottom + spacing(24) },
      ]}
      refreshControl={
        <RefreshControl tintColor={colors.textDim} refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <View style={styles.header}>
          <Text style={styles.title}>Жанры</Text>
          <Text style={styles.subtitle}>{genres.length} жанров</Text>
        </View>
      }
      renderItem={({ item, index }) => (
        <GenreTile
          genre={item}
          index={index % 12}
          onPress={() => router.push({ pathname: '/(tabs)/catalog', params: { genre: String(item.id) } })}
        />
      )}
    />
  )
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  list: {
    paddingHorizontal: spacing(4),
  },
  header: {
    marginBottom: spacing(4),
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
  row: {
    justifyContent: 'space-between',
  },
  tileWrap: {
    width: '48%',
    marginBottom: spacing(3),
  },
  tile: {
    width: '100%',
    padding: spacing(4),
    borderRadius: radius.lg,
    backgroundColor: colors.surface,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  name: {
    color: colors.text,
    fontFamily: font.medium,
    fontSize: 14,
  },
  count: {
    color: colors.textDim,
    fontFamily: font.mono,
    fontSize: 11,
    marginTop: spacing(1),
  },
})
