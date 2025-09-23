# TeepEtiquetas – Explicação

Este é um protótipo simples (HTML/CSS/JS puro) para demonstrar o conceito do TeepEtiquetas: importação de ZPL, detecção de campos, mapeamento para fontes de dados, preview, biblioteca com versionamento (localStorage), associação de layouts a máquinas e impressão simulada.

## Como executar

1. Clique duas vezes no arquivo `index.html` (funciona direto no navegador) ou sirva com um servidor estático:
   - Node: `npx serve .` ou `npx http-server .`
   - Python: `python -m http.server 8080`
2. Abra no navegador: `http://localhost:8080` (se usar servidor)

## Fluxo sugerido para demonstração

1. Importar:
   - Cole um ZPL com placeholders entre chaves, ex.: `{OP}`, `{Produto}`, `{QtdProduzida}`, `{Maquina}`.
   - Clique em "Detectar Campos".
2. Mapear:
   - Para cada placeholder detectado, selecione a fonte de dados correspondente.
   - Defina um nome e clique em "Salvar layout".
3. Preview:
   - Preencha manualmente os campos mapeados e gere o ZPL com substituições.
4. Biblioteca:
   - Revise os layouts salvos, selecione como ativo, crie nova versão.
5. Máquinas:
   - Cadastre máquinas fictícias, associe um layout e simule a impressão.

## Observações

- Todos os dados ficam no `localStorage` do navegador.
- Não há backend nesta etapa; a impressão é apenas registrada no log.
- A detecção de campos procura padrões `{Campo}` no ZPL.
- Este demo é apenas para alinhamento visual/funcional; o projeto real deverá integrar com o Teep e impressoras Zebra.

