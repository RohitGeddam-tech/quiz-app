// @ts-check
/**
 * Shared JSDoc types for the quiz engine. Holds no runtime code;
 * other files import these with import('./types.js').
 */

/**
 * A single quiz question.
 * @typedef {Object} Question
 * @property {string} id                  Stable id, e.g. 'q1'.
 * @property {string} prompt              The question text.
 * @property {ReadonlyArray<string>} options  Answer choices.
 * @property {number} answerIndex         0-based index of the correct option.
 */

/** @typedef {'idle' | 'playing' | 'finished'} QuizStatus */

/**
 * The quiz's whole state. The score is derived from `answers` and never stored.
 * @typedef {Object} QuizState
 * @property {QuizStatus} status
 * @property {number} index               Index of the current question.
 * @property {number | null} selected     Option picked on the current question.
 * @property {number[]} answers           Chosen option index per answered question.
 */

/**
 * Everything the reducer can respond to (a discriminated union on `type`).
 * @typedef {{ type: 'START' } | { type: 'SELECT', option: number } | { type: 'NEXT' } | { type: 'RESTART' }} Action
 */

/**
 * One row of the answer review on the result screen.
 * @typedef {Object} ReviewItem
 * @property {string} id
 * @property {string} prompt
 * @property {ReadonlyArray<string>} options
 * @property {number} chosenIndex
 * @property {number} correctIndex
 * @property {boolean} isCorrect
 */

export {}; // marks this file as a module so the typedefs can be imported
