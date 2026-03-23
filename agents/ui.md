# UI/UX Improvement Agent (shadcn/ui)

## Goal
Agent responsible for analyzing and improving visual experience and workflow in AvaliaPro, focusing on:
- Standardize empty states with a styled component.
- Reduce unnecessary create pages by using inline cards in list screens.
- Improve style consistency and accessibility with shadcn/ui.

## Scope
1. `app/questions/page.tsx`:
   - Turn into `QuestionManager` (toggle button to show/hide creation form), using `QuestionList` + `QuestionForm` inside a card.
   - Deprecate direct link to `/questions/new` (keep for migration if needed).
2. `app/exams/page.tsx`:
   - Turn into `ExamManager` (toggle create inline card).
   - Reuse `ExamList` + `ExamForm` with question data (`listQuestions`).
3. Empty state:
   - Create `components/ui/EmptyState.tsx` with:
     - visual card, icon, title, description, CTA button.
     - light animation (fade-in) and dashed border + subtle background.
   - Use in `components/questions/QuestionList.tsx` and `components/exams/ExamList.tsx` when list is empty.
4. Reduce pages:
   - Adjust `app/questions/new/page.tsx` and `app/exams/new/page.tsx` to keep support but make more compact (`max-w-3xl`, `py-6`, no redundant header) for transition.
5. Accessibility and usability:
   - buttons with clear labels and loading states.
   - input labels, inline error messaging.
   - failure/success visibility (toast optional).

## Acceptance Criteria
- When there are no questions, `QuestionList` shows `EmptyState` with a create CTA.
- When there are no exams, `ExamList` shows `EmptyState` with a create CTA.
- Questions/exams main screen exposes a single manager + card flow without page switch for create.
- The `New ...` button toggles inline creation form and hides it when toggled off.
- Create action works and refreshes list via react-query.
- No regression in global shadcn/ui styles; card component remains reusable.
- UI should look polished with spacing, color accents, cards, iconography, and a light design system for friendly perception.
- Empty states and forms should have clear visual hierarchy: card shadows, border radius, typography scale, and button variants.

## Visual polish additions
- Use `Badge` or `Alert` styles for context hints, plus subtle separator lines.
- Add a “hero” card in list pages (title, subtitle, action) for first impression.
- Normalize color shades for dark/light mode (if in use) with `bg-muted` and `text-muted-foreground`.
- Add transition states on hover for rows and buttons.
- Ensure `QuestionForm`/`ExamForm` has `max-w-3xl` and centered container.

## Suggested Process
1. Create `components/ui/EmptyState.tsx`.
2. Refactor list components (`QuestionList`, `ExamList`) to use empty state.
3. Create `QuestionManager` + `ExamManager` with toggle creation.
4. Update `app/questions/page.tsx` and `app/exams/page.tsx` to use managers.
5. Adjust `/new` pages to compact versions.
6. Run `npm run lint && npm run test`.

## Notes
- This agent doesn’t alter backend logic; it only captures frontend steps and responsibilities.
- Keep instructions in English for broader usage and consistency.