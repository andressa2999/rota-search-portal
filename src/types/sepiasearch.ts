export interface PeerTubePrivacy {
  id: number
  label?: string
}

export interface PeerTubeIdentity {
  id?: number
  name?: string
  displayName?: string
  host?: string
  url?: string
}

export interface SepiaVideo {
  uuid: string
  name: string
  url: string
  embedPath?: string
  privacy?: PeerTubePrivacy
  nsfw: boolean
  nsfwFlags: number
  tags: string[]
  duration?: number
  views?: number
  likes?: number
  publishedAt?: string
  createdAt?: string
  account?: PeerTubeIdentity
  channel?: PeerTubeIdentity
  videoChannel?: PeerTubeIdentity
}

export interface SepiaSearchResponse {
  total: number
  rawCount: number
  data: SepiaVideo[]
}

export interface TagFacet {
  name: string
  count: number
}
