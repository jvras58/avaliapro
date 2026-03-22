# AvaliaPro

Exam creation and grading web system built with Next.js 16, Prisma, and TypeScript.

---

## Table of contents

1. [Overview](#overview)
2. [Tech stack](#tech-stack)
3. [Project structure](#project-structure)
4. [Architecture](#architecture)
   - [Domain layer](#domain-layer)
   - [API layer](#api-layer)
   - [Frontend layer](#frontend-layer)
   - [Database layer](#database-layer)
5. [Domain types](#domain-types)
6. [Feature modules](#feature-modules)
   - [Questions](#questions)
   - [Exams](#exams)
   - [Generation](#generation)
   - [Grading](#grading)
7. [Acceptance tests](#acceptance-tests)
   - [Test setup](#test-setup)
   - [World object](#world-object)
   - [Feature files and step definitions](#feature-files-and-step-definitions)
   - [Running tests](#running-tests)
8. [Getting started](#getting-started)
9. [Available scripts](#available-scripts)

---

## Overview

AvaliaPro supports the full exam lifecycle:

- **Question management** — create, edit, and delete multiple-choice questions, each with a list of alternatives marked as correct or incorrect.
- **Exam management** — compose exams from existing questions; choose how alternatives are identified (letters or powers of 2).
- **Exam generation** — produce N individualised versions of an exam with randomised question and alternative order; export a CSV answer key.
- **Exam grading** — upload an answer-key CSV and a student-responses CSV; receive per-student grades and class statistics. Two modes: strict (exact match) and lenient (proportional credit).

---

## Tech stack

| Concern | Technology |
|---|---|
| Framework | Next.js 16, App Router |
| UI | React 19, shadcn/ui, Tailwind CSS 4 |
| ORM | Prisma 6 |
| Database | SQLite (dev) |
| Language | TypeScript 5 (strict) |
| Acceptance tests | Cucumber / Gherkin |
| Linting | ESLint 9 |

---

## Project structure

```
avaliapro/
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root layout with Navbar
│   ├── page.tsx                # Homepage dashboard
│   ├── api/                    # Route Handlers (API)
│   │   ├── questions/
│   │   │   ├── route.ts        # GET /api/questions, POST /api/questions
│   │   │   └── [id]/route.ts   # GET/PUT/DELETE /api/questions/:id
│   │   ├── exams/
│   │   │   ├── route.ts        # GET /api/exams, POST /api/exams
│   │   │   ├── [id]/route.ts   # GET/PUT/DELETE /api/exams/:id
│   │   │   └── [id]/generate/route.ts  # POST /api/exams/:id/generate
│   │   └── grading/
│   │       └── route.ts        # POST /api/grading
│   ├── questions/              # Question pages (list, new, edit)
│   ├── exams/                  # Exam pages (list, new, edit, generate)
│   └── grading/                # Grading page
├── components/                 # React components
│   ├── layout/Navbar.tsx
│   ├── questions/
│   │   ├── QuestionForm.tsx    # Create/edit form with dynamic alternatives
│   │   └── QuestionList.tsx    # Table with edit/delete actions
│   ├── exams/
│   │   ├── ExamForm.tsx        # Create/edit form with question picker
│   │   ├── ExamDeleteButton.tsx # Isolated client delete button
│   │   └── ExamGeneratePanel.tsx # Count input, generation trigger, CSV download
│   ├── grading/
│   │   └── GradingPanel.tsx    # File upload, mode select, results table
│   └── ui/                     # shadcn/ui primitives (button, card, table…)
├── domain/                     # Business logic (framework-independent)
│   ├── types.ts                # All shared TypeScript interfaces
│   ├── questions.ts            # Question CRUD
│   ├── exams.ts                # Exam CRUD
│   ├── generation.ts           # Exam generation and answer-key CSV
│   └── grading.ts              # Grading logic and CSV parsing
├── lib/
│   └── prisma.ts               # Prisma client singleton
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Migration history
├── tests/
│   ├── acceptance/
│   │   ├── questions.feature   # 9 scenarios — question CRUD + validation
│   │   ├── exams.feature       # 10 scenarios — exam CRUD + validation
│   │   ├── generation.feature  # 6 scenarios — generation and CSV format
│   │   ├── grading.feature     # 8 scenarios — grading modes and report stats
│   │   └── steps/              # Cucumber step definitions (one file per feature)
│   └── support/
│       └── world.ts            # Shared Cucumber world
├── agents/                     # AI agent instruction files (architect, backend…)
├── cucumber.json               # Cucumber runner configuration
├── tsconfig.json               # TypeScript config (Next.js / bundler)
└── tsconfig.test.json          # TypeScript config for ts-node (tests)
```

---

## Architecture

The application is organised into three layers with a strict one-way dependency:

```
Frontend (app/, components/)
       │  calls domain directly (Server Components) or via REST (Client Components)
       ▼
API layer (app/api/**/route.ts)
       │  calls domain functions
       ▼
Domain layer (domain/*.ts)
       │  calls Prisma
       ▼
Database (SQLite via Prisma)
```

### Domain layer

All business logic lives in `domain/`. These are plain TypeScript modules with no dependency on Next.js, React, or HTTP. They can be called from:

- Next.js Route Handlers (API routes)
- React Server Components (pages that fetch their own data server-side)
- Cucumber step definitions (acceptance tests, which never start an HTTP server)

This means the acceptance tests exercise the exact same code that runs in production.

### API layer

Route Handlers in `app/api/` are thin wrappers. Their responsibilities are:

1. Parse the request body / path parameters.
2. Call the appropriate domain function.
3. Map domain errors to HTTP status codes (400 for validation, 404 for not-found, 500 for unexpected errors).
4. Return a `NextResponse.json(...)`.

No business logic lives in the API layer.

**Async params pattern (Next.js 16):**

```typescript
type Params = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Params) {
  const { id } = await params;
  // ...
}
```

### Frontend layer

Pages under `app/` are React Server Components by default. They call domain functions directly (no HTTP round-trip) to populate the initial render. Client-side interactivity is encapsulated in `"use client"` components under `components/`.

| Component | Type | Reason |
|---|---|---|
| `app/exams/page.tsx` | Server Component | Fetches exam list via `listExams()` |
| `ExamDeleteButton.tsx` | Client Component | Needs `onClick` + `fetch` |
| `ExamForm.tsx` | Client Component | Needs form state + `useRouter` |
| `ExamGeneratePanel.tsx` | Client Component | Needs count input + file download |
| `GradingPanel.tsx` | Client Component | Needs `FileReader` API for CSV upload |
| `Navbar.tsx` | Client Component | Needs `usePathname` for active-link styling |

### Database layer

Prisma is configured with SQLite for development. The singleton client in `lib/prisma.ts` uses the `globalThis` pattern so Next.js hot-reload does not open multiple connections:

```typescript
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };
export const prisma = globalForPrisma.prisma ?? new PrismaClient({ ... });
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
```

SQLite does not support native enums. The `identificationMode` column is stored as a plain `string`. A `toExam()` cast helper in `domain/exams.ts` narrows the Prisma result to the `IdentificationMode` union at the service boundary so the rest of the codebase remains type-safe.

---

## Domain types

`domain/types.ts` is the single source of truth for all interfaces, imported by both backend and frontend:

```
Alternative            id, description, shouldBeMarked, questionId
Question               id, statement, alternatives[], createdAt, updatedAt
AlternativeInput       description, shouldBeMarked  (create/update input)
CreateQuestionInput    statement, alternatives[]
UpdateQuestionInput    statement?, alternatives[]?

IdentificationMode     "letters" | "powers_of_2"
ExamQuestion           id, examId, questionId, position, question
Exam                   id, title, course, instructor, date, identificationMode,
                       questions[], createdAt, updatedAt
CreateExamInput        title, course?, instructor?, date?, identificationMode, questionIds[]
UpdateExamInput        all fields optional

ShuffledAlternative    description, shouldBeMarked  (no id — post-shuffle)
ShuffledQuestion       originalId, statement, alternatives[]
GeneratedExam          examNumber, title, course, instructor, date,
                       identificationMode, questions[]
AnswerKeyRow           examNumber, answers[]
GenerationResult       exams[], answerKeyCsv

GradingMode            "strict" | "lenient"
StudentAnswerRow       studentId, examNumber, answers[]
QuestionScore          questionIndex, score, maxScore
StudentGrade           studentId, examNumber, questionScores[], total, maxTotal
GradingReport          grades[], average, min, max
```

---

## Feature modules

### Questions

**Domain:** `domain/questions.ts`

| Function | Behaviour |
|---|---|
| `createQuestion` | Validates non-empty statement and ≥ 2 alternatives; creates question with alternatives in one transaction |
| `updateQuestion` | Same validation rules on any provided field; replaces alternatives atomically |
| `deleteQuestion` | Catches Prisma `P2025` and re-throws as a readable message; cascade deletes alternatives |
| `getQuestion` | Returns question with alternatives, or `null` |
| `listQuestions` | Returns all questions ordered by `createdAt desc` |

**Pages:** `app/questions/` — list, `new/`, `[id]/edit/`.

**API:** `GET|POST /api/questions`, `GET|PUT|DELETE /api/questions/:id`.

---

### Exams

**Domain:** `domain/exams.ts`

| Function | Behaviour |
|---|---|
| `createExam` | Validates non-empty title and ≥ 1 question; creates exam and `ExamQuestion` join records with explicit `position` values |
| `updateExam` | Partial update; if `questionIds` are provided, join records are deleted and recreated to preserve new order |
| `deleteExam` | Cascade deletes `ExamQuestion` records |
| `getExam` | Deep include: `questions → question → alternatives` |
| `listExams` | Ordered by `createdAt desc` |

**Pages:** `app/exams/` — list, `new/`, `[id]/edit/`, `[id]/generate/`.

**API:** `GET|POST /api/exams`, `GET|PUT|DELETE /api/exams/:id`, `POST /api/exams/:id/generate`.

---

### Generation

**Domain:** `domain/generation.ts`

`generateExams(exam, count)` produces `count` individualised exam versions:

1. Validates `count >= 1`.
2. Sorts questions by `position` to get a stable base order.
3. For each version `n = 1…N`:
   - Fisher-Yates shuffles the question list.
   - Fisher-Yates shuffles each question's alternatives independently.
   - Computes the answer for each question:
     - **Letters mode** — joins the letters (A, B, C…) of the `shouldBeMarked` alternatives in their shuffled position order.
     - **Powers-of-2 mode** — sums 2^index for each `shouldBeMarked` alternative.
4. Builds a CSV answer key — header `exam_number,q1,q2,…` followed by one data row per version.
5. Returns `GenerationResult` with the exam objects and the CSV string.

---

### Grading

**Domain:** `domain/grading.ts`

**CSV parsing:**

- `parseAnswerKeyCsv(csv)` — skips header; returns `AnswerKeyRow[]`.
- `parseStudentAnswersCsv(csv)` — skips header; returns `StudentAnswerRow[]`.

**Grading modes:**

- **Strict** — for powers-of-2 answers, compares numeric strings directly. For letter answers, compares the *set* of letters (order-insensitive: "AB" = "BA"). Any mismatch → 0; exact match → 1.
- **Lenient** — letters only (numeric falls back to strict). Infers total alternative count from the highest letter present across key and student answer. Score = (correctly marked + correctly not-marked) / total alternatives.

`gradeExams(keyRows, studentRows, mode, pointsPerQuestion?)` joins student rows to the answer key by `examNumber`, scores each question, and returns a `GradingReport` with per-student grades and aggregate `average`, `min`, `max`.

---

## Acceptance tests

Tests use **Cucumber** with Gherkin feature files written in Portuguese. Step definitions call domain functions directly — no HTTP server is started — so tests are fast and exercise the real business logic.

### Test setup

Two TypeScript configurations coexist:

| File | Used by | Key settings |
|---|---|---|
| `tsconfig.json` | Next.js build | `module: esnext`, `moduleResolution: bundler` |
| `tsconfig.test.json` | ts-node / Cucumber | `module: commonjs`, `moduleResolution: node` |

`tsconfig.test.json` extends the base config and overrides only the module settings that ts-node requires. Both configs share the same `@/*` path alias (resolved by `tsconfig-paths`) so step definitions import `@/domain/...` without relative paths.

`cucumber.json` wires everything together:

```json
{
  "default": {
    "require": ["tests/support/**/*.ts", "tests/acceptance/steps/**/*.ts"],
    "paths":   ["tests/acceptance/**/*.feature"],
    "requireModule": ["ts-node/register", "tsconfig-paths/register"],
    "format": ["progress-bar", "summary"],
    "forceExit": true
  }
}
```

### World object

`tests/support/world.ts` defines `AvaliaProWorld`, which Cucumber instantiates fresh for every scenario. All shared state between steps is stored on `this`:

```typescript
interface AvaliaProWorld extends World {
  // Questions
  currentQuestion:       Question | null;
  lastResponse:          Question | Question[] | null;
  lastError:             Error | null;
  pendingStatement:      string;

  // Exams
  currentExam:           Exam | null;
  lastExamResponse:      Exam | Exam[] | null;

  // Generation
  lastGenerationResult:  GenerationResult | null;

  // Grading
  lastAnswerKeyCsv:      string;
  lastStudentAnswersCsv: string;
  lastGradingReport:     GradingReport | null;
}
```

Because Cucumber creates a new world instance per scenario, there is no state leakage between scenarios. Each step file also registers a `Before` hook that wipes the relevant database tables before each scenario.

The step `"Dado que o banco de dados está limpo"` (used in every feature's `Contexto:`) is a documented no-op — the `Before` hook already handles the cleanup.

### Feature files and step definitions

| Feature file | Step file | Scenarios | What is covered |
|---|---|---|---|
| `questions.feature` | `questions.steps.ts` | 9 | Question CRUD, validation (no statement, < 2 alternatives), not found |
| `exams.feature` | `exams.steps.ts` | 10 | Exam CRUD, both identification modes, validation (no title, no questions), not found |
| `generation.feature` | `generation.steps.ts` | 6 | Generate 1 / N exams, correct question count per version, letter-mode key non-numeric, powers-of-2 key numeric, count = 0 error |
| `grading.feature` | `grading.steps.ts` | 8 | Strict full/partial/zero credit, lenient partial credit, multi-letter set matching (order-insensitive), powers-of-2 numeric answers, report average/min/max |

**Step definition conventions:**

- `When` steps wrap domain calls in `try/catch`; any thrown error is stored in `this.lastError`.
- `Then "devo receber um erro de validação"` asserts `this.lastError !== null` — keeping validation-failure scenarios concise.
- Singular/plural step variants (`"1 versão"` / `"5 versões"`, `"1 prova gerada"` / `"5 provas geradas"`) are registered as separate step definitions to match natural Portuguese phrasing.
- CSV doc-strings (triple-quoted blocks) in `grading.feature` are passed as the second argument to `Given` steps and stored on the world for use in the subsequent `When` step.

### Running tests

```bash
npm test
# or directly:
TS_NODE_PROJECT=tsconfig.test.json npx cucumber-js
```

Current result: **33 scenarios, 147 steps, all passing**.

---

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Create the environment file
echo 'DATABASE_URL="file:./prisma/dev.db"' > .env

# 3. Run database migrations and generate Prisma client
npx prisma migrate dev

# 4. Start the development server
npm run dev
```

Open `http://localhost:3000`.

---

## Available scripts

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js development server with hot reload |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint across all `.ts` / `.tsx` files |
| `npm test` | Run all Cucumber acceptance tests |
| `npx prisma migrate dev` | Apply pending migrations and regenerate client |
| `npx prisma studio` | Open Prisma visual database browser |
| `npx tsc --noEmit` | Type-check all files without emitting output |
