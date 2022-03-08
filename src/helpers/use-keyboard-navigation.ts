import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useLayoutEffect,
  useState,
} from 'react';
import useScoutKey from 'use-scout-key';
import { isEmpty } from 'utils';
import ScoutBarContext from 'helpers/context';

type Cell = HTMLAnchorElement | HTMLButtonElement;

const useKeybaordNavigation = (
  ref: React.MutableRefObject<HTMLDivElement | null>
): [number, Dispatch<SetStateAction<Cell | null | undefined>>, Cell[]] => {
  const [cursor, setCursor] = useState<number>(-1);
  const [hovered, setHovered] = useState<Cell | undefined | null>(undefined);

  const { currentSection } = useContext(ScoutBarContext);
  /**
   * Scout Key Stroke Handlers
   */
  const downPress = useScoutKey('ArrowDown', true);
  const upPress = useScoutKey('ArrowUp', true);
  const enterPress = useScoutKey('Enter', true);
  const tabPressed = useScoutKey('Tab', true);
  /* ------------------------------------ = ----------------------------------- */

  const isMobile = window?.matchMedia(
    'only screen and (max-width: 768px)'
  )?.matches;
  /**
   * Check if we are on mobile device and
   * disable fetching all
   */
  const allCellElements: Cell[] | null = Array.from(
    !isEmpty(ref?.current) && !isMobile
      ? (ref?.current as HTMLDivElement)?.querySelectorAll(
          '.scoutbar-cell-item'
        )
      : []
  );
  const elementActive = allCellElements[cursor];

  useLayoutEffect(() => {
    // Get original body overflow
    const originalStyle = window.getComputedStyle(document.body).overflow;
    if (upPress || downPress || isMobile) {
      // Prevent scrolling on mount or deps check
      document.body.style.overflow = 'hidden';
    }
    return () => {
      // Re-enable scrolling when component unmounts
      document.body.style.overflow = originalStyle;
    };
  }, [upPress, downPress, isMobile]);

  useEffect(() => {
    if (elementActive && (upPress || downPress)) {
      /**
       * Allow elements scroll into view on keydown
       */
      elementActive?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
    }
    /**
     * To be able to achieve a proper hover to arrow experience we need to
     * disable pointer events on these elements with a class.
     * NB: we are doing this to make sure that when we traverse the elements you dont see double hovered elements.
     */
    allCellElements.forEach(
      (element, index) =>
        index !== cursor && element.classList.add('no-pointer-events')
    );
  }, [upPress, downPress, cursor]);

  useEffect(() => {
    if (allCellElements?.length && downPress) {
      setCursor(prevState => {
        if (prevState + 1 === allCellElements.length) return 0;
        return prevState + 1;
      });
    }
  }, [downPress]);

  useEffect(() => {
    if (allCellElements?.length && upPress) {
      setCursor(prevState => {
        if (prevState <= 0) return allCellElements.length - 1;
        return prevState - 1;
      });
    }
  }, [upPress]);

  useEffect(() => {
    if (elementActive && enterPress) {
      /**
       * Add a focus and click event to the element thats currently active
       * so that we can trigger the click event on just the current element and
       * ignore any element that is currently focused
       */

      elementActive?.click();
    }
  }, [enterPress]);

  useEffect(() => {
    if (allCellElements.length && hovered) {
      setCursor(allCellElements.indexOf(hovered));
    }
  }, [hovered]);

  useEffect(() => {
    const removeEvent = () => {
      allCellElements.forEach(element =>
        element.classList.remove('no-pointer-events')
      );
    };

    ref?.current?.addEventListener('mousemove', removeEvent);
    return () => {
      ref?.current?.removeEventListener('mousemove', removeEvent);
    };
  }, [cursor]);

  useEffect(() => {
    /**
     * Reset the cursor when there's an update on the section
     * or when user wants to navigate with the tab key
     */

    setCursor(-1);
  }, [currentSection, tabPressed]);

  return [cursor, setHovered, allCellElements];
};

export default useKeybaordNavigation;
