# Saúde Perto — Global Solution 2026/2 (FIAP)

> A saúde pública mais próxima de quem precisa.

Protótipo web feito apenas com **HTML5, CSS3, JavaScript puro e LocalStorage**. Sem frameworks, bibliotecas, APIs externas ou backend. **Todos os dados são fictícios.** Não há integração com o SUS e nenhum agendamento é confirmação real de unidade de saúde.

## Como executar
1. Baixe a pasta `saude-perto/`.
2. Dê dois cliques em `index.html` (qualquer navegador moderno). Não precisa de servidor nem de instalação.

## Estrutura
```
saude-perto/
├── index.html      Painel inicial
├── agendar.html    Agendamento, comprovante e histórico
├── vacinas.html    Carteira de vacinação e campanhas
├── css/style.css   Identidade visual, responsividade, Modo Conexão Fraca, impressão
├── js/storage.js   Dados (LocalStorage), regras de alerta, Modo Conexão Fraca, menu
├── js/agenda.js    Formulário, protocolo, comprovante, histórico, cancelamento
├── js/vacinas.js   Carteira, filtros, campanhas, ações
├── js/home.js      Cards e avisos do painel
└── README.md
```

## Funcionalidades
- **Painel**: próximo atendimento, situação vacinal, campanhas e distância, tudo lido do LocalStorage; avisos que mudam conforme os dados.
- **Agendamento**: formulário em 3 seções com validação clara, simulação de deslocamento, protocolo `SP-2026-XXXX`, comprovante (copiar com alternativa manual e imprimir/PDF só do comprovante), histórico com cancelamento.
- **Vacinas**: carteira com filtros sem recarregar, alertas calculados pela data do navegador (verde, amarelo, vermelho, sempre com ícone e texto), campanhas, "Agendar esta vacina" (preenche o tipo em `agendar.html`) e "Marcar como tomada" (com confirmação).
- **Modo Conexão Fraca**: botão nas 3 páginas, classe `modo-leve` no `body`, preferência salva e mantida ao navegar e recarregar. É uma simulação de uso com dados já salvos no aparelho.
- Os dados demonstrativos só são criados se o armazenamento estiver vazio. Para recomeçar, limpe os dados do site no navegador.

## Roteiro de demonstração
1. Abra `index.html`: mostre o painel e os avisos (Influenza pendente, reforço de Febre Amarela, campanha encerrando).
2. Clique em **Agendar esta vacina** no aviso da Influenza: o tipo "Vacinação" já vem preenchido.
3. Tente enviar sem data para mostrar a validação. Depois escolha data e turno, e confirme.
4. Mostre o comprovante: **Copiar comprovante** e **Imprimir / Salvar PDF** (só o comprovante aparece).
5. Volte ao início: o novo protocolo aparece em "Próximo atendimento" (ou o mais próximo na data).
6. Em **Agendamentos**, cancele um registro e confira a Home.
7. Em **Vacinas**, use os filtros e **Marcar como tomada** na Influenza; a Home atualiza.
8. Ative o **Modo Conexão Fraca**, navegue entre as páginas e recarregue: a preferência permanece.
9. Reduza a janela (ou use o modo celular) para mostrar o menu e as colunas únicas.
