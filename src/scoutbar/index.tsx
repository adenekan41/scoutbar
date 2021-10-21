/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import React, { useEffect, useState, useRef, useContext, useMemo } from 'react';
import { createPortal } from 'react-dom';

/* -------------------------- Internal Dependencies ------------------------- */
import Icon from 'components/icon';
import ScoutBarInput from 'components/input';
import ScoutSnackBar from 'components/snackbar';
import ScoutBarStem from 'components/stem';
import ScoutBarProvider from 'components/scout-bar-provider';

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
import { classNames, isBrowser } from 'utils';

/* ---------------------------- Styles Dependency --------------------------- */
import '../styles/index.scss';

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
   * Aknowledge the scout bar tutorial.
   * @default true
   */
  aknowledgement?: boolean;

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
   * Set snackbar color and position
   */
  snackBar?: {
    background?: string;
    color?: string;
    position?: 'top' | 'bottom';
    style?: React.CSSProperties;
  };
}

export const defaultProps: Partial<ScoutBarProps> = {
  tutorial: true,
  noAnimation: false,
  theme: 'light',
  aknowledgement: true,
  brandColor: '#61bb65',
  placeholder: [
    'What would you like to do today ?',
    'What do you need?',
    'Lets help you navigate',
  ],
  bodyScroll: true,
  disableFocusTrap: false,
  centered: false,
  barWidth: '650px',
  showRecentSearch: true,
  noResultsOnEmptySearch: false,
  persistInput: false,
  disableClickOutside: false,
  disableSnackbar: false,
  snackBar: {
    position: 'bottom',
  },
};

const ScoutBar: React.FC<ScoutBarProps> = ({
  tutorial,
  noAnimation,
  theme,
  aknowledgement,
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
}) => {
  const [scoutbarOpen, setScoutbarOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const ref = useRef(null);
  const isMounted = useIsMounted();

  /**
   * Revise action data type if its a function to a an array
   * We want to give user the ability to Item creation fucntions as a parameter in the props
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

  const socutbar___root: React.MutableRefObject<null | HTMLDivElement> = useRef(
    isBrowser() ? window.document.createElement('div') : null
  );

  useEffect(() => {
    (socutbar___root.current as any).setAttribute('id', 'scoutbar___root');
    window.document.body.appendChild(socutbar___root.current as any);
  }, [socutbar___root.current]);

  useScoutShortcut(['meta', 'k'], () => {
    if (scoutbarOpen) handleClickOutside();
    else setScoutbarOpen(true);
  });

  useScoutShortcut(['escape'], () => {
    handleClickOutside();
  });

  const handleClickOutside = () => {
    (ref as any).current?.classList.add('scoutbar___hide');
    if (!persistInput) setInputValue?.('');
    setTimeout(() => setScoutbarOpen(false), noAnimation ? 0 : 300);
  };

  useOnClickOutside(
    disableClickOutside ? (null as any) : ref,
    handleClickOutside
  );

  useTrapFocus({
    elementState: scoutbarOpen,
    bodyScroll,
    focusAbleElement: disableFocusTrap
      ? ''
      : 'body > div:not(#scoutbar___root)',
    disableFocusTrap,
  });

  return isMounted() && socutbar___root.current ? (
    <>
      {createPortal(
        <>
          {!disableSnackbar
            ? !scoutbarOpen && (
                <ScoutSnackBar
                  setController={setScoutbarOpen}
                  brandColor={brandColor}
                  theme={theme}
                  snackBar={snackBar}
                />
              )
            : null}
          {scoutbarOpen && (
            <ScoutBarProvider
              actions={revisedAction}
              values={{
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
                    ['--scoutbar-width' as any]: barWidth,
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
                        aknowledgement={aknowledgement}
                      />
                    )}
                    {aknowledgement && <ScoutBarLogo brandColor={brandColor} />}
                  </div>
                </div>
              </main>
            </ScoutBarProvider>
          )}
        </>,
        socutbar___root.current
      )}{' '}
    </>
  ) : null;
};

export const ScoutTutorial: React.FC<Partial<ScoutBarProps>> = ({
  brandColor,
  aknowledgement,
}) => (
  <div className="scout__bar-tutorial-section">
    {aknowledgement && (
      <div className="scout__bar-mobile-aknowledge">
        <p>
          Powered by <ScoutBarLogo brandColor={brandColor} />
        </p>
      </div>
    )}
    <div className="scout__bar-tutorial-section-item">
      <p>
        <span>
          <Icon width="24" height="24" viewBox="0 0 24 24">
            <path
              d="M18.03 11.47L11.53 4.97C11.396 4.83704 11.2168 4.7595 11.0281 4.75286C10.8395 4.74622 10.6553 4.81096 10.5122 4.93416C10.3692 5.05736 10.2779 5.22997 10.2566 5.41752C10.2352 5.60508 10.2853 5.79379 10.397 5.946L10.47 6.03L15.69 11.25H3.75C3.56876 11.25 3.39366 11.3156 3.25707 11.4348C3.12048 11.5539 3.03165 11.7184 3.007 11.898L3 12C3 12.38 3.282 12.694 3.648 12.743L3.75 12.75H15.69L10.47 17.97C10.343 18.097 10.2658 18.2653 10.2524 18.4445C10.239 18.6236 10.2903 18.8015 10.397 18.946L10.47 19.03C10.597 19.157 10.7653 19.2342 10.9445 19.2476C11.1236 19.261 11.3015 19.2097 11.446 19.103L11.53 19.03L18.03 12.53C18.157 12.403 18.2342 12.2347 18.2476 12.0555C18.261 11.8764 18.2097 11.6985 18.103 11.554L18.03 11.47L11.53 4.97L18.03 11.47V11.47ZM21 18.5V5.5C21 5.30109 20.921 5.11032 20.7803 4.96967C20.6397 4.82902 20.4489 4.75 20.25 4.75C20.0511 4.75 19.8603 4.82902 19.7197 4.96967C19.579 5.11032 19.5 5.30109 19.5 5.5V18.5C19.5 18.6989 19.579 18.8897 19.7197 19.0303C19.8603 19.171 20.0511 19.25 20.25 19.25C20.4489 19.25 20.6397 19.171 20.7803 19.0303C20.921 18.8897 21 18.6989 21 18.5Z"
              fill="black"
            />
          </Icon>
          TAB
        </span>
        or{' '}
        <span className="scout__bar-tutorial-section-item__arrow m-left">
          <Icon width="14" height="14" viewBox="0 0 24 24">
            <path
              d="M18.707 12.707L17.293 11.293L13 15.586V6H11V15.586L6.70697 11.293L5.29297 12.707L12 19.414L18.707 12.707Z"
              fill="black"
            />
          </Icon>
        </span>
        <span className="scout__bar-tutorial-section-item__arrow">
          <Icon width="14" height="14" viewBox="0 0 24 24">
            <path
              d="M11 8.41394V17.9999H13V8.41394L17.293 12.7069L18.707 11.2929L12 4.58594L5.29297 11.2929L6.70697 12.7069L11 8.41394Z"
              fill="black"
            />
          </Icon>
        </span>
        to navigate
      </p>
    </div>
    <div className="scout__bar-tutorial-section-item">
      <p>
        <span>
          <Icon width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M14.4999 1.5C14.6325 1.5 14.7597 1.55268 14.8535 1.64645C14.9472 1.74021 14.9999 1.86739 14.9999 2V6.8C14.9999 7.1283 14.9353 7.45339 14.8096 7.75671C14.684 8.06002 14.4998 8.33562 14.2677 8.56777C14.0355 8.79991 13.7599 8.98406 13.4566 9.1097C13.1533 9.23534 12.8282 9.3 12.4999 9.3H2.70692L6.05392 12.646C6.1478 12.7399 6.20055 12.8672 6.20055 13C6.20055 13.1328 6.1478 13.2601 6.05392 13.354C5.96003 13.4479 5.83269 13.5006 5.69992 13.5006C5.56714 13.5006 5.4398 13.4479 5.34592 13.354L1.14592 9.154C1.09935 9.10755 1.06241 9.05238 1.0372 8.99163C1.012 8.93089 0.999023 8.86577 0.999023 8.8C0.999023 8.73423 1.012 8.66911 1.0372 8.60837C1.06241 8.54762 1.09935 8.49245 1.14592 8.446L5.14592 4.446C5.2398 4.35211 5.36714 4.29937 5.49992 4.29937C5.63269 4.29937 5.76003 4.35211 5.85392 4.446C5.9478 4.53989 6.00055 4.66722 6.00055 4.8C6.00055 4.93278 5.9478 5.06011 5.85392 5.154L2.70692 8.3H12.4999C12.8977 8.3 13.2793 8.14196 13.5606 7.86066C13.8419 7.57936 13.9999 7.19782 13.9999 6.8V2C13.9999 1.86739 14.0526 1.74021 14.1464 1.64645C14.2401 1.55268 14.3673 1.5 14.4999 1.5Z"
              fill="black"
            />
          </Icon>
          RETURN
        </span>
        to Select
      </p>
    </div>
    <div className="scout__bar-tutorial-section-item">
      <p>
        <span>ESC</span>
        to cancle
      </p>
    </div>
  </div>
);

export const ScoutBarLogo: React.FC<{ brandColor: string | undefined }> = ({
  brandColor,
}) => (
  <a
    href="https://scoutbar.co"
    target="_blank"
    rel="nofollow norefereer noopener"
    className="scout__bar-brand-logo"
  >
    <Icon width="2267" height="503" viewBox="0 0 2267 503" fill="none">
      <rect
        y="7.87695"
        width="490.58"
        height="495.123"
        rx="128.11"
        fill={brandColor}
      />
      <path
        d="M239.235 126.715C224.62 126.715 210.149 129.593 196.647 135.186C183.144 140.779 170.876 148.976 160.542 159.311C150.208 169.645 142.01 181.913 136.417 195.415C130.825 208.918 127.946 223.389 127.946 238.004C127.946 252.619 130.825 267.09 136.417 280.592C142.01 294.094 150.208 306.363 160.542 316.697C170.876 327.031 183.144 335.229 196.647 340.822C210.149 346.414 191.31 340.822 205.925 340.822C236.208 288.511 297.057 337.568 317.928 316.697C338.799 295.826 350.524 267.52 350.524 238.004C350.524 208.488 338.799 180.181 317.928 159.311C297.057 138.44 268.751 126.715 239.235 126.715ZM90.8496 238.004C90.853 214.389 96.4923 191.117 107.299 170.12C118.105 149.123 133.767 131.009 152.982 117.283C172.198 103.556 194.411 94.6141 217.778 91.1993C241.144 87.7845 264.988 89.9958 287.327 97.6493C309.667 105.303 329.858 118.178 346.221 135.204C362.584 152.23 374.648 172.915 381.409 195.541C388.17 218.167 389.433 242.08 385.094 265.292C380.754 288.504 370.938 310.346 356.459 329.001L419.282 391.824C422.661 395.322 424.53 400.007 424.488 404.871C424.446 409.734 422.495 414.386 419.056 417.825C415.617 421.264 410.965 423.215 406.102 423.257C401.238 423.299 396.553 421.43 393.055 418.051L330.232 355.228C308.298 372.257 282.026 382.79 254.403 385.628C226.78 388.467 198.915 383.497 173.976 371.285C149.037 359.073 128.026 340.107 113.33 316.546C98.6354 292.984 90.8465 265.772 90.8496 238.004Z"
        fill="white"
        fillOpacity="0.83"
      />
      <path
        d="M803.116 317.627C803.116 272.333 778.264 243.873 724.953 233.452L679.258 225.034C648.394 219.022 636.77 208.6 636.77 189.761C636.77 168.918 656.01 155.289 686.473 155.289C718.139 155.289 741.788 167.314 741.788 196.174H798.306C798.306 132.442 743.792 108.392 687.275 108.392C618.332 108.392 577.847 146.07 577.847 194.972C577.847 238.262 606.307 265.919 658.014 275.539L703.308 284.358C731.366 289.568 743.391 299.188 743.391 319.23C743.391 342.078 721.746 356.508 689.68 356.508C649.196 356.508 629.555 339.673 629.555 316.023H571.434C571.434 369.334 616.327 404.607 689.68 404.607C753.412 404.607 803.116 373.343 803.116 317.627ZM969.302 273.535H1029.03C1019.81 219.022 980.124 188.558 927.214 188.558C863.882 188.558 821.394 231.848 821.394 296.783C821.394 362.119 863.882 405.409 926.813 405.409C979.322 405.409 1019 373.343 1029.03 319.23H969.302C962.487 343.681 947.657 356.508 925.21 356.508C898.755 356.508 878.713 337.268 878.713 296.783C878.713 259.907 897.552 236.658 926.813 236.658C947.657 236.658 964.091 249.485 969.302 273.535ZM1043.06 296.783C1043.06 361.718 1088.35 405.008 1152.08 405.008C1215.82 405.008 1261.11 361.718 1261.11 296.783C1261.11 232.249 1215.82 188.158 1152.08 188.158C1088.35 188.158 1043.06 232.249 1043.06 296.783ZM1100.38 296.383C1100.38 259.105 1120.82 235.857 1152.08 235.857C1183.35 235.857 1203.79 259.105 1203.79 296.383C1203.79 333.259 1183.35 357.309 1152.08 357.309C1120.82 357.309 1100.38 333.259 1100.38 296.383ZM1425.44 192.567V306.804C1425.44 337.668 1411.01 356.107 1383.36 356.508C1356.9 357.309 1340.07 341.677 1340.07 309.209V192.567H1286.76V316.424C1286.76 369.735 1317.62 405.008 1370.93 405.008C1395.78 405.008 1413.82 393.785 1424.64 378.153L1427.45 401H1478.75V192.567H1425.44ZM1586.52 401H1629V351.698H1604.55C1586.11 351.698 1581.3 344.883 1581.3 326.846V242.27H1629V192.567H1581.3V135.648H1525.19V172.124C1525.19 186.153 1521.58 192.567 1508.75 192.567H1493.12V242.27H1525.19V339.272C1525.19 376.95 1545.23 401 1586.52 401ZM1776.86 188.558C1745.99 188.558 1721.14 200.984 1710.32 219.423V99.9743H1653.8V401H1706.31L1709.52 372.942C1719.94 390.979 1745.19 405.008 1776.86 405.008C1834.17 405.008 1875.46 366.128 1875.46 296.783C1875.46 230.245 1836.58 188.558 1776.86 188.558ZM1764.43 354.904C1733.97 354.904 1711.12 333.259 1711.12 296.783C1711.12 260.708 1733.97 238.262 1764.43 238.663C1795.29 238.663 1817.74 260.708 1817.74 296.783C1817.74 332.858 1795.29 354.904 1764.43 354.904ZM2096.46 360.115C2089.64 360.115 2084.43 358.512 2084.43 348.09V270.328C2084.43 209.001 2037.53 188.558 1992.24 188.558C1937.73 188.558 1899.25 217.018 1899.25 263.915H1950.15C1950.95 245.477 1966.59 233.051 1989.84 233.051C2013.08 233.051 2027.91 245.878 2027.91 269.126V278.345H1972.2C1918.89 278.345 1894.04 303.598 1894.04 340.875C1894.04 380.958 1923.7 405.008 1969.79 405.008C2000.66 405.008 2024.71 394.186 2036.33 376.549C2040.74 394.587 2055.97 401 2074.41 401H2104.87V360.115H2096.46ZM2027.91 322.437C2027.91 347.288 2011.88 360.917 1984.22 360.917C1965.79 360.917 1951.76 354.503 1951.76 337.268C1951.76 326.044 1958.17 314.821 1982.22 314.821H2027.91V322.437ZM2229.53 192.567C2206.28 192.567 2191.45 203.79 2184.63 216.617L2178.62 192.567H2126.11V401H2182.63V293.978C2182.63 262.312 2193.05 242.671 2226.32 242.671H2257.99V192.567H2229.53Z"
        fill={brandColor}
      />
    </Icon>
  </a>
);

ScoutBar.defaultProps = defaultProps;

export default ScoutBar;
