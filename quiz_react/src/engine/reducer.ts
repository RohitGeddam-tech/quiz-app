import { ActionTypes, Status } from './constants';
import { isLastQuestion } from './selectors';
import type { Action, Question, QuizState } from './types';

/**
 * Returns a fresh starting state.
 * A function, not a shared constant, so every start or restart gets its own
 * `answers` array and nothing carries over between runs.
 */
export function createInitialState(): QuizState {
  return { status: Status.IDLE, index: 0, selected: null, answers: [] };
}

/**
 * Explains why an action can't be applied right now, or returns null if it can.
 * Pure: the reducer uses it to reject actions; the UI can use it to show feedback.
 */
export function getActionError(
  state: QuizState,
  action: Action,
  questions: readonly Question[],
): string | null {
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
      return `Unknown action: ${(action as { type: string }).type}`;
  }
}

/**
 * Pure reducer: returns the next state. A rejected action returns the same state,
 * which also tells React there is nothing to re-render.
 */
export function quizReducer(
  state: QuizState,
  action: Action,
  questions: readonly Question[],
): QuizState {
  if (getActionError(state, action, questions)) return state;

  switch (action.type) {
    case ActionTypes.START:
      return { ...state, status: Status.PLAYING };

    case ActionTypes.SELECT:
      return { ...state, selected: action.option };

    case ActionTypes.NEXT: {
      // getActionError has already ruled out a null selection
      const answers = [...state.answers, state.selected as number];
      return isLastQuestion(state, questions)
        ? { ...state, status: Status.FINISHED, selected: null, answers }
        : { ...state, index: state.index + 1, selected: null, answers };
    }

    case ActionTypes.RESTART:
      return createInitialState();

    default:
      return assertNever(action);
  }
}

/** Makes the switch exhaustive: adding an Action without a case becomes a type error. */
function assertNever(action: never): never {
  throw new Error(`Unhandled action: ${JSON.stringify(action)}`);
}
