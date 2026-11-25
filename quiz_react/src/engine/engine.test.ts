// Engine tests: the same cases as the vanilla version's test/engine.test.js, ported to Vitest.
import { describe, expect, it } from 'vitest';

import { questions } from '../data/questions';
import {
  ActionTypes,
  Status,
  createInitialState,
  getActionError,
  getCurrentQuestion,
  getProgress,
  getReview,
  getScore,
  isLastQuestion,
  quizReducer,
  validateQuestions,
  type Action,
  type Question,
  type QuizState,
} from './index';

/** Applies actions in order, starting from a fresh state. */
const run = (...actions: Action[]): QuizState =>
  actions.reduce((state, action) => quizReducer(state, action, questions), createInitialState());

const start: Action = { type: ActionTypes.START };
const next: Action = { type: ActionTypes.NEXT };
const select = (option: number): Action => ({ type: ActionTypes.SELECT, option });

/** Answers every question, choosing with pick(question) -> option index. */
const answerAll = (pick: (q: Question) => number): Action[] => [
  start,
  ...questions.flatMap((q) => [select(pick(q)), next]),
];

const correct = (q: Question) => q.answerIndex;
const wrong = (q: Question) => (q.answerIndex + 1) % q.options.length;

describe('quizReducer', () => {
  it('starts idle on question 0 with no answers', () => {
    expect(createInitialState()).toEqual({
      status: Status.IDLE,
      index: 0,
      selected: null,
      answers: [],
    });
  });

  it('START moves from idle to playing', () => {
    expect(run(start).status).toBe(Status.PLAYING);
  });

  it('SELECT stores the chosen option', () => {
    expect(run(start, select(2)).selected).toBe(2);
  });

  it('ignores SELECT before the quiz starts', () => {
    const state = createInitialState();
    expect(quizReducer(state, select(1), questions)).toBe(state);
  });

  it.each([-1, 4, 1.5, NaN])('ignores SELECT with an invalid option (%s)', (option) => {
    const playing = run(start);
    expect(quizReducer(playing, select(option), questions)).toBe(playing);
  });

  it('ignores NEXT when nothing is selected', () => {
    const playing = run(start);
    expect(quizReducer(playing, next, questions)).toBe(playing);
  });

  it('NEXT records the answer, moves on and clears the selection', () => {
    const state = run(start, select(1), next);
    expect(state.index).toBe(1);
    expect(state.selected).toBeNull();
    expect(state.answers).toEqual([1]);
  });

  it('NEXT on the last question finishes the quiz', () => {
    const state = run(...answerAll(correct));
    expect(state.status).toBe(Status.FINISHED);
    expect(state.answers).toHaveLength(questions.length);
    expect(state.index).toBe(questions.length - 1); // stays on a real question
  });

  it('RESTART returns a fresh state', () => {
    const state = run(...answerAll(correct), { type: ActionTypes.RESTART });
    expect(state).toEqual(createInitialState());
  });

  it('createInitialState never shares the answers array', () => {
    expect(createInitialState().answers).not.toBe(createInitialState().answers);
  });

  it('ignores unknown actions', () => {
    const playing = run(start);
    const unknown = { type: 'JUMP' } as unknown as Action;
    expect(quizReducer(playing, unknown, questions)).toBe(playing);
  });

  it('does not mutate the previous state', () => {
    const before = run(start, select(1));
    const snapshot = structuredClone(before);
    quizReducer(before, next, questions);
    expect(before).toEqual(snapshot);
  });
});

describe('getActionError', () => {
  it('returns null for allowed actions', () => {
    expect(getActionError(createInitialState(), start, questions)).toBeNull();
    expect(getActionError(run(start), select(0), questions)).toBeNull();
  });

  it('explains why NEXT is blocked without a selection', () => {
    expect(getActionError(run(start), next, questions)).toMatch(/select an option/i);
  });

  it('rejects START once the quiz is running', () => {
    expect(getActionError(run(start), start, questions)).not.toBeNull();
  });
});

describe('selectors', () => {
  it('getCurrentQuestion is null unless playing', () => {
    expect(getCurrentQuestion(createInitialState(), questions)).toBeNull();
    expect(getCurrentQuestion(run(start), questions)).toBe(questions[0]);
    expect(getCurrentQuestion(run(...answerAll(correct)), questions)).toBeNull();
  });

  it('getProgress is 1-based and full when finished', () => {
    expect(getProgress(run(start), questions)).toEqual({ current: 1, total: questions.length });
    expect(getProgress(run(...answerAll(correct)), questions)).toEqual({
      current: questions.length,
      total: questions.length,
    });
  });

  it('isLastQuestion is true only on the final question', () => {
    expect(isLastQuestion(run(start), questions)).toBe(false);
    const lastActions = answerAll(correct).slice(0, -2); // stop before the last answer
    expect(isLastQuestion(run(...lastActions), questions)).toBe(true);
  });

  it('getScore counts all correct, all wrong and mixed runs', () => {
    expect(getScore(run(...answerAll(correct)), questions)).toBe(questions.length);
    expect(getScore(run(...answerAll(wrong)), questions)).toBe(0);

    const mixed = run(...answerAll((q) => (Number(q.id.slice(1)) % 2 ? correct(q) : wrong(q))));
    expect(getScore(mixed, questions)).toBe(Math.ceil(questions.length / 2));
  });

  it('getReview has one row per answer and agrees with the score', () => {
    const state = run(...answerAll(wrong));
    const review = getReview(state, questions);
    expect(review).toHaveLength(questions.length);
    expect(review.filter((r) => r.isCorrect)).toHaveLength(getScore(state, questions));
    expect(Object.keys(review[0]).sort()).toEqual([
      'chosenIndex',
      'correctIndex',
      'id',
      'isCorrect',
      'options',
      'prompt',
    ]);
  });
});

describe('validateQuestions', () => {
  const valid: Question = { id: 'a', prompt: 'Pick one', options: ['x', 'y'], answerIndex: 0 };

  it('accepts the real quiz data', () => {
    expect(() => validateQuestions(questions)).not.toThrow();
  });

  it('rejects an empty list', () => {
    expect(() => validateQuestions([])).toThrow(/non-empty array/);
  });

  it('rejects duplicate ids', () => {
    expect(() => validateQuestions([valid, { ...valid }])).toThrow(/duplicate id "a"/);
  });

  it('rejects fewer than 2 options without crashing', () => {
    expect(() => validateQuestions([{ ...valid, options: ['x'] }])).toThrow(/at least 2/);
    const missingOptions = { id: 'b', prompt: 'p' } as unknown as Question;
    expect(() => validateQuestions([missingOptions])).toThrow(/at least 2/);
  });

  it.each([2, -1, 1.5])('rejects an answerIndex of %s', (answerIndex) => {
    expect(() => validateQuestions([{ ...valid, answerIndex }])).toThrow(/answerIndex/);
  });

  it('reports every problem in one error', () => {
    const bad = [
      { ...valid, prompt: '' },
      { ...valid, id: 'b', answerIndex: 9 },
    ];
    expect(() => validateQuestions(bad)).toThrow(/prompt[\s\S]*answerIndex/);
  });
});
