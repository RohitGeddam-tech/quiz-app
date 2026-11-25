// Engine tests. Run with: npm test (node --test), no dependencies.
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import questions from '../src/questions.js';
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
} from '../src/engine/index.js';

/** Applies actions in order, starting from a fresh state. */
const run = (...actions) =>
  actions.reduce((state, action) => quizReducer(state, action, questions), createInitialState());

const start = { type: ActionTypes.START };
const next = { type: ActionTypes.NEXT };
const select = (option) => ({ type: ActionTypes.SELECT, option });

/** Answers every question, choosing with pick(question) -> option index. */
const answerAll = (pick) => [start, ...questions.flatMap((q) => [select(pick(q)), next])];

const correct = (q) => q.answerIndex;
const wrong = (q) => (q.answerIndex + 1) % q.options.length;

describe('quizReducer', () => {
  it('starts idle on question 0 with no answers', () => {
    assert.deepEqual(createInitialState(), {
      status: Status.IDLE,
      index: 0,
      selected: null,
      answers: [],
    });
  });

  it('START moves from idle to playing', () => {
    assert.equal(run(start).status, Status.PLAYING);
  });

  it('SELECT stores the chosen option', () => {
    assert.equal(run(start, select(2)).selected, 2);
  });

  it('ignores SELECT before the quiz starts', () => {
    const state = createInitialState();
    assert.equal(quizReducer(state, select(1), questions), state);
  });

  it('ignores SELECT with an invalid option', () => {
    const playing = run(start);
    for (const option of [-1, 4, 1.5, NaN]) {
      assert.equal(quizReducer(playing, select(option), questions), playing);
    }
  });

  it('ignores NEXT when nothing is selected', () => {
    const playing = run(start);
    assert.equal(quizReducer(playing, next, questions), playing);
  });

  it('NEXT records the answer, moves on and clears the selection', () => {
    const state = run(start, select(1), next);
    assert.equal(state.index, 1);
    assert.equal(state.selected, null);
    assert.deepEqual(state.answers, [1]);
  });

  it('NEXT on the last question finishes the quiz', () => {
    const state = run(...answerAll(correct));
    assert.equal(state.status, Status.FINISHED);
    assert.equal(state.answers.length, questions.length);
    assert.equal(state.index, questions.length - 1); // stays on a real question
  });

  it('RESTART returns a fresh state', () => {
    const state = run(...answerAll(correct), { type: ActionTypes.RESTART });
    assert.deepEqual(state, createInitialState());
  });

  it('createInitialState never shares the answers array', () => {
    assert.notEqual(createInitialState().answers, createInitialState().answers);
  });

  it('ignores unknown actions', () => {
    const playing = run(start);
    assert.equal(quizReducer(playing, { type: 'JUMP' }, questions), playing);
  });

  it('does not mutate the previous state', () => {
    const before = run(start, select(1));
    const snapshot = structuredClone(before);
    quizReducer(before, next, questions);
    assert.deepEqual(before, snapshot);
  });
});

describe('getActionError', () => {
  it('returns null for allowed actions', () => {
    assert.equal(getActionError(createInitialState(), start, questions), null);
    assert.equal(getActionError(run(start), select(0), questions), null);
  });

  it('explains why NEXT is blocked without a selection', () => {
    assert.match(getActionError(run(start), next, questions), /select an option/i);
  });

  it('rejects START once the quiz is running', () => {
    assert.ok(getActionError(run(start), start, questions));
  });
});

describe('selectors', () => {
  it('getCurrentQuestion is null unless playing', () => {
    assert.equal(getCurrentQuestion(createInitialState(), questions), null);
    assert.equal(getCurrentQuestion(run(start), questions), questions[0]);
    assert.equal(getCurrentQuestion(run(...answerAll(correct)), questions), null);
  });

  it('getProgress is 1-based and full when finished', () => {
    assert.deepEqual(getProgress(run(start), questions), { current: 1, total: questions.length });
    assert.deepEqual(getProgress(run(...answerAll(correct)), questions), {
      current: questions.length,
      total: questions.length,
    });
  });

  it('isLastQuestion is true only on the final question', () => {
    assert.equal(isLastQuestion(run(start), questions), false);
    const lastActions = answerAll(correct).slice(0, -2); // stop before the last answer
    assert.equal(isLastQuestion(run(...lastActions), questions), true);
  });

  it('getScore counts all correct, all wrong and mixed runs', () => {
    assert.equal(getScore(run(...answerAll(correct)), questions), questions.length);
    assert.equal(getScore(run(...answerAll(wrong)), questions), 0);

    const mixed = run(...answerAll((q) => (Number(q.id.slice(1)) % 2 ? correct(q) : wrong(q))));
    assert.equal(getScore(mixed, questions), Math.ceil(questions.length / 2));
  });

  it('getReview has one row per answer and agrees with the score', () => {
    const state = run(...answerAll(wrong));
    const review = getReview(state, questions);
    assert.equal(review.length, questions.length);
    assert.equal(review.filter((r) => r.isCorrect).length, getScore(state, questions));
    assert.deepEqual(Object.keys(review[0]).sort(), [
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
  const valid = { id: 'a', prompt: 'Pick one', options: ['x', 'y'], answerIndex: 0 };

  it('accepts the real quiz data', () => {
    assert.doesNotThrow(() => validateQuestions(questions));
  });

  it('rejects an empty list', () => {
    assert.throws(() => validateQuestions([]), /non-empty array/);
  });

  it('rejects duplicate ids', () => {
    assert.throws(() => validateQuestions([valid, { ...valid }]), /duplicate id "a"/);
  });

  it('rejects fewer than 2 options without crashing', () => {
    assert.throws(() => validateQuestions([{ ...valid, options: ['x'] }]), /at least 2/);
    assert.throws(() => validateQuestions([{ id: 'b', prompt: 'p' }]), /at least 2/);
  });

  it('rejects an out-of-range or non-integer answerIndex', () => {
    for (const answerIndex of [2, -1, 1.5]) {
      assert.throws(() => validateQuestions([{ ...valid, answerIndex }]), /answerIndex/);
    }
  });

  it('reports every problem in one error', () => {
    const bad = [
      { ...valid, prompt: '' },
      { ...valid, answerIndex: 9 },
    ];
    assert.throws(
      () => validateQuestions(bad),
      (error) => /prompt/.test(error.message) && /answerIndex/.test(error.message),
    );
  });
});
