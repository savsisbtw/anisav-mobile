import { Text, TouchableOpacity, View, StyleSheet, Linking } from 'react-native'
import { colors, font } from '../lib/theme'

export default function Footer() {
  return (
    <View style={styles.row}>
      <TouchableOpacity onPress={() => Linking.openURL('https://im.savsis.xyz')}>
        <Text style={styles.link}>made by savsis</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
  },
  link: {
    color: colors.textFaint,
    fontFamily: font.body,
    fontSize: 12,
  },
})
