# Rota Search

Portal estático em português para buscar vídeos no índice agregado SepiaSearch e refinar os resultados com tags retornadas pela API real. O layout é próprio, preto e vermelho, responsivo; não copia logotipos nem assets das instâncias.

## Como funciona

1. Confirme que tem 18 anos ou mais.
2. Digite um termo e envie a busca. Só então o navegador faz um `GET` para a API pública do SepiaSearch.
3. O portal solicita registros com privacidade `Public` e conteúdo NSFW; localmente, só exibe vídeos com `privacy.id = 1` e o bit `2` (`EXPLICIT_SEX`) presente em `nsfwFlags`.
4. As opções de incluir/excluir são extraídas apenas das tags dos resultados elegíveis já carregados. **Incluir** aceita vídeos que contenham ao menos uma tag selecionada; **Excluir** remove vídeos que contenham qualquer tag selecionada. Os filtros atuam localmente e podem ser limpos.
5. Clique em **Reproduzir aqui** para carregar o iframe do host original. O link **Abrir no PeerTube de origem** permanece disponível como contingência.

A lista de tags não é fixa. O painel mostra primeiro as dez tags mais frequentes nos resultados elegíveis carregados naquela busca, com opção de expandir para ver todas; cada tag mostra em quantos resultados aparece. Não é um ranking de termos mais buscados por todas as pessoas: o portal não coleta nem guarda consultas de usuários. Cada nova busca e cada página carregada podem apresentar tags diferentes. A paginação é feita pela API do índice.

## Limitações importantes

SepiaSearch é um índice de várias instâncias PeerTube, não o host dos vídeos. O portal filtra para vídeos marcados como públicos e com a flag sexual explícita. Essa flag é declarada na origem e pode estar ausente ou incorreta; nem todo conteúdo adulto será encontrado e a classificação não é certificação independente.

A API não fornece um campo confiável de preço/paywall. `Public` significa visibilidade pública segundo PeerTube, mas não permite detectar links de apoio pagos, plugins ou regras adicionais da instância. Por isso o portal não garante que qualquer referência externa seja gratuita; ele não cobra nem intermedeia pagamentos. Se um player não carregar, confira o acesso e as regras na página original.

O termo digitado é enviado ao SepiaSearch somente ao enviar a busca. O player só se conecta à instância de origem quando o usuário o abre. Termos, tags e resultados ficam em memória e não são gravados em cookies, `localStorage`, URL, conta ou banco de dados. O portal não usa login, backend, chaves privadas, analytics próprios ou fontes externas.

## Fontes oficiais

- [SepiaSearch](https://sepiasearch.org/) — índice agregado PeerTube.
- [Referência REST do PeerTube](https://docs.joinpeertube.org/api-rest-reference.html) — busca, privacidade pública e flags NSFW.
- [PeerTube Embed Player](https://docs.joinpeertube.org/api/embed-player) — players incorporados.

## Desenvolvimento e build

Requer Node.js 22 ou compatível e pnpm 11.

```sh
pnpm install
pnpm dev
pnpm build
```

A build estática é gerada em `docs/`, com caminhos relativos, para GitHub Pages configurado em `main/docs`. O site publicado está em [andressa2999.github.io/rota-search-portal](https://andressa2999.github.io/rota-search-portal/). O projeto canônico permanece no Manus; o repositório público é um snapshot de hospedagem.


## Páginas legais

A publicação inclui [Termos de Uso](https://andressa2999.github.io/rota-search-portal/termos.html), [Política de Privacidade](https://andressa2999.github.io/rota-search-portal/privacidade.html) e um [aviso DMCA informativo](https://andressa2999.github.io/rota-search-portal/dmca.html). O aviso DMCA não designa agente nem declara safe harbor: questões sobre vídeos devem ser dirigidas à instância PeerTube de origem; reclamações sobre arquivos hospedados pelo GitHub Pages devem seguir o processo oficial do GitHub. Os textos são informativos e devem ser revisados por profissional jurídico para avaliar a situação do operador.
