import { useState, useEffect, useCallback, useMemo } from 'react';
import { ignoreStrokes, isBrowser } from './utils';

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

interface IScoutKeyOptions {
  override?: boolean;
}

interface IKeyMapping {
  [key: string]: boolean;
}
const disabledEventPropagation = (e: Event) => {
  if (!e) return;

  if (e.stopPropagation) e.stopPropagation();
  if (window.event) window.event.cancelBubble = true;
};

const useScoutShortcut = (
  targetKeys: Array<string>,
  callback: Function,
  options?: IScoutKeyOptions
) => {
  if (targetKeys.length === 0 || !Array.isArray(targetKeys))
    throw new Error(
      '⌨️ ScoutKey: the first Parameter must either be a `KeyboardEvent.key` or an Array of `KeyboardEvent.key`'
    );

  const { override } = options || {};

  const keyMapping = () =>
    targetKeys.reduce((currentKeys: IKeyMapping, key) => {
      currentKeys[key.toLowerCase()] = false;
      return currentKeys;
    }, {});

  const [keyMaps, setKeyMaps] = useState<IKeyMapping>(keyMapping);

  const keyHandlers = Boolean(
    Object.values(keyMaps).filter(value => !value).length
  );

  const downHandler = useCallback(
    (currentKey: string) =>
      (event: KeyboardEvent): void => {
        const key: string = currentKey.toLowerCase();

        /** Check If the key is already pressed, do nothing */
        if (event.repeat) return;

        /** Check if the key is in the list of keys to listen for, do nothing */
        if (key !== event.key.toLowerCase()) return;
        if (ignoreStrokes((event.target as HTMLElement).tagName)) return;

        if (override) {
          event.preventDefault();
          disabledEventPropagation(event);
          return;
        }

        setKeyMaps(prev => ({ ...prev, [key]: true }));
      },
    [override]
  );

  const upHandler = useCallback(
    (currentKey: string) =>
      (event: KeyboardEvent): void => {
        const key: string = currentKey.toLowerCase();

        /** Check If the key is already pressed, do nothing */
        if (event.repeat) return;

        /** Check if the key is in the list of keys to listen for, do nothing */
        if (key !== event.key.toLowerCase()) return;
        if (ignoreStrokes((event.target as HTMLElement).tagName)) return;

        if (override) {
          event.preventDefault();
          disabledEventPropagation(event);
          return;
        }

        setKeyMaps(prev => ({ ...prev, [key]: false }));
      },
    [override]
  );

  useEffect(() => {
    if (!keyHandlers) {
      callback(keyMaps);
      setKeyMaps(keyMapping);
    }
  }, [callback, keyMaps, keyHandlers, keyMapping]);

  useEffect(() => {
    targetKeys.forEach(key => {
      window.addEventListener('keydown', downHandler(key));
      window.addEventListener('keyup', upHandler(key));
    });

    return () =>
      targetKeys.forEach(key => {
        window.removeEventListener('keydown', downHandler(key));
        window.removeEventListener('keyup', upHandler(key));
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
};

export default useScoutShortcut;
