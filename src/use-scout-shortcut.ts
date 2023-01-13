/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import useIsMounted from 'helpers/use-is-mounted';
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
 * This is a custom hook that can be used to detect an array keys pressed.
 *
 * @param targeKey - The key to check for
 * @param callback - The callback to call when the key is pressed
 * @param options - Options for the key
 *
 * @returns True if the key is pressed
 */

const ROOT_KEY_MAPS = ['meta', 'k', 'control'];

interface IScoutKeyOptions {
  override?: boolean;
  universal?: boolean;
}

interface IKeyMapping {
  [key: string]: boolean;
}

const disabledEventPropagation = (e: KeyboardEvent) => {
  if (e.stopPropagation) {
    e.stopPropagation();
  } else if (window.event) {
    window.event.cancelBubble = true;
  }
};

const useScoutShortcut = (
  targetKeys: Array<string>,
  callback: (key: any) => void,
  options?: IScoutKeyOptions
) => {
  if (!Array.isArray(targetKeys))
    throw new Error(
      '⌨️ ScoutShortcut: The first parameter to `useScoutShortcut` must be an ordered array of `KeyboardEvent.key` strings.'
    );

  if (!targetKeys.length)
    throw new Error(
      '⌨️ ScoutShortcut: The first parameter to `useScoutShortcut` must contain atleast one `KeyboardEvent.key` string.'
    );

  if (!callback || typeof callback !== 'function')
    throw new Error(
      '⌨️ ScoutShortcut: The second parameter to `useScoutShortcut` must be a function that will be envoked when the keys are pressed.'
    );

  const isMounted = useIsMounted();
  const { override = false, universal = false } = options || {};
  const callbackRef = useRef<(key: IKeyMapping) => void>(callback);

  const keyMapping = useMemo(
    () =>
      [...new Set(targetKeys)].reduce((currentKeys: IKeyMapping, key) => {
        currentKeys[key.toLowerCase()] = false;
        return currentKeys;
      }, {}),
    []
  );

  const [keyMaps, setKeyMaps] = useState<IKeyMapping>(keyMapping);

  const keyHandlers = useMemo(
    () => Boolean(Object.values(keyMaps).filter(value => !value).length),
    [keyMaps]
  );

  const handler = useCallback(
    (event: KeyboardEvent, key: string, position) => {
      const overrideKeyForOption =
        !ROOT_KEY_MAPS.includes(event.key.toLowerCase()) &&
        ignoreStrokes((event.target as HTMLElement).tagName);
      /** Check If the key is already pressed, do nothing */
      if (event.repeat) return;

      /** Check if the key is in the list of keys to listen for, do nothing
       * @see: https://github.com/adenekan41/scoutbar/blob/faf2df3a6dbbfdcd54bd003c1cd011b0187f3117/src/utils/index.ts#L1
       */

      if (key !== event.key.toLowerCase()) return;

      /** check if key pressed should be ignored */
      if (keyMaps[key] === undefined) return;

      if (!universal && overrideKeyForOption) return;

      if (override) {
        disabledEventPropagation(event);
      }

      setKeyMaps(prev => ({
        ...prev,
        [key]: position === 'down' ? true : false,
      }));

      return;
    },
    [keyMaps, override, universal]
  );

  const downHandler = useCallback(
    (currentKey: string) =>
      (event: KeyboardEvent): void | boolean => {
        const key: string = currentKey.toLowerCase();

        handler(event, key, 'down');
      },
    [handler]
  );

  const upHandler = useCallback(
    (currentKey: string) =>
      (event: KeyboardEvent): void | boolean => {
        const key: string = currentKey.toLowerCase();

        handler(event, key, 'up');
      },
    [handler]
  );

  useEffect(() => {
    /** We don want tpo have the callback argument of the hook in the useEffect dependency array.
     * We can't guarantee that the hook user wrapped this function in a useCallback so we don't
     * want it to trigger the useEffect unnecessarily
     * @see: https://epicreact.dev/the-latest-ref-pattern-in-react/
     */

    callbackRef.current = callback;

    if (
      !keyHandlers &&
      typeof callbackRef.current === 'function' &&
      isMounted()
    ) {
      callbackRef?.current(keyMaps);
      setKeyMaps(keyMapping);
    }

    return () => {
      if (!isMounted()) {
        setKeyMaps(keyMapping);
      }
    };
  }, [keyMaps, keyHandlers, isMounted, keyMapping]);

  useEffect(() => {
    targetKeys.forEach(k => window.addEventListener('keydown', downHandler(k)));
    return () =>
      targetKeys.forEach(k =>
        window.removeEventListener('keydown', downHandler(k))
      );
  }, []);

  useEffect(() => {
    targetKeys.forEach(k => window.addEventListener('keyup', upHandler(k)));
    return () =>
      targetKeys.forEach(k =>
        window.removeEventListener('keyup', upHandler(k))
      );
  }, []);
};

export default useScoutShortcut;
