# Quiz App: React

Challenge 2: the same multiple-choice quiz as Challenge 1, built with React 19 and TypeScript, using Vite.

The app shows one question at a time with a progress bar. Next stays disabled until you pick an answer, and the last question shows Finish. At the end you see your score ("You scored X out of Y"), a review of every answer with the correct one, and a Restart button.

## How to run

You need [Node.js](https://nodejs.org/) 20.19 or later, or 22.12 or later.

```bash
npm install
npm run dev        # start the dev server, then open http://localhost:5173
```

Other scripts:

```bash
npm test           # run all tests once (Vitest)
npm run test:watch # re-run tests on every change
npm run typecheck  # TypeScript strict-mode check
npm run lint       # oxlint
npm run build      # type-check and build for production into dist/
npm run preview    # serve the production build locally
npm run format     # format the source with Prettier
```

## Tech stack

| Tool | Version | Used for |
| --- | --- | --- |
| React | 19.3 | UI |
| TypeScript | 7.0 (`strict`) | Types |
| Vite | 8.3 | Dev server and build |
| Vitest + React Testing Library | 5.1 | Unit and component tests |
| oxlint + Prettier | | Linting and formatting |

## Project structure

```
src/
├── engine/               # all quiz logic, as pure functions with no React
│   ├── types.ts          # Question, QuizState, Action, ReviewItem
│   ├── constants.ts      # ActionTypes and Status (`as const`)
│   ├── reducer.ts        # createInitialState, getActionError, quizReducer
│   ├── selectors.ts      # getCurrentQuestion, getProgress, isLastQuestion, getScore, getReview
│   ├── validate.ts       # validateQuestions: checks the data once at startup
│   ├── index.ts          # public API, re-exports only
│   └── engine.test.ts    # reducer, selector and validation tests
├── data/
│   └── questions.ts      # static quiz data (8 questions)
├── hooks/
│   ├── useQuiz.ts        # useReducer + engine; gives components plain values and functions
│   └── useFocusOnMount.ts
├── components/
│   ├── StartScreen.tsx
│   ├── Progress.tsx
│   ├── QuestionCard.tsx  # the question as a radio group in a fieldset, inside a form
│   └── ResultScreen.tsx  # score + answer review + Restart
├── App.tsx               # picks the screen from the quiz status
├── App.test.tsx          # full-flow tests through the real UI
├── index.css
├── main.tsx
└── test/setup.ts         # Testing Library matchers + cleanup
```

## How it works

- **The engine** (`src/engine/`) is the same logic as the vanilla JavaScript version, ported to TypeScript. It's a pure reducer plus selectors, and it doesn't depend on React, so it's tested on its own. The reducer's `switch` is exhaustive: adding a new action without handling it is a type error.
- **`useQuiz`** is the only stateful piece. It wraps `useReducer` around the engine and gives the components a view model: plain values (`currentQuestion`, `progress`, `score`, `review`, and so on) and functions (`start`, `select`, `next`, `restart`). Components never call `dispatch` or read the raw state.
- **Components** only get data and callbacks through props. `App` picks which screen to show from the quiz status.

## Design decisions

- **No state library and no context.** The state lives in one reducer, and the component tree is two levels deep, so passing props is the simplest honest choice. Redux, Zustand or context would add structure this app doesn't need.
- **No `useMemo` or `useCallback`.** The values are cheap to work out, and none of the components are memoised, so these hooks would add complexity with no measurable benefit.
- **`key={question.id}` on `QuestionCard`.** A new question remounts the card. That resets it cleanly and moves focus to the new question without any extra effect logic.
- **The score is derived, not stored.** It's worked out from `answers` on each render, so it can never get out of sync with them.
- **Invalid actions do nothing.** The reducer returns the same state for actions that aren't allowed, so the rules are enforced in the logic, not only by the disabled button. Returning the same state also tells React it doesn't need to re-render.
- **Data is checked at startup.** `validateQuestions` runs once when the module loads, not on every render, and reports every problem at once.

## Accessibility

- Each question is a native radio group inside a `<fieldset>`, with the question as its `<legend>`.
- Everything works with the keyboard: Tab to reach the options, arrow keys to choose, Enter to go on, because the question is a real `<form>`.
- Focus moves to each new question, to the result heading, and to the start heading after a restart (but not on first page load).
- Progress and the final score are announced through a polite `aria-live` region.
- Right and wrong answers in the review are shown with a ✓/✗ symbol and hidden text, not only by colour.
- There's a visible focus ring, the layout works from 360px wide, and animations are turned off under `prefers-reduced-motion`.

## Testing

`npm test` runs 38 tests:

- **Engine tests:** the same cases as the vanilla version. They cover every reducer transition, every invalid action, the score for all-correct, all-wrong and mixed runs, the answer review, and data validation.
- **Component tests:** these use React Testing Library and `user-event`, and find elements only by their role and accessible name. They cover:
  - Next stays disabled until an answer is picked.
  - A full correct run.
  - The review marks wrong answers.
  - Restart returns to a clean start.
  - The whole quiz can be completed using only the keyboard, with focus checked after every question.

## What I'd add with more time

- Load questions from a JSON file or an API, with loading and error states. The engine wouldn't need to change.
- Shuffle the questions with a seeded shuffle, so tests stay predictable.
- Save progress in `sessionStorage`.
- A GitHub Actions workflow that runs `typecheck`, `lint`, `test` and `build` on every push.

## AI assistance

I used an AI assistant (Claude) while building this project, for planning, code review and writing parts of the code. I've reviewed every file and can explain each decision above.
