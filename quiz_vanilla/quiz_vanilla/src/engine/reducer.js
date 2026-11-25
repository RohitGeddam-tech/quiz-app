// @ts-check
import { ActionTypes, Status } from './constants.js';
import { isLastQuestion } from './selectors.js';

/** @typedef {import('./types.js').Question} Question */
/** @typedef {import('./types.js').QuizState} QuizState */
/** @typedef {import('./types.js').Action} Action */

/**
 * Returns a fresh starting state.
 * A function, not a shared constant, so every start or restart gets its own
 * `answers` array and nothing carries over between runs.
 * @returns {QuizState}
 */
export function createInitialState() {
  return { status: Status.IDLE, index: 0, selected: null, answers: [] };
}

/**
 * Explains why an action can't be applied right now, or returns null if it can.
 * Pure: the reducer uses it to reject actions; the UI uses it to show feedback.
 * @param {QuizState} state
 * @param {Action} action
 * @param {ReadonlyArray<Question>} questions
 * @returns {string | null}
 */
export function getActionError(state, action, questions) {
  switch (action.type) {
    case ActionTypes.START:
      return state.status === Status.IDLE ? null : 'The quiz has already started.';
    case ActionTypes.SELECT: {
      if (state.status !== Status.PLAYING) return 'You can only select an option during the quiz.';
      const { options } = questions[state.index];
      const ok =
        Number.isInteger(action.option) && action.option >= 0 && action.option < options.length;
      return ok ? null : 'That option is not valid.';
    }
    case ActionTypes.NEXT:
      if (state.status !== Status.PLAYING) return 'The quiz is not in progress.';
      return state.selected === null ? 'Please select an option before continuing.' : null;
    case ActionTypes.RESTART:
      return null;
    default:
      return `Unknown action: ${/** @type {any} */ (action).type}`;
  }
}

/**
 * Pure reducer: returns the next state. A rejected action returns the same state.
 * @param {QuizState} state
 * @param {Action} action
 * @param {ReadonlyArray<Question>} questions
 * @returns {QuizState}
 */
export function quizReducer(state, action, questions) {
  if (getActionError(state, action, questions)) return state;

  switch (action.type) {
    case ActionTypes.START:
      return { ...state, status: Status.PLAYING };

    case ActionTypes.SELECT:
      return { ...state, selected: action.option };

    case ActionTypes.NEXT: {
      const answers = [...state.answers, /** @type {number} */ (state.selected)];
      const isLast = isLastQuestion(state, questions);
      return isLast
        ? { ...state, status: Status.FINISHED, selected: null, answers }
        : { ...state, index: state.index + 1, selected: null, answers };
    }

    case ActionTypes.RESTART:
      return createInitialState();

    default:
      return state;
  }
}
