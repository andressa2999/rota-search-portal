export type PlatformId = 'nudevista' | 'pornmd' | 'findtubes'
export type PlatformStatus = 'active' | 'inactive'

export interface Platform {
  id: PlatformId
  name: string
  domain: string
  status: PlatformStatus
  href: string
  description: string
}

export const PLATFORMS: Platform[] = [
  {
    id: 'nudevista',
    name: 'NudeVista',
    domain: 'nudevista.com',
    status: 'active',
    href: 'https://www.nudevista.com/advanced-search/',
    description: 'Componha localmente uma consulta com os operadores publicados pelo NudeVista e cole-a manualmente na página oficial.',
  },
  {
    id: 'pornmd',
    name: 'PornMD',
    domain: 'pornmd.com',
    status: 'active',
    href: 'https://www.pornmd.com/',
    description: 'Copie termos simples e pesquise diretamente na página inicial oficial. Este portal não envia nem importa resultados.',
  },
  {
    id: 'findtubes',
    name: 'FindTubes',
    domain: 'findtubes.com',
    status: 'inactive',
    href: 'https://www.findtubes.com/',
    description: 'O site oficial informa que o serviço foi encerrado e encaminha os visitantes para o PornMD.',
  },
]
