import type { PeerTubeIdentity, PeerTubePrivacy, SepiaSearchResponse, SepiaVideo } from '../types/sepiasearch'

export const SEPIA_SEARCH_API = 'https://sepiasearch.org/api/v1/search/videos'
export const PAGE_SIZE = 50

export class SepiaSearchError extends Error {
  status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = 'SepiaSearchError'
    this.status = status
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function toOptionalNumber(value: unknown): number | undefined {
  if (typeof value !== 'number' && typeof value !== 'string') return undefined
  const number = Number(value)
  return Number.isFinite(number) ? number : undefined
}

function readIdentity(value: unknown): PeerTubeIdentity | undefined {
  if (!isRecord(value)) return undefined
  return {
    id: toOptionalNumber(value.id),
    name: typeof value.name === 'string' ? value.name : undefined,
    displayName: typeof value.displayName === 'string' ? value.displayName : undefined,
    host: typeof value.host === 'string' ? value.host : undefined,
    url: typeof value.url === 'string' ? value.url : undefined,
  }
}

function readPrivacy(value: unknown): PeerTubePrivacy | undefined {
  if (!isRecord(value)) return undefined
  const id = toOptionalNumber(value.id)
  if (id === undefined) return undefined
  return { id, label: typeof value.label === 'string' ? value.label : undefined }
}

function parseVideo(value: unknown): SepiaVideo | undefined {
  if (!isRecord(value)) return undefined
  if (typeof value.uuid !== 'string' || typeof value.name !== 'string' || typeof value.url !== 'string') return undefined

  let sourceUrl: URL
  try {
    sourceUrl = new URL(value.url)
  } catch {
    return undefined
  }
  if (sourceUrl.protocol !== 'https:' || sourceUrl.username || sourceUrl.password) return undefined

  const tags = Array.isArray(value.tags)
    ? value.tags.filter((tag): tag is string => typeof tag === 'string').map((tag) => tag.trim()).filter(Boolean)
    : []
  const privacy = readPrivacy(value.privacy)
  const embedPath = typeof value.embedPath === 'string' ? value.embedPath : undefined

  return {
    uuid: value.uuid,
    name: value.name,
    url: sourceUrl.href,
    embedPath,
    privacy,
    nsfw: value.nsfw === true,
    nsfwFlags: toOptionalNumber(value.nsfwFlags) ?? 0,
    tags,
    duration: toOptionalNumber(value.duration),
    views: toOptionalNumber(value.views),
    likes: toOptionalNumber(value.likes),
    publishedAt: typeof value.publishedAt === 'string' ? value.publishedAt : undefined,
    createdAt: typeof value.createdAt === 'string' ? value.createdAt : undefined,
    account: readIdentity(value.account),
    channel: readIdentity(value.channel),
    videoChannel: readIdentity(value.videoChannel),
  }
}

function parseResponse(value: unknown): SepiaSearchResponse {
  if (!isRecord(value) || !Array.isArray(value.data)) {
    throw new SepiaSearchError('A origem retornou uma resposta fora do formato esperado.')
  }

  const rawCount = value.data.length
  const data = value.data.map(parseVideo).filter((video): video is SepiaVideo => video !== undefined)
  const total = toOptionalNumber(value.total)
  return { total: total !== undefined && total >= 0 ? total : rawCount, rawCount, data }
}

export async function searchSepiaVideos({
  query,
  start = 0,
  signal,
}: {
  query: string
  start?: number
  signal?: AbortSignal
}): Promise<SepiaSearchResponse> {
  const url = new URL(SEPIA_SEARCH_API)
  url.searchParams.set('search', query.trim())
  url.searchParams.set('privacyOneOf', '1')
  url.searchParams.set('nsfw', 'true')
  url.searchParams.set('count', String(PAGE_SIZE))
  url.searchParams.set('start', String(Math.max(0, start)))
  url.searchParams.set('skipCount', 'false')
  url.searchParams.set('sort', '-publishedAt')

  let response: Response
  try {
    response = await fetch(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      mode: 'cors',
      credentials: 'omit',
      cache: 'no-store',
      referrerPolicy: 'no-referrer',
      signal,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new SepiaSearchError('Não foi possível acessar o índice SepiaSearch. Verifique a conexão ou tente novamente.')
  }

  if (!response.ok) {
    throw new SepiaSearchError(`O índice SepiaSearch respondeu com erro HTTP ${response.status}.`, response.status)
  }

  let payload: unknown
  try {
    payload = await response.json()
  } catch {
    throw new SepiaSearchError('A origem retornou dados que não puderam ser lidos como JSON.')
  }

  return parseResponse(payload)
}
