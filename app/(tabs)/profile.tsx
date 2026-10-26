import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import Ionicons from '@expo/vector-icons/Ionicons'
import { useAuth } from '../../src/lib/AuthContext'
import { imageUrl } from '../../src/lib/api'
import { colors, font, radius, spacing } from '../../src/lib/theme'
import Loader from '../../src/components/Loader'
import Footer from '../../src/components/Footer'
import Reveal from '../../src/components/Reveal'
import AnimatedPressable from '../../src/components/AnimatedPressable'
import Solid from '../../src/components/Solid'

interface ProfileRowProps {
  icon: keyof typeof Ionicons.glyphMap
  label: string
  onPress: () => void
  danger?: boolean
}

function ProfileRow({ icon, label, onPress, danger }: ProfileRowProps) {
  return (
    <AnimatedPressable onPress={onPress} style={styles.row}>
      <View style={styles.rowLeft}>
        <Ionicons name={icon} size={19} color={danger ? colors.danger : colors.textDim} />
        <Text style={[styles.rowLabel, danger && styles.rowLabelDanger]}>{label}</Text>
      </View>
      {!danger && <Ionicons name="chevron-forward" size={18} color={colors.textFaint} />}
    </AnimatedPressable>
  )
}

function LoginButton() {
  const router = useRouter()
  return (
    <AnimatedPressable haptic onPress={() => router.push('/login')}>
      <Solid style={styles.loginButton}>
        <Text style={styles.loginButtonText}>Войти</Text>
      </Solid>
    </AnimatedPressable>
  )
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets()
  const router = useRouter()
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <Loader label="Загрузка..." />
      </View>
    )
  }

  const avatarUri = user
    ? imageUrl(user.avatar?.optimized?.preview || user.avatar?.preview)
    : undefined

  return (
    <ScrollView
      style={[styles.container, { paddingTop: insets.top }]}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing(24) }}
    >
      <Text style={styles.title}>Профиль</Text>

      {user ? (
        <Reveal style={styles.userHeader}>
          {avatarUri ? (
            <Image source={{ uri: avatarUri }} style={styles.avatar} />
          ) : (
            <Solid style={styles.avatarFallback}>
              <Text style={styles.avatarFallbackText}>{user.nickname?.[0]?.toUpperCase() ?? '?'}</Text>
            </Solid>
          )}
          <Text style={styles.nickname}>{user.nickname}</Text>
        </Reveal>
      ) : (
        <View style={styles.loggedOutWrap}>
          <View style={styles.loggedOutIconCircle}>
            <Ionicons name="person" size={30} color={colors.textDim} />
          </View>
          <Text style={styles.loggedOutTitle}>Вы не вошли в аккаунт</Text>
          <Text style={styles.loggedOutText}>
            Войдите в аккаунт AniLiberty, чтобы синхронизировать избранное, списки и историю
            просмотра между устройствами
          </Text>
          <View style={{ marginTop: spacing(5) }}>
            <LoginButton />
          </View>
        </View>
      )}

      <View style={styles.section}>
        <ProfileRow icon="star-outline" label="Понравилось" onPress={() => router.push('/wishlist')} />
        {user && (
          <>
            <ProfileRow icon="list-outline" label="Мои списки" onPress={() => router.push('/account/lists')} />
            <ProfileRow icon="time-outline" label="История" onPress={() => router.push('/account/history')} />
          </>
        )}
      </View>

      {user && (
        <View style={styles.section}>
          <ProfileRow icon="log-out-outline" label="Выйти" onPress={logout} danger />
        </View>
      )}

      <Footer />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  title: {
    color: colors.text,
    fontFamily: font.display,
    fontSize: 22,
    paddingHorizontal: spacing(4),
    marginTop: spacing(2),
    marginBottom: spacing(4),
  },
  userHeader: {
    alignItems: 'center',
    paddingHorizontal: spacing(4),
    marginBottom: spacing(6),
  },
  avatar: {
    width: 84,
    height: 84,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceRaised,
  },
  avatarFallback: {
    width: 84,
    height: 84,
    borderRadius: radius.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallbackText: {
    color: colors.onAccent,
    fontFamily: font.display,
    fontSize: 32,
  },
  nickname: {
    color: colors.text,
    fontFamily: font.heading,
    fontSize: 18,
    marginTop: spacing(3),
  },
  loggedOutWrap: {
    alignItems: 'center',
    paddingHorizontal: spacing(6),
    marginBottom: spacing(6),
  },
  loggedOutIconCircle: {
    width: 68,
    height: 68,
    borderRadius: radius.round,
    backgroundColor: colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loggedOutTitle: {
    color: colors.text,
    fontFamily: font.heading,
    fontSize: 16,
    marginTop: spacing(4),
    textAlign: 'center',
  },
  loggedOutText: {
    color: colors.textFaint,
    fontFamily: font.regular,
    fontSize: 13,
    textAlign: 'center',
    marginTop: spacing(2),
    lineHeight: 18,
  },
  loginButton: {
    borderRadius: radius.md,
    paddingHorizontal: spacing(8),
    paddingVertical: spacing(3),
  },
  loginButtonText: {
    color: colors.onAccent,
    fontFamily: font.heading,
    fontSize: 15,
  },
  section: {
    marginHorizontal: spacing(4),
    marginBottom: spacing(4),
    backgroundColor: colors.surfaceCard,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing(4),
    paddingVertical: spacing(4),
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  rowLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing(3),
  },
  rowLabel: {
    color: colors.text,
    fontFamily: font.body,
    fontSize: 15,
  },
  rowLabelDanger: {
    color: colors.danger,
  },
})
