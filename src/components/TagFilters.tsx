import { useMemo, useState } from 'react'
import type { TagFacet } from '../types/sepiasearch'

interface TagFiltersProps {
  tags: TagFacet[]
  included: string[]
  excluded: string[]
  onInclude: (tag: string) => void
  onExclude: (tag: string) => void
  onClear: () => void
}

export function TagFilters({ tags, included, excluded, onInclude, onExclude, onClear }: TagFiltersProps) {
  const [filterText, setFilterText] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const needle = filterText.trim().toLocaleLowerCase('pt-BR')
  const visibleTags = useMemo(
    () => tags.filter((tag) => !needle || tag.name.toLocaleLowerCase('pt-BR').includes(needle)),
    [needle, tags],
  )
  const selectedCount = included.length + excluded.length

  return (
    <aside className={`filter-panel ${isOpen ? 'is-open' : ''}`} aria-labelledby="tag-filter-title">
      <div className="filter-panel__header">
        <div>
          <p className="eyebrow">REFINAR RESULTADOS</p>
          <div className="filter-panel__title-row">
            <h2 id="tag-filter-title">Tags relacionadas</h2>
            <button className="filter-panel__toggle" type="button" aria-expanded={isOpen} onClick={() => setIsOpen((open) => !open)}>
              {isOpen ? 'Ocultar' : `Ver filtros${selectedCount ? ` (${selectedCount})` : ''}`} <span aria-hidden="true">{isOpen ? '⌃' : '⌄'}</span>
            </button>
          </div>
        </div>
        <button className="text-button" type="button" onClick={onClear} disabled={selectedCount === 0}>
          Limpar
        </button>
      </div>
      <div className="filter-panel__content">
      <p className="filter-panel__intro">As tags aparecem a partir dos vídeos públicos carregados. Incluir aceita qualquer tag escolhida; excluir remove vídeos com qualquer tag escolhida.</p>

      <div className="selected-filter-groups" aria-live="polite">
        <div className="selected-filter-group">
          <span className="filter-mode filter-mode--include">INCLUIR</span>
          <span>{included.length ? included.join(', ') : 'nenhuma'}</span>
        </div>
        <div className="selected-filter-group">
          <span className="filter-mode filter-mode--exclude">EXCLUIR</span>
          <span>{excluded.length ? excluded.join(', ') : 'nenhuma'}</span>
        </div>
      </div>

      <label className="tag-search" htmlFor="tag-search-input">
        <span className="sr-only">Filtrar tags disponíveis</span>
        <svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="8.5" cy="8.5" r="5.5" /><path d="m13 13 4 4" /></svg>
        <input
          id="tag-search-input"
          type="search"
          value={filterText}
          onChange={(event) => setFilterText(event.target.value)}
          placeholder="Filtrar tags desta busca"
        />
      </label>

      {tags.length === 0 ? (
        <p className="tag-empty">As tags serão listadas quando a busca retornar vídeos elegíveis com tags.</p>
      ) : visibleTags.length === 0 ? (
        <p className="tag-empty">Nenhuma tag corresponde ao filtro digitado.</p>
      ) : (
        <div className="tag-list" role="list" aria-label="Tags dinâmicas disponíveis">
          {visibleTags.map((tag) => {
            const isIncluded = included.includes(tag.name)
            const isExcluded = excluded.includes(tag.name)
            return (
              <div className="tag-row" role="listitem" key={tag.name}>
                <span className="tag-row__name" title={tag.name}>{tag.name}</span>
                <span className="tag-row__count" aria-label={`${tag.count} vídeos`}>{tag.count}</span>
                <div className="tag-row__actions">
                  <button
                    className={`tag-action tag-action--include ${isIncluded ? 'is-active' : ''}`}
                    type="button"
                    aria-label={`${isIncluded ? 'Remover inclusão de' : 'Incluir'} ${tag.name}`}
                    aria-pressed={isIncluded}
                    onClick={() => onInclude(tag.name)}
                  >
                    +<span className="sr-only">Incluir</span>
                  </button>
                  <button
                    className={`tag-action tag-action--exclude ${isExcluded ? 'is-active' : ''}`}
                    type="button"
                    aria-label={`${isExcluded ? 'Remover exclusão de' : 'Excluir'} ${tag.name}`}
                    aria-pressed={isExcluded}
                    onClick={() => onExclude(tag.name)}
                  >
                    −<span className="sr-only">Excluir</span>
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
      <p className="filter-panel__footer">{tags.length} tags únicas em {tags.reduce((sum, item) => sum + item.count, 0)} ocorrências dos resultados elegíveis carregados.</p>
      </div>
    </aside>
  )
}
