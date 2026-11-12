# Portal Rota

Portal estático em React, TypeScript e Vite para organizar consultas manuais a PornMD e NudeVista. Não chama APIs, não raspa páginas, não coleta nem exibe resultados. As consultas existem apenas na memória da aba.

## Como usar

- Em **NudeVista**, preencha os campos e revise a string gerada. Copie-a e cole-a manualmente na página oficial de busca avançada.
- Em **PornMD**, digite palavras simples, copie-as e faça a busca na página inicial oficial.
- **FindTubes** aparece como encerrado. A própria página informa que o serviço não está mais disponível e encaminha para PornMD.

A sintaxe oferecida no gerador NudeVista corresponde aos exemplos publicados na [página oficial de busca avançada](https://www.nudevista.com/advanced-search/): termos que devem aparecer, frase exata, alternativas `OR`, exclusões, `from:`, `-from:`, `in:` e durações `length>`/`length<`. Não há envio automático; o portal não preenche formulários, não abre URLs de resultados, não carrega resultados externos nem afirma que operadores funcionam em PornMD.

A consulta é perdida ao atualizar/fechar a página. O app não usa localStorage, cookies, login, analytics, backend ou armazenamento. Clicar em um link abre um site externo, sujeito aos próprios termos e políticas.

## Build

Requer Node.js 22 ou compatível e pnpm 11.

```sh
pnpm install
pnpm dev
pnpm build
```

A build de produção é criada em `docs/` com caminhos relativos e publicada pelo GitHub Pages a partir de `main/docs`. O repositório público de hospedagem é [rota-search-portal](https://github.com/andressa2999/rota-search-portal), com snapshot limpo no commit `7cc6ec81d5d7ab4e7ec76314183c7762cfd625c3`, sem o histórico do protótipo PeerTube. O site publicado está disponível em [andressa2999.github.io/rota-search-portal](https://andressa2999.github.io/rota-search-portal/). O repositório canônico do projeto continua gerenciado pelo Manus.

## Restrições das fontes

Os Termos do PornMD proíbem scraping e redistribuição sem autorização escrita prévia e processos para monitorar ou reproduzir o site/material. Os Termos do NudeVista proíbem bots, scrapers e ferramentas automatizadas de acessar ou copiar o serviço. Este projeto evita essas ações e fornece apenas composição local e navegação manual; isso não é uma autorização para outras formas de integração. Consulte os termos oficiais de [PornMD](https://www.pornhub.com/terms-of-service/) e [NudeVista](https://www.nudevista.com/TOS/).
