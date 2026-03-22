# language: pt

Funcionalidade: Gerenciamento de provas

  Como usuário do sistema
  Quero cadastrar, editar e remover provas compostas de questões
  Para poder gerar versões individualizadas das provas

  Contexto:
    Dado que o banco de dados está limpo

  Cenário: Listar provas quando não há nenhuma cadastrada
    Quando eu solicito a listagem de provas
    Então devo receber uma lista de provas vazia

  Cenário: Criar uma nova prova com questões no modo letras
    Dado que existem questões cadastradas:
      | enunciado        |
      | Questão Alpha    |
      | Questão Beta     |
    Quando eu crio uma prova com os dados:
      | título               | Prova de Exemplo   |
      | curso                | Ciência da Computação |
      | modo de identificação | letters           |
    Então a prova deve ser criada com sucesso
    E a lista de provas deve conter 1 prova

  Cenário: Criar uma nova prova no modo potências de 2
    Dado que existem questões cadastradas:
      | enunciado     |
      | Questão Gama  |
    Quando eu crio uma prova com os dados:
      | título               | Prova Potência     |
      | curso                | Matemática         |
      | modo de identificação | powers_of_2       |
    Então a prova deve ser criada com sucesso
    E a prova deve ter o modo de identificação "powers_of_2"

  Cenário: Buscar uma prova pelo id
    Dado que existe uma prova cadastrada com título "Prova Existente" no modo "letters"
    Quando eu busco a prova pelo seu id
    Então devo receber a prova com o título "Prova Existente"

  Cenário: Editar o título de uma prova existente
    Dado que existe uma prova cadastrada com título "Título Antigo" no modo "letters"
    Quando eu atualizo o título da prova para "Título Novo"
    Então a prova deve ter o título "Título Novo"

  Cenário: Alterar o modo de identificação de uma prova
    Dado que existe uma prova cadastrada com título "Prova para Alterar" no modo "letters"
    Quando eu atualizo o modo de identificação da prova para "powers_of_2"
    Então a prova deve ter o modo de identificação "powers_of_2"

  Cenário: Remover uma prova existente
    Dado que existe uma prova cadastrada com título "Prova a Remover" no modo "letters"
    Quando eu removo a prova
    Então a lista de provas deve conter 0 provas

  Cenário: Tentar criar prova sem título deve falhar
    Dado que existem questões cadastradas:
      | enunciado  |
      | Questão X  |
    Quando eu tento criar uma prova sem título
    Então devo receber um erro de validação

  Cenário: Tentar criar prova sem questões deve falhar
    Quando eu tento criar uma prova sem questões com título "Prova Sem Questões"
    Então devo receber um erro de validação

  Cenário: Tentar buscar prova inexistente deve retornar não encontrado
    Quando eu busco a prova com id "id-inexistente"
    Então devo receber prova não encontrada
