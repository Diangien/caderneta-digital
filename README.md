# Caderneta Digital

MVP de uma aplicação web para gestão de alunos e das respectivas ocorrências disciplinares.
Os dados são guardados no `localStorage` do navegador — não há backend nem base de dados.

## Executar

```bash
npm install
npm run dev
```

Outros comandos: `npm run build` (verificação de tipos + build de produção), `npm run preview`.

## Estrutura

```
src/
  types.ts                 Tipos (Aluno, Ocorrência) e listas predefinidas (classes, tipos de ocorrência)
  data/storage.ts          Leitura e escrita no localStorage
  data/seed.ts             Dados fictícios carregados na primeira utilização
  logic/useCaderneta.ts    Operações sobre alunos e ocorrências, pesquisa e ordenação
  logic/validation.ts      Validação dos formulários (inclui nº de processo único)
  utils/format.ts          Datas, normalização de texto, identificadores
  components/              Componentes da interface
  App.tsx                  Navegação entre vistas, formulário de aluno e mensagens
```

As fontes (Fraunces e Figtree) são instaladas via `@fontsource-variable` e servidas localmente,
pelo que a aplicação não depende de serviços externos.

Os dados ficam numa única chave (`caderneta-digital:dados`) com a forma
`{ version, students, occurrences }`. Cada ocorrência refere o aluno pelo `studentId`.
Para repor os dados de demonstração, apague essa chave nas ferramentas de programador do navegador.
