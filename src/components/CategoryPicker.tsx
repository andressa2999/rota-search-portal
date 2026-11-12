import { useMemo, useState } from 'react'
import { KEYWORD_GROUPS } from '../data/keyword-categories'

interface CategoryPickerProps {
  selected: string[]
  onToggle: (item: string) => void
  onClear: () => void
}

export function CategoryPicker({ selected, onToggle, onClear }: CategoryPickerProps) {
  const [filter, setFilter] = useState('')
  const visibleGroups = useMemo(() => {
    const needle = filter.trim().toLocaleLowerCase()
    return KEYWORD_GROUPS
      .map((group) => ({
        ...group,
        items: group.items.filter((item) => item.toLocaleLowerCase().includes(needle)),
      }))
      .filter((group) => group.items.length > 0)
  }, [filter])

  return (
    <section className="category-picker" aria-labelledby="keyword-categories-heading">
      <div className="category-picker-header">
        <div>
          <p className="eyebrow">PALAVRAS-CHAVE</p>
          <h4 id="keyword-categories-heading">Escolha várias opções</h4>
          <p className="category-picker-description">As seleções são acrescentadas como termos comuns à consulta.</p>
        </div>
        <button className="category-clear" type="button" onClick={onClear} disabled={selected.length === 0}>
          Limpar seleção
        </button>
      </div>

      <label className="field category-search" htmlFor="category-filter">
        <span className="field-label">Filtrar a lista</span>
        <input
          id="category-filter"
          type="search"
          value={filter}
          onChange={(event) => setFilter(event.target.value)}
          placeholder="Digite para localizar uma opção"
        />
      </label>

      <p className="category-selection-count" role="status" aria-live="polite">
        {selected.length === 0 ? 'Nenhuma opção selecionada' : `${selected.length} ${selected.length === 1 ? 'opção selecionada' : 'opções selecionadas'}`}
      </p>

      {selected.length > 0 && (
        <div className="selected-keywords" aria-label="Palavras-chave selecionadas">
          {selected.map((item) => (
            <button
              className="selected-keyword"
              key={item}
              type="button"
              onClick={() => onToggle(item)}
              aria-label={`Remover ${item}`}
              title={`Remover ${item}`}
            >
              <span>{item}</span><span aria-hidden="true">×</span>
            </button>
          ))}
        </div>
      )}

      <div className="category-groups">
        {visibleGroups.map((group) => (
          <details className="category-group" key={group.id} open={filter.trim().length > 0}>
            <summary>
              <span>{group.title}</span>
              <span className="category-group-count">{group.items.length}</span>
            </summary>
            <div className="category-options" role="group" aria-label={group.title}>
              {group.items.map((item) => (
                <label className="category-option" key={item}>
                  <input
                    type="checkbox"
                    checked={selected.includes(item)}
                    onChange={() => onToggle(item)}
                  />
                  <span>{item}</span>
                </label>
              ))}
            </div>
          </details>
        ))}
        {visibleGroups.length === 0 && <p className="category-empty">Nenhuma opção corresponde a esse filtro.</p>}
      </div>

      <p className="category-source-note">Lista fornecida pelo usuário. Os termos são palavras-chave comuns; não são filtros oficiais verificados das plataformas.</p>
    </section>
  )
}
