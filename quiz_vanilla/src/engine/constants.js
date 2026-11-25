// @ts-check

/**
 * All action types the reducer understands.
 * Frozen so they can't be changed at runtime. Use ActionTypes.NEXT instead of typing 'NEXT',
 * so a typo becomes an error instead of an action that silently does nothing.
 */
export const ActionTypes = Object.freeze({
  START: 'START',
  SELECT: 'SELECT',
  NEXT: 'NEXT',
  RESTART: 'RESTART',
});

/** Quiz lifecycle states. */
export const Status = Object.freeze({
  IDLE: 'idle',
  PLAYING: 'playing',
  FINISHED: 'finished',
});
