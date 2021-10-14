import { useEffect } from 'react';

const useTrapFocus = ({
  elementState,
  bodyScroll = true,
  focusAbleElement,
  disableFocusTrap = false,
}: {
  elementState: boolean;
  bodyScroll?: boolean;
  focusAbleElement?: string;
  disableFocusTrap?: boolean;
}): any => {
  useEffect(() => {
    const OUTER_SCOUTBAR_EL = focusAbleElement;
    /**
     * All focusable elements to consider for the focusable interaction
     */
    const focusableElements = [
      `${OUTER_SCOUTBAR_EL} a`,
      `${OUTER_SCOUTBAR_EL} button`,
      `${OUTER_SCOUTBAR_EL} input`,
      `${OUTER_SCOUTBAR_EL} select`,
      `${OUTER_SCOUTBAR_EL} textarea`,
      `${OUTER_SCOUTBAR_EL} area`,
    ];

    /**
     * query selector all `focusableElements`
     */
    const outerLayerElements = document.querySelectorAll(
      focusableElements.join(', ')
    );

    if (elementState && !disableFocusTrap) {
      /**
       * Remove focus from elements when scoutbar is opned
       */
      outerLayerElements.forEach(el => {
        el.setAttribute('tabindex', '-1');
        el.setAttribute('aria-hidden', 'true');
      });

      /**
       * Disable body scroll and attach focus to just the scoutbar
       */
      if (!bodyScroll) document.body.style.overflow = 'hidden';
    }

    /**
     * Cleanup all the DOM manipulation
     */
    return () => {
      outerLayerElements.forEach(el => {
        el.removeAttribute('tabindex');
        el.removeAttribute('aria-hidden');
        if (!bodyScroll) document.body.style.overflow = 'auto';
      });
    };
  }, [elementState, bodyScroll]);
};

export default useTrapFocus;
