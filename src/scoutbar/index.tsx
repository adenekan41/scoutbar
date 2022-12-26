/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import React, {
  useEffect,
  useState,
  useRef,
  useMemo,
  useCallback,
} from 'react';

/* -------------------------- Internal Dependencies ------------------------- */
import ScoutBarInput from 'components/input';
import ScoutSnackBar from 'components/snackbar';
import ScoutBarStem from 'components/stem';
import ScoutBarProvider from 'components/scout-bar-provider';
import Portal from 'components/portal';
import ScoutBarLogo from 'components/icon/svg/logo';

import {
  useScoutShortcut,
  IScoutAction,
  IScoutSectionAction,
  createScoutPage,
  createScoutAction,
  createScoutSection,
  IScoutStems,
  useTrapFocus,
  useOnClickOutside,
} from 'index';
import { classNames, print } from 'utils';

/* ---------------------------- Styles Dependency --------------------------- */
import '../styles/index.scss';
import ScoutTutorial from 'components/scout-tutorial';
import { FOCUSABLE_ELEMENTS, ROOT_SHORTCUT } from 'utils/constants';

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
   * Backdrop color to use for the scout bar.
   * @default null
   */
  backdrop?: string | null;
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
  backdrop: '#ff00002d',
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
  backdrop,
  snackBar,
  revealScoutbar,
  autocomplete,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [scoutbarReveal, setScoutbarReveal] = useState(revealScoutbar || false);

  const ref = useRef<HTMLDivElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  /**
   * Revise action data type if its a function to a an array
   * We want to give user the ability to Item creation functions as a parameter in the props
   *
   * e.g
   * ...
   * actions={({ createScoutAction, createScoutActionSection, createScoutActionSectionPage}) => [...]}
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

  useEffect(() => {
    setScoutbarReveal?.(revealScoutbar || false);
  }, [revealScoutbar]);

  useScoutShortcut(
    ROOT_SHORTCUT,
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

  const bootstrapShortcutActions = useCallback(() => {
    const shortcuts: Array<{
      key: string[];
      action: (e: KeyboardEvent) => void;
    }> = [];
    const recursMap = (actions: IScoutStems) => {
      [...actions]?.map(action => {
        if (
          (action.type === 'scout-section' ||
            action.type === 'scout-section-page') &&
          action?.children?.length
        )
          return recursMap(action?.children);

        if (action.type === 'scout-action' && action?.keyboardShortcut) {
          const isTampering =
            action?.keyboardShortcut?.length &&
            action?.keyboardShortcut?.filter(k => ROOT_SHORTCUT.includes(k));
          if (action?.disableIdledAction) return;

          if (isTampering)
            if (
              isTampering?.length >= 1 &&
              action.keyboardShortcut.length === isTampering.length
            )
              return print(
                `You are tampering with the Root shortcut either ${isTampering.toString()} in your action shortcut`
              );

          if (
            shortcuts.find(
              shortcut =>
                shortcut.key.toString() === action?.keyboardShortcut?.toString()
            )?.key
          )
            return print(
              `Shortcut ${action?.keyboardShortcut} is already in use. Please use a different shortcut to have its action run in scout idle mode.`
            );

          return shortcuts.push({
            key: action?.keyboardShortcut,
            action: action?.action as unknown as (e: KeyboardEvent) => void,
          });
        }
      });
    };

    recursMap(revisedAction);

    return shortcuts;
  }, [revisedAction, scoutbarReveal]);

  bootstrapShortcutActions()?.forEach((shortcut: any) => {
    useScoutShortcut(shortcut.key, !scoutbarReveal && shortcut.action);
  });

  const handleClickOutside = () => {
    ref?.current?.classList.add('scoutbar___hide');
    backdropRef?.current?.classList.add('scoutbar___hide-backdrop');

    if (!persistInput) setInputValue?.('');
    setTimeout(() => setScoutbarReveal?.(false), noAnimation ? 0 : 300);
  };

  useOnClickOutside(disableClickOutside ? null : ref, handleClickOutside);

  useTrapFocus({
    elementState: scoutbarReveal,
    bodyScroll,
    focusableElement: disableFocusTrap ? '' : FOCUSABLE_ELEMENTS,
    disableFocusTrap,
  });

  return (
    <Portal>
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
          {backdrop && (
            <div
              className="scoutbar___backdrop"
              ref={backdropRef}
              style={{
                ['--scoutbar-backdrop' as string]: backdrop,
              }}
            />
          )}

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
                {acknowledgement && <ScoutBarLogo brandColor={brandColor} />}
              </div>
            </div>
          </main>
        </ScoutBarProvider>
      )}
    </Portal>
  );
};

ScoutBar.defaultProps = defaultProps;

export default ScoutBar;
