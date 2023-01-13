import {
  Dispatch,
  SetStateAction,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
} from 'react';
import useScoutKey from 'use-scout-key';

type Cell = HTMLAnchorElement | HTMLButtonElement;

const useKeybaordNavigation = (
  ref: React.MutableRefObject<HTMLDivElement | null>
): [number, Dispatch<SetStateAction<Cell | null | undefined>>, Cell[]] => {
  const [cursor, setCursor] = useState<number>(-1);
  const [hovered, setHovered] = useState<Cell | undefined | null>(undefined);

  /**
   * Scout Key Stroke Handlers
   */
  const downPress = useScoutKey('ArrowDown', true);
  const upPress = useScoutKey('ArrowUp', true);
  const enterPress = useScoutKey('Enter', true);
  const tabPress = useScoutKey('Tab', true);
  const backscapePress = useScoutKey('Backspace', true);
  /* ------------------------------------ = ----------------------------------- */

  /**
   * Check if we are on mobile device and disable fetching all cells
   */
  const isMobile = window?.matchMedia(
    'only screen and (max-width: 768px)'
  )?.matches;

  /**
   * Check if we are on mobile device and
   * disable fetching all
   */
  const allCellElements: Cell[] | null = Array.from(
    ref.current && !isMobile
      ? ref.current.querySelectorAll('.scoutbar-cell-item')
      : []
  );

  const elementActive = useMemo(() => allCellElements[cursor], [cursor]);

  useLayoutEffect(() => {
    // Get original body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;

    if (upPress || downPress || isMobile) {
      // Prevent scrolling on mount or deps check
      document.body.style.overflow = 'hidden';
    }

    return () => {
      // Re-enable scrolling when component unmounts
      if (originalStyle) {
        document.body.style.overflow = originalStyle;
      }
    };
  }, []);

  useEffect(() => {
    if (elementActive) {
      /**
       * Allow elements scroll into view on keydown
       */
      elementActive?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });

      allCellElements.forEach(
        (element, index) =>
          allCellElements[index] === elementActive &&
          element.setAttribute('data-scoutbar-active', 'true')
      );
    }
  }, [elementActive]);

  useEffect(() => {
    const elementsLength = allCellElements?.length - 1;

    if (allCellElements?.length) {
      if (downPress) {
        setCursor(prevState => {
          if (prevState >= elementsLength) return 0;
          return prevState + 1;
        });
      }

      if (upPress) {
        setCursor(prevState => {
          if (prevState <= 0) return elementsLength;
          return prevState - 1;
        });
      }
    }
  }, [downPress, upPress]);

  useEffect(() => {
    if (elementActive && enterPress) {
      /**
       * Add a focus and click event to the element thats currently active
       * so that we can trigger the click event on just the current element and
       * ignore any element that is currently focused
       */
      elementActive?.click();
    }
  }, [enterPress, elementActive]);

  useEffect(() => {
    if (allCellElements.length && hovered) {
      setCursor(allCellElements.indexOf(hovered));
    }
  }, [hovered]);

  const removeEvent = useCallback(() => {
    allCellElements.forEach(element =>
      element.removeAttribute('data-scoutbar-active')
    );
  }, [allCellElements]);

  useEffect(() => {
    /**
     * Element cursor reset
     */
    ref?.current?.addEventListener('mousemove', removeEvent);
    return () => {
      ref?.current?.removeEventListener('mousemove', removeEvent);
    };
  }, [cursor]);

  useEffect(() => {
    /**
     * Reset the cursor when there's an update on the section
     * or when user wants to navigate with the tab key or backspace key
     */
    if (tabPress || backscapePress || enterPress) {
      setCursor(-1);
    }
  }, [tabPress, backscapePress, enterPress]);

  return [cursor, setHovered, allCellElements];
};

export default useKeybaordNavigation;
