/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import { useState, useEffect, useCallback } from 'react';

/* -------------------------- Internal Dependencies ------------------------- */
import { ignoreStrokes } from 'utils';

/**
 * Returns true if the key is pressed
 *
 * @remarks
 * This is a custom hook that can be used to detect a key press.
 *
 * @param targeKey - The key to check for
 * @param callback - The callback to call when the key is pressed
 * @param options - Options for the key
 *
 * @returns True if the key is pressed
 */

const useScoutKey = (targetKey: string, override = false): boolean => {
  if (!targetKey)
    throw new Error(
      '⌨️ ScoutKey: the first Parameter must be a `KeyboardEvent.key`'
    );

  // State for keeping track of whether key is pressed
  const [keyPressed, setKeyPressed] = useState(false);

  // If pressed key is our target key then set to true

  const downHandler = useCallback(
    ({ key, target }: KeyboardEvent): void => {
      if (ignoreStrokes((target as HTMLElement).tagName) && !override) return;
      if (key === targetKey) {
        setKeyPressed(true);
      }
    },
    [targetKey]
  );

  // If released key is our target key then set to false
  const upHandler = useCallback(
    ({ key, target }: KeyboardEvent): void => {
      if (ignoreStrokes((target as HTMLElement).tagName) && !override) return;

      if (key === targetKey) {
        setKeyPressed(false);
      }
    },
    [targetKey]
  );

  // Add event listeners
  useEffect(() => {
    window.addEventListener('keydown', downHandler);
    window.addEventListener('keyup', upHandler);
    // Remove event listeners on cleanup
    return () => {
      window.removeEventListener('keydown', downHandler);
      window.removeEventListener('keyup', upHandler);
    };
  }, [downHandler, upHandler]); // Empty array ensures that effect is only run on mount and unmount

  return keyPressed;
};

export default useScoutKey;
