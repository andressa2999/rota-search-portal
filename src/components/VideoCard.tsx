import { useState } from 'react'
import type { SepiaVideo } from '../types/sepiasearch'
import { formatCount, formatDuration, formatPublishedDate, getEmbedUrl, getVideoHost } from '../lib/video-filters'

export function VideoCard({ video }: { video: SepiaVideo }) {
  const [playerOpen, setPlayerOpen] = useState(false)
  const [playerError, setPlayerError] = useState(false)
  const [playerLoaded, setPlayerLoaded] = useState(false)
  const embedUrl = getEmbedUrl(video)
  const host = getVideoHost(video)
  const account = video.account?.displayName || video.account?.name || video.channel?.displayName || video.channel?.name
  const duration = formatDuration(video.duration)
  const views = formatCount(video.views)
  const published = formatPublishedDate(video.publishedAt || video.createdAt)

  function openPlayer() {
    setPlayerError(false)
    setPlayerLoaded(false)
    setPlayerOpen(true)
  }

  return (
    <article className="video-card">
      <div className="video-player-frame">
        {playerOpen && embedUrl ? (
          <iframe
            className="video-player-frame__iframe"
            src={embedUrl}
            title={`Player incorporado: ${video.name}`}
            loading="lazy"
            allow="encrypted-media; fullscreen; picture-in-picture"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
            onLoad={() => setPlayerLoaded(true)}
            onError={() => setPlayerError(true)}
          />
        ) : (
          <div className="video-placeholder">
            {embedUrl ? (
              <button className="play-button" type="button" onClick={openPlayer} aria-label={`Reproduzir ${video.name} aqui`}>
                <span className="play-button__icon" aria-hidden="true"><svg viewBox="0 0 24 24"><path d="m8 5 12 7-12 7z" /></svg></span>
                <span>Reproduzir aqui</span>
                <small>Player da instância de origem</small>
              </button>
            ) : (
              <p className="no-player">Player incorporado indisponível para este vídeo.</p>
            )}
          </div>
        )}
        <span className="video-public-badge"><span aria-hidden="true">●</span> PÚBLICO</span>
        {duration && <span className="video-duration">{duration}</span>}
      </div>

      <div className="video-card__body">
        <div className="video-card__title-row">
          <h3 title={video.name}>{video.name}</h3>
          <span className="explicit-badge" title="Marcado pela origem com a flag EXPLICIT_SEX">18+</span>
        </div>
        <p className="video-source">{account && <span>{account} · </span>}<span>{host}</span></p>
        <div className="video-meta" aria-label="Metadados do vídeo">
          {views && <span>{views} visualizações</span>}
          {published && <span>{published}</span>}
          <span>Marcado como explícito</span>
        </div>
        {video.tags.length > 0 && (
          <div className="video-tags" aria-label="Tags do vídeo">
            {video.tags.map((tag) => <span className="video-tag" key={`${video.uuid}-${tag}`}>{tag}</span>)}
          </div>
        )}
        <div className="video-card__actions">
          {playerOpen && embedUrl && (
            <button className="close-player" type="button" onClick={() => setPlayerOpen(false)}>Fechar player</button>
          )}
          <a className="source-link" href={video.url} target="_blank" rel="noopener noreferrer">
            Abrir no PeerTube de origem <span aria-hidden="true">↗</span>
          </a>
        </div>
        {playerOpen && !playerLoaded && !playerError && <p className="player-message" role="status">Carregando o player da instância… Se não iniciar, abra o vídeo na origem.</p>}
        {playerError && <p className="player-message player-message--error" role="alert">O player não carregou. Use o link para abrir o vídeo na instância de origem.</p>}
        {!playerOpen && <p className="player-note">O player só é carregado após seu clique.</p>}
      </div>
    </article>
  )
}
