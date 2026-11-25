// @ts-check
import {
  Status,
  getCurrentQuestion,
  getProgress,
  getReview,
  getScore,
  isLastQuestion,
} from './engine/index.js';

/** @typedef {import('./engine/types.js').Question} Question */
/** @typedef {import('./engine/types.js').QuizState} QuizState */

/**
 * The view turns state into DOM. It reads no events and holds no state:
 * buttons only carry a data-action, and main.js decides what each one dispatches.
 */

/**
 * Small createElement helper. Sets attributes and text, never innerHTML,
 * so question text can't inject markup.
 * - `true` adds a boolean attribute (disabled, checked), `false`/null/undefined skips it.
 * - Children can be elements or strings; null/false children are skipped.
 * @template {keyof HTMLElementTagNameMap} K
 * @param {K} tag
 * @param {Record<string, string | number | boolean | null | undefined>} [attrs]
 * @param {...(Node | string | null | false)} children
 * @returns {HTMLElementTagNameMap[K]}
 */
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [name, value] of Object.entries(attrs)) {
    if (value === false || value === null || value === undefined) continue;
    node.setAttribute(name, value === true ? '' : String(value));
  }
  for (const child of children) {
    if (child === null || child === false) continue;
    node.append(child);
  }
  return node;
}

/**
 * Start screen: title, question count and the Start button.
 * @param {ReadonlyArray<Question>} questions
 * @returns {HTMLElement}
 */
function renderStart(questions) {
  return el(
    'section',
    { class: 'card', 'aria-labelledby': 'start-title' },
    el('h1', { id: 'start-title', tabindex: -1, 'data-autofocus': true }, 'JavaScript Quiz'),
    el(
      'p',
      { class: 'muted' },
      `${questions.length} questions, one correct answer each. Pick an answer and press Next.`,
    ),
    el('button', { type: 'button', class: 'btn', 'data-action': 'start' }, 'Start quiz'),
  );
}

/**
 * "Question 2 of 8" plus a native progress bar.
 * @param {{ current: number, total: number }} progress
 * @returns {HTMLElement}
 */
function renderProgress({ current, total }) {
  return el(
    'div',
    { class: 'progress' },
    el('p', { id: 'progress-label', class: 'muted' }, `Question ${current} of ${total}`),
    el('progress', { max: total, value: current, 'aria-labelledby': 'progress-label' }),
  );
}

/**
 * Question screen. A real <form> so Enter submits natively; the radio group
 * lives in a fieldset whose legend is the question, which is what screen readers announce.
 * @param {QuizState} state
 * @param {ReadonlyArray<Question>} questions
 * @returns {HTMLElement}
 */
function renderQuestion(state, questions) {
  const question = /** @type {Question} */ (getCurrentQuestion(state, questions));
  const isLast = isLastQuestion(state, questions);

  const options = question.options.map((text, i) => {
    const id = `${question.id}-option-${i}`;
    return el(
      'label',
      { class: 'option', for: id },
      el('input', {
        type: 'radio',
        name: 'option',
        id,
        value: i,
        checked: state.selected === i,
      }),
      el('span', {}, text),
    );
  });

  return el(
    'form',
    { class: 'card', 'data-question-id': question.id },
    renderProgress(getProgress(state, questions)),
    el(
      'fieldset',
      {},
      el('legend', { class: 'question', tabindex: -1, 'data-autofocus': true }, question.prompt),
      el('div', { class: 'options' }, ...options),
    ),
    el(
      'div',
      { class: 'actions' },
      el(
        'button',
        { type: 'submit', class: 'btn', disabled: state.selected === null },
        isLast ? 'Finish' : 'Next',
      ),
    ),
  );
}

/**
 * Result screen: score, an answer review and Restart.
 * Right/wrong is shown with a symbol and words, not colour alone.
 * @param {QuizState} state
 * @param {ReadonlyArray<Question>} questions
 * @returns {HTMLElement}
 */
function renderResult(state, questions) {
  const score = getScore(state, questions);
  const total = questions.length;

  const items = getReview(state, questions).map((item) =>
    el(
      'li',
      { class: `review-item ${item.isCorrect ? 'is-correct' : 'is-incorrect'}` },
      el('p', { class: 'review-prompt' }, item.prompt),
      el(
        'p',
        {},
        el('span', { class: 'mark', 'aria-hidden': 'true' }, item.isCorrect ? '✓' : '✗'),
        ` Your answer: ${item.options[item.chosenIndex]} `,
        el('span', { class: 'visually-hidden' }, item.isCorrect ? '(correct)' : '(incorrect)'),
      ),
      !item.isCorrect &&
        el('p', { class: 'muted' }, `Correct answer: ${item.options[item.correctIndex]}`),
    ),
  );

  return el(
    'section',
    { class: 'card', 'aria-labelledby': 'result-title' },
    el(
      'h1',
      { id: 'result-title', tabindex: -1, 'data-autofocus': true },
      `You scored ${score} out of ${total}`,
    ),
    el('h2', { class: 'subheading' }, 'Review'),
    el('ol', { class: 'review' }, ...items),
    el('button', { type: 'button', class: 'btn', 'data-action': 'restart' }, 'Restart quiz'),
  );
}

/**
 * Renders the screen for the current status into the root, replacing what was there.
 * @param {HTMLElement} root
 * @param {QuizState} state
 * @param {ReadonlyArray<Question>} questions
 * @returns {void}
 */
export function renderApp(root, state, questions) {
  switch (state.status) {
    case Status.IDLE:
      root.replaceChildren(renderStart(questions));
      break;
    case Status.PLAYING:
      root.replaceChildren(renderQuestion(state, questions));
      break;
    case Status.FINISHED:
      root.replaceChildren(renderResult(state, questions));
      break;
  }
}

/**
 * Updates the open question in place when only the selection changed.
 * Re-rendering would destroy the focused radio and break arrow-key navigation,
 * so this just syncs the Next button.
 * @param {HTMLElement} root
 * @param {QuizState} state
 * @returns {void}
 */
export function updateSelection(root, state) {
  const submit = root.querySelector('button[type="submit"]');
  if (submit instanceof HTMLButtonElement) submit.disabled = state.selected === null;
}

/**
 * Moves focus to the new screen's heading (or question legend), so keyboard and
 * screen-reader users land on the new content instead of a removed button.
 * @param {HTMLElement} root
 * @returns {void}
 */
export function focusScreen(root) {
  const target = root.querySelector('[data-autofocus]');
  if (target instanceof HTMLElement) target.focus();
}

/**
 * The message the live region should read for a state.
 * @param {QuizState} state
 * @param {ReadonlyArray<Question>} questions
 * @returns {string}
 */
export function getAnnouncement(state, questions) {
  if (state.status === Status.PLAYING) {
    const { current, total } = getProgress(state, questions);
    return `Question ${current} of ${total}`;
  }
  if (state.status === Status.FINISHED) {
    return `Quiz finished. You scored ${getScore(state, questions)} out of ${questions.length}.`;
  }
  return '';
}

/**
 * Writes a message into the polite live region from index.html.
 * @param {string} message
 * @returns {void}
 */
export function announce(message) {
  const announcer = document.getElementById('announcer');
  if (announcer) announcer.textContent = message;
}

/**
 * Shows a short, non-blocking message. Replaces any toast already on screen.
 * @param {string} message
 * @param {number} [duration=3000]
 * @returns {void}
 */
export function showToast(message, duration = 3000) {
  document.querySelector('.toast')?.remove(); // avoid stacked toasts on repeated clicks

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.setAttribute('role', 'status'); // polite: doesn't interrupt the screen reader like role="alert"
  toast.textContent = message;
  document.body.append(toast);

  setTimeout(() => toast.remove(), duration);
}
