import { useEffect, useRef } from 'react';

/**
 * Focuses the referenced element when the component mounts.
 * Used on each new screen's heading (or question legend), so keyboard and
 * screen-reader users land on the new content instead of a removed button.
 * The element needs tabIndex={-1} to be focusable.
 */
export function useFocusOnMount<T extends HTMLElement>(enabled = true) {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (enabled) ref.current?.focus();
  }, [enabled]);

  return ref;
}
