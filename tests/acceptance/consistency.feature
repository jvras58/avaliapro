# language: pt

Funcionalidade: Consistência de dados após mutações

  Como desenvolvedor do sistema
  Quero garantir que criação e remoção de itens sejam refletidas imediatamente
  Para evitar que o cache retorne dados desatualizados

  Contexto:
    Dado que o banco de dados está limpo para consistência

  Cenário: Questão criada aparece imediatamente na listagem
    Quando eu crio uma questão via domínio com enunciado "Nova questão de consistência"
    Então a listagem de questões via domínio deve conter 1 itens
    E o primeiro item da listagem deve ter enunciado "Nova questão de consistência"

  Cenário: Questão removida desaparece imediatamente da listagem
    Dado que existe uma questão de consistência com enunciado "Questão para remover"
    Quando eu removo essa questão via domínio
    Então a listagem de questões via domínio deve conter 0 itens

  Cenário: Múltiplas criações acumulam na listagem
    Quando eu crio uma questão via domínio com enunciado "Questão A"
    E eu crio uma questão via domínio com enunciado "Questão B"
    E eu crio uma questão via domínio com enunciado "Questão C"
    Então a listagem de questões via domínio deve conter 3 itens

  Cenário: Exame criado aparece imediatamente na listagem
    Dado que existe uma questão de consistência com enunciado "Questão base"
    Quando eu crio um exame via domínio com título "Exame de consistência"
    Então a listagem de exames via domínio deve conter 1 itens
    E o primeiro exame da listagem deve ter título "Exame de consistência"

  Cenário: Exame removido desaparece imediatamente da listagem
    Dado que existe uma questão de consistência com enunciado "Questão para exame"
    E existe um exame de consistência com título "Exame para remover"
    Quando eu removo esse exame via domínio
    Então a listagem de exames via domínio deve conter 0 itens
