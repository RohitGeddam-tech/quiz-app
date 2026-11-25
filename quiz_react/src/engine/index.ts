/**
 * Public API of the quiz engine. Everything outside engine/ imports from here,
 * so the internal file layout can change without touching callers.
 */
export { ActionTypes, Status } from './constants';
export { createInitialState, getActionError, quizReducer } from './reducer';
export { getCurrentQuestion, getProgress, isLastQuestion, getScore, getReview } from './selectors';
export { validateQuestions } from './validate';
export type { Action, Question, QuizState, QuizStatus, ReviewItem } from './types';
