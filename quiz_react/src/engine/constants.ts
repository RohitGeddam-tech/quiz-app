/**
 * All action types the reducer understands.
 * `as const` keeps each value as its literal type ('NEXT', not string),
 * so a typo becomes a compile error instead of an action that silently does nothing.
 */
export const ActionTypes = {
  START: 'START',
  SELECT: 'SELECT',
  NEXT: 'NEXT',
  RESTART: 'RESTART',
} as const;

/** Quiz lifecycle states. */
export const Status = {
  IDLE: 'idle',
  PLAYING: 'playing',
  FINISHED: 'finished',
} as const;
