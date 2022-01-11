/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  useLayoutEffect,
} from 'react';

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

interface IScoutKeyOptions {
  override?: boolean;
  universal?: boolean;
}

interface IKeyMapping {
  [key: string]: boolean;
}

const disabledEventPropagation = (e: KeyboardEvent) => {
  if (e) {
    if (e.preventDefault) e.preventDefault();
    if (e.stopPropagation) {
      e.stopPropagation();
    } else if (window.event) {
      window.event.cancelBubble = true;
    }
  }
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

  const { override, universal } = options || {};
  const callbackRef = useRef(callback);

  const keyMapping = useMemo(
    () =>
      targetKeys.reduce((currentKeys: IKeyMapping, key) => {
        currentKeys[key.toLowerCase()] = false;
        return currentKeys;
      }, {}),
    [targetKeys]
  );

  const [keyMaps, setKeyMaps] = useState<IKeyMapping>(keyMapping);

  const keyHandlers = Boolean(
    Object.values(keyMaps).filter(value => !value).length
  );

  const downHandler = useCallback(
    (currentKey: string) =>
      (event: KeyboardEvent): void | boolean => {
        const key: string = currentKey.toLowerCase();

        // /** Check If the key is already pressed, do nothing */
        if (event.repeat) return;

        /** Check if the key is in the list of keys to listen for, do nothing
         * refer: https://github.com/adenekan41/scoutbar/blob/faf2df3a6dbbfdcd54bd003c1cd011b0187f3117/src/utils/index.ts#L1
         */
        if (!universal && ignoreStrokes((event.target as HTMLElement).tagName))
          return;

        if (key !== event.key.toLowerCase()) return;
        if (keyMaps[key] === undefined) return;

        if (override) {
          disabledEventPropagation(event);
        }

        setKeyMaps(prev => ({ ...prev, [key]: true }));
      },
    [keyMaps, override, universal]
  );

  const upHandler = useCallback(
    (currentKey: string) =>
      (event: KeyboardEvent): void | boolean => {
        const key: string = currentKey.toLowerCase();

        /** Check If the key is already pressed, do nothing */
        if (event.repeat) return;

        /** Check if the key is in the list of keys to listen for, do nothing
         * @see: https://github.com/adenekan41/scoutbar/blob/faf2df3a6dbbfdcd54bd003c1cd011b0187f3117/src/utils/index.ts#L1
         */
        if (!universal && ignoreStrokes((event.target as HTMLElement).tagName))
          return;

        if (key !== event.key.toLowerCase()) return;
        if (keyMaps[key] === undefined) return;

        if (override) {
          disabledEventPropagation(event);
        }

        setKeyMaps(prev => ({ ...prev, [key]: false }));
      },
    [keyMaps, override, universal]
  );

  useLayoutEffect(() => {
    /** We don want tpo have the callback argument of the hook in the useEffect dependency array.
     * We can't guarantee that the hook user wrapped this function in a useCallback so we don't
     * want it to trigger the useEffect unnecessarily
     * @see: https://epicreact.dev/the-latest-ref-pattern-in-react/
     */

    callbackRef.current = callback;
    if (!keyHandlers) {
      callbackRef.current(keyMaps);
      setKeyMaps(keyMapping);
    }
  }, [keyMaps, keyHandlers]);

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
  }, []);
};

export default useScoutShortcut;
