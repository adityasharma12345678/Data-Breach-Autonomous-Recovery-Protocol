/**
 * useKeys – Tracks currently pressed keyboard keys.
 *
 * Returns a ref object whose keys are KeyboardEvent.code strings.
 * Using a ref (not state) avoids re-renders on every keypress.
 */

import { useEffect, useRef } from 'react';

export function useKeys() {
  const keys = useRef({});

  useEffect(() => {
    const onDown = (e) => { keys.current[e.code] = true; };
    const onUp   = (e) => { keys.current[e.code] = false; };
    const clear = () => { keys.current = {}; };

    window.addEventListener('keydown', onDown);
    window.addEventListener('keyup',   onUp);
    window.addEventListener('blur', clear);

    return () => {
      window.removeEventListener('keydown', onDown);
      window.removeEventListener('keyup',   onUp);
      window.removeEventListener('blur', clear);
    };
  }, []);

  return keys;
}
