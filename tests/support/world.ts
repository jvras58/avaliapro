import { setWorldConstructor, World, IWorldOptions } from "@cucumber/cucumber";
import type { Question } from "@/domain/types";

export interface AvaliaProWorld extends World {
  /** Last question created or fetched during a scenario */
  currentQuestion: Question | null;
  /** Last raw response from the domain (may be null on not-found) */
  lastResponse: Question | Question[] | null;
  /** Last error thrown by the domain */
  lastError: Error | null;
}

class AvaliaProWorldImpl extends World implements AvaliaProWorld {
  currentQuestion: Question | null = null;
  lastResponse: Question | Question[] | null = null;
  lastError: Error | null = null;

  constructor(options: IWorldOptions) {
    super(options);
  }
}

setWorldConstructor(AvaliaProWorldImpl);
