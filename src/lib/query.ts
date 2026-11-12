export interface NudeVistaQueryInput {
  allWords: string
  exactPhrase: string
  anyWords: string
  noneWords: string
  includeSite: string
  excludeSite: string
  category: string
  longerThan: string
  shorterThan: string
}

export interface QueryBuildResult {
  query: string
  errors: string[]
}

function normalizeText(value: string): string {
  return value.replace(/[\r\n\t]+/g, ' ').replace(/\s+/g, ' ').trim()
}

function splitCommaList(value: string): string[] {
  return value.split(/[\n,]+/).map(normalizeText).filter(Boolean)
}

function splitWords(value: string): string[] {
  return value.split(/[\s,]+/).map(normalizeText).filter(Boolean)
}

function validDomain(value: string): string | undefined {
  const domain = normalizeText(value).toLowerCase()
  if (!domain) return undefined
  const domainPattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/
  return domainPattern.test(domain) ? domain : undefined
}

function durationSeconds(value: string): number | undefined {
  const match = /^(\d{1,3}):([0-5]\d)$/.exec(normalizeText(value))
  if (!match) return undefined
  return Number(match[1]) * 60 + Number(match[2])
}

function appendDuration(
  raw: string,
  operator: '>' | '<',
  label: string,
  errors: string[],
): { token?: string; seconds?: number } {
  const value = normalizeText(raw)
  if (!value) return {}
  const seconds = durationSeconds(value)
  if (seconds === undefined) {
    errors.push(`${label}: use MM:SS, por exemplo 20:00.`)
    return {}
  }
  return { token: `length${operator}${value}`, seconds }
}

export function buildPlainQuery(value: string): string {
  return normalizeText(value)
}

export function buildNudeVistaQuery(input: NudeVistaQueryInput): QueryBuildResult {
  const errors: string[] = []
  const parts: string[] = []
  const allWords = normalizeText(input.allWords)
  const exactPhrase = normalizeText(input.exactPhrase)

  if (allWords.length > 500) errors.push('Todas as palavras: limite de 500 caracteres.')
  else if (allWords) parts.push(allWords)

  if (exactPhrase.length > 300) errors.push('Frase exata: limite de 300 caracteres.')
  else if (exactPhrase.includes('"')) errors.push('Frase exata: remova as aspas; o gerador as adiciona automaticamente.')
  else if (exactPhrase) parts.push(`"${exactPhrase}"`)

  const anyWords = splitCommaList(input.anyWords)
  if (anyWords.some((word) => /\s/.test(word))) {
    errors.push('Qualquer palavra: separe alternativas simples por vírgulas, sem espaços dentro de cada alternativa.')
  } else if (anyWords.length > 0) {
    parts.push(anyWords.join(' OR '))
  }

  const noneWords = splitWords(input.noneWords)
  if (noneWords.some((word) => /["|]/.test(word))) {
    errors.push('Palavras excluídas: informe termos simples, sem aspas ou barras verticais.')
  } else {
    parts.push(...noneWords.map((word) => `-${word.replace(/^-+/, '')}`))
  }

  const includeSite = normalizeText(input.includeSite)
  if (includeSite) {
    const domain = validDomain(includeSite)
    if (domain) parts.push(`from:${domain}`)
    else errors.push('Somente deste site: informe apenas um domínio, sem protocolo ou caminho.')
  }

  const excludeSite = normalizeText(input.excludeSite)
  if (excludeSite) {
    const domain = validDomain(excludeSite)
    if (domain) parts.push(`-from:${domain}`)
    else errors.push('Excluir este site: informe apenas um domínio, sem protocolo ou caminho.')
  }

  const category = normalizeText(input.category).toLowerCase()
  if (category) {
    if (/^[a-z0-9_-]+$/.test(category)) parts.push(`in:${category}`)
    else errors.push('Categoria: use somente letras sem acento, números, hífen ou sublinhado.')
  }

  const minDuration = appendDuration(input.longerThan, '>', 'Duração maior que', errors)
  const maxDuration = appendDuration(input.shorterThan, '<', 'Duração menor que', errors)
  if (minDuration.token) parts.push(minDuration.token)
  if (maxDuration.token) parts.push(maxDuration.token)
  if (minDuration.seconds !== undefined && maxDuration.seconds !== undefined && minDuration.seconds >= maxDuration.seconds) {
    errors.push('A duração mínima precisa ser menor que a duração máxima.')
  }

  const query = errors.length === 0 ? parts.join(' ').trim().slice(0, 1500) : ''
  if (parts.join(' ').length > 1500) errors.push('A consulta ficou longa demais; reduza os campos para menos de 1500 caracteres.')

  return { query: errors.length === 0 ? query : '', errors }
}
