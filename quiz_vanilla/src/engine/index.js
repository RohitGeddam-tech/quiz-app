// @ts-check
/**
 * Public API of the quiz engine. Everything outside engine/ imports from here,
 * so the internal file layout can change without touching callers.
 */
export { ActionTypes, Status } from './constants.js';
export { createInitialState, getActionError, quizReducer } from './reducer.js';
export {
  getCurrentQuestion,
  getProgress,
  isLastQuestion,
  getScore,
  getReview,
} from './selectors.js';
export { validateQuestions } from './validate.js';
