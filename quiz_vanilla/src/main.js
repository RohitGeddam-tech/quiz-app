// @ts-check
import questions from './questions.js';
import { createStore } from './store.js';
import {
  announce,
  focusScreen,
  getAnnouncement,
  renderApp,
  showToast,
  updateSelection,
} from './view.js';
import {
  ActionTypes,
  createInitialState,
  getActionError,
  quizReducer,
  validateQuestions,
} from './engine/index.js';

/** @typedef {import('./engine/types.js').QuizState} QuizState */
/** @typedef {import('./engine/types.js').Action} Action */

validateQuestions(questions); // fail loudly on bad data before anything renders

const root = /** @type {HTMLElement} */ (document.getElementById('app'));

/** @type {import('./store.js').Store<QuizState, Action>} */
const store = createStore(
  (state, action) => quizReducer(state, action, questions),
  createInitialState(),
);

/**
 * Dispatches an action, or shows why it can't be applied right now.
 * @param {Action} action
 */
function dispatch(action) {
  const error = getActionError(store.getState(), action, questions);
  if (error) {
    showToast(error);
    return;
  }
  store.dispatch(action);
}

/**
 * Which screen is on the page: the status, plus the question index while playing.
 * Same idea as a React `key`: a new key means a new screen, the same key means update in place.
 * @param {QuizState} state
 * @returns {string}
 */
const screenKey = (state) => `${state.status}:${state.index}`;

/** @type {string | null} */
let renderedKey = null;

/**
 * Draws the state. A new screen is rendered, focused and announced; a selection
 * change on the same question only updates the Next button, so focus stays on the radio.
 * @param {QuizState} state
 * @param {{ initial?: boolean }} [options]
 */
function render(state, { initial = false } = {}) {
  const key = screenKey(state);
  if (key === renderedKey) {
    updateSelection(root, state);
    return;
  }
  renderedKey = key;
  renderApp(root, state, questions);
  if (initial) return; // don't steal focus or announce on page load
  focusScreen(root);
  announce(getAnnouncement(state, questions));
}

/** Maps a button's data-action to the action it dispatches. */
const buttonActions = /** @type {const} */ ({
  start: ActionTypes.START,
  restart: ActionTypes.RESTART,
});

// One delegated listener per event type on the root: the screens are re-created,
// so listeners on individual buttons would have to be re-attached on every render.
root.addEventListener('click', (event) => {
  const target = /** @type {HTMLElement} */ (event.target);
  const button = target.closest('button[data-action]');
  if (!(button instanceof HTMLButtonElement)) return;
  const type = buttonActions[/** @type {keyof typeof buttonActions} */ (button.dataset.action)];
  if (type) dispatch({ type });
});

root.addEventListener('change', (event) => {
  const target = event.target;
  if (target instanceof HTMLInputElement && target.name === 'option') {
    dispatch({ type: ActionTypes.SELECT, option: Number(target.value) });
  }
});

root.addEventListener('submit', (event) => {
  event.preventDefault(); // stay on the page; the store decides what happens next
  dispatch({ type: ActionTypes.NEXT });
});

store.subscribe((state) => render(state));
render(store.getState(), { initial: true });
