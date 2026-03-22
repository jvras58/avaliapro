# language: pt

Funcionalidade: Gerenciamento de questões

  Como usuário do sistema
  Quero cadastrar, editar e remover questões com alternativas
  Para poder utilizá-las na criação de provas

  Contexto:
    Dado que o banco de dados está limpo

  Cenário: Listar questões quando não há nenhuma cadastrada
    Quando eu solicito a listagem de questões
    Então devo receber uma lista vazia

  Cenário: Criar uma nova questão com alternativas
    Quando eu crio uma questão com os dados:
      | enunciado     | Qual é a capital do Brasil?  |
    E adiciono as seguintes alternativas:
      | descrição   | deve marcar |
      | Brasília    | true        |
      | São Paulo   | false       |
      | Rio de Janeiro | false    |
    Então a questão deve ser criada com sucesso
    E a lista de questões deve conter 1 questão

  Cenário: Buscar uma questão pelo id
    Dado que existe uma questão cadastrada com enunciado "Quanto é 2 + 2?" e alternativas:
      | descrição | deve marcar |
      | 3         | false       |
      | 4         | true        |
      | 5         | false       |
    Quando eu busco a questão pelo seu id
    Então devo receber a questão com o enunciado "Quanto é 2 + 2?"
    E a questão deve ter 3 alternativas

  Cenário: Editar o enunciado de uma questão existente
    Dado que existe uma questão cadastrada com enunciado "Enunciado original" e alternativas:
      | descrição | deve marcar |
      | Opção A   | true        |
      | Opção B   | false       |
    Quando eu atualizo o enunciado da questão para "Enunciado atualizado"
    Então a questão deve ter o enunciado "Enunciado atualizado"

  Cenário: Substituir as alternativas de uma questão existente
    Dado que existe uma questão cadastrada com enunciado "Questão de teste" e alternativas:
      | descrição   | deve marcar |
      | Alternativa X | true      |
      | Alternativa Y | false     |
    Quando eu atualizo as alternativas da questão para:
      | descrição   | deve marcar |
      | Nova opção 1 | false      |
      | Nova opção 2 | true       |
      | Nova opção 3 | false      |
    Então a questão deve ter 3 alternativas
    E uma das alternativas deve ser "Nova opção 2" marcada como correta

  Cenário: Remover uma questão existente
    Dado que existe uma questão cadastrada com enunciado "Questão a remover" e alternativas:
      | descrição | deve marcar |
      | Sim       | true        |
      | Não       | false       |
    Quando eu removo a questão
    Então a lista de questões deve conter 0 questões

  Cenário: Tentar criar questão sem enunciado deve falhar
    Quando eu tento criar uma questão sem enunciado e com alternativas:
      | descrição | deve marcar |
      | Opção A   | true        |
      | Opção B   | false       |
    Então devo receber um erro de validação

  Cenário: Tentar criar questão com menos de 2 alternativas deve falhar
    Quando eu tento criar uma questão com enunciado "Questão inválida" e apenas 1 alternativa:
      | descrição | deve marcar |
      | Única     | true        |
    Então devo receber um erro de validação

  Cenário: Tentar buscar questão inexistente deve retornar não encontrado
    Quando eu busco a questão com id "id-que-nao-existe"
    Então devo receber resposta de não encontrado
