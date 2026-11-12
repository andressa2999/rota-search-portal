import { useMemo, useState } from 'react'
import { PLATFORMS, type PlatformId } from './data/platforms'
import { CategoryPicker } from './components/CategoryPicker'
import { buildNudeVistaQuery, buildPlainQuery, type NudeVistaQueryInput } from './lib/query'

const emptyNudeVistaQuery: NudeVistaQueryInput = {
  allWords: '',
  exactPhrase: '',
  anyWords: '',
  noneWords: '',
  includeSite: '',
  excludeSite: '',
  category: '',
  longerThan: '',
  shorterThan: '',
}

function BrandMark() {
  return (
    <svg className="brand-mark" viewBox="0 0 40 40" aria-hidden="true">
      <path d="M7 11h15l-4-4m4 4-4 4M7 20h22l-4-4m4 4-4 4M7 29h15l-4-4m4 4-4 4" />
      <circle cx="32" cy="11" r="2" />
      <circle cx="32" cy="29" r="2" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <path d="M11 3h6v6M17 3l-8 8" />
      <path d="M15 11v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" />
    </svg>
  )
}

function CopyIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true">
      <rect x="7" y="7" width="10" height="10" rx="2" />
      <path d="M13 5V4a1 1 0 0 0-1-1H4a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h1" />
    </svg>
  )
}

function Field({
  id,
  label,
  hint,
  value,
  onChange,
  placeholder,
  type = 'text',
}: {
  id: string
  label: string
  hint?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  type?: 'text' | 'search'
}) {
  return (
    <label className="field" htmlFor={id}>
      <span className="field-label">{label}{hint && <span className="field-hint-label">{hint}</span>}</span>
      <input id={id} type={type} value={value} placeholder={placeholder} onChange={(event) => onChange(event.target.value)} />
    </label>
  )
}

function App() {
  const [activeSource, setActiveSource] = useState<PlatformId>('nudevista')
  const [plainQuery, setPlainQuery] = useState('')
  const [nudeVistaQuery, setNudeVistaQuery] = useState<NudeVistaQueryInput>(emptyNudeVistaQuery)
  const [selectedCategoryTerms, setSelectedCategoryTerms] = useState<string[]>([])
  const [copyNotice, setCopyNotice] = useState('')

  const platform = PLATFORMS.find((item) => item.id === activeSource) ?? PLATFORMS[0]
  const selectedKeywords = selectedCategoryTerms.join(' ')
  const nudeVistaResult = useMemo(() => buildNudeVistaQuery({
    ...nudeVistaQuery,
    allWords: [nudeVistaQuery.allWords, selectedKeywords].filter(Boolean).join(' '),
  }), [nudeVistaQuery, selectedKeywords])
  const plainQueryWithCategories = useMemo(
    () => buildPlainQuery([plainQuery, selectedKeywords].filter(Boolean).join(' ')),
    [plainQuery, selectedKeywords],
  )
  const queryToCopy = activeSource === 'nudevista'
    ? nudeVistaResult.query
    : activeSource === 'pornmd'
      ? plainQueryWithCategories
      : ''
  const validationErrors = activeSource === 'nudevista' ? nudeVistaResult.errors : []

  function updateNudeVistaField<K extends keyof NudeVistaQueryInput>(key: K, value: NudeVistaQueryInput[K]) {
    setNudeVistaQuery((current) => ({ ...current, [key]: value }))
    setCopyNotice('')
  }

  function toggleCategoryTerm(item: string) {
    setSelectedCategoryTerms((current) => current.includes(item)
      ? current.filter((selected) => selected !== item)
      : [...current, item])
    setCopyNotice('')
  }

  function clearCategoryTerms() {
    setSelectedCategoryTerms([])
    setCopyNotice('')
  }

  function selectSource(id: PlatformId) {
    setActiveSource(id)
    setCopyNotice('')
  }

  async function copyQuery() {
    if (validationErrors.length > 0) {
      setCopyNotice('Corrija os campos indicados antes de copiar.')
      return
    }
    if (!queryToCopy) {
      setCopyNotice(activeSource === 'pornmd' ? 'Digite um termo para montar a consulta.' : 'Preencha ao menos um campo para montar a consulta.')
      return
    }
    try {
      if (!navigator.clipboard?.writeText) throw new Error('clipboard unavailable')
      await navigator.clipboard.writeText(queryToCopy)
      setCopyNotice('Consulta copiada. Cole-a manualmente no site de destino.')
    } catch {
      setCopyNotice('Não foi possível copiar automaticamente. Selecione o texto acima e use a opção Copiar do navegador.')
    }
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <a className="brand" href="#inicio" aria-label="Rota, início">
          <BrandMark />
          <span className="brand-name">ROTA<span> / BUSCA MANUAL</span></span>
        </a>
        <div className="topbar-meta"><span className="status-dot" /> SEM RESULTADOS INTERNOS</div>
      </header>

      <main id="inicio">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <p className="eyebrow"><span>01</span> PORTAL DE BUSCA EXTERNA <span className="age-pill">18+</span></p>
            <h1 id="hero-title">Sua consulta.<br /><em>Sua fonte.</em></h1>
            <p className="hero-description">Monte uma consulta local e escolha onde continuar. Este portal não acessa, coleta nem exibe vídeos ou resultados.</p>
          </div>
          <div className="hero-mark" aria-hidden="true"><BrandMark /><span>ABRA<br />NA FONTE</span></div>
        </section>

        <section className="notice" aria-label="Aviso de conteúdo">
          <span className="notice-tag">18+</span>
          <p>Destinado somente a adultos. Os sites externos podem exibir conteúdo explícito e aplicam suas próprias regras e verificações. O portal Rota não hospeda nem indexa conteúdo.</p>
        </section>

        <section className="source-section" aria-labelledby="source-heading">
          <div className="section-heading">
            <div><p className="eyebrow"><span>02</span> ESCOLHA O DESTINO</p><h2 id="source-heading">Onde você quer pesquisar?</h2></div>
            <p className="section-side-note">A busca é feita manualmente no site escolhido.</p>
          </div>

          <div className="source-tabs" role="group" aria-label="Buscadores externos">
            {PLATFORMS.map((item, index) => (
              <button
                className={`source-tab ${activeSource === item.id ? 'source-tab--active' : ''} ${item.status === 'inactive' ? 'source-tab--legacy' : ''}`}
                key={item.id}
                type="button"
                aria-pressed={activeSource === item.id}
                onClick={() => selectSource(item.id)}
              >
                <span className="source-tab-number">0{index + 1}</span>
                <span className="source-tab-name">{item.name}</span>
                <span className="source-tab-state">{item.status === 'inactive' ? 'ENCERRADO' : 'LINK EXTERNO'}</span>
              </button>
            ))}
          </div>

          <div className="source-panel" id="source-panel" role="region" aria-label={`Busca manual — ${platform.name}`}>
            <div className="source-intro">
              <div>
                <p className="eyebrow">FONTE SELECIONADA <span className="source-domain">{platform.domain}</span></p>
                <h3>{platform.name}</h3>
                <p className="source-description">{platform.description}</p>
              </div>
              {platform.status === 'active' && <span className="manual-badge"><span className="status-dot" /> MANUAL</span>}
            </div>

            {activeSource !== 'findtubes' && (
              <CategoryPicker selected={selectedCategoryTerms} onToggle={toggleCategoryTerm} onClear={clearCategoryTerms} />
            )}

            {activeSource === 'nudevista' && (
              <div className="builder-layout">
                <div className="builder-fields">
                  <div className="builder-title"><span className="step-number">A</span><div><h4>Construa sua consulta</h4><p>Sintaxe da busca avançada publicada pelo NudeVista. A consulta é montada aqui, mas não é enviada ao site.</p></div></div>
                  <div className="fields-grid">
                    <Field id="all-words" label="Todas estas palavras" hint="AND" value={nudeVistaQuery.allWords} onChange={(value) => updateNudeVistaField('allWords', value)} placeholder="ex.: palavra1 palavra2" />
                    <Field id="exact-phrase" label="Frase exata" hint="com aspas" value={nudeVistaQuery.exactPhrase} onChange={(value) => updateNudeVistaField('exactPhrase', value)} placeholder="ex.: frase exata" />
                    <Field id="any-words" label="Qualquer destas palavras" hint="separe por vírgulas" value={nudeVistaQuery.anyWords} onChange={(value) => updateNudeVistaField('anyWords', value)} placeholder="ex.: termo1, termo2" />
                    <Field id="none-words" label="Excluir palavras" hint="separe por vírgulas" value={nudeVistaQuery.noneWords} onChange={(value) => updateNudeVistaField('noneWords', value)} placeholder="ex.: termo a excluir" />
                    <Field id="include-site" label="Somente deste site" hint="domínio" value={nudeVistaQuery.includeSite} onChange={(value) => updateNudeVistaField('includeSite', value)} placeholder="ex.: xhamster.com" />
                    <Field id="exclude-site" label="Excluir este site" hint="domínio" value={nudeVistaQuery.excludeSite} onChange={(value) => updateNudeVistaField('excludeSite', value)} placeholder="ex.: exemplo.com" />
                    <Field id="category" label="Categoria" hint="slug" value={nudeVistaQuery.category} onChange={(value) => updateNudeVistaField('category', value)} placeholder="ex.: straight, gay, trans" />
                    <div className="duration-row">
                      <Field id="longer-than" label="Duração maior que" hint="MM:SS" value={nudeVistaQuery.longerThan} onChange={(value) => updateNudeVistaField('longerThan', value)} placeholder="20:00" />
                      <Field id="shorter-than" label="Duração menor que" hint="MM:SS" value={nudeVistaQuery.shorterThan} onChange={(value) => updateNudeVistaField('shorterThan', value)} placeholder="60:00" />
                    </div>
                  </div>
                  <p className="field-note">Exemplos de operadores conforme a página oficial. A disponibilidade dos resultados e das categorias depende do próprio NudeVista.</p>
                </div>

                <aside className="query-output-panel" aria-label="Consulta pronta para copiar">
                  <div className="output-heading"><span className="step-number">B</span><div><h4>Copie e cole</h4><p>Revise a string antes de usá-la.</p></div></div>
                  <label className="sr-only" htmlFor="query-output">Consulta gerada para NudeVista</label>
                  <textarea id="query-output" value={queryToCopy} readOnly rows={7} placeholder="Sua consulta aparecerá aqui." />
                  {validationErrors.length > 0 && <ul className="validation-list" aria-label="Erros nos campos">{validationErrors.map((error) => <li key={error}>{error}</li>)}</ul>}
                  <button className="button button--primary" type="button" onClick={() => void copyQuery()} disabled={validationErrors.length > 0 || !queryToCopy}><CopyIcon /> Copiar consulta</button>
                  <a className="button button--secondary" href={platform.href} target="_blank" rel="noopener noreferrer">Abrir busca avançada <ExternalIcon /></a>
                  <p className="copy-notice" aria-live="polite">{copyNotice || 'A busca só acontece quando você cola e envia os campos no NudeVista.'}</p>
                </aside>
              </div>
            )}

            {activeSource === 'pornmd' && (
              <div className="manual-search-panel">
                <div className="builder-title"><span className="step-number">A</span><div><h4>Busca manual</h4><p>O portal não envia a consulta. Copie os termos e pesquise na página oficial do PornMD.</p></div></div>
                <Field id="pornmd-query" label="Termos de busca" value={plainQuery} onChange={(value) => { setPlainQuery(value); setCopyNotice('') }} placeholder="Digite palavras para sua busca" type="search" />
                <div className="plain-query-preview">
                  <label className="field-label" htmlFor="pornmd-query-output">Consulta pronta para copiar</label>
                  <textarea id="pornmd-query-output" value={queryToCopy} readOnly rows={3} placeholder="Os termos digitados e as opções selecionadas aparecerão aqui." />
                </div>
                <div className="manual-actions">
                  <button className="button button--primary" type="button" onClick={() => void copyQuery()} disabled={!queryToCopy}><CopyIcon /> Copiar termos</button>
                  <a className="button button--secondary" href={platform.href} target="_blank" rel="noopener noreferrer">Abrir PornMD <ExternalIcon /></a>
                </div>
                <p className="copy-notice" aria-live="polite">{copyNotice || 'Cole os termos na busca do PornMD. Este portal não coleta nem replica resultados.'}</p>
              </div>
            )}

            {activeSource === 'findtubes' && (
              <div className="legacy-panel" role="status">
                <div className="legacy-stamp">OFFLINE</div>
                <div className="legacy-copy"><h4>O FindTubes encerrou.</h4><p>A página oficial informa que o serviço não está mais disponível e encaminha visitantes ao PornMD. Este cartão é apenas informativo, não uma fonte independente de busca.</p></div>
                <a className="button button--primary" href="https://www.pornmd.com/" target="_blank" rel="noopener noreferrer">Continuar no PornMD <ExternalIcon /></a>
                <a className="legacy-link" href={platform.href} target="_blank" rel="noopener noreferrer">Ver o aviso oficial do FindTubes</a>
              </div>
            )}
          </div>
        </section>

        <section className="how-section" aria-labelledby="how-heading">
          <div className="section-heading section-heading--compact"><div><p className="eyebrow"><span>03</span> CONTROLE NA SUA MÃO</p><h2 id="how-heading">Sem consulta escondida.</h2></div></div>
          <div className="how-row">
            <article><span className="how-number">01</span><h3>Monte</h3><p>Escreva os termos ou use somente os filtros documentados do NudeVista.</p></article>
            <article><span className="how-number">02</span><h3>Copie</h3><p>A consulta fica nesta página enquanto ela estiver aberta. Nada é salvo.</p></article>
            <article><span className="how-number">03</span><h3>Pesquise na fonte</h3><p>Abra o site oficial e cole a consulta manualmente. Resultados não voltam para o Rota.</p></article>
          </div>
        </section>

        <section className="terms-note" aria-label="Limites e termos dos sites">
          <div><span className="terms-icon">i</span><p><strong>Os sites aplicam suas próprias regras.</strong> Este portal não busca, copia ou exibe conteúdo. Consulte os <a href="https://www.pornmd.com/terms-of-service/" target="_blank" rel="noopener noreferrer">Termos do PornMD</a> e os <a href="https://www.nudevista.com/TOS/" target="_blank" rel="noopener noreferrer">Termos do NudeVista</a> antes de usar os destinos externos.</p></div>
          <a className="terms-link" href="https://www.nudevista.com/advanced-search/" target="_blank" rel="noopener noreferrer">Filtros descritos pelo NudeVista <ExternalIcon /></a>
        </section>
      </main>

      <footer className="footer">
        <a className="footer-brand" href="#inicio"><BrandMark /><span>ROTA</span></a>
        <p>Consulta local · links oficiais · sem resultados internos</p>
        <span className="footer-code">STATIC / 18+</span>
      </footer>
    </div>
  )
}

export default App
