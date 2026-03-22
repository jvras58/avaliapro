# language: pt

Funcionalidade: Geração de versões individualizadas de provas

  Como usuário do sistema
  Quero gerar N versões individualizadas de uma prova
  Para distribuir provas com questões e alternativas embaralhadas

  Contexto:
    Dado que o banco de dados está limpo

  Cenário: Gerar uma versão de prova no modo letras
    Dado que existe uma prova no modo "letters" com as seguintes questões:
      | enunciado   | alternativas corretas |
      | Questão 1   | Opção A               |
      | Questão 2   | Opção B               |
    Quando eu gero 1 versão da prova
    Então devo receber 1 prova gerada
    E o CSV da chave de respostas deve ter 1 linha de dados
    E o CSV deve conter as colunas "exam_number,q1,q2"

  Cenário: Gerar múltiplas versões da prova
    Dado que existe uma prova no modo "letters" com as seguintes questões:
      | enunciado   | alternativas corretas |
      | Questão 1   | Opção A               |
    Quando eu gero 5 versões da prova
    Então devo receber 5 provas geradas
    E o CSV da chave de respostas deve ter 5 linhas de dados

  Cenário: Cada versão gerada deve ter o número correto de questões
    Dado que existe uma prova no modo "letters" com as seguintes questões:
      | enunciado   | alternativas corretas |
      | Questão 1   | Opção A               |
      | Questão 2   | Opção B               |
      | Questão 3   | Opção C               |
    Quando eu gero 2 versões da prova
    Então cada versão gerada deve ter 3 questões

  Cenário: Chave de respostas no modo letras deve conter letras
    Dado que existe uma prova no modo "letters" com as seguintes questões:
      | enunciado   | alternativas corretas |
      | Questão 1   | Opção A               |
    Quando eu gero 1 versão da prova
    Então a chave de respostas da versão 1 não deve ser numérica

  Cenário: Chave de respostas no modo potências de 2 deve conter números
    Dado que existe uma prova no modo "powers_of_2" com as seguintes questões:
      | enunciado   | alternativas corretas |
      | Questão 1   | Opção A               |
    Quando eu gero 1 versão da prova
    Então a chave de respostas da versão 1 deve ser numérica

  Cenário: Tentar gerar zero versões deve falhar
    Dado que existe uma prova no modo "letters" com as seguintes questões:
      | enunciado   | alternativas corretas |
      | Questão 1   | Opção A               |
    Quando eu tento gerar 0 versões da prova
    Então devo receber um erro de validação
