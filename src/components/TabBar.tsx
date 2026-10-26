import { Pressable, StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Ionicons from '@expo/vector-icons/Ionicons'
import type { BottomTabBarProps } from 'expo-router/build/react-navigation/bottom-tabs'
import * as Haptics from 'expo-haptics'
import { colors } from '../lib/theme'

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  index: 'home',
  catalog: 'grid',
  genres: 'pricetags',
  schedule: 'calendar',
  profile: 'person',
}

export default function TabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets()

  return (
    <View style={[styles.bar, { paddingBottom: insets.bottom }]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key]
        const focused = state.index === index
        const base = ICONS[route.name] ?? 'ellipse'
        const iconName = (focused ? base : `${base}-outline`) as keyof typeof Ionicons.glyphMap

        function onPress() {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true })
          if (!focused && !event.defaultPrevented) {
            Haptics.selectionAsync()
            navigation.navigate(route.name)
          }
        }

        return (
          <Pressable
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            accessibilityRole="button"
            accessibilityLabel={typeof options.title === 'string' ? options.title : route.name}
          >
            {focused && <View style={styles.activeLine} />}
            <Ionicons name={iconName} size={21} color={focused ? colors.text : colors.textFaint} />
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    flexDirection: 'row',
    backgroundColor: colors.background,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.borderStrong,
  },
  tab: {
    flex: 1,
    height: 52,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeLine: {
    position: 'absolute',
    top: -StyleSheet.hairlineWidth,
    width: 24,
    height: 2,
    backgroundColor: colors.text,
  },
})
