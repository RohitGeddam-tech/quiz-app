import type { Question } from '../engine';

/**
 * Static quiz data, the same 8 questions as the vanilla version. Each answerIndex is 0-based.
 * `as const` makes everything deeply readonly at compile time (the vanilla version needs
 * Object.freeze for that); `satisfies` checks the shape without widening the types.
 */
export const questions = [
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
    options: ['event.preventDefault()', 'event.stopPropagation()', 'return null', 'event.cancel()'],
    answerIndex: 0, // first option
  },
] as const satisfies readonly Question[];
