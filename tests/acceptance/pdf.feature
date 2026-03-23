# language: pt
Funcionalidade: Geração de PDFs de provas individualizadas

  Como usuário do sistema
  Quero gerar arquivos PDF de provas individualizadas
  Para distribuir versões impressas com cabeçalho, rodapé e área de identificação

  Contexto:
    Dado que o banco de dados está limpo

  Cenário: Renderizar um PDF individual produz um arquivo não vazio
    Dado que existe uma prova no modo "letters" com as seguintes questões:
      | enunciado              | alternativas corretas |
      | Qual é a capital do Brasil? | Brasília         |
      | Quanto é 2 + 2?        | 4                     |
    Quando eu gero 1 versão da prova
    E eu renderizo o PDF da versão 1
    Então o buffer do PDF não deve estar vazio

  Cenário: O arquivo gerado é um PDF válido
    Dado que existe uma prova no modo "letters" com as seguintes questões:
      | enunciado              | alternativas corretas |
      | Qual é a capital do Brasil? | Brasília         |
      | Quanto é 2 + 2?        | 4                     |
    Quando eu gero 1 versão da prova
    E eu renderizo o PDF da versão 1
    Então o buffer do PDF deve começar com a assinatura "%PDF"

  Cenário: Empacotar N provas gera um ZIP com N arquivos
    Dado que existe uma prova no modo "letters" com as seguintes questões:
      | enunciado              | alternativas corretas |
      | Qual é a capital do Brasil? | Brasília         |
      | Quanto é 2 + 2?        | 4                     |
    Quando eu gero 3 versões da prova
    E eu empacoto os PDFs das provas geradas
    Então o ZIP deve conter 3 arquivos PDF

  Cenário: Os arquivos no ZIP têm os nomes esperados
    Dado que existe uma prova no modo "letters" com as seguintes questões:
      | enunciado              | alternativas corretas |
      | Qual é a capital do Brasil? | Brasília         |
      | Quanto é 2 + 2?        | 4                     |
    Quando eu gero 2 versões da prova
    E eu empacoto os PDFs das provas geradas
    Então o ZIP deve conter um arquivo chamado "exam_1.pdf"
    E o ZIP deve conter um arquivo chamado "exam_2.pdf"

  Cenário: O ZIP é um arquivo binário não vazio
    Dado que existe uma prova no modo "letters" com as seguintes questões:
      | enunciado              | alternativas corretas |
      | Qual é a capital do Brasil? | Brasília         |
    Quando eu gero 1 versão da prova
    E eu empacoto os PDFs das provas geradas
    Então o buffer do ZIP não deve estar vazio

  Cenário: O PDF no modo potências de 2 também é gerado com sucesso
    Dado que existe uma prova no modo "powers_of_2" com as seguintes questões:
      | enunciado              | alternativas corretas |
      | Qual é a capital do Brasil? | Brasília         |
      | Quanto é 2 + 2?        | 4                     |
    Quando eu gero 1 versão da prova
    E eu renderizo o PDF da versão 1
    Então o buffer do PDF deve começar com a assinatura "%PDF"
