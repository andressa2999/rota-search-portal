import { useMemo, useRef, useState, type FormEvent } from 'react'
import { searchSepiaVideos } from './api/sepiasearch'
import { TagFilters } from './components/TagFilters'
import { VideoCard } from './components/VideoCard'
import { collectTagFacets, filterVideosByTags, getEligibleVideos } from './lib/video-filters'
import type { SepiaVideo } from './types/sepiasearch'

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
      <path d="M7 11h15l-4-4m4 4-4 4M7 20h22l-4-4m4 4-4 4M7 29h15l-4-4m4 4-4 4" />
      <circle cx="32" cy="11" r="2" />
      <circle cx="32" cy="29" r="2" />
    </svg>
  )
}

function SearchIcon() {
  return <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg>
}

function AgeGate({ onConfirm }: { onConfirm: () => void }) {
  return (
    <main className="age-gate">
      <section className="age-gate__card" role="dialog" aria-modal="true" aria-labelledby="age-title">
        <BrandMark />
        <span className="age-gate__pill">18+</span>
        <p className="eyebrow">ROTA SEARCH · PEERTUBE</p>
        <h1 id="age-title">Conteúdo adulto</h1>
        <p>Este portal apresenta buscas de vídeos sinalizados como conteúdo sexual explícito. Continue somente se tiver 18 anos ou mais e se isso for legal na sua região.</p>
        <button className="button button--primary age-gate__continue" type="button" onClick={onConfirm}>Tenho 18 anos ou mais — continuar</button>
        <p className="age-gate__footnote">A confirmação vale apenas para esta aba e não é salva.</p>
      </section>
    </main>
  )
}

function App() {
  const [ageConfirmed, setAgeConfirmed] = useState(false)
  const [queryInput, setQueryInput] = useState('')
  const [submittedQuery, setSubmittedQuery] = useState('')
  const [rawVideos, setRawVideos] = useState<SepiaVideo[]>([])
  const [total, setTotal] = useState(0)
  const [nextStart, setNextStart] = useState(0)
  const [includedTags, setIncludedTags] = useState<string[]>([])
  const [excludedTags, setExcludedTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState('')
  const [loadMoreError, setLoadMoreError] = useState('')
  const requestRef = useRef<AbortController | null>(null)
  const requestIdRef = useRef(0)

  const eligibleVideos = useMemo(() => getEligibleVideos(rawVideos), [rawVideos])
  const visibleVideos = useMemo(
    () => filterVideosByTags(eligibleVideos, includedTags, excludedTags),
    [eligibleVideos, includedTags, excludedTags],
  )
  const tagFacets = useMemo(() => collectTagFacets(eligibleVideos), [eligibleVideos])
  const hiddenCount = Math.max(0, rawVideos.length - eligibleVideos.length)
  const canLoadMore = submittedQuery.length > 0 && nextStart < total && rawVideos.length > 0

  async function fetchPage(query: string, start: number, append: boolean) {
    requestRef.current?.abort()
    const controller = new AbortController()
    requestRef.current = controller
    const requestId = ++requestIdRef.current

    if (append) {
      setLoadingMore(true)
      setLoadMoreError('')
    } else {
      setSubmittedQuery(query)
      setRawVideos([])
      setTotal(0)
      setNextStart(0)
      setIncludedTags([])
      setExcludedTags([])
      setError('')
      setLoadMoreError('')
      setLoading(true)
      setLoadingMore(false)
    }

    try {
      const page = await searchSepiaVideos({ query, start, signal: controller.signal })
      if (requestId !== requestIdRef.current) return
      setRawVideos((current) => {
        if (!append) return page.data
        const seen = new Set(current.map((video) => video.uuid))
        return [...current, ...page.data.filter((video) => !seen.has(video.uuid))]
      })
      setTotal(page.total)
      setNextStart(page.rawCount === 0 ? page.total : start + page.rawCount)
    } catch (cause) {
      if (controller.signal.aborted || requestId !== requestIdRef.current) return
      const message = cause instanceof Error ? cause.message : 'Ocorreu um erro inesperado na busca.'
      if (append) setLoadMoreError(message)
      else setError(message)
    } finally {
      if (requestId === requestIdRef.current) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const query = queryInput.trim()
    if (!query) {
      setError('Digite um termo para buscar.')
      return
    }
    if (query.length > 200) {
      setError('Use até 200 caracteres no termo de busca.')
      return
    }
    void fetchPage(query, 0, false)
  }

  function handleLoadMore() {
    if (!canLoadMore || loading || loadingMore) return
    void fetchPage(submittedQuery, nextStart, true)
  }

  function toggleIncluded(tag: string) {
    setIncludedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])
    setExcludedTags((current) => current.filter((item) => item !== tag))
  }

  function toggleExcluded(tag: string) {
    setExcludedTags((current) => current.includes(tag) ? current.filter((item) => item !== tag) : [...current, tag])
    setIncludedTags((current) => current.filter((item) => item !== tag))
  }

  function clearTagFilters() {
    setIncludedTags([])
    setExcludedTags([])
  }

  if (!ageConfirmed) return <AgeGate onConfirm={() => setAgeConfirmed(true)} />

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="Rota Search, início">
          <BrandMark />
          <span className="brand-name">ROTA<span> / SEARCH</span></span>
        </a>
        <nav className="main-nav" aria-label="Navegação principal">
          <a href="#search-section">Buscar</a>
          <a href="#tags-area">Tags</a>
          <a href="#video-results">Vídeos</a>
          <a href="#source-info">Sobre</a>
        </nav>
        <div className="topbar-meta"><span className="status-dot" /> SEPIASEARCH <span className="topbar-age">18+</span></div>
      </header>

      <main id="top">
        <section id="search-section" className="search-section" aria-labelledby="search-title">
          <div className="search-section__heading">
            <p className="eyebrow"><span className="eyebrow-index">BUSCA FEDERADA</span><span className="age-pill">18+</span></p>
            <h1 id="search-title">Buscar vídeos</h1>
            <p className="search-section__description">Pesquise no índice SepiaSearch. As tags relacionadas aparecem somente a partir dos resultados carregados.</p>
          </div>
          <form className="search-form" onSubmit={handleSearch}>
            <label className="sr-only" htmlFor="search-query">Termo de busca</label>
            <SearchIcon />
            <input
              id="search-query"
              type="search"
              value={queryInput}
              onChange={(event) => setQueryInput(event.target.value)}
              maxLength={200}
              placeholder="Ex.: ruiva, redhead…"
              autoComplete="off"
            />
            <button type="submit" disabled={loading}>{loading ? 'Buscando…' : 'Buscar'}</button>
          </form>
          <p className="search-privacy-note">O termo digitado é enviado ao SepiaSearch ao tocar em Buscar. Não fica salvo neste portal.</p>
          {error && <p className="inline-error" role="alert">{error}</p>}
        </section>

        <section className="notice" aria-label="Aviso de conteúdo e privacidade">
          <span className="notice-tag">18+</span>
          <p><strong>Apenas adultos.</strong> São exibidos registros marcados como públicos e com a flag `EXPLICIT_SEX`. A consulta vai ao SepiaSearch somente quando você buscar; o player conecta à instância original apenas após clique.</p>
        </section>

        <section className="results-area" aria-label="Resultados e filtros">
          <aside id="tags-area" className="filters-column">
            {submittedQuery ? (
              <TagFilters
                key={submittedQuery}
                tags={tagFacets}
                included={includedTags}
                excluded={excludedTags}
                onInclude={toggleIncluded}
                onExclude={toggleExcluded}
                onClear={clearTagFilters}
              />
            ) : (
              <div className="filter-empty-card"><span className="filter-empty-card__number">TAGS</span><h2>Tags relacionadas</h2><p>Faça uma busca para gerar opções a partir dos resultados elegíveis. Nenhuma categoria fixa é exibida.</p></div>
            )}
            <div className="eligibility-note"><span aria-hidden="true">i</span><p>“Público” não informa preços externos. As regras de acesso do vídeo pertencem à instância que o hospeda.</p></div>
          </aside>

          <section id="video-results" className="results-column" aria-labelledby="results-title">
            <div className="results-heading">
              <div><p className="eyebrow">VÍDEOS</p><h2 id="results-title">{submittedQuery ? `Busca: “${submittedQuery}”` : 'Resultados da busca'}</h2></div>
              {submittedQuery && !loading && <span className="result-count" role="status">{visibleVideos.length} exibidos · {eligibleVideos.length} elegíveis carregados</span>}
            </div>

            {!submittedQuery && (
              <div className="results-placeholder"><div className="placeholder-mark"><SearchIcon /></div><h3>Comece com um termo de busca</h3><p>Os resultados e suas tags aparecem aqui. Nenhum vídeo é carregado antes da sua busca.</p></div>
            )}
            {loading && <div className="loading-state" role="status"><span className="loading-spinner" />Buscando no índice SepiaSearch…</div>}
            {!loading && error && <div className="state-card state-card--error"><h3>Não foi possível buscar</h3><p>{error}</p><button type="button" className="button button--secondary" onClick={() => { if (submittedQuery) void fetchPage(submittedQuery, 0, false) }}>Tentar novamente</button></div>}
            {!loading && !error && submittedQuery && rawVideos.length === 0 && <div className="state-card"><h3>Nenhum resultado retornado</h3><p>Tente outro termo ou uma grafia alternativa.</p></div>}
            {!loading && !error && submittedQuery && rawVideos.length > 0 && eligibleVideos.length === 0 && <div className="state-card"><h3>Não há vídeos elegíveis nesta página</h3><p>Somente registros públicos com flag `EXPLICIT_SEX` são exibidos. A marcação depende da instância ou de quem publicou o vídeo.</p></div>}
            {!loading && !error && submittedQuery && eligibleVideos.length > 0 && visibleVideos.length === 0 && <div className="state-card"><h3>Nenhum vídeo corresponde às tags</h3><p>Remova ou altere os filtros para ampliar os resultados.</p><button type="button" className="button button--secondary" onClick={clearTagFilters}>Limpar filtros</button></div>}

            {hiddenCount > 0 && rawVideos.length > 0 && <p className="filter-summary">{hiddenCount} registro(s) da página atual não são exibidos por não atenderem aos critérios Público + EXPLICIT_SEX.</p>}
            {visibleVideos.length > 0 && (
              <div className="video-grid">
                {visibleVideos.map((video) => <VideoCard key={video.uuid} video={video} />)}
              </div>
            )}

            {loadMoreError && <p className="inline-error" role="alert">{loadMoreError}</p>}
            {canLoadMore && !error && (
              <div className="load-more-wrap">
                <button className="button button--secondary load-more" type="button" onClick={handleLoadMore} disabled={loadingMore}>
                  {loadingMore ? 'Carregando…' : 'Carregar mais resultados'}
                </button>
                <p>Novos vídeos podem acrescentar tags à lista dinâmica.</p>
              </div>
            )}
          </section>
        </section>

        <section id="source-info" className="source-disclosure" aria-label="Origem e limitações">
          <div className="source-disclosure__mark">i</div>
          <div><h2>Busca agregada, vídeos de várias instâncias</h2><p>O SepiaSearch indexa instâncias PeerTube independentes. O filtro usa apenas privacidade pública e uma marcação sexual declarada; essa marcação pode estar ausente ou incorreta. A API não informa se há monetização externa. Se o player não funcionar, use o link para abrir o vídeo na instância de origem e confira as regras daquele site.</p></div>
          <a href="https://docs.joinpeertube.org/api-rest-reference.html" target="_blank" rel="noopener noreferrer">API documentada <span aria-hidden="true">↗</span></a>
        </section>
      </main>

      <footer className="footer">
        <a className="footer-brand" href="#top"><BrandMark /><span>ROTA SEARCH</span></a>
        <p>Busca pública · tags do resultado · player sob demanda</p>
        <nav className="footer-legal-links" aria-label="Páginas legais">
          <a href="./termos.html">Termos</a>
          <a href="./privacidade.html">Privacidade</a>
          <a href="./dmca.html">DMCA</a>
        </nav>
        <a className="footer-link" href="https://sepiasearch.org/" target="_blank" rel="noopener noreferrer">SepiaSearch ↗</a>
      </footer>
    </div>
  )
}

export default App
