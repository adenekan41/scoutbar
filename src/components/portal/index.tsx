import {
  PropsWithChildren,
  useEffect,
  useRef,
  useCallback,
  useState,
} from 'react';
import { createPortal } from 'react-dom';
import { SCOUTBAR_ROOT_ID } from 'utils/constants';

export interface IPortal {
  /**
   * The selector to use for the portal
   * @default 'scoutbar___root'
   */
  selector?: string;
}

const Portal: React.FC<PropsWithChildren<IPortal>> = ({
  selector = SCOUTBAR_ROOT_ID,
  children,
}) => {
  const portalRef = useRef<Element | null>(null);

  const [mounted, setMounted] = useState(false);
  /**
   * Remove the hash prefix from the selector and add it again
   * to the query selector to avoid double hash
   */
  const prefixedSelector = `#${selector?.replace(/^#/, '')}`;

  const createElement = useCallback(() => {
    const div = document.createElement('div');

    div.setAttribute('id', selector);

    // Append the div to the body
    document.body.appendChild(div) as Element;

    return div;
  }, []);

  useEffect(() => {
    // Check if the selector exists in the DOM
    portalRef.current = document.querySelector(prefixedSelector);

    if (!portalRef.current) {
      // Create the div element
      const div = createElement();
      // Set the ref to the newly created div
      portalRef.current = div;
    }
    setMounted(true);
  }, [selector]);

  return mounted ? createPortal(children, portalRef.current as Element) : null;
};

export default Portal;
