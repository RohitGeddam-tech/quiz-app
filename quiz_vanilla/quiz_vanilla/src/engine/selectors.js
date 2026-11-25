// @ts-check
import { Status } from './constants.js';

/** @typedef {import('./types.js').Question} Question */
/** @typedef {import('./types.js').QuizState} QuizState */
/** @typedef {import('./types.js').ReviewItem} ReviewItem */

/**
 * The question being shown, or null when the quiz isn't in progress.
 * Returning null (rather than questions[0] while idle) makes the view handle each screen explicitly.
 * @param {QuizState} state
 * @param {ReadonlyArray<Question>} questions
 * @returns {Question | null}
 */
export function getCurrentQuestion(state, questions) {
  return state.status === Status.PLAYING ? (questions[state.index] ?? null) : null;
}

/**
 * 1-based position for display, e.g. { current: 2, total: 8 } -> "Question 2 of 8".
 * Once finished, current equals total so a progress bar reads 100%.
 * @param {QuizState} state
 * @param {ReadonlyArray<Question>} questions
 * @returns {{ current: number, total: number }}
 */
export function getProgress(state, questions) {
  const total = questions.length;
  const current = state.status === Status.FINISHED ? total : state.index + 1;
  return { current, total };
}

/**
 * True on the final question: drives the "Finish" label and the reducer's NEXT branch.
 * @param {QuizState} state
 * @param {ReadonlyArray<Question>} questions
 * @returns {boolean}
 */
export function isLastQuestion(state, questions) {
  return state.index === questions.length - 1;
}

/**
 * Number of recorded answers that match the correct option.
 * Derived from `answers` every time, never stored, so it can't drift out of sync.
 * @param {QuizState} state
 * @param {ReadonlyArray<Question>} questions
 * @returns {number}
 */
export function getScore(state, questions) {
  return state.answers.reduce(
    (score, chosen, i) => (chosen === questions[i].answerIndex ? score + 1 : score),
    0,
  );
}

/**
 * One review row per answered question, for the result screen.
 * Only covers answered questions, so it's safe to call mid-quiz too.
 * @param {QuizState} state
 * @param {ReadonlyArray<Question>} questions
 * @returns {ReviewItem[]}
 */
export function getReview(state, questions) {
  return state.answers.map((chosenIndex, i) => {
    const { id, prompt, options, answerIndex: correctIndex } = questions[i];
    return {
      id,
      prompt,
      options,
      chosenIndex,
      correctIndex,
      isCorrect: chosenIndex === correctIndex,
    };
  });
}
