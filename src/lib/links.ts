import type { Release } from './types'

export function titleHref(release: Release): string {
  if (release.source === 'yummy') return `/yummy/${release.yummy_id}`
  return `/title/${release.alias || release.id}`
}
