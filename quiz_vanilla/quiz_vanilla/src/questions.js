// src/questions.js
// Static quiz data. Each answerIndex is 0-based.

/** @type {ReadonlyArray<import('./engine/types.js').Question>} */
const questions = Object.freeze(
  [
    {
      id: 'q1',
      prompt: 'Which keyword declares a block-scoped variable that can be reassigned?',
      options: ['var', 'let', 'const', 'static'],
      answerIndex: 1,
    },
    {
      id: 'q2',
      prompt: 'What does typeof null return in JavaScript?',
      options: ['"null"', '"undefined"', '"object"', '"number"'],
      answerIndex: 2,
    },
    {
      id: 'q3',
      prompt: 'Which array method returns a new array without changing the original?',
      options: ['map()', 'push()', 'splice()', 'sort()'],
      answerIndex: 0, // first option
    },
    {
      id: 'q4',
      prompt: 'What does 0.1 + 0.2 === 0.3 evaluate to?',
      options: ['true', 'false', 'TypeError', 'NaN'],
      answerIndex: 1,
    },
    {
      id: 'q5',
      prompt: 'Which HTML element groups related radio buttons under one caption?',
      options: ['<div>', '<section>', '<label>', '<fieldset>'],
      answerIndex: 3, // last option
    },
    {
      id: 'q6',
      prompt: 'Which React hook suits state with several related transitions?',
      options: ['useEffect', 'useRef', 'useReducer', 'useMemo'],
      answerIndex: 2,
    },
    {
      id: 'q7',
      prompt: 'What does [1, 2, 3].at(-1) return?',
      options: ['undefined', '1', '-1', '3'],
      answerIndex: 3, // last option
    },
    {
      id: 'q8',
      prompt: 'Which call stops a form submission from reloading the page?',
      options: [
        'event.preventDefault()',
        'event.stopPropagation()',
        'return null',
        'event.cancel()',
      ],
      answerIndex: 0, // first option
    },
    // Deep-freeze each question: Object.freeze is shallow, so freezing the outer array
    // alone would still let code mutate a question (q.answerIndex = 0) or its options
    // (q.options.push('x')). Copy each object and options array, then freeze both, so
    // the static data stays read-only everywhere it is imported.
  ].map((q) => Object.freeze({ ...q, options: Object.freeze([...q.options]) })),
);

export default questions;
