import { Status } from './constants';
import type { Question, QuizState, ReviewItem } from './types';

/**
 * The question being shown, or null when the quiz isn't in progress.
 * Returning null (rather than questions[0] while idle) makes the UI handle each screen explicitly.
 */
export function getCurrentQuestion(
  state: QuizState,
  questions: readonly Question[],
): Question | null {
  return state.status === Status.PLAYING ? (questions[state.index] ?? null) : null;
}

/**
 * 1-based position for display, e.g. { current: 2, total: 8 } -> "Question 2 of 8".
 * Once finished, current equals total so a progress bar reads 100%.
 */
export function getProgress(
  state: QuizState,
  questions: readonly Question[],
): { current: number; total: number } {
  const total = questions.length;
  const current = state.status === Status.FINISHED ? total : state.index + 1;
  return { current, total };
}

/** True on the final question: drives the "Finish" label and the reducer's NEXT branch. */
export function isLastQuestion(state: QuizState, questions: readonly Question[]): boolean {
  return state.index === questions.length - 1;
}

/**
 * Number of recorded answers that match the correct option.
 * Derived from `answers` every time, never stored, so it can't drift out of sync.
 */
export function getScore(state: QuizState, questions: readonly Question[]): number {
  return state.answers.reduce(
    (score, chosen, i) => (chosen === questions[i].answerIndex ? score + 1 : score),
    0,
  );
}

/**
 * One review row per answered question, for the result screen.
 * Only covers answered questions, so it's safe to call mid-quiz too.
 */
export function getReview(state: QuizState, questions: readonly Question[]): ReviewItem[] {
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
