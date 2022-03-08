/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import { MutableRefObject, useEffect } from 'react';

type AnyEvent = MouseEvent | TouchEvent;

const useOnClickOutside = <T>(
  ref: MutableRefObject<T> | null,
  handler: (event: AnyEvent) => void
): void => {
  useEffect(() => {
    const listener = (event: AnyEvent) => {
      const el: any = ref?.current;

      // Do nothing if clicking ref's element or descendent elements
      if (!el || el?.contains(event.target as Node)) {
        return;
      }

      handler(event);
    };

    document.addEventListener(`mousedown`, listener);
    document.addEventListener(`touchstart`, listener);

    return () => {
      document.removeEventListener(`mousedown`, listener);
      document.removeEventListener(`touchstart`, listener);
    };

    // Reload only if ref or handler changes
  }, [ref, handler]);
};

export default useOnClickOutside;
