import { useMemo } from 'react'
import { StyleSheet, View } from 'react-native'
import { WebView } from 'react-native-webview'
import { colors, radius } from '../lib/theme'

const PARENT_ORIGIN = 'https://anisav.savsis.xyz/'

function escapeAttr(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function playerHtml(url: string): string {
  return (
    '<!doctype html><html><head><meta charset="utf-8">' +
    '<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1">' +
    '<style>html,body{margin:0;height:100%;background:#000;overflow:hidden}' +
    'iframe{border:0;width:100%;height:100%}</style></head><body>' +
    `<iframe src="${escapeAttr(url)}" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" ` +
    'allowfullscreen referrerpolicy="origin" sandbox="allow-scripts allow-same-origin allow-presentation allow-forms"></iframe>' +
    '</body></html>'
  )
}

export default function YummyPlayer({ url }: { url: string }) {
  const source = useMemo(() => ({ html: playerHtml(url), baseUrl: PARENT_ORIGIN }), [url])

  return (
    <View style={styles.frame}>
      <WebView
        source={source}
        style={styles.web}
        originWhitelist={['https://*', 'http://*', 'about:*']}
        javascriptEnabled
        allowsInlineMediaPlayback
        allowsFullscreenVideo
        mediaPlaybackRequiresUserAction={false}
        setSupportMultipleWindows={false}
        scrollEnabled={false}
        bounces={false}
        onShouldStartLoadWithRequest={(req) =>
          req.isTopFrame === false || req.url === 'about:blank' || req.url.startsWith(PARENT_ORIGIN)
        }
      />
    </View>
  )
}

const styles = StyleSheet.create({
  frame: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: radius.md,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.borderStrong,
  },
  web: {
    flex: 1,
    backgroundColor: '#000',
  },
})
