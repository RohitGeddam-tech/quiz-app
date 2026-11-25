/**
 * Shared types for the quiz engine. Same shapes as the vanilla version's types.js.
 */

/** A single quiz question. */
export type Question = {
  /** Stable id, e.g. 'q1'. */
  id: string;
  /** The question text. */
  prompt: string;
  /** Answer choices. */
  options: readonly string[];
  /** 0-based index of the correct option. */
  answerIndex: number;
};

export type QuizStatus = 'idle' | 'playing' | 'finished';

/** The quiz's whole state. The score is derived from `answers` and never stored. */
export type QuizState = {
  status: QuizStatus;
  /** Index of the current question. */
  index: number;
  /** Option picked on the current question. */
  selected: number | null;
  /** Chosen option index per answered question. */
  answers: number[];
};

/** Everything the reducer can respond to (a discriminated union on `type`). */
export type Action =
  { type: 'START' } | { type: 'SELECT'; option: number } | { type: 'NEXT' } | { type: 'RESTART' };

/** One row of the answer review on the result screen. */
export type ReviewItem = {
  id: string;
  prompt: string;
  options: readonly string[];
  chosenIndex: number;
  correctIndex: number;
  isCorrect: boolean;
};
