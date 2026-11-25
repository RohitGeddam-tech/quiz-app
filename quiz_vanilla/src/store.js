// @ts-check
/**
 * A minimal store: the same idea as React's useReducer, written by hand.
 * State only changes through dispatch(action) -> reducer -> notify subscribers.
 */

/**
 * @template S, A
 * @typedef {Object} Store
 * @property {() => S} getState                 Current state.
 * @property {(action: A) => void} dispatch      Runs the reducer and notifies subscribers if the state changed.
 * @property {(listener: (state: S) => void) => () => void} subscribe  Returns an unsubscribe function.
 */

/**
 * @template S, A
 * @param {(state: S, action: A) => S} reducer  Pure function: (state, action) -> next state.
 * @param {S} initialState
 * @returns {Store<S, A>}
 */
export function createStore(reducer, initialState) {
  let state = initialState;
  /** @type {Set<(state: S) => void>} */
  const listeners = new Set();

  return {
    getState: () => state,
    dispatch(action) {
      const next = reducer(state, action);
      if (next === state) return; // rejected or no-op action: nothing to re-render
      state = next;
      listeners.forEach((listener) => listener(state));
    },
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
}
