# AGENTS – Overview

This repository implements the exam creation and grading web system described in the practical experiment specification. 

## Experiment goal

Build a web system that supports: 

- Management of multiple-choice questions:
  - Each question has a statement and a list of alternatives.
  - Each alternative has a description and a flag indicating whether it should be selected by the student.

- Management of exams:
  - Each exam is created by selecting a set of previously registered questions.
  - For each exam, the user chooses how alternatives are identified:
    - Letters (A, B, C, …) with space for the student to write the selected letters.
    - Powers of 2 (1, 2, 4, 8, 16, …) with space for the student to write the sum of selected alternatives.

- Generation of exams:
  - Generate a user-defined number of individual exams.
  - Randomize the order of questions and alternatives per exam.
  - Each exam PDF must have:
    - A header (course name, instructor, date, etc.).
    - A footer on each page with the exam number.
    - A final area for student name and CPF (ID).
  - Generate a CSV with the answer key for each individual exam:
    - One line per exam: exam number + answer for each question (letters or expected sum). 

- Exam grading:
  - Input: CSV with answer keys + CSV with students’ answers (e.g., Google Forms export containing exam number and answers).
  - Output: grades per student and a class report.
  - Two grading modes:
    - Strict: any incorrectly selected or missed alternative makes the whole question score zero.
    - Lenient: question score is proportional to the percentage of alternatives correctly selected or left unselected. 

## Tech stack

- Next.js 16 with **App Router** (`app/**`).
- Backend implemented via **Route Handlers** under `app/api/**/route.ts` (Node/TypeScript).
- React 19 on the client.
- **shadcn/ui** as the main UI library.
- **Prisma** as ORM with **SQLite** as the development database.
- Acceptance tests with Cucumber + Gherkin.
- TypeScript across the entire project. 

## Agent files

Claude Code agents are defined in separate instruction files:

- `agents/architect.md` – architecture and coordination.
- `agents/frontend.md` – frontend (Next 16 + React 19 + shadcn/ui).
- `agents/backend.md` – backend APIs using `app/api`.
- `agents/tests.md` – acceptance and other tests.
- `agents/lint.md` – linting and code quality.
- `agents/commits.md` – commit messages.

## Recommended usage flow

1. Start with `agents/architect.md` to (re)define the architecture and a small-step plan.
2. Use `agents/frontend.md` and `agents/backend.md` to implement features in small increments.
3. After a feature is implemented, call `agents/tests.md` to add/update tests.
4. Periodically call `agents/lint.md` to keep code quality under control.
5. Before creating a commit, call `agents/commits.md` to generate a clear commit message.

For the experiment, remember to: 

- Log every prompt and agent action in the history spreadsheet.
- Check that the system builds/runs after each accepted agent action.
- Record issues, limitations, and any manual adjustments you make to the agent’s code.
