import type { SepiaVideo, TagFacet } from '../types/sepiasearch'

export const EXPLICIT_SEX_FLAG = 2

function normalizeTag(value: string): string {
  return value.trim().toLocaleLowerCase('pt-BR')
}

export function isPublicExplicitVideo(video: SepiaVideo): boolean {
  return Number(video.privacy?.id) === 1
    && (Number(video.nsfwFlags) & EXPLICIT_SEX_FLAG) === EXPLICIT_SEX_FLAG
}

export function getEligibleVideos(videos: SepiaVideo[]): SepiaVideo[] {
  return videos.filter(isPublicExplicitVideo)
}

export function collectTagFacets(videos: SepiaVideo[]): TagFacet[] {
  const tags = new Map<string, TagFacet>()

  for (const video of videos) {
    const seenInVideo = new Set<string>()
    for (const rawTag of video.tags) {
      const name = rawTag.trim()
      const key = normalizeTag(name)
      if (!key || seenInVideo.has(key)) continue
      seenInVideo.add(key)
      const current = tags.get(key)
      if (current) current.count += 1
      else tags.set(key, { name, count: 1 })
    }
  }

  return [...tags.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'pt-BR'))
}

export function filterVideosByTags(
  videos: SepiaVideo[],
  includedTags: string[],
  excludedTags: string[],
): SepiaVideo[] {
  const included = new Set(includedTags.map(normalizeTag))
  const excluded = new Set(excludedTags.map(normalizeTag))

  return videos.filter((video) => {
    const videoTags = new Set(video.tags.map(normalizeTag))
    if (included.size > 0 && ![...included].some((tag) => videoTags.has(tag))) return false
    if ([...excluded].some((tag) => videoTags.has(tag))) return false
    return true
  })
}

export function getVideoHost(video: SepiaVideo): string {
  try {
    return new URL(video.url).hostname
  } catch {
    return 'instância desconhecida'
  }
}

export function getEmbedUrl(video: SepiaVideo): string | undefined {
  if (!video.embedPath?.startsWith('/videos/embed/')) return undefined
  if (video.embedPath.startsWith('//') || video.embedPath.includes('..')) return undefined

  try {
    const source = new URL(video.url)
    if (source.protocol !== 'https:' || source.username || source.password) return undefined
    const embed = new URL(video.embedPath, source.origin)
    if (embed.protocol !== 'https:' || embed.origin !== source.origin) return undefined
    if (!embed.pathname.startsWith('/videos/embed/')) return undefined
    return embed.href
  } catch {
    return undefined
  }
}

export function formatDuration(seconds?: number): string | undefined {
  if (seconds === undefined || !Number.isFinite(seconds) || seconds < 0) return undefined
  const total = Math.floor(seconds)
  const hours = Math.floor(total / 3600)
  const minutes = Math.floor((total % 3600) / 60)
  const remainingSeconds = total % 60
  return hours > 0
    ? `${hours}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    : `${minutes}:${String(remainingSeconds).padStart(2, '0')}`
}

export function formatCount(value?: number): string | undefined {
  if (value === undefined || !Number.isFinite(value) || value < 0) return undefined
  return new Intl.NumberFormat('pt-BR', { notation: value >= 10000 ? 'compact' : 'standard', maximumFractionDigits: 1 }).format(value)
}

export function formatPublishedDate(value?: string): string | undefined {
  if (!value) return undefined
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return undefined
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date)
}
