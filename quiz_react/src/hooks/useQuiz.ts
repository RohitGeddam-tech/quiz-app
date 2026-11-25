import { useReducer } from 'react';
import {
  ActionTypes,
  createInitialState,
  getCurrentQuestion,
  getProgress,
  getReview,
  getScore,
  isLastQuestion,
  quizReducer,
  type Action,
  type Question,
  type QuizState,
} from '../engine';

/**
 * Adapts the quiz engine to React. The only stateful piece of the app:
 * components get plain values and intent functions, never `dispatch` or raw state.
 * Plays the same role as main.js + store.js in the vanilla version.
 */
export function useQuiz(questions: readonly Question[]) {
  const [state, dispatch] = useReducer(
    (current: QuizState, action: Action) => quizReducer(current, action, questions),
    undefined,
    createInitialState,
  );

  // Derived values are recomputed on each render. The data is tiny, so useMemo
  // would add complexity without a measurable benefit.
  return {
    status: state.status,
    currentQuestion: getCurrentQuestion(state, questions),
    progress: getProgress(state, questions),
    selected: state.selected,
    isLast: isLastQuestion(state, questions),
    canAdvance: state.selected !== null,
    score: getScore(state, questions),
    total: questions.length,
    review: getReview(state, questions),

    start: () => dispatch({ type: ActionTypes.START }),
    select: (option: number) => dispatch({ type: ActionTypes.SELECT, option }),
    next: () => dispatch({ type: ActionTypes.NEXT }),
    restart: () => dispatch({ type: ActionTypes.RESTART }),
  };
}
