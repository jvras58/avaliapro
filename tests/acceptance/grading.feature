# language: pt

Funcionalidade: Correção de provas

  Como usuário do sistema
  Quero corrigir provas a partir de CSVs de gabarito e respostas dos alunos
  Para obter as notas individuais e um relatório da turma

  Contexto:
    Dado que o banco de dados está limpo

  Cenário: Correção estrita com resposta totalmente correta
    Dado o gabarito CSV:
      """
      exam_number,q1,q2
      1,A,B
      """
    E as respostas dos alunos CSV:
      """
      student_id,exam_number,q1,q2
      aluno1,1,A,B
      """
    Quando eu corrijo no modo estrito
    Então a nota do aluno "aluno1" deve ser 2

  Cenário: Correção estrita com uma resposta errada
    Dado o gabarito CSV:
      """
      exam_number,q1,q2
      1,A,B
      """
    E as respostas dos alunos CSV:
      """
      student_id,exam_number,q1,q2
      aluno1,1,A,C
      """
    Quando eu corrijo no modo estrito
    Então a nota do aluno "aluno1" deve ser 1

  Cenário: Correção estrita com todas as respostas erradas
    Dado o gabarito CSV:
      """
      exam_number,q1,q2
      1,A,B
      """
    E as respostas dos alunos CSV:
      """
      student_id,exam_number,q1,q2
      aluno1,1,B,A
      """
    Quando eu corrijo no modo estrito
    Então a nota do aluno "aluno1" deve ser 0

  Cenário: Correção estrita com múltiplas letras corretas (conjunto exato)
    Dado o gabarito CSV:
      """
      exam_number,q1
      1,AB
      """
    E as respostas dos alunos CSV:
      """
      student_id,exam_number,q1
      aluno1,1,AB
      aluno2,1,BA
      aluno3,1,A
      """
    Quando eu corrijo no modo estrito
    Então a nota do aluno "aluno1" deve ser 1
    E a nota do aluno "aluno2" deve ser 1
    E a nota do aluno "aluno3" deve ser 0

  Cenário: Correção leniente com resposta parcialmente correta
    Dado o gabarito CSV:
      """
      exam_number,q1
      1,AB
      """
    E as respostas dos alunos CSV:
      """
      student_id,exam_number,q1
      aluno1,1,A
      """
    Quando eu corrijo no modo leniente
    Então a nota do aluno "aluno1" deve ser maior que 0
    E a nota do aluno "aluno1" deve ser menor que 1

  Cenário: Correção leniente com resposta totalmente correta vale nota máxima
    Dado o gabarito CSV:
      """
      exam_number,q1
      1,AB
      """
    E as respostas dos alunos CSV:
      """
      student_id,exam_number,q1
      aluno1,1,AB
      """
    Quando eu corrijo no modo leniente
    Então a nota do aluno "aluno1" deve ser 1

  Cenário: Relatório deve incluir média, mínimo e máximo
    Dado o gabarito CSV:
      """
      exam_number,q1
      1,A
      2,A
      """
    E as respostas dos alunos CSV:
      """
      student_id,exam_number,q1
      aluno1,1,A
      aluno2,2,B
      """
    Quando eu corrijo no modo estrito
    Então o relatório deve conter média 0.5
    E o relatório deve conter mínimo 0
    E o relatório deve conter máximo 1

  Cenário: Correção no modo potências de 2 com resposta numérica correta
    Dado o gabarito CSV:
      """
      exam_number,q1
      1,3
      """
    E as respostas dos alunos CSV:
      """
      student_id,exam_number,q1
      aluno1,1,3
      aluno2,1,1
      """
    Quando eu corrijo no modo estrito
    Então a nota do aluno "aluno1" deve ser 1
    E a nota do aluno "aluno2" deve ser 0
