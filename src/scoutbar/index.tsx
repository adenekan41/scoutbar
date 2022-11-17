/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

/* -------------------------- Internal Dependencies ------------------------- */
import ScoutBarInput from 'components/input';
import ScoutSnackBar from 'components/snackbar';
import ScoutBarStem from 'components/stem';
import ScoutBarProvider from 'components/scout-bar-provider';

import ScoutBarLogo from 'components/icon/svg/logo';

import {
  useScoutShortcut,
  IScoutAction,
  IScoutSectionAction,
  createScoutPage,
  createScoutAction,
  createScoutSection,
  IScoutStems,
  useIsMounted,
  useTrapFocus,
  useOnClickOutside,
} from 'index';
import { classNames, getOS, isBrowser } from 'utils';

/* ---------------------------- Styles Dependency --------------------------- */
import '../styles/index.scss';
import { TutorialIcon } from 'components/icon/svg/tutorial';

export type ScoutActionCreators = (props: {
  createScoutAction: (action: IScoutAction) => IScoutAction;
  createScoutSection: (action: IScoutSectionAction) => IScoutSectionAction;
  createScoutPage: (action: IScoutSectionAction) => IScoutSectionAction;
}) => (IScoutAction | IScoutSectionAction)[];

export interface ScoutBarProps {
  /**
   * Show the scout bar tutorial user interface.
   * @default true
   */
  tutorial?: boolean;
  /**
   * Disable animations on the scout bar.
   * @default false
   */
  noAnimation?: boolean;
  /**
   * Theme to use for the scout bar.
   * @default 'light'
   */
  theme?: 'light' | 'dark' | 'auto';
  /**
   * Acknowledge the scout bar tutorial.
   * @default true
   */
  acknowledgement?: boolean;
  /**
   * Change scoutbar brand color.
   * @default '#000'
   */
  brandColor?: string;
  /**
   * Scoutbar placeholders
   */
  placeholder?: string[] | string;
  /**
   * Enable double scrolling and allow users to scroll on body
   * @default true
   */
  bodyScroll?: boolean;
  /**
   * Set Scoutbar action
   */
  actions: (IScoutAction | IScoutSectionAction)[] | ScoutActionCreators;
  /**
   * Allow users to tab out of the scoutbar
   * @default false
   */
  disableFocusTrap?: boolean;
  /**
   * Center the scoutbar
   * @default false
   */
  centered?: boolean;
  /**
   * Set the scoutbar width
   * @default 650px
   */
  barWidth?: string;
  /**
   * Allow scoutbar to show recent searches
   * @default true
   */
  showRecentSearch?: boolean;
  /**
   * Disable Scoutbar stem before search
   * @default false
   */
  noResultsOnEmptySearch?: boolean;
  /**
   * Keep data in input even after scoutbar is closed
   * @default false
   */
  persistInput?: boolean;
  /**
   * Disable click outside to close scoutbar
   */
  disableClickOutside?: boolean;
  /**
   * Disable the scoutbar snackbar
   */
  disableSnackbar?: boolean;
  /**
   * Specifies whether or not an input field should have autocomplete enabled.
   * @default 'off'
   */
  autocomplete?: 'on' | 'off';
  /**
   * Set snackbar color and position
   */
  snackBar?: {
    background?: string;
    color?: string;
    position?: 'top' | 'bottom';
    style?: React.CSSProperties;
  };
  /**
   * Reveal the scoutbar
   * @default false
   */
  revealScoutbar?: boolean;
}

export const defaultProps: Partial<ScoutBarProps> = {
  tutorial: true,
  noAnimation: false,
  theme: 'light',
  acknowledgement: true,
  brandColor: '#61bb65',
  placeholder: [
    'What would you like to do today ?',
    'What do you need?',
    'Lets help you navigate',
  ],
  autocomplete: 'off',
  bodyScroll: true,
  disableFocusTrap: false,
  centered: false,
  barWidth: '650px',
  showRecentSearch: true,
  noResultsOnEmptySearch: false,
  persistInput: false,
  disableClickOutside: false,
  disableSnackbar: false,
  revealScoutbar: false,
  snackBar: {
    position: 'bottom',
  },
};

const ScoutBar: React.FC<ScoutBarProps> = ({
  tutorial,
  noAnimation,
  theme,
  acknowledgement,
  brandColor,
  placeholder,
  bodyScroll,
  disableFocusTrap,
  centered,
  actions,
  barWidth,
  showRecentSearch,
  noResultsOnEmptySearch,
  persistInput,
  disableClickOutside,
  disableSnackbar,
  snackBar,
  revealScoutbar,
  autocomplete,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [scoutbarReveal, setScoutbarReveal] = useState(revealScoutbar || false);

  const rootShortcut = getOS() === 'Mac' ? ['meta', 'k'] : ['control', 'k'];

  const ref = useRef<HTMLDivElement>(null);
  const isMounted = useIsMounted();

  /**
   * Revise action data type if its a function to a an array
   * We want to give user the ability to Item creation functions as a parameter in the props
   *
   * e.g
   * ...
   * actions={({ createScoutAction,createScoutActionSection,createScoutActionSectionPage}) => [...]}
   */

  const revisedAction: IScoutStems = useMemo(() => {
    return Array.isArray(actions)
      ? actions
      : actions?.({
          createScoutAction,
          createScoutSection,
          createScoutPage,
        });
  }, [actions]);

  const scoutbar___root = useRef<HTMLDivElement>(
    isBrowser() ? window.document.createElement('div') : null
  );

  useEffect(() => {
    setScoutbarReveal?.(revealScoutbar || false);
  }, [revealScoutbar]);

  useEffect(() => {
    if (scoutbar___root?.current) {
      scoutbar___root?.current?.setAttribute('id', 'scoutbar___root');
      window.document.body.appendChild(scoutbar___root?.current);
    }
  }, [scoutbar___root.current]);

  useScoutShortcut(
    rootShortcut,
    () => {
      if (scoutbarReveal) handleClickOutside();
      else setScoutbarReveal?.(!scoutbarReveal);
    },
    { override: true, universal: true }
  );

  useScoutShortcut(
    ['escape'],
    () => {
      handleClickOutside();
    },
    { universal: true }
  );

  const handleClickOutside = () => {
    ref?.current?.classList.add('scoutbar___hide');
    if (!persistInput) setInputValue?.('');
    setTimeout(() => setScoutbarReveal?.(false), noAnimation ? 0 : 300);
  };

  useOnClickOutside(disableClickOutside ? null : ref, handleClickOutside);

  useTrapFocus({
    elementState: scoutbarReveal,
    bodyScroll,
    focusAbleElement: disableFocusTrap
      ? ''
      : 'body > div:not(#scoutbar___root)',
    disableFocusTrap,
  });

  return isMounted() && scoutbar___root.current ? (
    <>
      {createPortal(
        <>
          {!disableSnackbar
            ? !scoutbarReveal && (
                <ScoutSnackBar
                  setController={setScoutbarReveal}
                  brandColor={brandColor}
                  theme={theme}
                  snackBar={snackBar}
                />
              )
            : null}
          {scoutbarReveal && (
            <ScoutBarProvider
              actions={revisedAction}
              values={{
                scoutbarReveal,
                setScoutbarReveal,
                inputValue,
                setInputValue,
              }}
            >
              <main className="___scout">
                <div
                  className={classNames([
                    'scout__bar-container',
                    `${centered && 'scout__bar-wrapper-centered'}`,
                  ])}
                  ref={ref}
                  style={{
                    ['--scoutbar-width' as string]: barWidth,
                  }}
                >
                  <div
                    className={classNames([
                      'scout__bar-wrapper',
                      `${noAnimation && 'scout__bar-wrapper-no-animation'}`,
                      `scout__bar-wrapper-theme-${theme}`,
                    ])}
                  >
                    <ScoutBarInput
                      placeholder={placeholder}
                      brandColor={brandColor}
                      autocomplete={autocomplete}
                      closeScoutbar={() => handleClickOutside()}
                      showRecentSearch={showRecentSearch}
                    />

                    <ScoutBarStem
                      actions={
                        noResultsOnEmptySearch && inputValue?.trim() === ''
                          ? []
                          : revisedAction
                      }
                      brandColor={brandColor}
                      showRecentSearch={showRecentSearch}
                    />

                    {tutorial && (
                      <ScoutTutorial
                        brandColor={brandColor}
                        acknowledgement={acknowledgement}
                      />
                    )}
                    {acknowledgement && (
                      <ScoutBarLogo brandColor={brandColor} />
                    )}
                  </div>
                </div>
              </main>
            </ScoutBarProvider>
          )}
        </>,
        scoutbar___root.current
      )}{' '}
    </>
  ) : null;
};

export const ScoutTutorial: React.FC<Partial<ScoutBarProps>> = ({
  brandColor,
  acknowledgement,
}) => (
  <div className="scout__bar-tutorial-section">
    {acknowledgement && (
      <div className="scout__bar-mobile-acknowledge">
        <p>
          Powered by <ScoutBarLogo brandColor={brandColor} />
        </p>
      </div>
    )}
    <div className="scout__bar-tutorial-section-item">
      <p>
        <span>
          <TutorialIcon.Tab />
          TAB
        </span>
        or{' '}
        <span className="scout__bar-tutorial-section-item__arrow m-left">
          <TutorialIcon.Down />
        </span>
        <span className="scout__bar-tutorial-section-item__arrow">
          <TutorialIcon.Up />
        </span>
        to navigate
      </p>
    </div>
    <div className="scout__bar-tutorial-section-item">
      <p>
        <span>
          <TutorialIcon.Return />
          RETURN
        </span>
        to Select
      </p>
    </div>
    <div className="scout__bar-tutorial-section-item">
      <p>
        <span>ESC</span>
        to cancel
      </p>
    </div>
  </div>
);

ScoutBar.defaultProps = defaultProps;

export default ScoutBar;
