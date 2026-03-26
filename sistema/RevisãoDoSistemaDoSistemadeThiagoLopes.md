# Revisão do Sistema do Colega Thiago(github.com/thls/talp)

## A Revisão do Sistema

**1. O sistema está funcionando com as funcionalidades solicitadas?**
Parcialmente. A arquitetura do código demonstra que o sistema foi pensado para contemplar as funcionalidades principais (módulos para questões, provas, geração de PDF e correção). No entanto, **a implementação não foi concluída na íntegra**. De acordo com o planejamento do desenvolvedor, o projeto avançou apenas até a parte 4 de seu *planner*. Sendo assim, embora as rotas e interfaces iniciais existam, o sistema carece da finalização do escopo completo solicitado no experimento.

**2. Quais os problemas de qualidade do código e dos testes?**
* **Qualidade do Código:** A qualidade estrutural do código entregue é excelente. O projeto utiliza Next.js (App Router) com uma clara separação de responsabilidades (Domain-Driven Design - DDD), dividindo os módulos em `domain`, `server` e `ui`. O uso de TypeScript aliado a bibliotecas como `zod` garante forte tipagem e validação de dados.
* **Problemas e Testes:** O maior problema identificado é a **ausência de testes automatizados**. Não há evidências de testes unitários ou de integração nos módulos desenvolvidos. Além disso, a camada de persistência parece depender de estruturas efêmeras em memória ou arquivos locais, o que não é sustentável para um ambiente real, e a interrupção precoce do desenvolvimento deixou a aplicação em um estado inacabado.

**3. Como a funcionalidade e a qualidade desse sistema pode ser comparada com as do seu sistema?**
Ambos os projetos optaram por uma abordagem **Full-Stack moderna utilizando Next.js e TypeScript**, buscando centralizar o desenvolvimento e unificar a tipagem de dados entre cliente e servidor. No entanto, as decisões arquiteturais e o resultado final divergem significativamente:
* **Funcionalidade:** O meu sistema (`avaliapro`) é uma aplicação completa que entrega o escopo solicitado e possui integração com um banco de dados real através do Prisma ORM. Em contrapartida, o sistema avaliado (`talp`) teve seu fluxo interrompido (parando na etapa 4), resultando em funcionalidades incompletas e ausência de persistência de dados real.
* **Qualidade e Arquitetura:** O sistema avaliado (`talp`) apostou fortemente em uma estrutura rigorosa de módulos baseada em DDD (Domain-Driven Design). Embora seja uma separação de código muito elegante e escalável, a complexidade inicial parece ter consumido o tempo de desenvolvimento. Por outro lado, o meu sistema (`avaliapro`) também separou regras de negócio (camada `domain`), mas equilibrou o design com pragmatismo, o que permitiu não só concluir o projeto, mas também garantir a qualidade do software através da implementação de **testes de aceitação automatizados (BDD com Cucumber)** cobrindo todos os fluxos principais (`exams.feature`, `grading.feature`, etc.). 
* **Conclusão:** Enquanto o sistema do colega possui um alicerce arquitetural interno muito bem desenhado, o meu sistema demonstrou superioridade prática na qualidade e funcionalidade ao alinhar o cumprimento de todo o escopo, uso de persistência real de dados e a validação do comportamento do software através de testes automatizados.

---

## A Revisão do Histórico do Desenvolvimento

**1. Estratégias de interação utilizada**
A estratégia baseou-se em "System Prompting" e "Context Conditioning" em nível avançado. O uso da pasta `.cursor/` com arquivos de diretrizes (`architect.md`, `fullstack-nextjs.md` e `quality.md`) indica que o agente foi previamente instruído com regras rígidas sobre como o código deveria ser estruturado e qual stack utilizar, em vez de depender apenas de prompts interativos manuais.

**2. Situações em que o agente funcionou melhor ou pior**
* **Melhor:** O agente foi excelente na organização do projeto e na manutenção da consistência arquitetural ditada pelos arquivos de regras. Ele soube separar as camadas de domínio e interface adequadamente.
* **Pior:** O modelo falhou no gerenciamento do tempo ou limite de contexto/tarefas, resultando no abandono do desenvolvimento na "parte 4" do planejamento. Além disso, o agente ignorou a criação de testes automatizados, o que geralmente exige prompts específicos de TDD/BDD (como ocorreu de forma bem-sucedida no meu sistema AvaliaPro).

**3. Tipos de problemas observados**
O principal problema do processo foi a incapacidade de concluir o escopo. Em termos técnicos, arquiteturas complexas geradas por IA no Next.js (com Server Components e limites estritos de módulos) aumentam a fricção para o agente. A dependência excessiva de um *planner* automatizado longo mostrou que a IA pode se perder ou esgotar sua capacidade antes de chegar até a implementação funcional final.

**4. Avaliação geral da utilidade do agente no desenvolvimento**
A utilidade técnica foi alta na criação de um alicerce sólido. O uso de regras de sistema transforma o agente em um "Arquiteto de Software", gerando código limpo e organizado rapidamente. Contudo, a utilidade prática caiu drasticamente devido à entrega incompleta do produto final.

**5. Comparação com a sua experiência de uso do agente**
A abordagem do colega, guiada por arquivos Markdown de contexto de sistema (como os arquivos em `.cursor/`), cria uma excelente grade de proteção (*guardrails*), mitigando a "alucinação arquitetural". No meu projeto (`avaliapro`), notei que também utilizei diretrizes de agentes (`agents/architect.md`, `agents/tests.md`), mas de uma forma que permitiu focar não só na estrutura, mas também em garantir o banco de dados via Prisma e os testes via Cucumber. A experiência do colega evidencia que orquestrar um projeto com um nível de granularidade estrutural (DDD rígido) muito alto desde o primeiro momento requer que as tarefas sejam ainda mais divididas, caso contrário, o agente gasta todos os tokens na fundação e não constrói o telhado.