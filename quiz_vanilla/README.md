# Quiz App: Vanilla JavaScript

Challenge 1: a multiple-choice quiz in plain HTML, CSS and JavaScript. It uses no framework and no build step.

The app shows one question at a time with a progress bar. Next stays disabled until you pick an answer, and the last question shows Finish. At the end you see your score ("You scored X out of Y"), a review of every answer with the correct one, and a Restart button.

## How to run

You need [Node.js](https://nodejs.org/) 18 or later to serve the files and run the tests. The app itself has no dependencies.

```bash
npm start      # serves the folder with `npx serve .`; open the URL it prints
npm test       # runs the engine tests with Node's built-in test runner
npm run typecheck   # optional: type-checks the JavaScript through JSDoc (downloads TypeScript on first run)
```

You can also run any static file server from this folder, for example `python -m http.server`, and open `http://localhost:8000`.

> Opening `index.html` by double-clicking it won't work. The app uses ES modules, and browsers block modules loaded from `file://`. I chose modules because they keep the code cleanly split into files. The cost is this one-line serve command.

## Project structure

```
quiz_vanilla/
├── index.html            # page shell: <main id="app"> mount point + a screen-reader live region
├── styles.css            # all styles, built on CSS custom properties
├── src/
│   ├── questions.js      # static quiz data (8 questions, deep-frozen)
│   ├── engine/           # all quiz logic, as pure functions with no DOM access
│   │   ├── types.js      # JSDoc types: Question, QuizState, Action, ReviewItem
│   │   ├── constants.js  # ActionTypes and Status, so there are no magic strings
│   │   ├── reducer.js    # createInitialState, getActionError, quizReducer
│   │   ├── selectors.js  # getCurrentQuestion, getProgress, isLastQuestion, getScore, getReview
│   │   ├── validate.js   # validateQuestions: checks the data once at startup
│   │   └── index.js      # public API, re-exports only
│   ├── store.js          # createStore: getState / dispatch / subscribe
│   ├── view.js           # turns state into DOM, one render function per screen
│   └── main.js           # connects store, view and events
├── test/
│   └── engine.test.js    # tests for the reducer, selectors and validation
├── package.json          # scripts only, no dependencies
└── jsconfig.json         # type checking for the JavaScript files
```

## How it works

Data always flows one way:

```
user event → dispatch(action) → quizReducer(state, action) → new state → render(state)
```

- **The engine** (`src/engine/`) holds all the quiz rules as pure functions: state and an action go in, new state comes out. It never touches the DOM, so it can be tested in Node with no browser.
- **The store** (`store.js`) is a small hand-written version of the pattern behind Redux and React's `useReducer`. It keeps the current state and runs the reducer on every dispatch. It notifies subscribers only when the state actually changes.
- **The view** (`view.js`) builds each screen from the state. It doesn't read events or hold any state. Buttons only carry a `data-action` attribute.
- **`main.js`** connects them. It listens once on the page for click, change and submit events, and turns each one into an action.

## Design decisions

- **One quiz engine, two apps.** The React version uses the same engine logic, ported to TypeScript. Only the view layer is different.
- **The score is derived, not stored.** It's worked out from `answers` whenever it's needed, so it can never get out of sync with them.
- **Invalid actions do nothing.** The reducer returns the same state for actions that aren't allowed, such as Next with no answer selected. So the rules are enforced in the logic, not only by the disabled button. `getActionError` explains why an action was rejected, and the UI can show that as a toast.
- **`createElement` instead of `innerHTML`.** All text is set as text, never parsed as HTML. This matters even with our own data: question 5's options are `<div>`, `<section>`, `<label>` and `<fieldset>`, which `innerHTML` would turn into real elements.
- **Only redraw when the screen changes.** A new question or a new screen is redrawn completely. When only the selected answer changes, only the Next button is updated. That keeps focus on the radio button, so arrow keys still work. It's the same idea as a React `key`.
- **Data is checked at startup.** `validateQuestions` reports every problem it finds at once: duplicate ids, missing options, or an `answerIndex` out of range.
- **Type checking without TypeScript.** JSDoc comments and `// @ts-check` let the editor and `tsc` check the plain JavaScript, with no compile step.

## Accessibility

- Each question is a native radio group inside a `<fieldset>`, with the question as its `<legend>`.
- Everything works with the keyboard: Tab to reach the options, arrow keys to choose, Enter to go on, because the question is a real `<form>`.
- Focus moves to the new question or result heading after every screen change.
- Progress and the final score are announced through a polite `aria-live` region.
- Right and wrong answers in the review are shown with a ✓/✗ symbol and hidden text, not only by colour.
- There's a visible focus ring, the layout works from 360px wide, and animations are turned off under `prefers-reduced-motion`.

## Testing

`npm test` runs 26 tests with `node:test`. They cover every reducer transition, every invalid action, the score for all-correct, all-wrong and mixed runs, the answer review, and data validation.

## What I'd add with more time

- Load questions from a JSON file or an API, behind the same engine, with a loading state.
- Shuffle the questions with a seeded shuffle, so tests stay predictable.
- Save progress in `sessionStorage`, so a page refresh in the middle of the quiz doesn't reset it.
- Browser tests (for example with Playwright) for the full flow, like the React version's component tests.

## AI assistance

I used an AI assistant (Claude) while building this project, for planning, code review and writing parts of the code. I've reviewed every file and can explain each decision above.
