/* -------------------------------------------------------------------------- */
/*                            External Dependencies                           */
/* -------------------------------------------------------------------------- */
import React, {
  Dispatch,
  memo,
  SetStateAction,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

/* -------------------------- Internal Dependencies ------------------------- */
import { classNames, isEmpty } from 'utils';
import { ActionOptions } from 'index';
import ScoutBarContext from 'helpers/context';
import {
  IScoutAction,
  IScoutSectionAction,
  ScoutBarProps,
  useScoutShortcut,
  useLocalStorage,
  useKeyboardNavigation,
  IScoutStems,
  IScoutStem,
} from 'index';
import Icon from 'components/icon';

/* --------------------------- Styles Dependencies -------------------------- */
/* @ts-ignore */
import styles from './stem.module.scss';

type Cell = HTMLAnchorElement | HTMLButtonElement;
const ScoutBarStem = ({
  actions,
  brandColor,
  showRecentSearch,
}: Partial<ScoutBarProps>) => {
  const [items, setItems] = useState<
    JSX.Element | JSX.Element[] | IScoutStems | undefined
  >(<></>);
  const [recentSearch, removeRecent] = useLocalStorage<string[]>(
    'scoutbar:recent-search',
    []
  );
  const ref = useRef<HTMLDivElement | null>(null);
  const [cursor, setHovered, allCellElements] = useKeyboardNavigation(ref);

  const { currentSection, setInputValue } = useContext(ScoutBarContext);

  const scrollStemSection = useCallback(() => {
    ref?.current?.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, []);

  const createScoutbarStemItems = useCallback(
    (item: IScoutStem | any) => {
      if (
        item.type === 'scout-action' ||
        (item.type === 'scout-section-page' &&
          currentSection?.id !== item.id &&
          !Array.isArray(currentSection))
      )
        return (
          // Return Cell if its a section page or action
          <ScoutbarStemCell
            item={item}
            key={item.id}
            active={cursor}
            setHovered={setHovered}
            allCellElements={allCellElements}
            scrollStemSection={scrollStemSection}
          />
        );

      /**
       * Run a Recursion to create new scoutbar items to
       * form a tree of items
       * @returns {function(): object}
       */

      const scoutbarItemChildren = item?.children?.map((child: IScoutStems) =>
        createScoutbarStemItems(child)
      );

      /**
       * Set the element for parent dir
       */
      return (
        <ScoutbarStemItem
          key={item.id}
          item={item}
          scoutbarChildren={scoutbarItemChildren}
        />
      );
    },
    [currentSection, cursor]
  );

  const setUpScoutbarStem = useCallback(() => {
    const scoutbarItems = (actions as IScoutStems)?.map(
      (item: IScoutStems | unknown) => createScoutbarStemItems(item)
    );

    setItems(scoutbarItems);
  }, [createScoutbarStemItems, actions]);

  const removeRecentSearch = (value: string) => {
    removeRecent?.((prev: string[]) => {
      return prev.filter((item: string) => item !== value);
    });
  };

  useEffect(() => {
    setUpScoutbarStem();
  }, [setUpScoutbarStem]);

  return (
    <div
      className={classNames([
        styles.scoutbarStem,
        isEmpty(actions) && (recentSearch.length === 0 || !showRecentSearch)
          ? styles.emptyResults
          : false,
      ])}
      style={{ ['--scout-brand-primary' as string]: brandColor }}
      ref={ref}
    >
      <div className={styles.scoutbarStemInner}>
        {!isEmpty(currentSection) ? (
          <>
            {(currentSection as unknown as IScoutStems)?.length > 0 ? (
              <>
                {(currentSection as unknown as IScoutStems)?.map(
                  (section: IScoutStems | unknown) =>
                    createScoutbarStemItems(section)
                )}
              </>
            ) : (
              createScoutbarStemItems(currentSection)
            )}
          </>
        ) : (
          <>
            {showRecentSearch && (
              <RecentSearch
                recents={recentSearch}
                removeRecentSearch={removeRecentSearch}
                setInputValue={setInputValue}
              />
            )}
            {!isEmpty(actions) && items}
          </>
        )}
      </div>
    </div>
  );
};

const ScoutbarStemCell: React.FC<{
  item: IScoutAction | IScoutSectionAction;
  active: number;
  scrollStemSection: () => void;
  setHovered: Dispatch<SetStateAction<Cell | null | undefined>>;
  allCellElements: Cell[];
}> = memo(
  ({ item, active, setHovered, allCellElements, scrollStemSection }) => {
    const isNewPage =
      item.type === 'scout-section-page' && item?.children?.length > 0;
    const { setCurrentSection, setScoutbarReveal, setInputValue } =
      useContext(ScoutBarContext);

    const ref = useRef(null);
    const elementActive =
      active >= 0 && ref?.current
        ? allCellElements.indexOf(ref?.current) === active
        : false;

    const setSection = useCallback(
      item => {
        setCurrentSection?.(item);
        /**
         * Make sure sections starts from the top of the bar
         */
        scrollStemSection();
      },
      [scrollStemSection]
    );

    const options: ActionOptions = {
      close: setScoutbarReveal,
      clearSearch: () => setInputValue?.(''),
      // ...
    };

    const handleClick = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>) => {
        if (isNewPage) return setSection(item);

        item.action?.call(null, e, options);
      },
      []
    );

    const handleShortcutAction: React.MouseEventHandler<
      HTMLButtonElement | HTMLAnchorElement
    > = useCallback(e => {
      /**
       * Make the element active has a click event that matches expected behavior
       */

      if (isNewPage) return setSection(item);
      if (item.href && !item?.target) return window.location.assign(item?.href);
      if (item.href && item?.target)
        return window.open(item?.href, item?.target);

      item.action?.call(null, e, options);
    }, []);

    const keyboardShortcut =
      (item.type === 'scout-action' && item.keyboardShortcut) || [];

    if (keyboardShortcut.length > 0) {
      useScoutShortcut([...keyboardShortcut], handleShortcutAction, {
        override: true,
      });
    }

    const ScoutbarStemCellChild = () => (
      <>
        {typeof item.icon === 'string' ? (
          <img src={item.icon} alt={item?.label || ''} aria-hidden="true" />
        ) : (
          <>{item.icon}</>
        )}
        <p>
          {item.label}
          {item.description && (
            <span className={styles.description}>{item.description}</span>
          )}
          {keyboardShortcut.length > 0 && (
            <span className={styles.shortcut}>
              {keyboardShortcut?.map((key: string) => (
                <span key={key}>{key}</span>
              ))}
            </span>
          )}
          {isNewPage && (
            <Icon
              width="16"
              height="16"
              viewBox="0 0 16 16"
              className={styles.newPageIcon}
              aria-hidden="true"
            >
              <path
                d="M0 14C0 14.5304 0.210714 15.0391 0.585786 15.4142C0.960859 15.7893 1.46957 16 2 16H14C14.5304 16 15.0391 15.7893 15.4142 15.4142C15.7893 15.0391 16 14.5304 16 14V2C16 1.46957 15.7893 0.960859 15.4142 0.585786C15.0391 0.210714 14.5304 0 14 0L2 0C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2L0 14ZM4.5 7.5H10.293L8.146 5.354C8.05211 5.26011 7.99937 5.13278 7.99937 5C7.99937 4.86722 8.05211 4.73989 8.146 4.646C8.23989 4.55211 8.36722 4.49937 8.5 4.49937C8.63278 4.49937 8.76011 4.55211 8.854 4.646L11.854 7.646C11.9006 7.69245 11.9375 7.74762 11.9627 7.80837C11.9879 7.86911 12.0009 7.93423 12.0009 8C12.0009 8.06577 11.9879 8.13089 11.9627 8.19163C11.9375 8.25238 11.9006 8.30755 11.854 8.354L8.854 11.354C8.76011 11.4479 8.63278 11.5006 8.5 11.5006C8.36722 11.5006 8.23989 11.4479 8.146 11.354C8.05211 11.2601 7.99937 11.1328 7.99937 11C7.99937 10.8672 8.05211 10.7399 8.146 10.646L10.293 8.5H4.5C4.36739 8.5 4.24021 8.44732 4.14645 8.35355C4.05268 8.25979 4 8.13261 4 8C4 7.86739 4.05268 7.74021 4.14645 7.64645C4.24021 7.55268 4.36739 7.5 4.5 7.5V7.5Z"
                fill="black"
              />
            </Icon>
          )}
        </p>
      </>
    );

    const cellCommonProps = {
      onClick: handleClick,
      onMouseEnter: () => setHovered(ref?.current),
      onMouseLeave: () => setHovered(undefined),
      className: classNames([
        'scoutbar-cell-item',
        styles.scoutbarStemCell,
        `${elementActive && styles.active}`,
      ]),
      'aria-label': item.ariaLabel,
      ref,
    };

    return (
      <>
        {item.href ? (
          <a
            href={item.href}
            {...cellCommonProps}
            target={item?.target}
            rel={item?.rel}
          >
            <ScoutbarStemCellChild />
          </a>
        ) : (
          <button
            type="button"
            {...cellCommonProps}
            disabled={!item.action && item.type === 'scout-action'}
            aria-hidden={!item.action && item.type === 'scout-action'}
          >
            <ScoutbarStemCellChild />
          </button>
        )}
      </>
    );
  }
);

const ScoutbarStemItem: React.FC<{
  item: IScoutSectionAction;
  scoutbarChildren: Element[] | undefined;
}> = memo(({ item, scoutbarChildren }) => {
  return (
    <div key={item.id}>
      <div className={styles.scoutbarSection}>
        {item.label && <p className={styles.header}>{item.label}</p>}
        {scoutbarChildren}
      </div>
    </div>
  );
});

const RecentSearch: React.FC<{
  recents: string[];
  removeRecentSearch: (search: string) => void;
  setInputValue?: (value: string) => void;
}> = memo(({ recents: recentSearch, removeRecentSearch, setInputValue }) => {
  const [isShowMore, setIsShowMore] = useState(false);
  return (
    <>
      {!isEmpty(recentSearch) && (
        <div className={classNames([styles.scoutbarSection])}>
          <p className={styles.header}>Recent Search</p>
          <div className={styles.recentSearch}>
            {recentSearch
              .slice(0, isShowMore ? recentSearch.length : 5)
              ?.map((search, index) => (
                <div className={styles.recentCell} key={`${search}:${index}`}>
                  <Icon
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    className={styles.clock}
                    aria-hidden="true"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 16L12.586 13.586C12.2109 13.211 12.0001 12.7024 12 12.172V6"
                      stroke="black"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </Icon>
                  <button
                    className={classNames([
                      styles.recentButton,
                      'scoutbar-recent-button',
                    ])}
                    onClick={() => setInputValue?.(search)}
                  >
                    {search}
                  </button>
                  <button
                    onClick={() => removeRecentSearch(search)}
                    className={styles.recentCloseIcon}
                  >
                    <Icon width="24" height="24" viewBox="0 0 24 24">
                      <path
                        d="M6.22517 4.81099C6.03657 4.62883 5.78397 4.52803 5.52177 4.53031C5.25957 4.53259 5.00876 4.63776 4.82335 4.82317C4.63794 5.00858 4.53278 5.25939 4.5305 5.52158C4.52822 5.78378 4.62901 6.03638 4.81117 6.22499L10.5862 12L4.81017 17.775C4.71466 17.8672 4.63848 17.9776 4.58607 18.0996C4.53366 18.2216 4.50607 18.3528 4.50492 18.4856C4.50377 18.6184 4.52907 18.75 4.57935 18.8729C4.62963 18.9958 4.70388 19.1075 4.79778 19.2014C4.89167 19.2953 5.00332 19.3695 5.12622 19.4198C5.24911 19.4701 5.38079 19.4954 5.51357 19.4942C5.64635 19.4931 5.77757 19.4655 5.89958 19.4131C6.02158 19.3607 6.13192 19.2845 6.22417 19.189L12.0002 13.414L17.7752 19.189C17.9638 19.3711 18.2164 19.4719 18.4786 19.4697C18.7408 19.4674 18.9916 19.3622 19.177 19.1768C19.3624 18.9914 19.4676 18.7406 19.4698 18.4784C19.4721 18.2162 19.3713 17.9636 19.1892 17.775L13.4142 12L19.1892 6.22499C19.3713 6.03638 19.4721 5.78378 19.4698 5.52158C19.4676 5.25939 19.3624 5.00858 19.177 4.82317C18.9916 4.63776 18.7408 4.53259 18.4786 4.53031C18.2164 4.52803 17.9638 4.62883 17.7752 4.81099L12.0002 10.586L6.22517 4.80999V4.81099Z"
                        fill="black"
                      />
                    </Icon>
                  </button>
                </div>
              ))}
            {recentSearch.length > 5 && (
              <div className={styles.recentCell}>
                <Icon
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  className={styles.more}
                  aria-hidden="true"
                >
                  <path
                    d="M0 14C0 14.5304 0.210714 15.0391 0.585786 15.4142C0.960859 15.7893 1.46957 16 2 16H14C14.5304 16 15.0391 15.7893 15.4142 15.4142C15.7893 15.0391 16 14.5304 16 14V2C16 1.46957 15.7893 0.960859 15.4142 0.585786C15.0391 0.210714 14.5304 0 14 0L2 0C1.46957 0 0.960859 0.210714 0.585786 0.585786C0.210714 0.960859 0 1.46957 0 2L0 14ZM4.5 7.5H10.293L8.146 5.354C8.05211 5.26011 7.99937 5.13278 7.99937 5C7.99937 4.86722 8.05211 4.73989 8.146 4.646C8.23989 4.55211 8.36722 4.49937 8.5 4.49937C8.63278 4.49937 8.76011 4.55211 8.854 4.646L11.854 7.646C11.9006 7.69245 11.9375 7.74762 11.9627 7.80837C11.9879 7.86911 12.0009 7.93423 12.0009 8C12.0009 8.06577 11.9879 8.13089 11.9627 8.19163C11.9375 8.25238 11.9006 8.30755 11.854 8.354L8.854 11.354C8.76011 11.4479 8.63278 11.5006 8.5 11.5006C8.36722 11.5006 8.23989 11.4479 8.146 11.354C8.05211 11.2601 7.99937 11.1328 7.99937 11C7.99937 10.8672 8.05211 10.7399 8.146 10.646L10.293 8.5H4.5C4.36739 8.5 4.24021 8.44732 4.14645 8.35355C4.05268 8.25979 4 8.13261 4 8C4 7.86739 4.05268 7.74021 4.14645 7.64645C4.24021 7.55268 4.36739 7.5 4.5 7.5V7.5Z"
                    fill="black"
                  />
                </Icon>
                <button
                  className={styles.recentButton}
                  onClick={() => setIsShowMore(!isShowMore)}
                >
                  {!isShowMore ? (
                    <>
                      Show <b>{recentSearch.length - 5}</b> more...
                    </>
                  ) : (
                    <>Show less</>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
});

/**
 * Set display name for the component so its easily debuggable.
 * the memo method prevents the component
 * from re-rendering when the props change and renames it as Anonymous
 */
RecentSearch.displayName = 'RecentSearch';
ScoutbarStemItem.displayName = 'ScoutbarStemItem';
ScoutbarStemCell.displayName = 'ScoutbarStemCell';
export default ScoutBarStem;
